
import React, { useState, useMemo, useEffect } from 'react';
import type { Order, OrderItem, Piece } from '../types';
import { PlusIcon, XIcon } from '../components/icons';

interface OrderFormProps {
    order: Order | null;
    pieces: Piece[];
    onSave: (order: Omit<Order, 'id' | 'createdAt' | 'status'> & Partial<Pick<Order, 'id'>>) => void;
    onClose: () => void;
    onDelete: (orderId: string) => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ order, pieces, onSave, onClose, onDelete }) => {
    const [clientName, setClientName] = useState('');
    const [items, setItems] = useState<OrderItem[]>([]);
    
    const isEditing = useMemo(() => order !== null, [order]);

    useEffect(() => {
        if (order) {
            setClientName(order.clientName);
            setItems(order.items);
        }
    }, [order]);

    const availablePieces = useMemo(() => {
        return pieces.filter(p => {
            const itemInOrder = items.find(item => item.pieceId === p.id);
            const quantityInOrder = itemInOrder ? itemInOrder.quantity : 0;
            return p.stock + quantityInOrder > 0;
        });
    }, [pieces, items]);

    const handleAddItem = (piece: Piece) => {
        if (!piece) return;

        const existingItem = items.find(item => item.pieceId === piece.id);
        if (existingItem) {
            // Just increment quantity if item already in order
            handleQuantityChange(piece.id, existingItem.quantity + 1);
        } else {
            // Add new item
            setItems(prev => [...prev, {
                pieceId: piece.id,
                pieceName: piece.name,
                piecePhoto: piece.photos[0] || '',
                quantity: 1,
                salePricePerUnit: piece.salePrice
            }]);
        }
    };
    
    const handleRemoveItem = (pieceId: string) => {
        setItems(prev => prev.filter(item => item.pieceId !== pieceId));
    };

    const handleQuantityChange = (pieceId: string, quantity: number) => {
        const piece = pieces.find(p => p.id === pieceId);
        if (!piece) return;

        const originalStock = piece.stock + (order?.items.find(i => i.pieceId === pieceId)?.quantity || 0);
        const newQuantity = Math.max(1, Math.min(quantity, originalStock));
        
        setItems(prev => prev.map(item =>
            item.pieceId === pieceId ? { ...item, quantity: newQuantity } : item
        ));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!clientName || items.length === 0) {
            alert('Por favor, preencha o nome do cliente e adicione pelo menos um item.');
            return;
        }
        onSave({ id: order?.id, clientName, items });
        onClose();
    };

    const handleDelete = () => {
        if (order && window.confirm('Tem certeza que deseja apagar esta encomenda? O estoque dos itens será restaurado.')) {
            onDelete(order.id);
            onClose();
        }
    };

    const totalOrderValue = useMemo(() => items.reduce((sum, item) => sum + (item.salePricePerUnit * item.quantity), 0), [items]);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-5">
            <div className="bg-white/80 backdrop-blur-lg w-full max-w-4xl max-h-full sm:max-h-[90vh] rounded-none sm:rounded-3xl shadow-2xl flex flex-col">
                <header className="p-6 sm:p-8 flex justify-between items-center border-b border-black/10">
                    <h2 className="text-2xl sm:text-3xl font-bold text-graphite">{isEditing ? 'Editar Encomenda' : 'Nova Encomenda'}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-black">
                        <XIcon className="w-7 h-7" />
                    </button>
                </header>
                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 sm:p-10 space-y-6 sm:space-y-10">
                    <div>
                        <label className="block text-base sm:text-lg font-medium text-graphite">Nome do Cliente</label>
                        <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} className="mt-2 block w-full text-base sm:text-lg p-3 bg-white/50 border-gray-300 rounded-lg shadow-sm" required />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                           <h3 className="text-lg sm:text-xl font-semibold text-graphite mb-4">Itens Disponíveis</h3>
                           <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                {availablePieces.map(p => (
                                    <button type="button" key={p.id} onClick={() => handleAddItem(p)} className="w-full flex items-center p-3 bg-white/70 rounded-lg shadow-sm hover:bg-sage-green/10 text-left">
                                        <img src={p.photos[0]} alt={p.name} className="w-12 h-12 rounded-md object-cover mr-4"/>
                                        <div className="flex-grow">
                                            <p className="font-semibold text-graphite">{p.name}</p>
                                            <p className="text-sm text-gray-500">Estoque: {p.stock}</p>
                                        </div>
                                        <span className="text-lg font-bold text-sage-green">{p.salePrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                    </button>
                                ))}
                           </div>
                        </div>
                        <div>
                             <h3 className="text-lg sm:text-xl font-semibold text-graphite mb-4">Itens na Encomenda</h3>
                            {items.length === 0 ? <p className="text-gray-500">Nenhum item adicionado.</p> : (
                                <div className="space-y-3">
                                    {items.map(item => (
                                        <div key={item.pieceId} className="flex items-center p-3 bg-white/70 rounded-lg">
                                            <img src={item.piecePhoto} alt={item.pieceName} className="w-12 h-12 rounded-md object-cover mr-4"/>
                                            <div className="flex-grow">
                                                <p className="font-semibold text-graphite">{item.pieceName}</p>
                                                <p className="text-sm text-gray-600">{(item.salePricePerUnit * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                            </div>
                                            <input type="number" value={item.quantity} onChange={e => handleQuantityChange(item.pieceId, parseInt(e.target.value))} className="w-16 p-1 text-center bg-white/50 border-gray-300 rounded-md" />
                                            <button type="button" onClick={() => handleRemoveItem(item.pieceId)} className="ml-2 text-red-500 hover:text-red-700">
                                                <XIcon className="w-5 h-5"/>
                                            </button>
                                        </div>
                                    ))}
                                    <div className="pt-4 text-right">
                                        <p className="text-lg text-graphite">Total:</p>
                                        <p className="text-3xl font-bold text-sage-green">{totalOrderValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-6 flex justify-between items-center">
                        <div>
                            {isEditing && (
                               <button type="button" onClick={handleDelete} className="bg-red-500/10 py-3 px-6 sm:py-3.5 sm:px-8 rounded-lg text-base sm:text-lg font-medium text-red-700 hover:bg-red-500/20">
                                   Excluir Encomenda
                                </button>
                            )}
                        </div>
                        <div className="flex justify-end space-x-2 sm:space-x-4">
                            <button type="button" onClick={onClose} className="bg-white py-3 px-6 sm:py-3.5 sm:px-8 border border-gray-300 rounded-lg shadow-sm text-base sm:text-lg font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
                            <button type="submit" className="inline-flex justify-center py-3 px-6 sm:py-3.5 sm:px-8 border border-transparent shadow-sm text-base sm:text-lg font-medium rounded-lg text-white bg-sage-green hover:bg-sage-green-dark">
                                {isEditing ? 'Salvar Alterações' : 'Salvar Encomenda'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface OrdersScreenProps {
    orders: Order[];
    pieces: Piece[];
    onSaveOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status'> & Partial<Pick<Order, 'id'>>) => void;
    onDeleteOrder: (orderId: string) => void;
    onUpdateStatus: (orderId: string, status: 'pending' | 'sent') => void;
}

const OrdersScreen: React.FC<OrdersScreenProps> = ({ orders, pieces, onSaveOrder, onDeleteOrder, onUpdateStatus }) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);

    const handleOpenFormForNew = () => {
        setEditingOrder(null);
        setIsFormOpen(true);
    };

    const handleOpenFormForEdit = (order: Order) => {
        setEditingOrder(order);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingOrder(null);
    }
    
    const toggleStatus = (order: Order) => {
        const newStatus = order.status === 'pending' ? 'sent' : 'pending';
        onUpdateStatus(order.id, newStatus);
    }
    
    const totalOrderValue = (order: Order) => order.items.reduce((sum, item) => sum + (item.salePricePerUnit * item.quantity), 0);

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center">
                <h1 className="text-4xl sm:text-5xl font-bold text-graphite">Encomendas</h1>
                <button
                    onClick={handleOpenFormForNew}
                    className="bg-sage-green text-white rounded-full p-4 shadow-lg hover:bg-opacity-90 transition"
                >
                    <PlusIcon className="w-7 h-7" />
                </button>
            </header>

            {isFormOpen && <OrderForm order={editingOrder} pieces={pieces} onSave={onSaveOrder} onClose={handleCloseForm} onDelete={onDeleteOrder} />}
            
            {orders.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-lg sm:text-xl text-gray-500">Nenhuma encomenda registrada.</p>
                    <p className="text-base sm:text-lg text-gray-400 mt-2">Clique no '+' para criar uma nova encomenda.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map(order => (
                        <div key={order.id} className="bg-white/60 backdrop-blur-lg border border-white/30 rounded-2xl shadow-md p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex-grow cursor-pointer" onClick={() => handleOpenFormForEdit(order)}>
                                <h3 className="font-bold text-xl sm:text-2xl text-graphite">{order.clientName}</h3>
                                <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {order.items.map(item => (
                                        <div key={item.pieceId} className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
                                            <img src={item.piecePhoto} alt={item.pieceName} className="w-6 h-6 rounded-full object-cover mr-2" />
                                            <span>{item.quantity}x {item.pieceName}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-4">
                                <span className="text-2xl sm:text-3xl font-bold text-sage-green">{totalOrderValue(order).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                <button
                                    onClick={() => toggleStatus(order)}
                                    className={`py-2 px-4 rounded-full text-sm font-semibold transition ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}
                                >
                                    {order.status === 'pending' ? 'Pendente' : 'Enviado'}
                                </button>
                             </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrdersScreen;
