import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import { 
    Home as HomeIcon, LayoutGrid, Heart, Library, 
    Search, ChevronLeft, ChevronRight, LogOut 
} from 'lucide-react';
import { logoutApi, getCurrentUserApi, getPlaylistsApi } from '../services/api_services';
import MusicPlayerBar from '../components/MusicPlayer/MusicPlayerBar';
import { useMusic } from '../context/MusicContext';

const ACCENT = '#0F5E8F';

const Logo = () => {
    const navigate = useNavigate();
    return (
        <div className="flex items-center px-4 py-5 flex-shrink-0 cursor-pointer" onClick={() => navigate('/home')}>
            <img src="/logo/FullLogo_Transparent.png" alt="buzzify" className="h-10 w-auto object-contain" />
        </div>
    );
};

const UserMenu = ({ user, onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const fn = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setIsOpen(false); };
        document.addEventListener('mousedown', fn);
        return () => document.removeEventListener('mousedown', fn);
    }, []);

    const avatarSrc = user?.anhDaiDien 
        || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.hoTen || 'U')}&background=e11d48&color=fff&bold=true`;

    return (
        <div className="relative" ref={menuRef}>
            <button onClick={() => setIsOpen(!isOpen)} 
                className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-white/30 transition-all active:scale-95 flex-shrink-0">
                <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-3 w-60 bg-[#1a1a1a] rounded-2xl shadow-2xl border border-white/10 py-2 z-[600]">
                    <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-sm font-bold text-white truncate">{user?.hoTen || 'Người dùng'}</p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email || ''}</p>
                    </div>
                    {['Hồ sơ', 'Cài đặt', 'Trợ giúp'].map(label => (
                        <button key={label} className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors">
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
    const { currentSong } = useMusic();
    const [user, setUser] = useState(null);
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        (async () => {
            try {
                const [uRes, pRes] = await Promise.allSettled([
                    getCurrentUserApi(), getPlaylistsApi()
                ]);
                if (uRes.status === 'fulfilled') setUser(uRes.value);
                if (pRes.status === 'fulfilled') {
                    const p = pRes.value;
                    setPlaylists(Array.isArray(p) ? p : (p?.data || []));
                }
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        })();
    }, []);

    const handleLogout = async () => {
        try { await logoutApi(); } catch {}
        Cookies.remove('access_token');
        navigate('/');
    };

    const navItems = [
        { id: 'home', label: 'Trang chủ', icon: <HomeIcon size={18} />, path: '/home' },
        { id: 'browse', label: 'Khám phá', icon: <LayoutGrid size={18} />, path: '/browse' },
        { id: 'favorite', label: 'Yêu thích', icon: <Heart size={18} />, path: '/favorite' },
        { id: 'library', label: 'Thư viện', icon: <Library size={18} />, path: '/library' },
    ];

    return (
        <div className="flex h-screen text-white overflow-hidden" style={{ background: '#0e0e0e', fontFamily: "'Inter', -apple-system, sans-serif" }}>
            
            {/* Sidebar */}
            <aside className="w-56 flex-shrink-0 flex flex-col overflow-hidden" style={{ background: '#0a0a0a', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
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

                <div className="mt-6 px-4 flex-1 overflow-hidden flex flex-col min-h-0">
                    <p className="text-[10px] uppercase font-bold tracking-widest mb-3 text-white/30">Playlist của tôi</p>
                    <div className="space-y-0.5 overflow-y-auto flex-1 hide-scrollbar" data-lenis-prevent>
                        {loading ? (
                            <div className="animate-pulse space-y-2">
                                <div className="h-4 bg-white/5 rounded w-3/4"></div>
                                <div className="h-4 bg-white/5 rounded w-1/2"></div>
                            </div>
                        ) : (
                            playlists.filter(p => (p.congKhai === true || p.idNguoiTao === user?.id) && !(p.ten?.toLowerCase().includes('thích') || p.loaiPlaylist === 'liked')).map(pl => (
                                <button key={pl.id} 
                                    onClick={() => navigate(`/home/playlist/${pl.id}`)}
                                    className="w-full text-left px-2 py-2 rounded-lg text-sm text-gray-500 hover:text-white hover:bg-white/5 transition-colors truncate cursor-pointer">
                                    {pl.ten}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </aside>

            {/* Main area */}
            <div className={`flex-1 flex flex-col overflow-hidden ${currentSong ? 'pb-24' : ''}`}> {/* Chỉ padding khi có nhạc */}
                <header className="flex-shrink-0 flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="flex gap-2">
                        <button onClick={() => window.history.back()} className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 text-gray-500 hover:text-white transition-colors">
                            <ChevronLeft size={18} />
                        </button>
                        <button onClick={() => window.history.forward()} className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 text-gray-500 hover:text-white transition-colors">
                            <ChevronRight size={18} />
                        </button>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full w-80 bg-white/5 border border-white/5">
                        <Search size={14} className="text-gray-500" />
                        <input type="text" placeholder="Tìm kiếm..." value={search} onChange={e => setSearch(e.target.value)}
                            className="bg-transparent text-sm outline-none flex-1" />
                    </div>
                    <UserMenu user={user} onLogout={handleLogout} />
                </header>

                <main className="flex-1 overflow-hidden relative flex flex-col">
                    <Outlet context={{ user }} />
                </main>
            </div>

            {/* Global Music Player Bar - Chỉ render khi có bài hát */}
            {currentSong && <MusicPlayerBar />}
        </div>
    );
};

export default MusicLayout;
