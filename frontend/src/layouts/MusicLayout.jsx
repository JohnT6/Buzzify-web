import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import { 
    Home as HomeIcon, LayoutGrid, Heart, Library, 
    Search, ChevronLeft, ChevronRight, LogOut, X,
    Plus, ArrowUpDown, Music, LayoutDashboard
} from 'lucide-react';
import { 
    logoutApi, getCurrentUserApi, getPlaylistsApi, 
    getSavedPlaylistsApi, globalSearchApi 
} from '../services/api_services';
import MusicPlayerBar from '../components/MusicPlayer/MusicPlayerBar';
import SearchDropdown from '../components/Search/SearchDropdown';
import { useMusic } from '../context/MusicContext';
import CreatePlaylistModal from '../components/Playlist/CreatePlaylistModal';
import JamPanel from '../components/MusicPlayer/JamPanel';
import PlaylistMenu from '../components/Playlist/PlaylistMenu';
import BottomNav from './BottomNav';

const ACCENT = '#0F5E8F';

const API_BASE = import.meta.env.VITE_API_URL || '';
const imgUrl = (src) => {
    if (!src) return null;
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) return src;
    return `${API_BASE}${src.startsWith('/') ? '' : '/'}${src}`;
};

const Logo = () => {
    const navigate = useNavigate();
    return (
        <div className="flex items-center px-4 py-5 flex-shrink-0 cursor-pointer" onClick={() => navigate('/home')}>
            <img src="/logo/FullLogo_Transparent.png" alt="buzzify" className="h-10 w-auto object-contain" />
        </div>
    );
};

const UserMenu = ({ user, onLogout }) => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const fn = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setIsOpen(false); };
        document.addEventListener('mousedown', fn);
        return () => document.removeEventListener('mousedown', fn);
    }, []);

    const displayName = user?.hoTen || user?.fullName || user?.FullName || 'Người dùng';
    const avatarSrc = user?.anhDaiDien || user?.anhDaiDienProvider 
        || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0F5E8F&color=fff&bold=true`;

    return (
        <div className="relative" ref={menuRef}>
            <button onClick={() => setIsOpen(!isOpen)} 
                className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-white/30 transition-all active:scale-95 flex-shrink-0">
                <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-3 w-60 bg-[#1a1a1a] rounded-2xl shadow-2xl border border-white/10 py-2 z-[600]">
                    <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-sm font-bold text-white truncate">{displayName}</p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email || 'Email của bạn'}</p>
                    </div>
                    {user?.vaiTro === 'artist' && (
                        <button 
                            onClick={() => {
                                setIsOpen(false);
                                navigate('/artist');
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm font-medium flex items-center gap-2 hover:bg-white/10 hover:text-white transition-colors text-blue-400 border-b border-white/5 pb-3 mb-1"
                        >
                            <LayoutDashboard size={14} /> Kênh nghệ sĩ
                        </button>
                    )}
                    {user?.vaiTro === 'admin' && (
                        <button 
                            onClick={() => {
                                setIsOpen(false);
                                navigate('/admin');
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm font-medium flex items-center gap-2 hover:bg-white/10 hover:text-white transition-colors text-indigo-400 border-b border-white/5 pb-3 mb-1"
                        >
                            <LayoutDashboard size={14} /> Trang quản trị
                        </button>
                    )}
                    {['Hồ sơ', 'Cài đặt', 'Trợ giúp'].map(label => (
                        <button 
                            key={label} 
                            onClick={() => {
                                setIsOpen(false);
                                if (label === 'Hồ sơ') navigate('/home/profile');
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                        >
                            {label}
                        </button>
                    ))}
                    <div className="h-px bg-white/10 my-1 mx-3" />
                    <button onClick={onLogout} 
                        className="w-full text-left px-4 py-2.5 text-sm font-medium flex items-center gap-2 hover:bg-white/10 transition-colors"
                        style={{ color: ACCENT }}>
                        <LogOut size={14} /> Đăng xuất
                    </button>
                </div>
            )}
        </div>
    );
};

const MusicLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentSong, user, setUser, playSong, logout, myPlaylists, refreshUser } = useMusic();
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState(null);
    const [recentSearches, setRecentSearches] = useState(() => {
        const saved = localStorage.getItem('recent_searches');
        return saved ? JSON.parse(saved) : [];
    });
    const searchRef = useRef(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isCreatePlaylistModalOpen, setIsCreatePlaylistModalOpen] = useState(false);
    const [playlistMenuConfig, setPlaylistMenuConfig] = useState({ open: false, x: 0, y: 0, playlist: null });

    const handlePlaylistContextMenu = (e, playlist) => {
        e.preventDefault();
        setPlaylistMenuConfig({
            open: true,
            x: e.clientX,
            y: e.clientY,
            playlist: playlist
        });
    };

    const handleLogout = async () => {
        try { await logoutApi(); } catch {}
        logout();
        navigate('/');
    };

    useEffect(() => {
        if (!search.trim()) {
            setSearchResults(null);
            return;
        }
        setIsSearching(true);
        const timer = setTimeout(async () => {
            try {
                const res = await globalSearchApi(search);
                setSearchResults(res?.data || res || null);
            } catch (err) { console.error(err); }
            finally { setIsSearching(false); }
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        const fn = (e) => { 
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowDropdown(false);
                setIsSearchFocused(false);
            }
        };
        document.addEventListener('mousedown', fn);
        return () => document.removeEventListener('mousedown', fn);
    }, []);

    const handleSearchSelect = (item, type = 'query') => {
        const q = typeof item === 'string' ? item : (item.ten || item.fullName || item.tieuDe);
        
        // Save to recent
        const updated = [q, ...recentSearches.filter(i => i !== q)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('recent_searches', JSON.stringify(updated));

        setShowDropdown(false);
        setIsSearchFocused(false);

        if (type === 'track') {
            navigate(`/home/search?q=${encodeURIComponent(q)}`);
        } else if (type === 'album') {
            navigate(`/home/album/${item.id}`);
        } else {
            navigate(`/home/search?q=${encodeURIComponent(q)}`);
        }
    };

    const handleRemoveRecent = (q) => {
        const updated = recentSearches.filter(i => i !== q);
        setRecentSearches(updated);
        localStorage.setItem('recent_searches', JSON.stringify(updated));
    };

    const navItems = [
        { id: 'home', label: 'Trang chủ', icon: <HomeIcon size={18} />, path: '/home' },
        { id: 'browse', label: 'Khám phá', icon: <LayoutGrid size={18} />, path: '/home/browse' },
        { id: 'library', label: 'Thư viện', icon: <Library size={18} />, path: '/home/library' },
    ];

    return (
        <div className="flex h-screen text-white overflow-hidden" style={{ background: '#0e0e0e', fontFamily: "'Inter', -apple-system, sans-serif" }}>
            
            {/* Sidebar - Hidden on Mobile */}
            <aside className="w-56 flex-shrink-0 flex flex-col overflow-hidden hidden md:flex" style={{ background: '#0a0a0a', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                <Logo />
                <nav className="px-3 space-y-0.5 flex-shrink-0">
                    {navItems.map(item => (
                        <button key={item.id} onClick={() => navigate(item.path)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${location.pathname === item.path ? 'text-white' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                            style={location.pathname === item.path ? { background: ACCENT } : {}}>
                            {item.icon}{item.label}
                        </button>
                    ))}
                </nav>

                <div className="mt-8 px-4 flex-1 overflow-hidden flex flex-col min-h-0">
                    <div className="flex items-center justify-between mb-4 pr-1">
                        <p className="text-[11px] uppercase font-black tracking-[0.1em] text-white/30">All playlists</p>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setIsCreatePlaylistModalOpen(true)}
                                className="p-1.5 rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                            >
                                <Plus size={16} />
                            </button>
                            <button className="p-1.5 rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-colors">
                                <ArrowUpDown size={14} />
                            </button>
                        </div>
                    </div>
                    
                    <div className="space-y-1 overflow-y-auto flex-1 hide-scrollbar pr-1" data-lenis-prevent>
                        {loading ? (
                            <div className="animate-pulse space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex gap-3">
                                        <div className="w-10 h-10 bg-white/5 rounded"></div>
                                        <div className="flex-1 space-y-2 py-1">
                                            <div className="h-3 bg-white/5 rounded w-3/4"></div>
                                            <div className="h-2 bg-white/5 rounded w-1/2"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            myPlaylists.filter(p => !p.ten?.toLowerCase().includes('thích')).map(pl => (
                                <button key={pl.id} 
                                    onClick={() => navigate(`/home/playlist/${pl.id}`)}
                                    onContextMenu={(e) => handlePlaylistContextMenu(e, pl)}
                                    className="w-full flex items-center gap-3 p-2 rounded-xl group hover:bg-white/5 transition-all text-left">
                                    <div className="w-10 h-10 rounded bg-[#1a1a1a] flex-shrink-0 overflow-hidden border border-white/5 group-hover:border-white/10 transition-colors">
                                        {pl.anhBia ? (
                                            <img src={imgUrl(pl.anhBia)} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full">
                                                {pl.topSongImages && pl.topSongImages.length >= 4 ? (
                                                    <div className="grid grid-cols-2 grid-rows-2 w-full h-full bg-[#1a1a1a]">
                                                        {pl.topSongImages.slice(0, 4).map((img, i) => (
                                                            <img key={i} src={imgUrl(img)} alt="" className="w-full h-full object-cover" />
                                                        ))}
                                                    </div>
                                                ) : pl.topSongImages && pl.topSongImages.length > 0 ? (
                                                    <img src={imgUrl(pl.topSongImages[0])} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-[#1a1a1a]">
                                                        <Music size={18} className="text-white/20 group-hover:text-white/40 transition-colors" />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13.5px] font-bold text-white/80 group-hover:text-white truncate transition-colors tracking-tight leading-tight">
                                            {pl.ten}
                                        </p>
                                        <p className="text-[11px] text-white/30 group-hover:text-white/50 truncate transition-colors mt-0.5">
                                            {pl.songCount || pl.baiHatTrongPlaylists?.length || 0} items
                                        </p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </aside>

            {/* Main area */}
            <div className={`flex-1 flex flex-col overflow-hidden`}>
                <header className="flex-shrink-0 flex items-center justify-between px-4 md:px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: '#0a0a0a' }}>
                    <div className="flex gap-4">
                        {/* Mobile Logo */}
                        <div className="md:hidden flex items-center" onClick={() => navigate('/home')}>
                            <img src="/logo/FullLogo_Transparent.png" alt="buzzify" className="h-7 w-auto object-contain" />
                        </div>
                        <div className="hidden md:flex gap-2">
                            <button onClick={() => window.history.back()} className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 text-gray-500 hover:text-white transition-colors">
                                <ChevronLeft size={18} />
                            </button>
                            <button onClick={() => window.history.forward()} className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 text-gray-500 hover:text-white transition-colors">
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 flex-1 justify-end pr-0 md:pr-4">
                        <div className="relative hidden md:block" ref={searchRef}>
                            <div className={`flex items-center gap-3 px-4 py-1.5 rounded-full transition-all duration-300 bg-white/5 border ${isSearchFocused ? 'w-[400px] border-white/40 bg-white/10' : 'w-72 border-white/10 hover:border-white/20'}`}>
                                <Search size={16} className={`transition-colors ${isSearchFocused ? 'text-white' : 'text-white/40'}`} />
                                <input 
                                    type="text" 
                                    placeholder="Search" 
                                    value={search} 
                                    onChange={e => setSearch(e.target.value)}
                                    onFocus={() => { setIsSearchFocused(true); setShowDropdown(true); }}
                                    onClick={() => setShowDropdown(true)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && search.trim()) {
                                            handleSearchSelect(search);
                                        }
                                    }}
                                    className="bg-transparent text-sm h-8 outline-none flex-1 placeholder:text-white/20 text-white" 
                                />
                                {search && (
                                    <button onClick={() => setSearch('')} className="text-white/40 hover:text-white transition-colors">
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                            
                            {showDropdown && (isSearchFocused || search) && (
                                <SearchDropdown 
                                    search={search}
                                    results={searchResults}
                                    loading={isSearching}
                                    history={recentSearches}
                                    onSearchHistory={handleSearchSelect}
                                    onRemoveHistory={handleRemoveRecent}
                                    onPlaySong={(song, queue) => playSong(song, queue, { type: 'Searching', name: 'Tìm kiếm' })}
                                    onNavigate={(path) => {
                                        navigate(path);
                                        setShowDropdown(false);
                                        setIsSearchFocused(false);
                                    }}
                                />
                            )}
                        </div>

                        <UserMenu user={user} onLogout={handleLogout} />
                    </div>
                </header>

                <main className={`flex-1 overflow-hidden relative flex flex-col ${currentSong ? 'pb-36 md:pb-24' : 'pb-20 md:pb-0'}`}>
                    <Outlet context={{ user, setUser, handlePlaylistContextMenu }} />
                </main>
            </div>

            {/* Bottom Navigation for Mobile */}
            <BottomNav />

            {isCreatePlaylistModalOpen && (
                <CreatePlaylistModal 
                    isOpen={isCreatePlaylistModalOpen} 
                    onClose={() => setIsCreatePlaylistModalOpen(false)}
                />
            )}

            {/* Jam Panel - Rendered under MusicPlayerBar */}
            <JamPanel />

            {/* Music Player Bar - Fixed at the very bottom */}
            <MusicPlayerBar />

            {/* Playlist Context Menu */}
            {playlistMenuConfig.open && (
                <PlaylistMenu 
                    playlist={playlistMenuConfig.playlist}
                    position={{ x: playlistMenuConfig.x, y: playlistMenuConfig.y }}
                    onClose={() => setPlaylistMenuConfig({ ...playlistMenuConfig, open: false })}
                />
            )}
        </div>
    );
};

export default MusicLayout;
