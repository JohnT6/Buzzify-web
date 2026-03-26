import React from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Users, 
    Mic2, 
    Library, 
    LogOut, 
    Bell, 
    Search,
    ChevronRight,
    UserCircle
} from 'lucide-react';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { useMusic } from '../context/MusicContext';
import { cn } from '../lib/utils';
import '../pages/Admin/Admin.css'; // Sửa đường dẫn import cho đúng

const AdminLayout = () => {
    const navigate = useNavigate();
    const { user, logout } = useMusic();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        Cookies.remove('access_token');
        toast.success("Đã đăng xuất khỏi quyền Admin");
        navigate('/login');
    };

    const menuItems = [
        { name: 'Tổng quan', path: '/admin', icon: LayoutDashboard },
        { name: 'Người dùng', path: '/admin/users', icon: Users },
        { name: 'Nghệ sĩ', path: '/admin/artists', icon: Mic2 },
        { name: 'Album & Nhạc', path: '/admin/albums', icon: Library },
    ];

    if (!user || user.vaiTro !== 'admin') {
        return <div className="flex h-screen items-center justify-center">Đang tải hoặc không có quyền truy cập...</div>;
    }

    return (
        <div className="flex h-screen bg-[#F8FAFC]">
            {/* Sidebar */}
            <aside className="w-64 bg-black text-white flex flex-col hidden md:flex">
                <div className="p-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-xl">B</div>
                    <span className="text-xl font-bold tracking-tight">Buzzify <span className="text-indigo-500">Admin</span></span>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path || (item.path === '/admin' && location.pathname === '/admin/');
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                                    isActive 
                                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
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
                        {menuItems.find(i => i.path === location.pathname)?.name || 'Admin Console'}
                    </h1>

                    <div className="flex items-center gap-4">
                        <div className="relative hidden lg:block">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Tìm kiếm nhanh..." 
                                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all w-64"
                            />
                        </div>
                        <button className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-all relative">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="h-8 w-[1px] bg-gray-200 mx-2"></div>
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-gray-800">{user.hoTen}</p>
                                <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">System Administrator</p>
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

export default AdminLayout;
