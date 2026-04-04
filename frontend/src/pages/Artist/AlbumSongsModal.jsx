import React, { useState, useEffect } from 'react';
import { 
  X, 
  Music, 
  Trash2, 
  Loader2, 
  Disc,
  Play,
  Eye,
  EyeOff,
  GripVertical,
  Plus,
  Edit2
} from 'lucide-react';
import { getAlbumByIdAsync, updateSongApi, reorderTracksApi } from '../../services/api_services';
import { cn } from '../../lib/utils';
import { toast } from 'react-hot-toast';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import UploadSongModal from './UploadSongModal';

const AlbumSongsModal = ({ isOpen, onClose, album, onRefresh }) => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for UploadSongModal
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editSongData, setEditSongData] = useState(null);
  const [initialData, setInitialData] = useState(null);

  const fetchSongs = async () => {
    if (!album) return;
    setLoading(true);
    try {
      const res = await getAlbumByIdAsync(album.id);
      const loadedSongs = res.songs || res.data?.songs || [];
      // Sort by TrackNumber to ensure correct visual order
      loadedSongs.sort((a,b) => (a.trackNumber || 999) - (b.trackNumber || 999));
      setSongs(loadedSongs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && album) fetchSongs();
  }, [isOpen, album]);

  const handleRemoveFromAlbum = async (song) => {
    if (!window.confirm(`Bạn có muốn đưa bài hát "${song.tieuDe}" ra khỏi album này không? (Bài hát vẫn sẽ tồn tại ở mục Độc lập)`)) return;
    try {
      await updateSongApi(song.id, {
        ...song,
        IdAlbum: null,
        TieuDe: song.tieuDe,
        Url: song.url
      });
      toast.success("Đã gỡ bài hát khỏi album!");
      setSongs(prev => prev.filter(s => s.id !== song.id));
      onRefresh?.();
    } catch (e) {
      toast.error("Thao tác thất bại.");
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
        ArtistId: song.artistId || null,
        TrackNumber: song.trackNumber || null
      };

      await updateSongApi(song.id, songData);
      toast.success(newStatus === 'hidden' ? "Đã ẩn bài hát!" : "Đã công khai bài hát!", { id: loadingToast });
      setSongs(prev => prev.map(s => s.id === song.id ? { ...s, trangThai: newStatus } : s));
      onRefresh?.();
    } catch (e) {
      toast.error("Thao tác thất bại.", { id: loadingToast });
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    if (result.source.index === result.destination.index) return;
    
    // Optimistic UI update
    const items = Array.from(songs);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setSongs(items);
    
    try {
      const songIds = items.map(s => s.id);
      await reorderTracksApi(album.id, songIds);
      toast.success("Đã cập nhật thứ tự bài hát!");
      onRefresh?.();
    } catch (e) {
      console.error(e);
      toast.error("Lỗi khi cập nhật thứ tự.");
      // Revert sorting
      fetchSongs();
    }
  };

  const handleAddNew = () => {
    setEditSongData(null);
    setInitialData({
        idAlbum: album.id,
        trackNumber: songs.length + 1
    });
    setIsUploadOpen(true);
  };

  const handleEdit = (song) => {
    setInitialData(null);
    setEditSongData(song);
    setIsUploadOpen(true);
  };

  const handleUploadSuccess = () => {
    fetchSongs();
    onRefresh?.();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}></div>
        
        <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg flex-shrink-0">
                <img src={album?.anhBia || "/default-album.png"} className="w-full h-full object-cover" alt="" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 uppercase tracking-tight line-clamp-1">{album?.tieuDe}</h3>
                <p className="text-xs text-blue-600 font-bold flex items-center gap-1.5 uppercase mt-1">
                  <Disc size={12} /> {songs.length} bài hát
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleAddNew}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
              >
                <Plus size={16} /> Thêm bài mới
              </button>
              <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-all text-gray-400 hover:text-black shadow-sm border border-gray-100">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* List Body */}
          <DragDropContext onDragEnd={handleDragEnd}>
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
                  <Loader2 className="animate-spin" size={32} />
                  <p className="text-sm font-medium">Đang tải danh sách bài hát...</p>
                  </div>
              ) : songs.length > 0 ? (
                  <Droppable droppableId="album-songs">
                  {(provided) => (
                      <div 
                          {...provided.droppableProps} 
                          ref={provided.innerRef}
                          className="space-y-2"
                      >
                      {songs.map((song, idx) => (
                          <Draggable key={song.id} draggableId={song.id} index={idx}>
                          {(provided, snapshot) => (
                              <div 
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={cn(
                                      "group flex items-center justify-between p-3 rounded-2xl transition-all border",
                                      snapshot.isDragging ? "bg-white shadow-xl border-blue-200 z-50 scale-[1.02]" : "hover:bg-gray-50 border-transparent hover:border-gray-100 bg-white"
                                  )}
                              >
                              <div className="flex items-center gap-2 overflow-hidden">
                                  {/* Nút kéo thả */}
                                  <div 
                                      {...provided.dragHandleProps} 
                                      className="p-1 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing"
                                  >
                                      <GripVertical size={16} />
                                  </div>
                                  
                                  <span className="text-xs font-bold text-gray-400 w-4 text-center">{idx + 1}</span>
                                  
                                  <div className="flex items-center gap-3 ml-2 overflow-hidden">
                                    <img src={song.anhBia || "/default-song.png"} className="w-10 h-10 rounded-lg object-cover shadow-sm pointer-events-none" alt={song.tieuDe} />
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-bold text-gray-800 truncate flex items-center gap-2">
                                            {song.tieuDe}
                                            {song.trangThai === 'hidden' && <span className="text-[10px] bg-red-50 text-red-500 px-1.5 py-0.5 rounded border border-red-100 uppercase font-bold flex-shrink-0">Đã ẩn</span>}
                                        </p>
                                        <p className="text-[11px] text-gray-400 font-medium tracking-wide truncate">
                                            <span className="font-bold text-blue-600/70">{Math.floor(song.thoiLuongGiay / 60)}:{(Math.floor(song.thoiLuongGiay % 60)).toString().padStart(2, '0')}</span> • {song.tenNgheSi}
                                        </p>
                                    </div>
                                  </div>
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all ml-4">
                                  <button title="Phát thử" className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                      <Play size={16} />
                                  </button>
                                  <button 
                                      onClick={() => handleEdit(song)}
                                      title="Chỉnh sửa bài hát" 
                                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                  >
                                      <Edit2 size={16} />
                                  </button>
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
                                  onClick={() => handleRemoveFromAlbum(song)}
                                  title="Gỡ khỏi Album" 
                                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                  >
                                      <Trash2 size={16} />
                                  </button>
                              </div>
                              </div>
                          )}
                          </Draggable>
                      ))}
                      {provided.placeholder}
                      </div>
                  )}
                  </Droppable>
              ) : (
                  <div className="text-center py-20 space-y-3">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                      <Music size={28} />
                  </div>
                  <p className="text-sm text-gray-400 font-medium">Chưa có bài hát nào trong album này.</p>
                  <button onClick={handleAddNew} className="text-blue-600 font-bold text-xs uppercase tracking-widest hover:underline">Thêm bài hát đầu tiên</button>
                  </div>
              )}
              </div>
          </DragDropContext>

          <div className="p-4 bg-gray-50/50 border-t border-gray-100 text-center">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Buzzify Artist Dashboard</p>
          </div>
        </div>
      </div>

      <UploadSongModal 
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={handleUploadSuccess}
        editData={editSongData}
        initialData={initialData}
      />
    </>
  );
};

export default AlbumSongsModal;
