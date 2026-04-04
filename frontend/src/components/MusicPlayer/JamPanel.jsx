import React, { useState } from 'react';
import { 
    X, UserPlus, LogOut, Copy, QrCode, Play, 
    MoreHorizontal, ListMusic, Settings, Share2, 
    Users, ChevronDown, Check, X as XIcon
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import { useMusic } from '../../context/MusicContext';
import AddSongToJamModal from './AddSongToJamModal';

const API_BASE = import.meta.env.VITE_API_URL || '';
const imgUrl = (src) => {
    if (!src) return null;
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) return src;
    return `${API_BASE}${src.startsWith('/') ? '' : '/'}${src}`;
};

const JamPanel = () => {
    const { 
        isJamPanelOpen, setIsJamPanelOpen, user, 
        currentSong, isJamActive, setIsJamActive,
        dominantColor, queue, currentIndex, playFromQueue,
        jamRoomId, isHost, guestPermissions, setGuestPermissions, jamParticipants,
        suggestedQueue, approveSuggestion, rejectSuggestion, approveAllSuggestions, rejectAllSuggestions,
        startJamSession, endJamSession, hubConnectionRef
    } = useMusic();

    const [activeTab, setActiveTab] = useState('Invite');
    const [isAddSongModalOpen, setIsAddSongModalOpen] = useState(false);

    // Scroll Lock for Mobile when Jam is open
    React.useEffect(() => {
        if (isJamPanelOpen && window.innerWidth < 768) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isJamPanelOpen]);

    // Luôn render để phục vụ transition, nhưng ẩn bằng CSS
    const displayName = user?.hoTen || user?.fullName || 'Nghệ sĩ';
    const displayAvatar = user?.anhDaiDien || '';
    const nextUp = queue.length > 0 ? queue.slice(currentIndex + 1) : [];

    return (
        <div 
            className={`fixed bottom-0 md:bottom-20 right-0 w-full md:w-[420px] bg-[#0a0a0a] md:bg-[#0a0a0a]/95 md:backdrop-blur-3xl border-l border-white/10 z-[1050] transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] transform ${isJamPanelOpen ? 'translate-x-0 opacity-100 visible' : 'translate-x-full opacity-0 invisible shadow-none'}`}
            style={{ height: '100dvh' }}
            data-lenis-prevent
        >
            <div className="h-full flex flex-col relative">
                {/* Mobile Header (Removed as per user request) */}

                {/* Header Section */}
                <div className="p-8 pb-4 md:pb-8">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-3">
                                <Users size={18} className="text-emerald-500" />
                                <h2 className="text-lg font-black text-white tracking-widest uppercase italic">Buzzify Jam</h2>
                                {isJamActive && <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                            </div>
                            <p className="text-[9px] text-white/30 font-bold uppercase tracking-[0.3em] mt-1">{isHost ? 'Phòng của bạn' : 'Phòng của máy chủ'}</p>
                        </div>
                        <button 
                            onClick={() => setIsJamPanelOpen(false)}
                            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all active:scale-90"
                        >
                            <ChevronDown size={20} />
                        </button>
                    </div>

                    {/* Tabs Navigation (Mini) */}
                    <div className="flex gap-1.5 bg-white/5 p-1 rounded-2xl border border-white/5">
                        {['Queue', 'Invite', 'Settings'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all
                                    ${activeTab === tab ? 'bg-white text-black shadow-lg scale-[1.02]' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
                            >
                                {tab === 'Queue' ? 'Hàng chờ' : tab === 'Invite' ? 'Mời' : 'Cài đặt'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-8 md:px-0 hide-scrollbar pb-28 md:pb-0" data-lenis-prevent>
                    {/* ─── Tab: Queue ─── */}
                    {activeTab === 'Queue' && (
                        <div className="space-y-8 animate-in fade-in duration-500 pt-4">
                            
                            {/* Participants List */}
                            <section className="bg-white/5 border border-white/5 rounded-3xl p-5 backdrop-blur-md relative overflow-hidden">
                                <h3 className="text-[9px] font-black text-white/40 mb-4 uppercase tracking-[0.2em]">Thành viên ({(jamParticipants && jamParticipants.length > 0) ? jamParticipants.length : 1})</h3>
                                <div className="flex flex-col gap-4 relative z-10 max-h-40 overflow-y-auto hide-scrollbar">
                                    {(jamParticipants && jamParticipants.length > 0 ? jamParticipants : [{name: displayName, avatar: displayAvatar, isHost: isHost}]).map((p, idx) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-emerald-500 border-2 border-[#0a0a0a] flex-shrink-0 flex items-center justify-center text-[11px] font-black text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] overflow-hidden relative">
                                                {p.avatar ? (
                                                    <img src={imgUrl(p.avatar)} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    p.name?.charAt(0) || '?'
                                                )}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[11px] font-black text-white uppercase tracking-widest truncate">{p.name}</span>
                                                <span className="text-[9px] font-bold text-emerald-500/70 uppercase tracking-widest mt-0.5">{p.isHost ? "Trưởng nhóm" : "Thành viên"}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />
                            </section>

                            {/* Add Music Button */}
                            <button 
                                onClick={() => setIsAddSongModalOpen(true)}
                                className="w-full bg-white text-black hover:bg-gray-200 transition-all active:scale-[0.98] py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl border border-white/10"
                            >
                                <ListMusic size={16} />
                                + Thêm nhạc vào Jam
                            </button>

                            {/* Current Song Card */}
                            <div className="group relative mt-2">
                                <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-[32px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative p-5 rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-md">
                                    <h3 className="text-[9px] font-black text-white/30 mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> Đang phát
                                    </h3>
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-900 shadow-2xl border border-white/10 flex-shrink-0">
                                            <img src={imgUrl(currentSong?.anhBia)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-black text-white text-sm uppercase tracking-tight truncate mb-1">{currentSong?.tieuDe}</p>
                                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest truncate">
                                                {currentSong?.tenNgheSi}
                                            </p>
                                        </div>
                                        <div className="flex items-end gap-[2px] h-3 mr-1">
                                            <div className="w-[2px] bg-emerald-500 animate-[music-bar-1_1s_infinite]" />
                                            <div className="w-[2px] bg-emerald-500 animate-[music-bar-2_1.2s_infinite]" />
                                            <div className="w-[2px] bg-emerald-500 animate-[music-bar-3_0.8s_infinite]" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Next Up List */}
                            <section>
                                <h3 className="text-[9px] font-black text-white/30 mb-5 uppercase tracking-[0.2em] px-1">Tiếp theo ({nextUp.length})</h3>
                                <div className="space-y-1">
                                    {nextUp.length > 0 ? nextUp.map((song, idx) => (
                                        <div 
                                            key={song.id}
                                            onClick={() => playFromQueue(currentIndex + 1 + idx)}
                                            className="flex items-center gap-4 group cursor-pointer hover:bg-white/5 p-3 rounded-2xl transition-all border border-transparent hover:border-white/5"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-white/5 overflow-hidden flex-shrink-0 relative">
                                                <img src={imgUrl(song.anhBia)} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                                                    <Play size={14} fill="white" className="text-white" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-white text-[11px] truncate uppercase tracking-tight">{song.tieuDe}</p>
                                                <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest mt-0.5 truncate">{song.tenNgheSi}</p>
                                            </div>
                                            <button className="p-2 text-white/20 hover:text-white opacity-0 group-hover:opacity-100 transition-all">
                                                <MoreHorizontal size={16} />
                                            </button>
                                        </div>
                                    )) : (
                                        <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-3xl">
                                            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Hàng chờ trống</p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Suggested Queue List */}
                            {suggestedQueue && suggestedQueue.length > 0 && (
                                <section className="mt-8">
                                    <h3 className="text-[9px] font-black text-white/30 mb-5 uppercase tracking-[0.2em] px-1 flex items-center justify-between">
                                        <span>Khách đề xuất ({suggestedQueue.length})</span>
                                        {isHost ? (
                                            <div className="flex gap-2">
                                                <button onClick={approveAllSuggestions} className="text-emerald-500/90 hover:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded-md transition-colors flex items-center gap-1"><Check size={10} strokeWidth={3}/> Duyệt tất cả</button>
                                                <button onClick={rejectAllSuggestions} className="text-rose-500/90 hover:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 px-2.5 py-1 rounded-md transition-colors flex items-center gap-1"><XIcon size={10} strokeWidth={3}/> Xoá</button>
                                            </div>
                                        ) : (
                                            <span className="text-amber-500/70">Chờ duyệt...</span>
                                        )}
                                    </h3>
                                    <div className="space-y-1 relative">
                                        <div className="absolute -inset-4 bg-emerald-500/5 blur-2xl rounded-[40px] pointer-events-none" />
                                        {suggestedQueue.map((item) => {
                                            const song = item.song || item;
                                            const suggester = item.suggestedBy || 'Khách';
                                            return (
                                                <div 
                                                    key={`suggest_${song.id}`}
                                                    className="flex items-center gap-4 relative group p-3 bg-white/5 rounded-2xl border border-white/5"
                                                >
                                                    <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-white/5 overflow-hidden flex-shrink-0 relative">
                                                        <img src={imgUrl(song.anhBia)} className="w-full h-full object-cover opacity-80" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-white text-[11px] truncate uppercase tracking-tight">{song.tieuDe}</p>
                                                        <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest mt-0.5 truncate flex items-center gap-1.5">
                                                            {song.tenNgheSi} 
                                                            <span className="w-1 h-1 rounded-full bg-white/20"></span> 
                                                            <span className="text-amber-500/80">Đề xuất: {suggester}</span>
                                                        </p>
                                                    </div>
                                                    
                                                    {isHost ? (
                                                        <div className="flex items-center gap-1">
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); approveSuggestion(song.id); }}
                                                                className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-black flex items-center justify-center transition-all"
                                                                title="Duyệt bài này"
                                                            >
                                                                <Check size={14} />
                                                            </button>
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); rejectSuggestion(song.id); }}
                                                                className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all"
                                                                title="Từ chối"
                                                            >
                                                                <XIcon size={14} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="px-3 py-1 bg-white/5 rounded-full border border-white/5">
                                                            <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Đang chờ</span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            )}
                        </div>
                    )}

                    {/* ─── Tab: Invite ─── */}
                    {activeTab === 'Invite' && (
                        <div className="space-y-6 animate-in fade-in duration-500 pt-4">
                            {!jamRoomId ? (
                                <div className="text-center py-10">
                                    <h3 className="text-sm font-black text-white mb-2 uppercase tracking-wide">Bắt đầu phiên Jam</h3>
                                    <p className="text-[10px] text-white/40 mb-6 px-4 leading-relaxed">Khởi tạo phòng để cùng nghe nhạc theo thời gian thực với bạn bè.</p>
                                    <button 
                                        onClick={startJamSession}
                                        className="bg-emerald-500 text-black px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-emerald-400 hover:scale-105 transition-all"
                                    >
                                        Bắt đầu ngay
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-gradient-to-br from-zinc-900 to-black p-8 rounded-[32px] border border-white/10 shadow-2xl relative overflow-hidden group">
                                    <div className="relative z-10 flex flex-col items-center">
                                        <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-5 text-emerald-500">
                                            <QrCode size={32} />
                                        </div>
                                        <h3 className="text-lg font-black text-white mb-2 tracking-tight">Cùng nghe</h3>
                                        <p className="text-[10px] text-white/60 mb-2 font-black uppercase tracking-widest text-center">ID: {jamRoomId}</p>
                                        <p className="text-[9px] text-white/30 mb-8 font-bold uppercase tracking-widest text-center leading-relaxed">Quét mã hoặc gửi link cho bạn bè.</p>
                                        
                                        <div className="bg-white p-4 rounded-3xl shadow-xl mb-8 group-hover:scale-105 transition-transform duration-700">
                                             <QRCodeSVG value={`${window.location.origin}/jam/${jamRoomId}`} size={140} level="M" />
                                        </div>

                                        <button 
                                            onClick={() => {
                                                navigator.clipboard.writeText(`${window.location.origin}/jam/${jamRoomId}`);
                                                toast.success('Đã sao chép link phòng!');
                                            }}
                                            className="w-full bg-white text-black h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Copy size={14} /> Sao chép link
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ─── Tab: Settings ─── */}
                    {activeTab === 'Settings' && (
                        <div className="space-y-4 animate-in fade-in duration-500 pt-4">
                            {/* Guest Permissions Box */}
                            <div className="p-5 bg-white/5 rounded-2xl border border-white/5 group">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-[11px] font-black text-white uppercase tracking-widest">Quyền của khách</p>
                                    <button 
                                        onClick={() => {
                                            if (!isHost) {
                                                toast.error('Chỉ trưởng phòng mới được đổi cài đặt này.');
                                                return;
                                            }
                                            const newVal = !guestPermissions;
                                            setGuestPermissions(newVal);
                                            hubConnectionRef.current?.invoke("UpdateGuestPermissions", jamRoomId, newVal);
                                        }}
                                        disabled={!isHost}
                                        className={`w-10 h-5 rounded-full relative transition-all duration-300 ${!guestPermissions ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-white/10'} ${!isHost ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                    >
                                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${!guestPermissions ? 'right-1' : 'left-1'}`} />
                                    </button>
                                </div>
                                <p className="text-[9.5px] text-white/40 leading-relaxed font-semibold">
                                    {!guestPermissions ? 
                                    "ĐANG BẬT: Khách chỉ được nghe. Chỉ Trưởng phòng mới được thao tác điều khiển (Tiến/Lùi bài, Dừng, Thêm hàng chờ). Khách tự chỉnh âm lượng." 
                                    : "ĐANG TẮT: Khách có toàn quyền thay đổi bài hát và thao tác hàng chờ giống như Trưởng phòng."}
                                </p>
                            </div>

                            <button 
                                onClick={endJamSession}
                                className="w-full mt-6 h-12 rounded-2xl border border-rose-500/20 text-rose-500 font-black uppercase tracking-widest text-[9px] hover:bg-rose-500/10 transition-all flex items-center justify-center gap-3"
                            >
                                <LogOut size={14} /> Kết thúc Jam
                            </button>
                        </div>
                    )}
                </div>
            </div>
            
            <AddSongToJamModal 
                isOpen={isAddSongModalOpen} 
                onClose={() => setIsAddSongModalOpen(false)} 
            />
        </div>
    );
};

export default JamPanel;
