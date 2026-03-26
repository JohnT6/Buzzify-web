import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  ExternalLink,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  getMySongsApi, 
  deleteSongApi, 
  updateSongApi 
} from '../../services/api_services';
import { useMusic } from '../../context/MusicContext';
import { cn } from '../../lib/utils';
import UploadSongModal from './UploadSongModal';
import { toast } from 'react-hot-toast';

const MusicManagement = () => {
  const { user } = useMusic();
  const [allSongs, setAllSongs] = useState([]); // Lưu toàn bộ dữ liệu gốc
  const [songs, setSongs] = useState([]); // Dữ liệu hiển thị sau khi lọc
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [filter, setFilter] = useState('all'); // all, published, hidden, scheduled

  const fetchSongs = async () => {
    setLoading(true);
    try {
      const res = await getMySongsApi(search);
      const data = res.items || res.data || res || [];
      setAllSongs(data);
      applyFilter(data, filter);
    } catch (error) {
      console.error("Error fetching songs:", error);
      toast.error("Không thể tải danh sách bài hát.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, [search, user]);

  useEffect(() => {
    applyFilter(allSongs, filter);
  }, [filter, allSongs]);

  const applyFilter = (data, status) => {
    if (status === 'all') {
      setSongs(data);
      return;
    }
    const filtered = data.filter(s => {
      if (status === 'scheduled') {
        return s.scheduledPublishDate && new Date(s.scheduledPublishDate) > new Date();
      }
      return s.trangThai === status;
    });
    setSongs(filtered);
  };

  const handleEdit = (song) => {
    setSelectedSong(song);
    setIsModalOpen(true);
  };

  const handleDelete = async (songId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài hát này? Hành động này không thể hoàn tác.")) return;
    try {
      await deleteSongApi(songId);
      toast.success("Đã xóa bài hát thành công!");
      fetchSongs();
    } catch (e) {
      toast.error("Không thể xóa bài hát.");
    }
  };

  const handleToggleHide = async (song) => {
    const newStatus = song.trangThai === 'hidden' ? 'published' : 'hidden';
    const loadingToast = toast.loading("Đang xử lý...");
    try {
      const songData = {
        TieuDe: song.tieuDe,
        IdAlbum: song.idAlbum || null,
        NgheSiHopTac: song.ngheSiHopTac || '',
        Url: song.url,
        AnhBia: song.anhBia || '',
        ScheduledPublishDate: song.scheduledPublishDate || null,
        TrangThai: newStatus,
        ThoiLuongGiay: song.thoiLuongGiay || 0,
        ArtistId: song.artistId || null
      };

      await updateSongApi(song.id, songData);
      toast.success(newStatus === 'hidden' ? "Đã ẩn bài hát!" : "Đã công khai bài hát!", { id: loadingToast });
      fetchSongs();
    } catch (e) {
      toast.error("Thao tác thất bại.", { id: loadingToast });
    }
  };

  const getStatusBadge = (song) => {
    if (song.trangThai === 'hidden') {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-500 text-xs font-bold rounded-full border border-gray-200 uppercase tracking-wider">
          <Clock size={12} className="rotate-180" /> Đã ẩn
        </span>
      );
    }
    const isScheduled = song.scheduledPublishDate && new Date(song.scheduledPublishDate) > new Date();
    if (isScheduled) {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-600 text-xs font-bold rounded-full border border-amber-100 uppercase tracking-wider">
          <Clock size={12} /> Hẹn giờ
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-full border border-green-100 uppercase tracking-wider">
        <CheckCircle2 size={12} /> Công khai
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Thư viện của bạn</h2>
          <p className="text-gray-500 text-sm">Quản lý Album, EP và tất cả bài hát của bạn.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
        >
          <Plus size={20} />
          Đăng Album / EP mới
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm bài hát..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all text-sm outline-none text-gray-800"
          />
        </div>
        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl">
           {['all', 'published', 'hidden', 'scheduled'].map((s) => (
             <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-bold transition-all capitalize",
                filter === s ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
              )}
             >
                {s === 'all' ? 'Tất cả' : s === 'published' ? 'Công khai' : s === 'hidden' ? 'Đã ẩn' : 'Hẹn giờ'}
             </button>
           ))}
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Bài hát</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Album</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Lượt nghe</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-10 w-40 bg-gray-100 rounded-lg"></div></td>
                    <td className="px-6 py-4"><div className="h-6 w-24 bg-gray-50 rounded-lg"></div></td>
                    <td className="px-6 py-4"><div className="h-6 w-12 bg-gray-50 rounded-lg"></div></td>
                    <td className="px-6 py-4"><div className="h-6 w-20 bg-gray-50 rounded-lg"></div></td>
                    <td className="px-6 py-4 text-right"><div className="h-8 w-8 bg-gray-50 rounded-full ml-auto"></div></td>
                  </tr>
                ))
              ) : songs.length > 0 ? (
                songs.map((song) => (
                  <tr key={song.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={song.anhBia || "/default-song.png"} 
                          className="w-10 h-10 rounded-lg object-cover shadow-sm"
                          alt={song.tieuDe}
                        />
                        <div>
                          <p className="font-bold text-sm text-gray-800 line-clamp-1">{song.tieuDe}</p>
                          <p className="text-[11px] text-gray-400 font-medium">ID: {song.id.substring(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 font-medium">{song.tenAlbum || "Độc lập"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-gray-700">{song.luotNghe?.toLocaleString() || 0}</span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(song)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleToggleHide(song)}
                          title={song.trangThai === 'hidden' ? "Hiện" : "Ẩn"} 
                          className={cn(
                            "p-2 rounded-lg transition-all",
                            song.trangThai === 'hidden' ? "text-green-600 hover:bg-green-50" : "text-amber-600 hover:bg-amber-50"
                          )}
                        >
                          {song.trangThai === 'hidden' ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        <button 
                          onClick={() => handleEdit(song)}
                          title="Sửa" 
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(song.id)}
                          title="Xóa" 
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                    {search ? "Không tìm thấy bài hát nào phù hợp." : "Bạn chưa đăng bài hát nào. Hãy bắt đầu ngay!"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <UploadSongModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSong(null);
        }} 
        editData={selectedSong}
        onSuccess={fetchSongs}
      />
    </div>
  );
};

export default MusicManagement;
