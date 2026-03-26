import React, { useState, useEffect } from 'react';
import { X, Camera, Globe, Loader2 } from 'lucide-react';
import { createPlaylistApi, updatePlaylistApi } from '../../services/api_services';
import { useMusic } from '../../context/MusicContext';

const CreatePlaylistModal = ({ isOpen, onClose, playlist = null, onSuccess }) => {
    const { setMyPlaylists, refreshUser } = useMusic();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        isPublic: true,
        image: null
    });
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (playlist) {
            setFormData({
                title: playlist.ten || '',
                description: playlist.moTa || '',
                isPublic: playlist.congKhai ?? true,
                image: null // Giữ nguyên ảnh cũ nếu không chọn ảnh mới
            });
            if (playlist.anhBia) {
                const API_BASE = import.meta.env.VITE_API_URL || '';
                const fullUrl = playlist.anhBia.startsWith('http') ? playlist.anhBia : `${API_BASE}${playlist.anhBia.startsWith('/') ? '' : '/'}${playlist.anhBia}`;
                setPreviewUrl(fullUrl);
            } else {
                setPreviewUrl(null);
            }
        } else {
            setFormData({
                title: '',
                description: '',
                isPublic: true,
                image: null
            });
            setPreviewUrl(null);
        }
    }, [playlist, isOpen]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, image: file });
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const resizeImageToBase64 = (file, maxWidth = 400, maxHeight = 400) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxWidth) {
                            height *= maxWidth / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width *= maxHeight / height;
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.8)); // Nén 80% chất lượng
                };
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const handleSave = async () => {
        if (!formData.title.trim()) return;
        setLoading(true);
        try {
            let base64Image = null;
            if (formData.image) {
                base64Image = await resizeImageToBase64(formData.image);
            }

            const payload = {
                Ten: formData.title,
                MoTa: formData.description,
                CongKhai: formData.isPublic,
                AnhBia: base64Image // Gửi null hoặc base64 string
            };

            let res;
            if (playlist?.id) {
                res = await updatePlaylistApi(playlist.id, payload);
            } else {
                res = await createPlaylistApi(payload);
            }

            // Refresh playlists
            refreshUser();
            if (onSuccess) onSuccess(res);
            onClose();
        } catch (error) {
            console.error("Lỗi khi lưu playlist:", error);
            alert("Có lỗi xảy ra khi lưu danh sách phát. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/90 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-[640px] bg-[#121212] rounded-2xl shadow-2xl overflow-hidden border border-white/5 animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
                    <h2 className="text-xl font-black text-white tracking-tight">{playlist ? 'Edit details' : 'Create playlist'}</h2>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-all shadow-sm"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8">
                    <div className="flex gap-8">
                        {/* Left: Image Selection */}
                        <div className="flex flex-col gap-4">
                            <div className="w-[180px] h-[180px] bg-[#1a1a1a] rounded-xl flex items-center justify-center overflow-hidden border border-white/5 shadow-inner group relative">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-16 h-16 rounded-lg bg-white/5 flex items-center justify-center text-white/10 group-hover:text-white/20 transition-colors">
                                        <Camera size={32} />
                                    </div>
                                )}
                            </div>
                            <label className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 text-white text-xs font-black uppercase tracking-widest text-center rounded-lg cursor-pointer transition-all border border-white/5 active:scale-95">
                                {previewUrl ? 'Change image' : 'Choose image'}
                                <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                            </label>
                        </div>

                        {/* Right: Form Information */}
                        <div className="flex-1 space-y-6">
                            <div className="space-y-2">
                                <div className="relative group">
                                    <input 
                                        type="text"
                                        placeholder="Title"
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                        className="w-full bg-[#1a1a1a] border border-white/5 focus:border-white/20 rounded-xl px-5 py-4 text-white outline-none transition-all placeholder:text-white/20 font-bold text-lg"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <textarea 
                                    placeholder="Write a description"
                                    value={formData.description}
                                    maxLength={500}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    className="w-full bg-[#1a1a1a] border border-white/5 focus:border-white/20 rounded-xl px-5 py-4 text-white outline-none transition-all placeholder:text-white/20 text-sm h-[120px] resize-none"
                                    disabled={loading}
                                />
                                <div className="flex justify-end">
                                    <span className="text-[11px] font-bold text-white/20 uppercase tracking-widest">
                                        {formData.description.length}/500 characters
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Options Section */}
                    <div className="mt-8 p-6 bg-white/[0.02] rounded-2xl border border-white/5 flex items-center justify-between group hover:bg-white/[0.04] transition-all">
                        <div className="flex items-start gap-4">
                            <div className="p-2 rounded-lg bg-white/5 text-white/40 group-hover:text-rose-500 transition-colors">
                                <Globe size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-black text-white tracking-tight">Make it public</p>
                                <p className="text-[12px] text-white/30 leading-relaxed mt-0.5">Your playlist will be visible on your Profile and accessible by anyone.</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="sr-only peer"
                                checked={formData.isPublic}
                                onChange={(e) => setFormData({...formData, isPublic: e.target.checked})}
                                disabled={loading}
                            />
                            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/40 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500 peer-checked:after:bg-white"></div>
                        </label>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-6 bg-[#1a1a1a]/50 border-t border-white/5 flex justify-end">
                    <button 
                        onClick={handleSave}
                        className="px-8 py-3 bg-white hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed text-black text-sm font-black rounded-lg transition-all active:scale-95 flex items-center gap-2"
                        disabled={!formData.title.trim() || loading}
                    >
                        {loading && <Loader2 size={16} className="animate-spin" />}
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreatePlaylistModal;
