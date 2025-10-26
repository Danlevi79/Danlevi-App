import React, { useState, useEffect, useMemo } from 'react';
import type { Piece, Settings } from '../types';
import { PlusIcon, XIcon } from '../components/icons';

interface PieceFormProps {
    piece: Piece | null;
    settings: Settings;
    onSave: (piece: Omit<Piece, 'id' | 'createdAt'> & Partial<Pick<Piece, 'id' | 'createdAt'>>) => void;
    onClose: () => void;
    onDelete: (pieceId: string) => void;
}

const PieceForm: React.FC<PieceFormProps> = ({ piece, settings, onSave, onClose, onDelete }) => {
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        photos: [] as string[],
        yarnCost: 0,
        accessoriesCost: 0,
        otherCosts: 0,
        timeHours: 0,
        timeMinutes: 0,
        stock: 1,
        salePrice: 0,
    });

    const isEditing = useMemo(() => piece !== null, [piece]);

    useEffect(() => {
        if (piece) {
            setFormData({
                name: piece.name,
                category: piece.category,
                photos: piece.photos,
                yarnCost: piece.yarnCost,
                accessoriesCost: piece.accessoriesCost,
                otherCosts: piece.otherCosts,
                timeHours: piece.timeHours,
                timeMinutes: piece.timeMinutes,
                stock: piece.stock,
                salePrice: piece.salePrice,
            });
        }
    }, [piece]);

    const totalMaterialCost = useMemo(() => formData.yarnCost + formData.accessoriesCost + formData.otherCosts, [formData]);
    const timeCost = useMemo(() => (formData.timeHours + formData.timeMinutes / 60) * settings.hourlyRate, [formData.timeHours, formData.timeMinutes, settings.hourlyRate]);
    const baseCost = useMemo(() => totalMaterialCost + timeCost, [totalMaterialCost, timeCost]);
    const suggestedPrice = useMemo(() => baseCost * (1 + settings.profitMargin / 100), [baseCost, settings.profitMargin]);
    
    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setFormData(prev => ({...prev, photos: [event.target?.result as string]}));
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || formData.photos.length === 0) {
            alert('Por favor, preencha o nome e adicione uma foto.');
            return;
        }
        onSave({ ...formData, id: piece?.id, createdAt: piece?.createdAt });
        onClose();
    };

    const handleDelete = () => {
         if (piece && window.confirm('Tem certeza que deseja apagar esta peça? Esta ação não pode ser desfeita.')) {
            onDelete(piece.id);
            onClose();
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-5">
            <div className="bg-white/80 backdrop-blur-lg w-full max-w-2xl max-h-full sm:max-h-[90vh] rounded-none sm:rounded-3xl shadow-2xl flex flex-col">
                <header className="p-6 sm:p-8 flex justify-between items-center border-b border-black/10">
                    <h2 className="text-2xl sm:text-3xl font-bold text-graphite">{isEditing ? 'Editar Peça' : 'Nova Peça'}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-black">
                        <XIcon className="w-7 h-7" />
                    </button>
                </header>
                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 sm:p-10 space-y-6 sm:space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
                        {/* Column 1: Info & Photo */}
                        <div className="space-y-6 sm:space-y-8">
                             <div>
                                <label htmlFor="photo-upload" className="block text-base sm:text-lg font-medium text-graphite mb-2">Foto da Peça</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl">
                                    <div className="space-y-1 text-center">
                                        {formData.photos.length > 0 ? (
                                            <img src={formData.photos[0]} alt="Preview" className="mx-auto h-24 sm:h-32 w-24 sm:w-32 object-cover rounded-lg"/>
                                        ) : (
                                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        )}
                                        <div className="flex text-base sm:text-lg text-gray-600">
                                            <label htmlFor="photo-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-sage-green hover:text-sage-green-dark focus-within:outline-none">
                                                <span>Carregar um arquivo</span>
                                                <input id="photo-upload" name="photo-upload" type="file" className="sr-only" accept="image/*" onChange={handlePhotoUpload} />
                                            </label>
                                        </div>
                                        <p className="text-sm sm:text-base text-gray-500">PNG, JPG, etc.</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-base sm:text-lg font-medium text-graphite">Nome da Peça</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-2 block w-full text-base sm:text-lg p-3 bg-white/50 border-gray-300 rounded-lg shadow-sm" required />
                            </div>
                            <div>
                                <label className="block text-base sm:text-lg font-medium text-graphite">Categoria</label>
                                <input type="text" name="category" value={formData.category} onChange={handleChange} placeholder="Ex: Amigurumi, Bolsa" className="mt-2 block w-full text-base sm:text-lg p-3 bg-white/50 border-gray-300 rounded-lg shadow-sm" />
                            </div>
                        </div>

                        {/* Column 2: Costs & Price */}
                        <div className="space-y-6 sm:space-y-8">
                           <div className="p-4 sm:p-6 rounded-xl bg-slate-100/50 space-y-4 sm:space-y-6">
                                <h3 className="font-semibold text-lg sm:text-xl text-graphite">Custo e Preço</h3>
                                <div>
                                    <label className="block text-base sm:text-lg font-medium text-graphite">Custo dos Fios (R$)</label>
                                    <input type="number" step="0.01" name="yarnCost" value={formData.yarnCost} onChange={handleChange} className="mt-2 block w-full text-base sm:text-lg p-3 bg-white/50 border-gray-300 rounded-lg shadow-sm" />
                                </div>
                                <div>
                                    <label className="block text-base sm:text-lg font-medium text-graphite">Custo de Acessórios (R$)</label>
                                    <input type="number" step="0.01" name="accessoriesCost" value={formData.accessoriesCost} onChange={handleChange} className="mt-2 block w-full text-base sm:text-lg p-3 bg-white/50 border-gray-300 rounded-lg shadow-sm" />
                                </div>
                                <div>
                                    <label className="block text-base sm:text-lg font-medium text-graphite">Outros Custos (R$)</label>
                                    <input type="number" step="0.01" name="otherCosts" value={formData.otherCosts} onChange={handleChange} className="mt-2 block w-full text-base sm:text-lg p-3 bg-white/50 border-gray-300 rounded-lg shadow-sm" />
                                </div>
                                <div>
                                    <label className="block text-base sm:text-lg font-medium text-graphite">Tempo Gasto</label>
                                    <div className="flex space-x-3 mt-2">
                                        <input type="number" placeholder="Horas" name="timeHours" value={formData.timeHours || ''} onChange={handleChange} className="block w-full text-base sm:text-lg p-3 bg-white/50 border-gray-300 rounded-lg shadow-sm" />
                                        <input type="number" placeholder="Minutos" name="timeMinutes" value={formData.timeMinutes || ''} onChange={handleChange} className="block w-full text-base sm:text-lg p-3 bg-white/50 border-gray-300 rounded-lg shadow-sm" />
                                    </div>
                                </div>
                           </div>
                           <div className="p-4 sm:p-6 rounded-xl bg-pale-gold/20 text-center space-y-3">
                                <div className="flex justify-around items-center">
                                     <div>
                                        <p className="text-sm sm:text-base text-yellow-800">Custo Base</p>
                                        <p className="text-xl sm:text-2xl font-bold text-yellow-900">{baseCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm sm:text-base text-yellow-800">Preço Sugerido</p>
                                        <p className="text-xl sm:text-2xl font-bold text-yellow-900">{suggestedPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                    </div>
                                </div>
                           </div>
                           <div className="space-y-4 sm:space-y-6">
                             <div>
                                <label className="block text-base sm:text-lg font-medium text-graphite">Preço de Venda Final (R$)</label>
                                <input type="number" step="0.01" name="salePrice" value={formData.salePrice} onChange={handleChange} className="mt-2 block w-full text-base sm:text-lg p-3 bg-white/50 border-gray-300 rounded-lg shadow-sm" />
                            </div>
                            <div>
                                <label className="block text-base sm:text-lg font-medium text-graphite">Quantidade em Estoque</label>
                                <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="mt-2 block w-full text-base sm:text-lg p-3 bg-white/50 border-gray-300 rounded-lg shadow-sm" />
                            </div>
                           </div>
                        </div>
                    </div>

                     <div className="pt-6 flex justify-between items-center">
                        <div>
                            {isEditing && (
                               <button type="button" onClick={handleDelete} className="bg-red-500/10 py-3 px-6 sm:py-3.5 sm:px-8 rounded-lg text-base sm:text-lg font-medium text-red-700 hover:bg-red-500/20">
                                   Excluir Peça
                                </button>
                            )}
                        </div>
                        <div className="flex justify-end space-x-2 sm:space-x-4">
                            <button type="button" onClick={onClose} className="bg-white py-3 px-6 sm:py-3.5 sm:px-8 border border-gray-300 rounded-lg shadow-sm text-base sm:text-lg font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
                            <button type="submit" className="inline-flex justify-center py-3 px-6 sm:py-3.5 sm:px-8 border border-transparent shadow-sm text-base sm:text-lg font-medium rounded-lg text-white bg-sage-green hover:bg-sage-green-dark">
                                {isEditing ? 'Salvar Alterações' : 'Salvar Peça'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface PiecesScreenProps {
    pieces: Piece[];
    settings: Settings;
    onSavePiece: (piece: Omit<Piece, 'id' | 'createdAt'> & Partial<Pick<Piece, 'id' | 'createdAt'>>) => void;
    onDeletePiece: (pieceId: string) => void;
}

const PiecesScreen: React.FC<PiecesScreenProps> = ({ pieces, settings, onSavePiece, onDeletePiece }) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPiece, setEditingPiece] = useState<Piece | null>(null);

    const handleOpenFormForNew = () => {
        setEditingPiece(null);
        setIsFormOpen(true);
    };

    const handleOpenFormForEdit = (piece: Piece) => {
        setEditingPiece(piece);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingPiece(null);
    }

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center">
                <h1 className="text-4xl sm:text-5xl font-bold text-graphite">Minhas Peças</h1>
                <button
                    onClick={handleOpenFormForNew}
                    className="bg-sage-green text-white rounded-full p-4 shadow-lg hover:bg-opacity-90 transition"
                >
                    <PlusIcon className="w-7 h-7" />
                </button>
            </header>

            {isFormOpen && <PieceForm piece={editingPiece} settings={settings} onSave={onSavePiece} onClose={handleCloseForm} onDelete={onDeletePiece} />}
            
            {pieces.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-lg sm:text-xl text-gray-500">Nenhuma peça cadastrada ainda.</p>
                    <p className="text-base sm:text-lg text-gray-400 mt-2">Clique no '+' para começar.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {pieces.map(piece => (
                        <button key={piece.id} onClick={() => handleOpenFormForEdit(piece)} className="text-left bg-white/60 backdrop-blur-lg border border-white/30 rounded-2xl shadow-md overflow-hidden hover:ring-2 hover:ring-sage-green transition-all duration-200">
                            <img src={piece.photos[0]} alt={piece.name} className="w-full h-40 sm:h-52 object-cover" />
                            <div className="p-4">
                                <h3 className="font-bold text-lg sm:text-xl truncate">{piece.name}</h3>
                                <p className="text-base sm:text-lg text-gray-600">{piece.category || 'Sem categoria'}</p>
                                <div className="flex justify-between items-baseline mt-2">
                                     <p className="text-xl sm:text-2xl font-bold text-sage-green">{piece.salePrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                     <p className="text-sm sm:text-base text-gray-500">Estoque: {piece.stock}</p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PiecesScreen;