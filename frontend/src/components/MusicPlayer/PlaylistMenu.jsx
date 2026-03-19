import React, { useState, useEffect, useRef } from 'react';
import { 
    Edit, Trash2, Share2, Copy, Plus,
    MoreHorizontal, ChevronRight, Music2 
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';
const imgUrl = (src) => {
    if (!src) return null;
    if (src.startsWith('http://') || src.startsWith('https://')) return src;
    return `${API_BASE}${src.startsWith('/') ? '' : '/'}${src}`;
};

const PlaylistMenu = ({ playlist, position, onClose, isOwner, isSaved, onToggleSave, onDelete, onEdit }) => {
    const menuRef = useRef(null);
    const [style, setStyle] = useState({ 
        top: position.y, 
        left: position.x, 
        transform: 'translate(-100%, -100%)',
        opacity: 0,
        scale: 0.95
    });

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        
        const timer = setTimeout(() => {
            if (menuRef.current) {
                const rect = menuRef.current.getBoundingClientRect();
                const winW = window.innerWidth;
                const winH = window.innerHeight;

                let tx = '-100%';
                let ty = '-100%';

                if (position.y < rect.height + 20) ty = '0%';
                if (position.x < rect.width + 20) tx = '0%';
                if (position.x + 20 > winW) tx = '-100%';
                if (position.y + 20 > winH) ty = '-100%';

                setStyle({
                    top: position.y,
                    left: position.x,
                    transform: `translate(${tx}, ${ty})`,
                    opacity: 1,
                    scale: 1
                });
            }
        }, 0);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            clearTimeout(timer);
        };
    }, [onClose, position]);

    if (!playlist) return null;

    const menuItems = [
        ...(isOwner ? [
            { label: 'Sửa thông tin', icon: <Edit size={18} />, action: onEdit },
            { label: 'Xóa danh sách phát', icon: <Trash2 size={18} />, action: onDelete },
        ] : [
            { label: isSaved ? 'Bỏ lưu khỏi thư viện' : 'Thêm vào thư viện', icon: <Plus size={18} />, action: onToggleSave },
        ]),
        { label: 'Sao chép liên kết', icon: <Copy size={18} />, action: () => {
            navigator.clipboard.writeText(window.location.href);
            alert("Đã sao chép liên kết!");
            onClose();
        }},
        { label: 'Chia sẻ', icon: <Share2 size={18} />, action: () => { /* Logic chia sẻ */ onClose(); } },
    ];

    return (
        <div 
            ref={menuRef}
            className="fixed z-[3000] w-72 bg-[#1a1a1a]/95 backdrop-blur-2xl rounded-2xl shadow-[0_30px_100px_rgba(0,0,0,0.9)] border border-white/10 py-2 overflow-visible transition-all duration-300 ring-1 ring-white/10"
            style={style}
        >
            {/* Header */}
            <div className="px-5 py-4 flex items-center gap-4 border-b border-white/5 mb-2">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-900 flex-shrink-0 shadow-2xl ring-1 ring-white/10">
                    <img src={imgUrl(playlist.anhBia)} alt={playlist.ten} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-black text-white truncate uppercase tracking-tighter leading-tight">{playlist.ten}</p>
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest truncate mt-1.5 flex items-center gap-1.5">
                        <Music2 size={10} className="text-gray-600" />
                        {playlist.songs?.length || 0} bài hát
                    </p>
                </div>
            </div>

            {/* Menu Items */}
            <div className="flex flex-col px-2 pb-1">
                {menuItems.map((item, idx) => (
                    <div 
                        key={idx}
                        onClick={() => { if (item.action) item.action(); onClose(); }}
                        className="px-4 py-3 flex items-center gap-3.5 rounded-xl hover:bg-white/10 transition-all cursor-pointer group text-gray-300 hover:text-white"
                    >
                        <span className="opacity-40 group-hover:opacity-100 transition-opacity">{item.icon}</span>
                        <span className="text-[13px] font-black tracking-tight uppercase">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PlaylistMenu;
