import React, { useRef, useEffect, useState } from 'react';
import { 
    Plus, Heart, Radio, Disc, Search, User, Share2, 
    Monitor, Ban, ChevronRight, Music2, Check, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMusic } from '../../context/MusicContext';
import { addSongToPlaylistApi } from '../../services/api_services';
import CreatePlaylistModal from '../Playlist/CreatePlaylistModal';

const API_BASE = import.meta.env.VITE_API_URL || '';
const imgUrl = (src) => {
    if (!src) return null;
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) return src;
    return `${API_BASE}${src.startsWith('/') ? '' : '/'}${src}`;
};

const SongMenu = ({ song, position, onClose }) => {
    const navigate = useNavigate();
    const { myPlaylists, refreshUser } = useMusic();
    const menuRef = useRef(null);
    const [activeSubmenu, setActiveSubmenu] = useState(null);
    const [submenuDirection, setSubmenuDirection] = useState('right');
    const [isAdding, setIsAdding] = useState(null); // id of playlist being added to
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    const [style, setStyle] = useState({ 
        top: position.y, 
        left: position.x, 
        transform: 'translate(-100%, -100%)',
        opacity: 0,
        scale: 0.95
    });

    useEffect(() => {
        // Lock scroll
        const originalOverflow = document.body.style.overflow;
        if (!isCreateModalOpen) document.body.style.overflow = 'hidden';

        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                if (!isCreateModalOpen) onClose();
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
                
                // Check submenu direction
                const expectedSubmenuRight = rect.right + 250; 
                if (expectedSubmenuRight > winW) {
                    setSubmenuDirection('left');
                } else {
                    setSubmenuDirection('right');
                }

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
            document.body.style.overflow = originalOverflow;
            document.removeEventListener('mousedown', handleClickOutside);
            clearTimeout(timer);
        };
    }, [onClose, position, isCreateModalOpen]);

    if (!song) return null;

    const handleAddSong = async (playlistId) => {
        setIsAdding(playlistId);
        try {
            await addSongToPlaylistApi(playlistId, song.id || song.Id);
            refreshUser(); // Cập nhật Sidebar ngay lập tức
            // Optional: toast notification
            setTimeout(onClose, 500);
        } catch (error) {
            console.error("Lỗi khi thêm bài hát vào playlist:", error);
            alert("Không thể thêm bài hát vào danh sách phát này.");
            setIsAdding(null);
        }
    };

    const menuItems = [
        { label: 'Thêm vào danh sách phát', icon: <Plus size={18} />, hasSubmenu: true, id: 'add-playlist' },
        { label: 'Đi tới album', icon: <Disc size={18} />, action: () => { navigate(`/home/album/${song.idAlbum || song.IdAlbum}`); onClose(); } },
        { label: 'Đi tới nghệ sĩ', icon: <User size={18} />, action: () => { navigate(`/home/artist/${song.artistId || song.ArtistId}`); onClose(); } },
        { label: 'Chia sẻ', icon: <Share2 size={18} />, hasSubmenu: true, id: 'share' },
    ];

    return (
        <>
            <div 
                ref={menuRef}
                className={`fixed z-[3000] w-72 bg-[#1a1a1a]/95 backdrop-blur-2xl rounded-2xl shadow-[0_30px_100px_rgba(0,0,0,0.9)] border border-white/10 py-2 overflow-visible transition-all duration-300 ring-1 ring-white/10 ${isCreateModalOpen ? 'opacity-0 pointer-events-none' : ''}`}
                style={style}
            >
                {/* Header */}
                <div className="px-5 py-4 flex items-center gap-4 border-b border-white/5 mb-2">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-900 flex-shrink-0 shadow-2xl ring-1 ring-white/10">
                        <img src={imgUrl(song.anhBia)} alt={song.tieuDe} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[15px] font-black text-white truncate uppercase tracking-tighter leading-tight">{song.tieuDe}</p>
                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest truncate mt-1.5 flex items-center gap-1.5">
                            <User size={10} className="text-gray-600" />
                            {song.tenNgheSi}{song.ngheSiHopTac ? `, ${song.ngheSiHopTac}` : ''}
                        </p>
                    </div>
                </div>

                {/* Main Menu */}
                <div className="flex flex-col px-2 pb-1">
                    {menuItems.map((item, idx) => (
                        <div 
                            key={idx}
                            onMouseEnter={() => item.hasSubmenu ? setActiveSubmenu(item.id) : setActiveSubmenu(null)}
                            onClick={() => { if (item.action) item.action(); if (!item.hasSubmenu) onClose(); }}
                            className={`
                                relative px-4 py-3 flex items-center justify-between rounded-xl hover:bg-white/10 transition-all cursor-pointer group
                                text-gray-300 hover:text-white
                            `}
                        >
                            <div className="flex items-center gap-3.5">
                                <span className="opacity-40 group-hover:opacity-100 transition-opacity">{item.icon}</span>
                                <span className="text-[13px] font-black tracking-tight uppercase">{item.label}</span>
                            </div>
                            {item.hasSubmenu && <ChevronRight size={16} className="opacity-20 group-hover:opacity-60 transition-opacity" />}

                            {/* Submenu */}
                            {activeSubmenu === item.id && item.hasSubmenu && (
                                <div 
                                    className={`
                                        absolute top-[-8px] w-64 bg-[#222222]/98 backdrop-blur-3xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] border border-white/10 py-3 animate-fade-in z-[3001] ring-1 ring-white/10 flex flex-col
                                        ${submenuDirection === 'right' ? 'left-[102%]' : 'right-[102%]'}
                                    `}
                                >
                                    {item.id === 'add-playlist' ? (
                                        <div className="flex flex-col max-h-[400px] overflow-y-auto custom-main-scroll px-1">
                                            <div className="px-4 py-1 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-2 border-b border-white/5 pb-2">Thêm vào playlist</div>
                                            
                                            <div 
                                                onClick={(e) => { e.stopPropagation(); setIsCreateModalOpen(true); }}
                                                className="px-4 py-3 hover:bg-white/5 mx-1 rounded-lg text-[12px] font-black text-rose-500 cursor-pointer transition-colors uppercase tracking-tight flex items-center gap-3 group/btn shadow-sm"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center group-hover/btn:bg-rose-500/20 transition-colors">
                                                    <Plus size={16} />
                                                </div>
                                                Tạo playlist mới
                                            </div>

                                            <div className="h-[1px] bg-white/5 my-2 mx-4" />

                                            {myPlaylists.length > 0 ? (
                                                myPlaylists.map(pl => (
                                                    <div 
                                                        key={pl.id}
                                                        onClick={(e) => { e.stopPropagation(); handleAddSong(pl.id); }}
                                                        className="px-4 py-2.5 hover:bg-white/10 mx-1 rounded-lg text-[12px] font-bold text-white/70 hover:text-white cursor-pointer transition-all flex items-center justify-between group/pl"
                                                    >
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className="w-8 h-8 rounded bg-gray-900 flex-shrink-0 overflow-hidden ring-1 ring-white/5 group-hover/pl:ring-white/20 transition-all">
                                                                {pl.anhBia ? (
                                                                    <img src={imgUrl(pl.anhBia)} className="w-full h-full object-cover" alt="" />
                                                                ) : (
                                                                    <div className="w-full h-full bg-[#1a1a1a]">
                                                                        {pl.topSongImages && pl.topSongImages.length >= 4 ? (
                                                                            <div className="grid grid-cols-2 grid-rows-2 w-full h-full">
                                                                                {pl.topSongImages.slice(0, 4).map((img, i) => (
                                                                                    <img key={i} src={imgUrl(img)} alt="" className="w-full h-full object-cover" />
                                                                                ))}
                                                                            </div>
                                                                        ) : pl.topSongImages && pl.topSongImages.length > 0 ? (
                                                                            <img src={imgUrl(pl.topSongImages[0])} alt="" className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            <div className="w-full h-full flex items-center justify-center">
                                                                                <Music2 size={12} className="text-white/20" />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <span className="truncate">{pl.ten}</span>
                                                        </div>
                                                        {isAdding === pl.id ? (
                                                            <Loader2 size={14} className="animate-spin text-rose-500" />
                                                        ) : (
                                                            <div className="w-2 h-2 rounded-full bg-rose-500 opacity-0 group-hover/pl:opacity-100 transition-opacity" />
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="px-4 py-8 text-center text-[11px] font-black text-white/10 uppercase tracking-widest italic">
                                                    Chưa có playlist nào
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="px-5 py-4 text-[12px] font-black text-white/30 italic text-center uppercase tracking-widest">Đang phát triển</div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <CreatePlaylistModal 
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={(newPl) => {
                    // Tự động thêm bài hát vào playlist vừa tạo
                    if (newPl && newPl.id) handleAddSong(newPl.id);
                }}
            />
        </>
    );
};

export default SongMenu;
