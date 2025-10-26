import React, { useMemo, useState } from 'react';
import type { Sale } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ResultsScreenProps {
    sales: Sale[];
}

type Period = 'week' | 'month' | 'year';

const ResultsScreen: React.FC<ResultsScreenProps> = ({ sales }) => {
    const [period, setPeriod] = useState<Period>('month');

    const periodData = useMemo(() => {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday as start of week
        startOfWeek.setHours(0, 0, 0, 0);

        const periodSales = sales.filter(sale => {
            const saleDate = new Date(sale.date);
            switch (period) {
                case 'week':
                    return saleDate >= startOfWeek;
                case 'year':
                    return saleDate.getFullYear() === now.getFullYear();
                case 'month':
                default:
                    return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
            }
        });

        const totalProfit = periodSales.reduce((sum, sale) => sum + (Number(sale.profit) || 0), 0);
        const totalRevenue = periodSales.reduce((sum, sale) => sum + (Number(sale.salePrice) || 0), 0);
        const totalCost = periodSales.reduce((sum, sale) => sum + (Number(sale.baseCost) || 0) * (Number(sale.quantity) || 1), 0);

        const profitByPiece = periodSales.reduce((acc, sale) => {
            const pieceName = (sale as any).pieceName || (sale as any).piece?.name || 'Peça desconhecida';
            if (!acc[pieceName]) {
                acc[pieceName] = 0;
            }
            acc[pieceName] += (Number(sale.profit) || 0);
            return acc;
        }, {} as Record<string, number>);

        const topPieces = Object.entries(profitByPiece)
            .map(([name, profit]) => ({ name, profit }))
            .sort((a, b) => (Number(b.profit) || 0) - (Number(a.profit) || 0))
            .slice(0, 5);

        return { totalProfit, totalRevenue, totalCost, topPieces, salesInPeriod: periodSales.length };
    }, [sales, period]);

    const titles: Record<Period, string> = {
        week: 'Resultados da Semana',
        month: 'Resultados do Mês',
        year: 'Resultados do Ano',
    };

    const periodLabels: Record<Period, string> = {
        week: 'Semana',
        month: 'Mês',
        year: 'Ano',
    };

    return (
        <div className="space-y-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-graphite">{titles[period]}</h1>

            <div className="flex justify-center p-1.5 bg-gray-200/50 rounded-xl space-x-2">
                {(['week', 'month', 'year'] as Period[]).map(p => (
                    <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={`w-full py-2.5 px-3 sm:py-3 sm:px-4 rounded-lg text-base sm:text-lg font-semibold transition-colors duration-300 ${
                            period === p ? 'bg-sage-green text-white shadow' : 'text-gray-600 hover:bg-white/50'
                        }`}
                    >
                        {periodLabels[p]}
                    </button>
                ))}
            </div>

            {periodData.salesInPeriod === 0 ? (
                 <div className="text-center py-20">
                    <p className="text-lg sm:text-xl text-gray-500">Nenhuma venda registrada neste período.</p>
                    <p className="text-base sm:text-lg text-gray-400 mt-2">Vá para a aba 'Vendas' para registrar uma nova venda.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 text-center">
                        <div className="bg-white/60 backdrop-blur-lg border border-white/30 p-6 sm:p-10 rounded-2xl shadow-md">
                            <p className="text-base sm:text-lg text-gray-500">Lucro Total</p>
                            <p className="text-4xl sm:text-5xl font-bold text-sage-green">{periodData.totalProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        </div>
                         <div className="bg-white/60 backdrop-blur-lg border border-white/30 p-6 sm:p-10 rounded-2xl shadow-md">
                            <p className="text-base sm:text-lg text-gray-500">Receita Bruta</p>
                            <p className="text-4xl sm:text-5xl font-bold text-graphite">{periodData.totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        </div>
                         <div className="bg-white/60 backdrop-blur-lg border border-white/30 p-6 sm:p-10 rounded-2xl shadow-md">
                            <p className="text-base sm:text-lg text-gray-500">Custo Total</p>
                            <p className="text-4xl sm:text-5xl font-bold text-dusty-rose">{periodData.totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        </div>
                    </div>
                    
                    <div className="bg-white/60 backdrop-blur-lg border border-white/30 p-6 sm:p-10 rounded-2xl shadow-md">
                        <h2 className="font-bold text-xl sm:text-2xl text-graphite mb-6">Ranking de Peças (Lucro)</h2>
                        <div className="w-full h-80 sm:h-96">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={periodData.topPieces} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                    <XAxis type="number" hide />
                                    <YAxis 
                                        type="category" 
                                        dataKey="name" 
                                        width={100} 
                                        tickLine={false} 
                                        axisLine={false}
                                        tick={{ fontSize: 14, fill: '#374151' }}
                                        tickMargin={5}
                                    />
                                    <Tooltip 
                                        cursor={{fill: 'rgba(236, 253, 245, 0.5)'}} 
                                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', border: 'none', borderRadius: '10px' }}
                                        formatter={(value: number) => [value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), "Lucro"]}
                                    />
                                    <Bar dataKey="profit" radius={[0, 10, 10, 0]}>
                                       {periodData.topPieces.map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={'#fcd34d'}/> // Pale Gold
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ResultsScreen;