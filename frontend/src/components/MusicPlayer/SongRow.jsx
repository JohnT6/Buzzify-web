import React from 'react';
import { Heart, MoreHorizontal, Clock, Play } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';
const imgUrl = (src) => {
    if (!src) return null;
    if (src.startsWith('http://') || src.startsWith('https://')) return src;
    return `${API_BASE}${src.startsWith('/') ? '' : '/'}${src}`;
};

const fmtTime = (s) => { 
    if (!s) return '0:00'; 
    const m = Math.floor(s / 60); 
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, '0')}`; 
};

const SongRow = ({ 
    song, 
    idx, 
    isCurrent, 
    isPlaying, 
    likedSongIds, 
    onPlay, 
    onToggleLike, 
    onOpenMenu 
}) => {
    const ACCENT = '#0F5E8F';

    return (
        <tr 
            onClick={() => onPlay(song)}
            className="group hover:bg-white/5 transition-colors cursor-pointer"
        >
            <td className="px-4 py-4 text-center align-middle">
                {isCurrent ? (
                    <div className="flex items-end justify-center gap-[2px] h-4 w-4 mx-auto">
                        <div className={`w-[2px] bg-[#0F5E8F] ${isPlaying ? 'animate-music-bar-1' : 'h-1'}`} />
                        <div className={`w-[2px] bg-[#0F5E8F] ${isPlaying ? 'animate-music-bar-2' : 'h-2'}`} />
                        <div className={`w-[2px] bg-[#0F5E8F] ${isPlaying ? 'animate-music-bar-3' : 'h-1.5'}`} />
                    </div>
                ) : (
                    <span className="text-sm text-white/30">{idx + 1}</span>
                )}
            </td>
            <td className="px-4 py-4 align-middle">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-800 flex-shrink-0">
                        <img src={imgUrl(song.anhBia)} alt={song.tieuDe} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                        <p className={`text-sm font-bold truncate ${isCurrent ? 'text-[#0F5E8F]' : 'text-white'}`}>{song.tieuDe}</p>
                    </div>
                </div>
            </td>
            <td className="px-4 py-4 align-middle">
                <p className="text-sm text-white/60 truncate hover:text-white transition-colors">
                    {song.tenNgheSi}{song.ngheSiHopTac ? `, ${song.ngheSiHopTac}` : ''}
                </p>
            </td>
            <td className="px-4 py-4 align-middle">
                <p className="text-sm text-white/40 truncate hover:text-white transition-colors">{song.tenAlbum || 'N/A'}</p>
            </td>
            <td className="px-4 py-4 align-middle">
                <span className="text-sm text-white/40 font-medium">{fmtTime(song.thoiLuongGiay)}</span>
            </td>
            <td className="px-4 py-4 align-middle text-right">
                <div className={`flex items-center justify-end gap-4 transition-opacity ${likedSongIds.has(song.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onToggleLike(song); }}
                        className="hover:scale-110 transition-transform active:scale-95"
                    >
                        <Heart size={16} fill={likedSongIds.has(song.id) ? ACCENT : "none"} color="currentColor" className={likedSongIds.has(song.id) ? '' : 'text-white/40 hover:text-white transition-colors'} strokeWidth={likedSongIds.has(song.id) ? 0 : 2} />
                    </button>
                    <button 
                        onClick={(e) => onOpenMenu(e, song)}
                        className="text-white/30 hover:text-white transition-colors"
                    >
                        <MoreHorizontal size={18} />
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default SongRow;
