import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  FolderPlus,
  Calendar,
  Disc,
  MoreVertical,
  Layers
} from 'lucide-react';
import { 
  getMyAlbumsApi, 
  deleteAlbumApi 
} from '../../services/api_services';
import { useMusic } from '../../context/MusicContext';
import { cn } from '../../lib/utils';
import AlbumModal from './AlbumModal';
import AlbumSongsModal from './AlbumSongsModal';
import { toast } from 'react-hot-toast';

const AlbumManagement = () => {
  const { user } = useMusic();
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  
  const [isSongsModalOpen, setIsSongsModalOpen] = useState(false);
  const [viewingAlbum, setViewingAlbum] = useState(null);

  const fetchAlbums = async () => {
    setLoading(true);
    try {
      const res = await getMyAlbumsApi(search, 1, 50); 
      setAlbums(res.data || res.items || []);
    } catch (error) {
      console.error("Error fetching albums:", error);
      toast.error("Không thể tải danh sách album.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, [search, user]);

  const handleEdit = (e, album) => {
    e.stopPropagation();
    setSelectedAlbum(album);
    setIsModalOpen(true);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Bạn có chắc chắn muốn xóa album này? Các bài hát bên trong sẽ trở thành Độc lập.")) return;
    try {
      await deleteAlbumApi(id);
      toast.success("Đã xóa album thành công!");
      fetchAlbums();
    } catch (error) {
      toast.error("Không thể xóa album.");
    }
  };

  const handleViewSongs = (album) => {
    setViewingAlbum(album);
    setIsSongsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Bộ sưu tập Album</h2>
          <p className="text-gray-500 text-sm">Tổ chức âm nhạc của bạn thành các Album chuyên nghiệp.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
        >
          <FolderPlus size={20} />
          Tạo Album mới
        </button>
      </div>

      {/* Grid Area */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-3xl p-4 border border-gray-100 animate-pulse">
              <div className="aspect-square bg-gray-100 rounded-2xl mb-4"></div>
              <div className="h-5 w-3/4 bg-gray-100 rounded mb-2"></div>
              <div className="h-4 w-1/2 bg-gray-50 rounded"></div>
            </div>
          ))}
        </div>
      ) : albums.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {albums.map((album) => (
            <div 
              key={album.id} 
              onClick={() => handleViewSongs(album)}
              className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative cursor-pointer"
            >
              <div className="aspect-square rounded-2xl overflow-hidden mb-4 relative">
                <img 
                  src={album.anhBia || "/default-album.png"} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  alt={album.tieuDe}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button 
                    onClick={(e) => handleEdit(e, album)}
                    className="p-2 bg-white text-black rounded-full hover:bg-blue-600 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={(e) => handleDelete(e, album.id)}
                    className="p-2 bg-white text-black rounded-full hover:bg-red-600 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 delay-75"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              <div className="space-y-1">
                <h3 className="font-bold text-gray-800 line-clamp-1 group-hover:text-blue-600 transition-colors uppercase tracking-tight text-sm">
                  {album.tieuDe}
                </h3>
                <div className="flex items-center gap-3 text-gray-400">
                   <div className="flex items-center gap-1 text-[11px] font-bold">
                     <Disc size={12} />
                     <span>{album.songsCount || 0} bài hát</span>
                   </div>
                   <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                   <div className="flex items-center gap-1 text-[11px] font-bold">
                     <Calendar size={12} />
                     <span>{new Date(album.ngayPhatHanh).getFullYear()}</span>
                   </div>
                </div>
              </div>

              {album.scheduledPublishDate && new Date(album.scheduledPublishDate) > new Date() && (
                <div className="absolute top-6 left-6 px-2 py-1 bg-amber-500 text-white text-[10px] font-bold rounded-lg shadow-lg">
                  HẸN GIỜ
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 border-dashed p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Layers size={32} className="text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">Chưa có album nào</h3>
          <p className="text-sm text-gray-500 mb-6">Hãy tạo album đầu tiên để ra mắt người hâm mộ.</p>
          <button className="inline-flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-xl font-bold hover:bg-gray-800 transition-all">
            <Plus size={20} /> Tạo ngay
          </button>
        </div>
      )}

      <AlbumModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAlbum(null);
        }}
        editData={selectedAlbum}
        onSuccess={fetchAlbums}
      />

      <AlbumSongsModal 
        isOpen={isSongsModalOpen}
        onClose={() => {
          setIsSongsModalOpen(false);
          setViewingAlbum(null);
        }}
        album={viewingAlbum}
        onRefresh={fetchAlbums}
      />
    </div>
  );
};

export default AlbumManagement;
