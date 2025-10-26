
import React from 'react';
import type { Screen } from '../types';
import { PiecesIcon, SalesIcon, OrderIcon, ResultsIcon, SettingsIcon } from './icons';

interface BottomNavProps {
    activeScreen: Screen;
    setActiveScreen: (screen: Screen) => void;
}

const NavItem: React.FC<{
    screen: Screen;
    label: string;
    Icon: React.ElementType;
    isActive: boolean;
    onClick: () => void;
}> = ({ screen, label, Icon, isActive, onClick }) => {
    const activeClass = 'text-sage-green';
    const inactiveClass = 'text-gray-400 hover:text-sage-green';

    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center flex-1 transition-colors duration-300 ${isActive ? activeClass : inactiveClass}`}
        >
            <Icon className="w-7 h-7" />
            <span className="text-sm mt-1">{label}</span>
        </button>
    );
};

const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, setActiveScreen }) => {
    const navItems: { screen: Screen; label: string; Icon: React.ElementType }[] = [
        { screen: 'pieces', label: 'Peças', Icon: PiecesIcon },
        { screen: 'sales', label: 'Vendas', Icon: SalesIcon },
        { screen: 'orders', label: 'Encomendas', Icon: OrderIcon },
        { screen: 'results', label: 'Resultados', Icon: ResultsIcon },
        { screen: 'settings', label: 'Ajustes', Icon: SettingsIcon },
    ];

    return (
        <footer className="fixed bottom-5 left-5 right-5 h-20 bg-white/70 backdrop-blur-xl rounded-3xl shadow-lg border border-white/30">
            <nav className="h-full flex items-center justify-around">
                {navItems.map((item) => (
                    <NavItem
                        key={item.screen}
                        screen={item.screen}
                        label={item.label}
                        Icon={item.Icon}
                        isActive={activeScreen === item.screen}
                        onClick={() => setActiveScreen(item.screen)}
                    />
                ))}
            </nav>
        </footer>
    );
};

export default BottomNav;
