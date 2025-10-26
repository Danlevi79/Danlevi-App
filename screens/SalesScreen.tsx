import React, { useState } from 'react';
import type { Piece } from '../types';
import { SalesIcon } from '../components/icons';

interface SalesScreenProps {
    pieces: Piece[];
    onRegisterSale: (piece: Piece, quantity: number) => void;
}

const SalesScreen: React.FC<SalesScreenProps> = ({ pieces, onRegisterSale }) => {
    const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);
    const [quantity, setQuantity] = useState(1);
    
    const handleSelectPiece = (piece: Piece) => {
        setSelectedPiece(piece);
        setQuantity(1);
    };
    
    const handleFinalizeSale = () => {
        if (selectedPiece && quantity > 0 && quantity <= selectedPiece.stock) {
            onRegisterSale(selectedPiece, quantity);
            setSelectedPiece(null);
        } else {
            alert("Quantidade inválida ou sem estoque suficiente.");
        }
    };

    const totalSalePrice = selectedPiece ? selectedPiece.salePrice * quantity : 0;

    return (
        <div className="space-y-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-graphite">Nova Venda</h1>

            {pieces.length === 0 ? (
                 <div className="text-center py-20">
                    <p className="text-lg sm:text-xl text-gray-500">Nenhuma peça em estoque para vender.</p>
                    <p className="text-base sm:text-lg text-gray-400 mt-2">Cadastre uma nova peça na aba 'Peças'.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {pieces.map(piece => (
                        <button key={piece.id} onClick={() => handleSelectPiece(piece)} className="text-left bg-white/60 backdrop-blur-lg border border-white/30 rounded-2xl shadow-md overflow-hidden hover:ring-2 hover:ring-sage-green transition">
                            <img src={piece.photos[0]} alt={piece.name} className="w-full h-40 sm:h-52 object-cover" />
                            <div className="p-4">
                                <h3 className="font-bold text-lg sm:text-xl truncate">{piece.name}</h3>
                                <div className="flex justify-between items-baseline mt-2">
                                     <p className="text-xl sm:text-2xl font-bold text-sage-green">{piece.salePrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                     <p className="text-base sm:text-lg text-gray-500">Estoque: {piece.stock}</p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
            
            {selectedPiece && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-5">
                    <div className="bg-white/80 backdrop-blur-lg w-full max-w-md rounded-3xl shadow-2xl p-6 sm:p-10 text-center space-y-6 sm:space-y-8">
                         <img src={selectedPiece.photos[0]} alt={selectedPiece.name} className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-full mx-auto -mt-20 sm:-mt-28 border-8 border-white shadow-lg" />
                        <h2 className="text-2xl sm:text-3xl font-bold text-graphite">Vender: {selectedPiece.name}</h2>
                        
                        <div>
                            <label className="block text-base sm:text-lg font-medium text-graphite mb-2">Quantidade (Estoque: {selectedPiece.stock})</label>
                            <input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                min="1"
                                max={selectedPiece.stock}
                                className="mt-1 block w-full text-base sm:text-lg p-3 text-center bg-white/50 border-gray-300 rounded-lg shadow-sm"
                            />
                        </div>

                         <div className="p-4 sm:p-6 rounded-xl bg-sage-green/10 text-center space-y-2">
                            <p className="text-base sm:text-lg text-sage-green-dark">Valor Total da Venda</p>
                            <p className="text-4xl sm:text-5xl font-bold text-sage-green">
                                {totalSalePrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                        </div>

                        <div className="flex justify-center space-x-2 sm:space-x-4 pt-4">
                            <button onClick={() => setSelectedPiece(null)} className="bg-white py-3 px-6 sm:py-3.5 sm:px-8 border border-gray-300 rounded-lg shadow-sm text-base sm:text-lg font-medium text-gray-700 hover:bg-gray-50">
                                Cancelar
                            </button>
                            <button onClick={handleFinalizeSale} className="inline-flex items-center justify-center py-3 px-6 sm:py-3.5 sm:px-8 border border-transparent shadow-sm text-base sm:text-lg font-medium rounded-lg text-white bg-sage-green hover:bg-opacity-90">
                                <SalesIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                                Finalizar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalesScreen;