import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Music, 
  Image as ImageIcon, 
  Loader2, 
  Calendar as CalendarIcon,
  AlertCircle,
  Plus,
  Trash2
} from 'lucide-react';
import { uploadMediaApi, createSongApi, updateSongApi, getMyAlbumsApi, getMyArtistProfileApi } from '../../services/api_services';
import { cn } from '../../lib/utils';
import { toast } from 'react-hot-toast';
import { useMusic } from '../../context/MusicContext';
import DateTimePicker from '../../components/Common/DateTimePicker';

const UploadSongModal = ({ isOpen, onClose, onSuccess, editData = null, initialData = null }) => {
  const { user } = useMusic();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [albums, setAlbums] = useState([]);
  const [artistInfo, setArtistInfo] = useState(null);
  
  // Tabs: 'single' | 'album'
  const [activeTab, setActiveTab] = useState('single');

  // ================= TAB 1: SINGLE / EDIT STATE =================
  const [singleFormData, setSingleFormData] = useState({
    tieuDe: '',
    idAlbum: '',
    ngheSiHopTac: '',
    scheduledPublishDate: '',
    trangThai: 'published',
    thoiLuongGiay: 0,
    trackNumber: null
  });
  const [singleFiles, setSingleFiles] = useState({ audio: null, cover: null });
  const [singlePreviews, setSinglePreviews] = useState({ cover: null });

  // ================= TAB 2: ALBUM STATE =================
  const [albumData, setAlbumData] = useState({
    idAlbum: '',
    scheduledPublishDate: '' // Dùng chung cho cả Album
  });
  
  const [albumSongs, setAlbumSongs] = useState([]); 
  const [existingAlbumSongs, setExistingAlbumSongs] = useState([]);
  // item: { id, file, tieuDe, ngheSiHopTac, trackNumber, anhBiaFile, anhBiaPreview }

  useEffect(() => {
    if (editData) {
      setActiveTab('single');
      setSingleFormData({
        tieuDe: editData.tieuDe || '',
        idAlbum: editData.idAlbum || '',
        ngheSiHopTac: editData.ngheSiHopTac || '',
        scheduledPublishDate: editData.scheduledPublishDate ? new Date(editData.scheduledPublishDate) : null,
        trangThai: editData.trangThai || 'published',
        thoiLuongGiay: editData.thoiLuongGiay || 0,
        trackNumber: editData.trackNumber || null
      });
      setSinglePreviews({ cover: editData.anhBia || null });
      setSingleFiles({ audio: null, cover: null });
    } else if (initialData) {
      setActiveTab('single');
      setSingleFormData({
        tieuDe: '',
        idAlbum: initialData.idAlbum || '',
        ngheSiHopTac: '',
        scheduledPublishDate: null,
        trangThai: 'published',
        thoiLuongGiay: 0,
        trackNumber: initialData.trackNumber || null
      });
      setSinglePreviews({ cover: null });
      setSingleFiles({ audio: null, cover: null });
    } else {
      setActiveTab('single');
      setSingleFormData({
        tieuDe: '',
        idAlbum: '',
        ngheSiHopTac: '',
        scheduledPublishDate: null,
        trangThai: 'published',
        thoiLuongGiay: 0,
        trackNumber: null
      });
      setSinglePreviews({ cover: null });
      setSingleFiles({ audio: null, cover: null });
      
      setAlbumData({ idAlbum: '', scheduledPublishDate: null });
      setAlbumSongs([]);
      setExistingAlbumSongs([]);
    }
    setError('');
  }, [editData, isOpen]);

  useEffect(() => {
    const fetchArtistAndAlbums = async () => {
      try {
        const artistRes = await getMyArtistProfileApi(); 
        if (artistRes) {
            setArtistInfo(artistRes);
        }

        const res = await getMyAlbumsApi(null, 1, 100); 
        setAlbums(res.data || res.items || []);
      } catch (err) { }
    };
    if (isOpen) fetchArtistAndAlbums();
  }, [isOpen]);

  useEffect(() => {
    const fetchExistingSongs = async () => {
        const targetAlbumId = activeTab === 'album' ? albumData.idAlbum : singleFormData.idAlbum;
        if (targetAlbumId) {
            try {
                const { getAlbumByIdAsync } = await import('../../services/api_services');
                const res = await getAlbumByIdAsync(targetAlbumId);
                const loadedSongs = res.songs || res.data?.songs || [];
                const sorted = loadedSongs.sort((a, b) => (a.trackNumber || 0) - (b.trackNumber || 0));
                setExistingAlbumSongs(sorted);
                
                // Nếu ở tab Single và chưa có trackNumber, tự động gợi ý số tiếp theo
                if (activeTab === 'single' && !singleFormData.trackNumber) {
                    setSingleFormData(prev => ({ ...prev, trackNumber: sorted.length + 1 }));
                }
            } catch (err) {
                console.error("Lỗi khi lấy danh sách bài hát cũ:", err);
            }
        } else {
            setExistingAlbumSongs([]);
        }
    };
    fetchExistingSongs();
  }, [activeTab, albumData.idAlbum, singleFormData.idAlbum]);

  // ================= SINGLE MODE HANDLERS =================
  const handleSingleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'cover') {
      setSingleFiles(prev => ({ ...prev, cover: file }));
      const reader = new FileReader();
      reader.onloadend = () => setSinglePreviews(prev => ({ ...prev, cover: reader.result }));
      reader.readAsDataURL(file);
    } else {
      setSingleFiles(prev => ({ ...prev, audio: file }));
    }
  };

  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    if (!editData && !singleFiles.audio) {
      setError('Vui lòng chọn tệp âm thanh!'); return;
    }
    if (!singleFormData.tieuDe.trim()) {
      setError('Vui lòng nhập tiêu đề bài hát!'); return;
    }

    setLoading(true); setError('');
    try {
      const artistId = artistInfo?.id || 'unknown';
      const albumId = singleFormData.idAlbum || 'singles';

      let audioUrl = editData?.url || '';
      if (singleFiles.audio) {
        const audioData = new FormData();
        audioData.append('file', singleFiles.audio);
        // Tạo UUID cho file nhạc
        const songResourceId = crypto.randomUUID();
        const audioRes = await uploadMediaApi('audio', audioData, artistId, albumId, songResourceId);
        audioUrl = audioRes.url || audioRes.data?.url;
      }

      let coverUrl = editData?.anhBia || '';
      if (singleFiles.cover) {
        const coverData = new FormData();
        coverData.append('file', singleFiles.cover);
        // Tạo UUID cho ảnh bìa bài hát
        const coverResourceId = crypto.randomUUID();
        const coverRes = await uploadMediaApi('song', coverData, artistId, null, coverResourceId);
        coverUrl = coverRes.url || coverRes.data?.url;
      }

      const payload = {
        TieuDe: singleFormData.tieuDe,
        IdAlbum: singleFormData.idAlbum || null,
        NgheSiHopTac: singleFormData.ngheSiHopTac,
        Url: audioUrl,
        AnhBia: coverUrl,
        ScheduledPublishDate: singleFormData.scheduledPublishDate || null,
        TrangThai: singleFormData.trangThai,
        ThoiLuongGiay: parseFloat(singleFormData.thoiLuongGiay) || 0,
        TrackNumber: singleFormData.trackNumber ? parseInt(singleFormData.trackNumber) : null
      };

      if (editData) {
        await updateSongApi(editData.id, payload);
        toast.success("Đã cập nhật bài hát!");
      } else {
        await createSongApi(payload);
        toast.success("Đã đăng bài hát thành công!");
      }
      onSuccess?.(); onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Đã có lỗi xảy ra.');
    } finally { setLoading(false); }
  };

  // ================= ALBUM MODE HANDLERS =================
  const addAlbumSong = () => {
    const nextNum = existingAlbumSongs.length + albumSongs.length + 1;
    setAlbumSongs(prev => [...prev, {
      id: Math.random().toString(),
      file: null,
      tieuDe: '',
      ngheSiHopTac: '',
      trackNumber: nextNum,
      thoiLuongGiay: 0,
      anhBiaFile: null,
      anhBiaPreview: null
    }]);
  };

  const removeAlbumSong = (id) => {
    setAlbumSongs(prev => prev.filter(s => s.id !== id));
  };

  const updateAlbumSongItem = (id, field, value) => {
    setAlbumSongs(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleAlbumSongFile = (id, type, file) => {
    if (!file) return;
    if (type === 'audio') {
      updateAlbumSongItem(id, 'file', file);
      if (!albumSongs.find(s => s.id === id).tieuDe) {
        updateAlbumSongItem(id, 'tieuDe', file.name.replace(/\.[^/.]+$/, ""));
      }
    } else if (type === 'cover') {
      updateAlbumSongItem(id, 'anhBiaFile', file);
      const reader = new FileReader();
      reader.onloadend = () => updateAlbumSongItem(id, 'anhBiaPreview', reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAlbumSubmit = async (e) => {
    e.preventDefault();
    if (!albumData.idAlbum) {
      setError('Vui lòng chọn Album để đưa các bài hát vào!'); return;
    }
    if (albumSongs.length === 0) {
      setError('Vui lòng thêm ít nhất một bài hát!'); return;
    }
    if (albumSongs.some(s => !s.file || !s.tieuDe.trim())) {
      setError('Vui lòng chọn file nhạc và nhập tiêu đề cho tất cả bài hát trong danh sách!'); return;
    }

    setLoading(true); setError('');
    try {
      const artistId = artistInfo?.id || 'unknown';
      const albumId = albumData.idAlbum;

      for (let i = 0; i < albumSongs.length; i++) {
        const item = albumSongs[i];
        
        let audioUrl = '';
        const audioData = new FormData();
        audioData.append('file', item.file);
        const songResourceId = crypto.randomUUID();
        const audioRes = await uploadMediaApi('audio', audioData, artistId, albumId, songResourceId);
        audioUrl = audioRes.url || audioRes.data?.url;

        let coverUrl = '';
        if (item.anhBiaFile) {
          const coverData = new FormData();
          coverData.append('file', item.anhBiaFile);
          const coverResourceId = crypto.randomUUID();
          const coverRes = await uploadMediaApi('song', coverData, artistId, null, coverResourceId);
          coverUrl = coverRes.url || coverRes.data?.url;
        }

        const payload = {
          TieuDe: item.tieuDe,
          IdAlbum: albumData.idAlbum,
          NgheSiHopTac: item.ngheSiHopTac || '',
          Url: audioUrl,
          AnhBia: coverUrl,
          ScheduledPublishDate: albumData.scheduledPublishDate || null,
          TrangThai: 'published',
          TrackNumber: parseInt(item.trackNumber) || (i + 1),
          ThoiLuongGiay: parseFloat(item.thoiLuongGiay) || 0
        };
        await createSongApi(payload);
      }
      toast.success(`Đã đăng ${albumSongs.length} bài hát vào Album thành công!`);
      onSuccess?.(); onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Đã có lỗi xảy ra trong quá trình tải lên Album.');
    } finally { setLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[95vh]">
        {/* Header Tabs */}
        <div className="border-b border-gray-100 flex items-center justify-between flex-shrink-0 bg-gray-50/50 pr-4">
          <div className="flex">
            <button 
                onClick={() => !editData && setActiveTab('single')}
                className={cn(
                    "px-8 py-5 text-sm font-bold uppercase tracking-wider transition-all border-b-2",
                    activeTab === 'single' ? "border-blue-600 text-blue-600 bg-white" : "border-transparent text-gray-400 hover:text-gray-600 hover:bg-white/50"
                )}
            >
                {editData ? 'Chỉnh sửa bài hát' : 'Đăng Single / EP'}
            </button>
            {!editData && (
                <button 
                    onClick={() => setActiveTab('album')}
                    className={cn(
                        "px-8 py-5 text-sm font-bold uppercase tracking-wider transition-all border-b-2",
                        activeTab === 'album' ? "border-blue-600 text-blue-600 bg-white" : "border-transparent text-gray-400 hover:text-gray-600 hover:bg-white/50"
                    )}
                >
                    Đăng vào Album (Nhiều bài)
                </button>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-all text-gray-400 hover:text-black">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50/30">
          {error && (
            <div className="m-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-sm border border-red-100 animate-shake shadow-sm">
              <AlertCircle size={20} className="flex-shrink-0" />
              {error}
            </div>
          )}

          {/* ======================= TAB 1: SINGLE / EDIT ======================= */}
          {activeTab === 'single' && (
            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Ảnh bìa bài hát</label>
                  <div 
                    className={cn(
                      "aspect-square rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden bg-white group shadow-sm",
                      singlePreviews.cover ? "border-transparent" : "border-gray-200 hover:border-blue-400 hover:bg-blue-50/30"
                    )}
                    onClick={() => document.getElementById('single-cover-upload').click()}
                  >
                    {singlePreviews.cover ? (
                      <img src={singlePreviews.cover} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <>
                        <div className="p-4 bg-gray-50 rounded-2xl shadow-sm mb-3 group-hover:scale-110 transition-transform border border-gray-100">
                          <ImageIcon size={28} className="text-blue-500" />
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Tải ảnh lên<br/>(1:1 ratio)</p>
                      </>
                    )}
                    <input id="single-cover-upload" type="file" accept="image/*" className="hidden" onChange={(e) => handleSingleFileChange(e, 'cover')} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Tệp âm thanh (MP3, WAV)</label>
                  <div 
                    className={cn(
                      "p-6 rounded-2xl border-2 border-dashed flex items-center gap-4 cursor-pointer transition-all bg-white shadow-sm group",
                      singleFiles.audio ? "border-green-200 bg-green-50/30" : "border-gray-200 hover:border-blue-400 hover:bg-blue-50/30"
                    )}
                    onClick={() => document.getElementById('single-audio-upload').click()}
                  >
                    <div className={cn("p-3 rounded-xl shadow-sm border", singleFiles.audio ? "bg-green-500 text-white border-green-600" : "bg-gray-50 text-blue-500 border-gray-100")}>
                      <Music size={24} />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      {singleFiles.audio ? (
                        <p className="text-sm font-bold text-green-600 truncate">{singleFiles.audio.name}</p>
                      ) : (
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Chọn tệp nhạc</p>
                      )}
                    </div>
                    <input id="single-audio-upload" type="file" accept="audio/*" className="hidden" onChange={(e) => handleSingleFileChange(e, 'audio')} />
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Tiêu đề</label>
                  <input 
                    type="text" 
                    required
                    value={singleFormData.tieuDe}
                    onChange={(e) => setSingleFormData({...singleFormData, tieuDe: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-200 shadow-sm rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-gray-800"
                    placeholder="Ví dụ: Lạc Trôi"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Nghệ sĩ hợp tác (không bắt buộc)</label>
                  <input 
                    type="text" 
                    value={singleFormData.ngheSiHopTac}
                    onChange={(e) => setSingleFormData({...singleFormData, ngheSiHopTac: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-200 shadow-sm rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-gray-800"
                    placeholder="Ví dụ: Đen Vâu, JustaTee"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Thời lượng (giây)</label>
                        <input 
                            type="number" 
                            value={singleFormData.thoiLuongGiay}
                            onChange={(e) => setSingleFormData({...singleFormData, thoiLuongGiay: e.target.value})}
                            className="w-full px-4 py-3 bg-white border border-gray-200 shadow-sm rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-gray-800"
                            placeholder="Ví dụ: 180"
                            min="0"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Số thứ tự (Track No)</label>
                        <input 
                            type="number" 
                            value={singleFormData.trackNumber || ''}
                            onChange={(e) => setSingleFormData({...singleFormData, trackNumber: e.target.value})}
                            className="w-full px-4 py-3 bg-white border border-gray-200 shadow-sm rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-gray-800"
                            placeholder="Tự động"
                            min={singleFormData.idAlbum ? existingAlbumSongs.length + 1 : 1}
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Thuộc Album / EP</label>
                  <select 
                    value={singleFormData.idAlbum}
                    onChange={(e) => setSingleFormData({...singleFormData, idAlbum: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-200 shadow-sm rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-gray-800"
                  >
                    <option value="">+ Tạo Album mới (Single)</option>
                    {albums.map(album => (
                      <option key={album.id} value={album.id}>{album.tieuDe}</option>
                    ))}
                  </select>
                  <div className="mt-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
                     <p className="text-[11px] text-blue-600 leading-relaxed font-medium">
                       <span className="font-bold">Lưu ý:</span> Nếu bạn không chọn Album có sẵn, hệ thống sẽ tự động tạo một Album mới với tên và ảnh bìa giống như bài hát này.
                     </p>
                  </div>
                </div>

                <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 space-y-3">
                  <div className="flex items-center justify-between">
                    {!editData ? (
                      <div className="flex items-center gap-2 text-blue-600">
                        <CalendarIcon size={18} />
                        <span className="text-sm font-bold">Hẹn giờ đăng bài</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-blue-600">
                        <span className="text-sm font-bold">Trạng thái hiển thị</span>
                      </div>
                    )}
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <span className="text-xs font-bold text-gray-500 group-hover:text-blue-600 transition-colors">Ẩn bài hát</span>
                      <input 
                        type="checkbox" 
                        checked={singleFormData.trangThai === 'hidden'}
                        onChange={(e) => setSingleFormData({...singleFormData, trangThai: e.target.checked ? 'hidden' : 'published'})}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </label>
                  </div>
                  {!editData && (
                    <>
                      <DateTimePicker 
                        selected={singleFormData.scheduledPublishDate}
                        onChange={(date) => setSingleFormData({...singleFormData, scheduledPublishDate: date})}
                        placeholderText="Chọn thời điểm ra mắt"
                      />
                      <p className="text-[10px] text-blue-400 font-medium ml-1">Để trống nếu bạn muốn đăng ngay lập tức.</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ======================= TAB 2: ALBUM / BULK UPLOAD ======================= */}
          {activeTab === 'album' && !editData && (
            <div className="p-6 md:p-8 space-y-8">
                {/* Header Album Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 text-red-500">Bắt buộc: Chọn Album</label>
                        <select 
                            value={albumData.idAlbum}
                            onChange={(e) => setAlbumData({...albumData, idAlbum: e.target.value})}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 shadow-inner rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-gray-800"
                        >
                            <option value="">-- Click để chọn Album --</option>
                            {albums.map(album => (
                            <option key={album.id} value={album.id}>{album.tieuDe}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Hẹn giờ mở khóa cho toàn bộ Album</label>
                        <DateTimePicker 
                            selected={albumData.scheduledPublishDate}
                            onChange={(date) => setAlbumData({...albumData, scheduledPublishDate: date})}
                            placeholderText="Chọn thời gian mở khóa Album"
                        />
                    </div>
                </div>

                {/* Danh sách các bài hát */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
                            <Music size={20} className="text-blue-500" />
                            Danh sách bài hát được thêm vào Album
                        </h4>
                    </div>

                    <div className="space-y-4">
                        {/* Hiển thị các bài hát đã có (Read Only) */}
                        {existingAlbumSongs.map((song) => (
                            <div key={song.id} className="bg-gray-100/50 rounded-3xl p-5 border border-gray-200 shadow-sm flex flex-col md:flex-row gap-6 opacity-70 grayscale-[0.5]">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-sm">
                                        <img src={song.anhBia || "/default-song.png"} className="w-full h-full object-cover" alt="" />
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">Đã có trong Album</span>
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="sm:w-[40%] px-4 py-3 rounded-xl border border-gray-200 bg-white/50 flex items-center gap-3">
                                            <Music size={16} className="text-gray-400" />
                                            <span className="text-[11px] font-bold text-gray-500 uppercase truncate">File nhạc đã tải</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="w-full px-4 h-11 bg-white/50 border border-gray-200 rounded-xl flex items-center font-bold text-gray-400 text-sm">
                                                {song.tieuDe}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="flex-1">
                                            <div className="w-full px-4 h-11 bg-white/50 border border-gray-200 rounded-xl flex items-center font-medium text-gray-400 text-sm">
                                                {song.ngheSiHopTac || "Nghệ sĩ chính"}
                                            </div>
                                        </div>
                                        <div className="sm:w-32 flex items-center gap-2">
                                            <span className="text-xs font-bold text-gray-400">Track No:</span>
                                            <div className="w-full px-3 h-11 bg-white/50 border border-gray-200 rounded-xl flex items-center justify-center font-bold text-gray-400 text-sm">
                                                {song.trackNumber}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Các bài hát đang thêm mới */}
                        {albumSongs.map((song, idx) => (
                            <div key={song.id} className="bg-white rounded-3xl p-5 border border-blue-100 shadow-md flex flex-col md:flex-row gap-6 relative group animate-in slide-in-from-bottom-2 duration-300">
                                {/* X Nút xóa */}
                                <button 
                                    onClick={() => removeAlbumSong(song.id)}
                                    className="absolute -top-3 -right-3 bg-white w-8 h-8 rounded-full border border-gray-100 shadow-md text-gray-400 hover:text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10"
                                >
                                    <X size={16} />
                                </button>
                                
                                {/* Track Number Badge */}
                                <div className="absolute top-4 left-4 w-7 h-7 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm md:hidden">
                                    {song.trackNumber}
                                </div>

                                {/* Col: Ảnh Bìa */}
                                <div className="flex flex-col items-center gap-2 pt-8 md:pt-0">
                                    <div 
                                        onClick={() => document.getElementById(`cover-upload-${song.id}`).click()}
                                        className={cn(
                                            "w-24 h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden flex-shrink-0 group/cover shadow-sm",
                                            song.anhBiaPreview ? "border-transparent" : "border-blue-100 hover:border-blue-400 bg-blue-50/20 hover:bg-blue-50/50"
                                        )}
                                    >
                                        {song.anhBiaPreview ? (
                                            <img src={song.anhBiaPreview} className="w-full h-full object-cover" alt="Preview" />
                                        ) : (
                                            <div className="text-center">
                                                <ImageIcon size={20} className="mx-auto text-blue-500 mb-1" />
                                                <span className="text-[9px] font-bold text-gray-400 uppercase">Tải ảnh</span>
                                            </div>
                                        )}
                                        <input id={`cover-upload-${song.id}`} type="file" accept="image/*" className="hidden" onChange={(e) => handleAlbumSongFile(song.id, 'cover', e.target.files[0])} />
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Ảnh mới (tùy chọn)</span>
                                </div>

                                {/* Col: Form thông tin */}
                                <div className="flex-1 space-y-4">
                                    {/* Dòng 1: File nhạc & Tiêu đề */}
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div 
                                            onClick={() => document.getElementById(`audio-upload-${song.id}`).click()}
                                            className={cn(
                                                "sm:w-[40%] px-4 py-3 rounded-xl border border-dashed flex items-center gap-3 cursor-pointer transition-all shadow-sm",
                                                song.file ? "border-green-200 bg-green-50/50" : "border-blue-200 bg-blue-50/30 hover:bg-blue-100/40 hover:border-blue-400"
                                            )}
                                        >
                                            <div className={cn("p-2 rounded-lg", song.file ? "bg-green-500 text-white" : "bg-white border text-blue-500")}>
                                                <Music size={16} />
                                            </div>
                                            <div className="overflow-hidden flex-1">
                                                {song.file ? (
                                                    <p className="text-xs font-bold text-green-700 truncate">{song.file.name}</p>
                                                ) : (
                                                    <p className="text-[11px] font-bold text-blue-600/70 uppercase">Tải tệp âm thanh (Bắt buộc)</p>
                                                )}
                                            </div>
                                            <input id={`audio-upload-${song.id}`} type="file" accept="audio/*" className="hidden" onChange={(e) => handleAlbumSongFile(song.id, 'audio', e.target.files[0])} />
                                        </div>
                                        
                                        <div className="flex-1">
                                            <input 
                                                type="text" 
                                                value={song.tieuDe}
                                                onChange={(e) => updateAlbumSongItem(song.id, 'tieuDe', e.target.value)}
                                                className="w-full px-4 h-11 bg-white border border-gray-200 shadow-sm rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-gray-800 text-sm"
                                                placeholder="Tên bài hát (Bắt buộc)"
                                            />
                                        </div>
                                    </div>

                                    {/* Dòng 2: Nghệ sĩ hợp tác, Track Number & Thời lượng */}
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="flex-1">
                                            <input 
                                                type="text" 
                                                value={song.ngheSiHopTac}
                                                onChange={(e) => updateAlbumSongItem(song.id, 'ngheSiHopTac', e.target.value)}
                                                className="w-full px-4 h-11 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-gray-800 text-sm"
                                                placeholder="Nghệ sĩ hợp tác (không bắt buộc)"
                                            />
                                        </div>
                                        <div className="sm:w-32 flex items-center gap-2">
                                            <span className="text-xs font-bold text-gray-400 whitespace-nowrap hidden sm:block">Giây:</span>
                                            <input 
                                                type="number" 
                                                value={song.thoiLuongGiay}
                                                onChange={(e) => updateAlbumSongItem(song.id, 'thoiLuongGiay', e.target.value)}
                                                className="w-full px-3 h-11 bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-blue-600 text-sm text-center"
                                                min="0"
                                                placeholder="Giây"
                                            />
                                        </div>
                                        <div className="sm:w-32 flex items-center gap-2">
                                            <span className="text-xs font-bold text-gray-400 whitespace-nowrap hidden sm:block">Track No:</span>
                                            <input 
                                                type="number" 
                                                value={song.trackNumber}
                                                onChange={(e) => updateAlbumSongItem(song.id, 'trackNumber', e.target.value)}
                                                className="w-full px-3 h-11 bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-blue-600 text-sm text-center"
                                                min={existingAlbumSongs.length + 1}
                                                placeholder="Thứ tự"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Nút Cộng */}
                    <button 
                        onClick={addAlbumSong}
                        className="w-full py-6 rounded-3xl border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50/20 text-blue-500 font-bold flex flex-col justify-center items-center gap-2 transition-all group"
                    >
                        <div className="p-3 bg-blue-50 rounded-full group-hover:scale-110 transition-transform">
                            <Plus size={24} />
                        </div>
                        Thêm bài hát mới vào Album
                    </button>
                </div>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="p-6 border-t border-gray-100 bg-white flex items-center justify-between flex-shrink-0">
          <p className="text-xs text-gray-400 font-medium hidden sm:block">Vui lòng kiểm tra kỹ thông tin trước khi tải lên dữ liệu.</p>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button 
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-colors"
                disabled={loading}
            >
                Hủy bỏ
            </button>
            <button 
                onClick={activeTab === 'single' ? handleSingleSubmit : handleAlbumSubmit}
                disabled={loading || (activeTab === 'album' && albumSongs.length === 0)}
                className="flex flex-1 sm:flex-none justify-center items-center gap-2 bg-black hover:bg-gray-800 disabled:bg-gray-300 text-white px-8 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-black/10 active:scale-95"
            >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <>{editData ? <Plus size={20} className="rotate-45" /> : <Upload size={20} />} {editData ? 'Lưu thay đổi' : 'Tải lên Server'}</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadSongModal;
