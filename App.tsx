
import React, { useState, useCallback } from 'react';
import type { Piece, Sale, Order, Settings, Screen } from './types';
import BottomNav from './components/BottomNav';
import PiecesScreen from './screens/PiecesScreen';
import SalesScreen from './screens/SalesScreen';
import OrdersScreen from './screens/OrdersScreen';
import ResultsScreen from './screens/ResultsScreen';
import SettingsScreen from './screens/SettingsScreen';

const useLocalStorage = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue: React.Dispatch<React.SetStateAction<T>> = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
};

const App: React.FC = () => {
  const [settings, setSettings] = useLocalStorage<Settings>('ponto-de-valor-settings', {
    atelierName: 'Meu Ateliê',
    hourlyRate: 20,
    profitMargin: 100,
  });
  const [pieces, setPieces] = useLocalStorage<Piece[]>('ponto-de-valor-pieces', []);
  const [sales, setSales] = useLocalStorage<Sale[]>('ponto-de-valor-sales', []);
  const [orders, setOrders] = useLocalStorage<Order[]>('ponto-de-valor-orders', []);
  const [activeScreen, setActiveScreen] = useState<Screen>('pieces');

  const handleSavePiece = useCallback((pieceToSave: Omit<Piece, 'id' | 'createdAt'> & Partial<Pick<Piece, 'id' | 'createdAt'>>) => {
    setPieces(prev => {
      const index = prev.findIndex(p => p.id === pieceToSave.id);
      if (index > -1) {
        const newPieces = [...prev];
        newPieces[index] = { ...prev[index], ...pieceToSave };
        return newPieces;
      } else {
        const newPiece: Piece = {
          ...pieceToSave,
          id: `piece-${Date.now()}`,
          createdAt: new Date().toISOString(),
          photos: pieceToSave.photos || [],
          yarnCost: pieceToSave.yarnCost || 0,
          accessoriesCost: pieceToSave.accessoriesCost || 0,
          otherCosts: pieceToSave.otherCosts || 0,
          timeHours: pieceToSave.timeHours || 0,
          timeMinutes: pieceToSave.timeMinutes || 0,
          stock: pieceToSave.stock || 0,
          salePrice: pieceToSave.salePrice || 0,
          category: pieceToSave.category || '',
          name: pieceToSave.name || 'Nova Peça'
        };
        return [newPiece, ...prev];
      }
    });
  }, [setPieces]);

  const handleDeletePiece = useCallback((pieceId: string) => {
      setPieces(prev => prev.filter(p => p.id !== pieceId));
  }, [setPieces]);


  const handleRegisterSale = useCallback((piece: Piece, quantity: number) => {
    const timeInHours = piece.timeHours + piece.timeMinutes / 60;
    const timeCost = timeInHours * settings.hourlyRate;
    const totalMaterialCost = piece.yarnCost + piece.accessoriesCost + piece.otherCosts;
    const baseCost = totalMaterialCost + timeCost; // per unit

    const totalSalePrice = piece.salePrice * quantity;
    const totalBaseCost = baseCost * quantity;

    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      pieceId: piece.id,
      pieceName: piece.name,
      piecePhoto: piece.photos[0] || '',
      quantity,
      salePrice: totalSalePrice,
      baseCost: baseCost, // Storing per-unit cost for records
      profit: totalSalePrice - totalBaseCost,
      date: new Date().toISOString(),
    };

    setSales(prev => [newSale, ...prev]);
    setPieces(prev => prev.map(p => p.id === piece.id ? { ...p, stock: p.stock - quantity } : p));
  }, [settings.hourlyRate, setSales, setPieces]);
  
  const handleSaveOrder = useCallback((orderToSave: Omit<Order, 'id' | 'createdAt' | 'status'> & Partial<Pick<Order, 'id'>>) => {
    // For simplicity, we only handle new orders affecting stock. Editing is complex.
    if (orderToSave.id) {
        // Simple update without stock management for edits
        setOrders(prev => prev.map(o => o.id === orderToSave.id ? { ...o, clientName: orderToSave.clientName, items: orderToSave.items } : o));
    } else {
        // New order
        const newOrder: Order = {
            ...orderToSave,
            id: `order-${Date.now()}`,
            createdAt: new Date().toISOString(),
            status: 'pending',
        };
        setOrders(prev => [newOrder, ...prev]);

        // Decrement stock
        setPieces(currentPieces => {
            let piecesToUpdate = [...currentPieces];
            newOrder.items.forEach(item => {
                piecesToUpdate = piecesToUpdate.map(p =>
                    p.id === item.pieceId ? { ...p, stock: p.stock - item.quantity } : p
                );
            });
            return piecesToUpdate;
        });
    }
  }, [setOrders, setPieces]);

  const handleDeleteOrder = useCallback((orderId: string) => {
      const orderToDelete = orders.find(o => o.id === orderId);
      if (!orderToDelete) return;

      // Restore stock
      setPieces(currentPieces => {
          let piecesToUpdate = [...currentPieces];
          orderToDelete.items.forEach(item => {
              piecesToUpdate = piecesToUpdate.map(p =>
                  p.id === item.pieceId ? { ...p, stock: p.stock + item.quantity } : p
              );
          });
          return piecesToUpdate;
      });

      setOrders(prev => prev.filter(o => o.id !== orderId));
  }, [orders, setOrders, setPieces]);

  const handleUpdateOrderStatus = useCallback((orderId: string, status: 'pending' | 'sent') => {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  }, [setOrders]);


  const renderScreen = () => {
    switch (activeScreen) {
      case 'pieces':
        return <PiecesScreen pieces={pieces} settings={settings} onSavePiece={handleSavePiece} onDeletePiece={handleDeletePiece} />;
      case 'sales':
        return <SalesScreen pieces={pieces.filter(p => p.stock > 0)} onRegisterSale={handleRegisterSale} />;
      case 'orders':
        return <OrdersScreen orders={orders} pieces={pieces} onSaveOrder={handleSaveOrder} onDeleteOrder={handleDeleteOrder} onUpdateStatus={handleUpdateOrderStatus} />;
      case 'results':
        return <ResultsScreen sales={sales} />;
      case 'settings':
        return <SettingsScreen settings={settings} setSettings={setSettings} />;
      default:
        return <PiecesScreen pieces={pieces} settings={settings} onSavePiece={handleSavePiece} onDeletePiece={handleDeletePiece} />;
    }
  };

  return (
    <div className="min-h-screen font-sans text-graphite pb-28">
      <main className="p-4 sm:p-6">
        {renderScreen()}
      </main>
      <BottomNav activeScreen={activeScreen} setActiveScreen={setActiveScreen} />
    </div>
  );
};

export default App;
