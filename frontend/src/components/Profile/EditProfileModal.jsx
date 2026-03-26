import React, { useState, useEffect, useRef } from 'react';
import { X, Camera } from 'lucide-react';

const EditProfileModal = ({ isOpen, onClose, user, onUpdate }) => {
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({
        hoTen: '',
        userName: '',
        bio: '',
        link: '',
        anhDaiDien: ''
    });
    const [previewImage, setPreviewImage] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user && isOpen) {
            setFormData({
                hoTen: user.hoTen || '',
                userName: user.email?.split('@')[0] || '',
                bio: user.bio || '',
                link: user.link || '',
                anhDaiDien: user.anhDaiDien || ''
            });
            setPreviewImage(user.anhDaiDien);
        }
    }, [user, isOpen]);

    if (!isOpen) return null;

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                setPreviewImage(base64String);
                setFormData(prev => ({ ...prev, anhDaiDien: base64String }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setPreviewImage(null);
        setFormData(prev => ({ ...prev, anhDaiDien: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await onUpdate(formData);
            onClose();
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Có lỗi xảy ra khi cập nhật hồ sơ.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Hidden File Input */}
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                accept="image/*" 
                className="hidden" 
            />

            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-[540px] bg-[#121212] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
                    <h2 className="text-2xl font-black text-white tracking-tight">Chỉnh sửa hồ sơ</h2>
                    <button 
                        onClick={onClose}
                        className="p-1 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8 max-h-[75vh] overflow-y-auto custom-main-scroll">
                    {/* Basic Info Section */}
                    <div>
                        <h3 className="text-sm font-black text-white mb-1 uppercase tracking-widest">Thông tin cơ bản</h3>
                        <p className="text-[13px] text-white/40 mb-6">Thông tin bạn thêm vào hồ sơ sẽ hiển thị với tất cả mọi người.</p>

                        {/* Profile Picture Box */}
                        <div className="bg-white/5 rounded-lg p-6 flex items-center gap-6 border border-white/5 mb-8">
                            <div 
                                onClick={handleImageClick}
                                className="relative w-24 h-24 rounded-full overflow-hidden bg-[#1a1a1a] shadow-inner group cursor-pointer"
                            >
                                <img 
                                    src={previewImage || user?.anhDaiDienProvider || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.hoTen || 'U')}&background=e11d48&color=fff&bold=true&size=128`} 
                                    className="w-full h-full object-cover" 
                                    alt="Profile" 
                                />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera size={24} className="text-white" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-sm font-bold text-white mb-2">Ảnh đại diện</span>
                                <div className="flex items-center gap-4 text-[13px]">
                                    <button 
                                        type="button" 
                                        onClick={handleImageClick}
                                        className="text-white/60 hover:text-white font-bold transition-colors"
                                    >
                                        Chọn ảnh đại diện
                                    </button>
                                    <span className="text-white/10">•</span>
                                    <button 
                                        type="button" 
                                        onClick={handleRemoveImage}
                                        className="text-rose-500 hover:text-rose-400 font-bold transition-colors"
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Inputs */}
                        <div className="space-y-4">
                            {/* Name Input */}
                            <div className="relative group">
                                <label className="absolute left-4 top-3 text-[10px] font-black text-white/40 group-focus-within:text-rose-500 uppercase tracking-widest transition-colors">Tên</label>
                                <input 
                                    type="text"
                                    value={formData.hoTen}
                                    onChange={(e) => setFormData({...formData, hoTen: e.target.value})}
                                    className="w-full bg-[#1a1a1a] border border-white/5 focus:border-rose-500/50 rounded-lg pt-8 pb-3 px-4 text-[15px] text-white outline-none transition-all"
                                    placeholder="Nhập tên của bạn"
                                />
                            </div>

                            {/* Username Input */}
                            <div className="relative group">
                                <label className="absolute left-4 top-3 text-[10px] font-black text-white/40 group-focus-within:text-rose-500 uppercase tracking-widest transition-colors">Tên người dùng</label>
                                <input 
                                    type="text"
                                    value={formData.userName}
                                    onChange={(e) => setFormData({...formData, userName: e.target.value})}
                                    className="w-full bg-[#1a1a1a] border border-white/5 focus:border-rose-500/50 rounded-lg pt-8 pb-3 px-4 text-[15px] text-white outline-none transition-all"
                                    placeholder="username"
                                />
                                <p className="text-[11px] text-white/20 mt-2 px-1">Chỉ sử dụng chữ cái a-z, số 0-9 và dấu gạch dưới.</p>
                            </div>

                             {/* Link Input */}
                             <div className="relative group">
                                <label className="absolute left-4 top-3 text-[10px] font-black text-white/40 group-focus-within:text-rose-500 uppercase tracking-widest transition-colors">Liên kết</label>
                                <input 
                                    type="text"
                                    value={formData.link}
                                    onChange={(e) => setFormData({...formData, link: e.target.value})}
                                    className="w-full bg-[#1a1a1a] border border-white/5 focus:border-rose-500/50 rounded-lg pt-8 pb-3 px-4 text-[15px] text-white outline-none transition-all"
                                    placeholder="URL trang web của bạn"
                                />
                            </div>

                             {/* Bio Input */}
                             <div className="relative group">
                                <label className="absolute left-4 top-3 text-[10px] font-black text-white/40 group-focus-within:text-rose-500 uppercase tracking-widest transition-colors">Tiểu sử</label>
                                <textarea 
                                    value={formData.bio}
                                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                    rows="4"
                                    className="w-full bg-[#1a1a1a] border border-white/5 focus:border-rose-500/50 rounded-lg pt-8 pb-3 px-4 text-[15px] text-white outline-none transition-all resize-none"
                                    placeholder="Kể về bản thân bạn..."
                                />
                                <div className="flex justify-between mt-2 px-1">
                                    <span className="text-[11px] text-white/20">{5000 - formData.bio.length} ký tự còn lại</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer / Actions */}
                <div className="sticky bottom-0 px-6 py-5 border-t border-white/5 bg-[#121212] flex justify-end gap-4 z-10">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-full text-sm font-bold text-white/60 hover:text-white hover:bg-white/5 transition-all"
                    >
                        Hủy
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={isSaving}
                        className="px-8 py-2.5 rounded-full bg-white text-[#121212] text-sm font-black hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]"
                    >
                        {isSaving ? 'Đang lưu...' : 'Lưu'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditProfileModal;
