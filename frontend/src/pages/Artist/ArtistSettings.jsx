import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Camera, 
  Save, 
  Lock,
  ShieldCheck,
  BellRing
} from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { updateProfileApi } from '../../services/api_services';
import { cn } from '../../lib/utils';

const ArtistSettings = () => {
  const { user, refreshUser } = useMusic();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    hoTen: user?.hoTen || '',
    email: user?.email || '',
    anhDaiDien: user?.anhDaiDien || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      await updateProfileApi(formData);
      await refreshUser();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Update profile error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Cài đặt tài khoản</h2>
        <p className="text-gray-500 text-sm">Quản lý thông tin cá nhân và quyền riêng tư của nghệ sĩ.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Navigation Tabs (Style) */}
        <div className="space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-white text-blue-600 font-bold rounded-2xl border border-blue-100 shadow-sm">
            <User size={18} /> Hồ sơ nghệ sĩ
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 font-medium hover:bg-gray-100 rounded-2xl transition-all">
            <Lock size={18} /> Bảo mật
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 font-medium hover:bg-gray-100 rounded-2xl transition-all">
            <BellRing size={18} /> Thông báo
          </button>
        </div>

        {/* Main Settings Form */}
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center sm:flex-row gap-6">
              <div className="relative group">
                <img 
                  src={formData.anhDaiDien || "/default-avatar.png"} 
                  className="w-24 h-24 rounded-3xl object-cover ring-4 ring-gray-50 shadow-md"
                  alt="Avatar"
                />
                <button type="button" className="absolute -bottom-2 -right-2 p-2 bg-blue-600 text-white rounded-xl shadow-lg hover:scale-110 transition-transform">
                  <Camera size={16} />
                </button>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h4 className="font-bold text-gray-800">Ảnh đại diện</h4>
                <p className="text-xs text-gray-400 mt-1">Khuyên dùng ảnh 500x500px. Định dạng JPG, PNG.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Tên nghệ sĩ / Họ tên</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input 
                    type="text" 
                    value={formData.hoTen}
                    onChange={(e) => setFormData({...formData, hoTen: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-gray-800"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input 
                    type="email" 
                    disabled
                    value={formData.email}
                    className="w-full pl-12 pr-4 py-3 bg-gray-100 border-none rounded-2xl font-medium text-gray-400 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
               {success && (
                 <div className="flex items-center gap-2 text-green-600 font-bold text-sm animate-in fade-in zoom-in duration-300">
                   <ShieldCheck size={20} /> Đã cập nhật thành công!
                 </div>
               )}
               <button 
                 type="submit"
                 disabled={loading}
                 className="ml-auto flex items-center gap-2 bg-black text-white px-8 py-3 rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 active:scale-95 disabled:bg-gray-400"
               >
                 {loading ? "Đang lưu..." : <><Save size={20} /> Lưu thay đổi</>}
               </button>
            </div>
          </form>

          {/* Dangerous Zone */}
          <div className="bg-red-50/50 p-8 rounded-3xl border border-red-100 space-y-4">
             <h4 className="text-red-600 font-bold">Vùng nguy hiểm</h4>
             <p className="text-xs text-red-400">Xóa tài khoản nghệ sĩ sẽ gỡ tất cả bài hát và album của bạn khỏi hệ thống. Hành động này không thể hoàn tác.</p>
             <button className="text-red-600 text-sm font-bold border-b-2 border-red-200 hover:border-red-600 transition-all pb-1">
               Xóa tài khoản nghệ sĩ
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistSettings;
