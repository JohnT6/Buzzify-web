import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Music, 
  Library, 
  Settings, 
  LogOut, 
  Bell,
  User as UserIcon,
  ChevronRight
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { cn } from '../lib/utils';

const ArtistLayout = () => {
  const { user, logout } = useMusic();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Tổng quan', path: '/artist', icon: LayoutDashboard },
    { name: 'Quản lý nhạc', path: '/artist/music', icon: Music },
    { name: 'Album', path: '/artist/albums', icon: Library },
    { name: 'Cài đặt', path: '/artist/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user || user.vaiTro !== 'artist') {
    return <div className="flex h-screen items-center justify-center">Đang tải hoặc không có quyền truy cập...</div>;
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside className="w-64 bg-black text-white flex flex-col hidden md:flex">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl">B</div>
          <span className="text-xl font-bold tracking-tight">Buzzify <span className="text-blue-500">Artist</span></span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon size={20} className={cn(isActive ? "text-white" : "text-gray-500 group-hover:text-white")} />
                <span className="font-medium">{item.name}</span>
                {isActive && <ChevronRight size={16} className="ml-auto opacity-50" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium">Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 flex-shrink-0">
          <h1 className="text-xl font-bold text-gray-800">
            {menuItems.find(i => i.path === location.pathname)?.name || 'Dashboard'}
          </h1>

          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-all relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-[1px] bg-gray-200 mx-2"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-800">{user.hoTen}</p>
                <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Artist Account</p>
              </div>
              <img 
                src={user.anhDaiDien || "/default-avatar.png"} 
                alt="Avatar" 
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-gray-50"
              />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar" data-lenis-prevent>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ArtistLayout;
