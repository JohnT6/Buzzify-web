import React, { useRef, useEffect, useState } from 'react';
import { 
    Users, Share2, ListPlus, Trash2, 
    ChevronRight, Music2, Check, Loader2, Play
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMusic } from '../../context/MusicContext';
import { getPlaylistByIdApi } from '../../services/api_services';

const API_BASE = import.meta.env.VITE_API_URL || '';
const imgUrl = (src) => {
    if (!src) return null;
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) return src;
    return `${API_BASE}${src.startsWith('/') ? '' : '/'}${src}`;
};

const PlaylistMenu = ({ playlist, position, onClose }) => {
    const navigate = useNavigate();
    const { setIsJamPanelOpen, setIsJamActive, playSong, startJamSession } = useMusic();
    const menuRef = useRef(null);
    const [style, setStyle] = useState({ 
        top: position.y, 
        left: position.x, 
        opacity: 0,
        scale: 0.95,
        transform: 'translate(0, 0)'
    });

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) onClose();
        };
        document.addEventListener('mousedown', handleClickOutside);
        
        const timer = setTimeout(() => {
            if (menuRef.current) {
                const rect = menuRef.current.getBoundingClientRect();
                const winW = window.innerWidth;
                const winH = window.innerHeight;

                let tx = '0%';
                let ty = '0%';

                if (position.x + rect.width > winW) tx = '-100%';
                if (position.y + rect.height > winH) ty = '-100%';

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
        { 
            label: 'Nghe cùng nhau (Jam)', 
            icon: <Users size={18} className="text-emerald-500" />, 
            action: async () => { 
                try {
                    const res = await getPlaylistByIdApi(playlist.id);
                    const fullPlaylist = res.data || res;
                    const playlistSongs = fullPlaylist.songs || fullPlaylist.Songs || [];
                    const playlistName = fullPlaylist.ten || fullPlaylist.Ten || playlist.ten;

                    if (playlistSongs && playlistSongs.length > 0) {
                        playSong(playlistSongs[0], playlistSongs, { 
                            type: 'playlist', 
                            id: fullPlaylist.id, 
                            name: playlistName 
                        });
                    }
                    startJamSession(); // Gọi để khởi tạo mã phòng luôn thay vì chờ người dùng nhấn nút 'Bắt đầu ngay'
                    onClose(); 
                } catch (error) {
                    console.error("Lỗi khi mở Jam:", error);
                    startJamSession(); // Khởi tạo kể cả lỗi nhạc
                    onClose();
                }
            } 
        },
        { 
            label: 'Phát playlist', 
            icon: <Play size={18} />, 
            action: () => { 
                navigate(`/home/playlist/${playlist.id}`); 
                onClose(); 
            } 
        },
        { 
            label: 'Thêm vào hàng chờ', 
            icon: <ListPlus size={18} />, 
            action: () => { onClose(); } 
        },
        { 
            label: 'Chia sẻ', 
            icon: <Share2 size={18} />, 
            action: () => { onClose(); } 
        },
        { 
            label: 'Xóa playlist', 
            icon: <Trash2 size={18} className="text-rose-500" />, 
            action: () => { onClose(); } 
        },
    ];

    return (
        <div 
            ref={menuRef}
            className="fixed z-[3000] w-64 bg-[#1a1a1a]/95 backdrop-blur-3xl rounded-2xl shadow-[0_30px_100px_rgba(0,0,0,0.9)] border border-white/10 py-2 transition-all duration-300 ring-1 ring-white/10"
            style={style}
        >
            {/* Header Info */}
            <div className="px-5 py-4 flex items-center gap-4 border-b border-white/5 mb-1">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-900 flex-shrink-0 shadow-lg ring-1 ring-white/5">
                    {playlist.anhBia ? (
                        <img src={imgUrl(playlist.anhBia)} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#1a1a1a]">
                            <Music2 size={16} className="text-zinc-700" />
                        </div>
                    )}
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-black text-white truncate uppercase tracking-tight">{playlist.ten}</p>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Playlist</p>
                </div>
            </div>

            {/* Menu Items */}
            <div className="px-1.5 pb-1">
                {menuItems.map((item, idx) => (
                    <div 
                        key={idx}
                        onClick={item.action}
                        className="px-3.5 py-2.5 flex items-center gap-3.5 rounded-xl hover:bg-white/5 transition-all cursor-pointer group text-zinc-400 hover:text-white"
                    >
                        <span className="opacity-40 group-hover:opacity-100 transition-opacity">
                            {item.icon}
                        </span>
                        <span className="text-[12px] font-black tracking-tight uppercase">
                            {item.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PlaylistMenu;
