import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  Loader2, 
  Calendar as CalendarIcon,
  AlertCircle,
  Plus
} from 'lucide-react';
import { uploadMediaApi, createAlbumApi, updateAlbumApi } from '../../services/api_services';
import { cn } from '../../lib/utils';
import { toast } from 'react-hot-toast';

const AlbumModal = ({ isOpen, onClose, onSuccess, editData = null }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    tieuDe: '',
    ngayPhatHanh: '',
  });

  const [files, setFiles] = useState({
    cover: null
  });

  const [previews, setPreviews] = useState({
    cover: null
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        tieuDe: editData.tieuDe || '',
        ngayPhatHanh: editData.ngayPhatHanh || '',
      });
      setPreviews({
        cover: editData.anhBia || null
      });
      setFiles({ cover: null });
    } else {
      setFormData({
        tieuDe: '',
        ngayPhatHanh: new Date().toISOString().split('T')[0],
      });
      setPreviews({ cover: null });
      setFiles({ cover: null });
    }
  }, [editData, isOpen]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFiles({ cover: file });
    const reader = new FileReader();
    reader.onloadend = () => setPreviews({ cover: reader.result });
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editData && !formData.tieuDe) {
      setError('Vui lòng nhập tiêu đề album!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let coverUrl = editData?.anhBia || '';
      if (files.cover) {
        const coverFormData = new FormData();
        coverFormData.append('file', files.cover);
        const coverRes = await uploadMediaApi('album', coverFormData);
        coverUrl = coverRes.url || coverRes.data?.url;
      }

      const albumData = {
        TieuDe: formData.tieuDe,
        AnhBia: coverUrl,
        NgayPhatHanh: formData.ngayPhatHanh || null,
        ArtistId: editData?.artistId || null
      };

      if (editData) {
        await updateAlbumApi(editData.id, albumData);
        toast.success("Đã cập nhật album!");
      } else {
        await createAlbumApi(albumData);
        toast.success("Đã tạo album mới!");
      }
      
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Album error:", err);
      setError(err.response?.data?.error || 'Đã có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800">{editData ? 'Chỉnh sửa Album' : 'Tạo Album mới'}</h3>
            <p className="text-sm text-gray-500">Tổ chức các bài hát của bạn vào Album.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400 hover:text-black">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-sm border border-red-100 animate-shake">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          <div className="flex flex-col items-center gap-6">
            <div 
              className={cn(
                "w-48 aspect-square rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden bg-gray-50 group",
                previews.cover ? "border-transparent" : "border-gray-200 hover:border-blue-400 hover:bg-blue-50/30"
              )}
              onClick={() => document.getElementById('album-cover-upload').click()}
            >
              {previews.cover ? (
                <img src={previews.cover} className="w-full h-full object-cover" alt="Preview" />
              ) : (
                <>
                  <div className="p-3 bg-white rounded-xl shadow-sm mb-2 group-hover:scale-110 transition-transform">
                    <ImageIcon size={24} className="text-blue-500" />
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center px-4">Ảnh bìa<br/>Album</p>
                </>
              )}
              <input id="album-cover-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>

            <div className="w-full space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Tiêu đề Album</label>
                <input 
                  type="text" 
                  required
                  value={formData.tieuDe}
                  onChange={(e) => setFormData({...formData, tieuDe: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-gray-800"
                  placeholder="Ví dụ: Sky Tour (Live Album)"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Ngày phát hành</label>
                <div className="relative">
                  <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="date" 
                    value={formData.ngayPhatHanh}
                    onChange={(e) => setFormData({...formData, ngayPhatHanh: e.target.value})}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-gray-800"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-3 flex-shrink-0">
          <button 
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-black transition-colors"
          >
            Hủy bỏ
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <>{editData ? <Plus size={20} className="rotate-45" /> : <Upload size={20} />} {editData ? 'Lưu thay đổi' : 'Tạo Album'}</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlbumModal;
