import React, { useState, useEffect } from 'react';
import type { Settings } from '../types';

interface SettingsScreenProps {
    settings: Settings;
    setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ settings, setSettings }) => {
    const [localSettings, setLocalSettings] = useState(settings);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setLocalSettings(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value,
        }));
    };

    const handleSave = () => {
        setSettings(localSettings);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="space-y-8 max-w-lg mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-graphite text-center md:text-left">Ajustes</h1>
            
            <div className="bg-white/60 backdrop-blur-lg border border-white/30 p-8 sm:p-12 rounded-2xl shadow-md space-y-8 sm:space-y-10">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-graphite">O Cérebro do Negócio</h2>
                    <p className="text-base sm:text-lg text-gray-500 mt-2">
                        Estes valores são a base para todos os seus cálculos de preço.
                    </p>
                </div>
                
                <div>
                    <label className="block text-base sm:text-lg font-medium text-graphite mb-2">Nome do Ateliê</label>
                    <input
                        type="text"
                        name="atelierName"
                        value={localSettings.atelierName}
                        onChange={handleChange}
                        className="mt-1 block w-full text-base sm:text-lg p-3 bg-white/50 border-gray-300 rounded-lg shadow-sm focus:ring-sage-green focus:border-sage-green"
                    />
                </div>

                <div>
                    <label className="block text-base sm:text-lg font-medium text-graphite mb-2">Quanto vale a sua hora de trabalho? (R$)</label>
                    <input
                        type="number"
                        name="hourlyRate"
                        value={localSettings.hourlyRate}
                        onChange={handleChange}
                        className="mt-1 block w-full text-base sm:text-lg p-3 bg-white/50 border-gray-300 rounded-lg shadow-sm focus:ring-sage-green focus:border-sage-green"
                    />
                </div>

                <div>
                    <label className="block text-base sm:text-lg font-medium text-graphite mb-2">Margem de Lucro Desejada (%)</label>
                    <input
                        type="number"
                        name="profitMargin"
                        value={localSettings.profitMargin}
                        onChange={handleChange}
                        className="mt-1 block w-full text-base sm:text-lg p-3 bg-white/50 border-gray-300 rounded-lg shadow-sm focus:ring-sage-green focus:border-sage-green"
                    />
                </div>

                <div className="flex justify-end items-center pt-4">
                    {saved && <span className="text-base sm:text-lg text-sage-green mr-4">Salvo!</span>}
                    <button
                        onClick={handleSave}
                        className="inline-flex justify-center py-3 px-6 sm:py-3.5 sm:px-8 border border-transparent shadow-sm text-base sm:text-lg font-medium rounded-lg text-white bg-sage-green hover:bg-opacity-90 transition"
                    >
                        Salvar Alterações
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsScreen;