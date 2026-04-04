import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, Library, Search } from 'lucide-react';

const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { id: 'home', label: 'Home', icon: <Home size={20} />, path: '/home' },
        { id: 'browse', label: 'Explore', icon: <LayoutGrid size={20} />, path: '/home/browse' },
        { id: 'library', label: 'Library', icon: <Library size={20} />, path: '/home/library' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#0a0a0a]/95 backdrop-blur-md border-t border-white/5 flex items-center justify-around px-2 z-[1000] md:hidden shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
            {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                    <button
                        key={item.id}
                        onClick={() => navigate(item.path)}
                        className={`flex flex-col items-center gap-1 transition-all duration-300 w-20 py-1.5 ${
                            isActive ? 'text-[#0F5E8F] scale-110' : 'text-gray-500'
                        }`}
                    >
                        <div className={`p-1 rounded-lg transition-colors ${isActive ? 'bg-[#0F5E8F]/10' : ''}`}>
                            {item.icon}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                            {item.label}
                        </span>
                    </button>
                );
            })}
        </nav>
    );
};

export default BottomNav;
