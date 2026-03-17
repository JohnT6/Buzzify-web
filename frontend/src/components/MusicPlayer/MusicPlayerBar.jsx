import React, { useState, useEffect, useRef } from 'react';
import { 
    Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, 
    Volume2, VolumeX, ListMusic, ChevronUp, Heart, MoreHorizontal,
    Maximize2, Minimize2, Search, CircleOff, X
} from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { useNavigate } from 'react-router-dom';

const ACCENT = '#0F5E8F';

const API_BASE = import.meta.env.VITE_API_URL || '';
const imgUrl = (src) => {
    if (!src) return null;
    if (src.startsWith('http://') || src.startsWith('https://')) return src;
    return `${API_BASE}${src.startsWith('/') ? '' : '/'}${src}`;
};

const MusicPlayerBar = () => {
    const { 
        currentSong, isPlaying, togglePlay, nextSong, prevSong, 
        likedSongIds, toggleLike, volume, setVolume, audioRef,
        sourceInfo, queue, currentIndex, playSong, playFromQueue
    } = useMusic();

    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [prevVolume, setPrevVolume] = useState(volume);
    const [bgColor, setBgColor] = useState('#1a1a1a');
    const [isExpanded, setIsExpanded] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [activeTab, setActiveTab] = useState('Play queue');

    const navigate = useNavigate();

    useEffect(() => {
        const audio = audioRef.current;
        const updateProgress = () => {
            if (audio.duration) {
                setCurrentTime(audio.currentTime);
                setDuration(audio.duration);
                setProgress((audio.currentTime / audio.duration) * 100);
            }
        };

        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('loadedmetadata', updateProgress);

        // Extract color from cover
        if (currentSong?.anhBia) {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.src = imgUrl(currentSong.anhBia);
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
                let r = 0, g = 0, b = 0;
                for (let i = 0; i < data.length; i += 4) {
                    r += data[i]; g += data[i+1]; b += data[i+2];
                }
                const count = data.length / 4;
                setBgColor(`rgb(${Math.floor(r/count)}, ${Math.floor(g/count)}, ${Math.floor(b/count)})`);
            };
        }

        return () => {
            audio.removeEventListener('timeupdate', updateProgress);
            audio.removeEventListener('loadedmetadata', updateProgress);
        };
    }, [currentSong?.id]);

    const handleProgressChange = (e) => {
        const newProgress = parseFloat(e.target.value);
        const newTime = (newProgress / 100) * duration;
        audioRef.current.currentTime = newTime;
        setProgress(newProgress);
    };

    const toggleMute = () => {
        if (isMuted) {
            setVolume(prevVolume === 0 ? 0.5 : prevVolume);
            setIsMuted(false);
        } else {
            setPrevVolume(volume);
            setVolume(0);
            setIsMuted(true);
        }
    };

    const formatTime = (time) => {
        if (isNaN(time)) return "0:00";
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleMinimize = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsExpanded(false);
            setIsClosing(false);
        }, 450);
    };

    const handleToggleExpand = () => {
        if (isExpanded) {
            handleMinimize();
        } else {
            setIsExpanded(true);
        }
    };

    if (!currentSong) return null;

    const history = currentIndex > 0 ? queue.slice(Math.max(0, currentIndex - 3), currentIndex) : [];
    const nextUp = queue.length > 0 ? queue.slice(currentIndex + 1, currentIndex + 6) : [];

    return (
        <div className={`fixed bottom-0 left-0 right-0 z-[500]`}>
    {/* Expanded Modal Layer */}
    {(isExpanded || isClosing) && (
        <div className={`fixed inset-0 z-[550] flex flex-col select-none ${isClosing ? 'animate-slide-down' : 'animate-slide-up'}`}
            data-lenis-prevent
            style={{ 
                background: `linear-gradient(to bottom, ${bgColor} 0%, #000 100%)`
            }}>
            
            {/* Header: Move Fullscreen to top left */}
            <div className="flex justify-between items-center px-8 py-6">
                <div className="flex gap-2">
                    <button className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-md flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-widest transition-all cursor-pointer">
                        <Maximize2 size={12} /> Full screen
                    </button>
                </div>
                
                <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Search size={16} className="text-gray-400 group-focus-within:text-white transition-colors" />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search" 
                        className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-6 w-72 text-xs focus:bg-white/15 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all placeholder-gray-500 text-white"
                    />
                </div>
            </div>

            <div className="flex-1 flex px-16 py-4 gap-12 overflow-hidden max-w-[1400px] mx-auto w-full items-start">
                {/* Left: Album Art & Info (Align height with queue) */}
                <div className="w-[400px] flex flex-col animate-fade-in-up pt-6">
                    <div className="aspect-square w-full rounded-xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] mb-8 relative group">
                        <img src={imgUrl(currentSong.anhBia)} alt={currentSong.tieuDe} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/5" />
                    </div>
                    <div className="space-y-0.5">
                        <h1 className="text-2xl font-black text-white tracking-tighter uppercase leading-tight">{currentSong.tieuDe}</h1>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{currentSong.tenNgheSi || 'Nghệ sĩ'}</p>
                    </div>
                </div>

                {/* Right: Queue & Navigation (Add data-lenis-prevent) */}
                <div className="flex-1 flex flex-col min-h-0 pt-6">
                    <div className="flex gap-1.5 items-center mb-8 overflow-x-auto hide-scrollbar">
                        {['Play queue', 'Suggested tracks', 'Lyrics', 'Credits'].map((tab) => (
                            <button 
                                key={tab} 
                                onClick={() => setActiveTab(tab)}
                                className={`px-5 py-2.5 rounded-xl text-[11px] font-black transition-all flex items-center gap-2 whitespace-nowrap uppercase tracking-widest cursor-pointer
                                    ${activeTab === tab ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:bg-white/10'}`}
                            >
                                {tab === 'Play queue' && <ListMusic size={14} />}
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto pr-6 custom-main-scroll space-y-8 pb-32" data-lenis-prevent>
                        {/* History Section */}
                        {history.length > 0 && (
                            <section>
                                <h3 className="text-[10px] font-black text-gray-500 mb-4 uppercase tracking-[0.3em]">History</h3>
                                <div className="space-y-3">
                                    {history.map((s, idx) => (
                                        <div key={s.id} 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                playFromQueue(Math.max(0, currentIndex - history.length + idx));
                                            }}
                                            className="flex items-center gap-3 group cursor-pointer opacity-40 hover:opacity-100 transition-all p-1.5 rounded-lg hover:bg-white/5"
                                        >
                                            <div className="w-10 h-10 rounded bg-gray-900 border border-white/5 overflow-hidden flex-shrink-0 relative group">
                                                <img src={imgUrl(s.anhBia)} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Play size={14} fill="white" className="text-white" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-white text-xs truncate uppercase tracking-tight">{s.tieuDe}</p>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{s.tenNgheSi}</p>
                                            </div>
                                            <MoreHorizontal size={14} className="text-gray-600 hover:text-white transition-colors cursor-pointer" />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Playing From Section */}
                        <section>
                            <h3 className="text-[10px] font-black text-white mb-4 uppercase tracking-[0.2em]">Playing from: <span className="underline decoration-1 underline-offset-4">{sourceInfo?.name || 'Now Playing'}</span></h3>
                            <div className="flex items-center gap-4 p-3 rounded-lg bg-white/5 border border-white/10 group ring-1 ring-white/10 shadow-xl">
                                <div className="w-12 h-12 rounded relative overflow-hidden flex-shrink-0 bg-gray-900">
                                    <img src={imgUrl(currentSong.anhBia)} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                                        <div className="flex items-end gap-[2px] h-4">
                                            <div className="w-[2px] bg-[#0F5E8F] animate-music-bar-1" />
                                            <div className="w-[2px] bg-[#0F5E8F] animate-music-bar-2" />
                                            <div className="w-[2px] bg-[#0F5E8F] animate-music-bar-3" />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-black text-[#0F5E8F] text-sm uppercase tracking-tight truncate">{currentSong.tieuDe}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{currentSong.tenNgheSi || 'Nghệ sĩ'}</p>
                                </div>
                                <button className="p-1.5 text-gray-500 hover:text-white transition-colors cursor-pointer">
                                    <MoreHorizontal size={16} />
                                </button>
                            </div>
                        </section>

                        {/* Next Up Section */}
                        <section>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-[10px] font-black text-white mb-0 uppercase tracking-[0.2em]">Next Up from: <span className="underline decoration-1 underline-offset-2">{sourceInfo?.name || 'Queue'}</span></h3>
                                <button className="text-[10px] font-black text-gray-500 hover:text-white transition-colors uppercase tracking-widest cursor-pointer">Clear</button>
                            </div>
                            <div className="space-y-3">
                                {nextUp.length > 0 ? nextUp.map((s, idx) => (
                                    <div key={s.id} 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            playFromQueue(currentIndex + 1 + idx);
                                        }}
                                        className="flex items-center gap-3 group cursor-pointer hover:bg-white/5 p-1.5 rounded-lg transition-colors"
                                    >
                                        <div className="w-10 h-10 rounded bg-gray-900 border border-white/5 overflow-hidden flex-shrink-0 relative group/img">
                                            <img src={imgUrl(s.anhBia)} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                                                <Play size={14} fill="white" className="text-white" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-white text-xs truncate uppercase tracking-tight">{s.tieuDe}</p>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{s.tenNgheSi}</p>
                                        </div>
                                        <button className="p-1.5 text-gray-600 hover:text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                                            <X size={14} />
                                        </button>
                                    </div>
                                )) : (
                                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest italic pt-2">No more tracks in queue</p>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )}

    {/* Bottom Bar: Constant location & higher z-index */}
    <div className={`relative h-20 flex items-center px-10 gap-12 w-full transition-all duration-500 z-[600] bg-[#0a0a0a] border-t border-white/5 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]`}>
        
        {/* Left: Song Info (Buttons next to title) */}
        <div className="flex items-center gap-5 w-[33%] min-w-0">
            <div className="flex-shrink-0 cursor-pointer group" onClick={handleToggleExpand}>
                <div className="w-14 h-14 rounded-md overflow-hidden bg-gray-900 border border-white/10 relative shadow-2xl">
                    <img src={imgUrl(currentSong.anhBia)} alt={currentSong.tieuDe} className="w-full h-full object-cover" />
                </div>
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex items-center gap-3.5 mb-1">
                    <h4 className="text-sm font-black text-white truncate uppercase tracking-tight leading-tight cursor-default">{currentSong.tieuDe}</h4>
                    <span className="px-1.5 py-0.5 bg-white/10 rounded text-[9px] font-black text-gray-400 border border-white/5 cursor-default">E</span>
                    <div className="flex items-center gap-1.5 ml-1">
                        <button onClick={() => toggleLike(currentSong)} className="p-1 text-gray-500 hover:text-white transition-all cursor-pointer">
                            <Heart size={18} fill={likedSongIds.has(currentSong.id) ? "#ef4444" : "none"} color={likedSongIds.has(currentSong.id) ? "#ef4444" : "currentColor"} />
                        </button>
                        <button className="p-1 text-gray-500 hover:text-white transition-all cursor-pointer">
                            <CircleOff size={18} />
                        </button>
                        <button className="p-1 text-gray-500 hover:text-white transition-all cursor-pointer">
                            <MoreHorizontal size={18} />
                        </button>
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest leading-none">{currentSong.tenNgheSi || 'Nghệ sĩ'}</p>
                    <p className="text-[10px] text-white font-black uppercase tracking-widest leading-none">Playing from: <span className="underline decoration-1 underline-offset-2 hover:text-buzzify-blue cursor-pointer">{sourceInfo?.name || 'Now Playing'}</span></p>
                </div>
            </div>
        </div>

        {/* Center: Controls & Progress */}
        <div className="flex-1 flex flex-col items-center gap-1.5 px-4 max-w-4xl">
            <div className="flex items-center gap-10">
                <button className="text-gray-600 hover:text-white transition-colors cursor-pointer"><Shuffle size={20} /></button>
                <button onClick={prevSong} className="text-white hover:scale-110 transition-transform cursor-pointer"><SkipBack size={22} fill="currentColor" /></button>
                <button onClick={togglePlay} className="w-12 h-12 rounded-full bg-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.25)] cursor-pointer">
                    {isPlaying ? <Pause size={22} fill="black" className="text-black" /> : <Play size={22} fill="black" className="text-black ml-0.5" />}
                </button>
                <button onClick={nextSong} className="text-white hover:scale-110 transition-transform cursor-pointer"><SkipForward size={22} fill="currentColor" /></button>
                <button className="text-gray-600 hover:text-white transition-colors cursor-pointer"><Repeat size={20} /></button>
            </div>
            <div className="w-full flex items-center gap-4">
                <span className="text-[10px] text-gray-600 font-bold tracking-widest font-mono w-10 text-right">{formatTime(currentTime)}</span>
                <div className="flex-1 relative group h-1 cursor-pointer flex items-center">
                    <input 
                        type="range" 
                        min="0" max="100" 
                        value={progress} 
                        onChange={handleProgressChange}
                        className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-white hover:accent-buzzify-blue"
                        style={{
                            background: `linear-gradient(to right, white ${progress}%, rgba(255,255,255,0.05) ${progress}%)`
                        }}
                    />
                </div>
                <span className="text-[10px] text-gray-600 font-bold tracking-widest font-mono w-10">{formatTime(duration)}</span>
            </div>
        </div>

        {/* Right: Tools */}
        <div className="w-[30%] flex items-center justify-end gap-6 h-full">
            <div className="flex items-center gap-3 w-32 group">
                <button onClick={toggleMute} className="text-gray-500 hover:text-white transition-colors cursor-pointer">
                    {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <div className="flex-1 h-1 relative flex items-center cursor-pointer">
                    <input 
                        type="range" 
                        min="0" max="1" step="0.01"
                        value={volume}
                        onChange={(e) => {
                            const v = parseFloat(e.target.value);
                            setVolume(v);
                            localStorage.setItem('buzzify_volume', v);
                            if (v > 0) setIsMuted(false);
                        }}
                        className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-white"
                        style={{
                            background: `linear-gradient(to right, white ${volume * 100}%, rgba(255,255,255,0.05) ${volume * 100}%)`
                        }}
                    />
                </div>
            </div>
            <button className="text-gray-500 hover:text-white transition-colors cursor-pointer">
                <ListMusic size={20} />
            </button>
            <button onClick={handleToggleExpand} className={`p-2.5 rounded-xl transition-all cursor-pointer ${isExpanded ? 'bg-white/10 text-white shadow-xl ring-1 ring-white/10' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
                <ChevronUp size={22} className={`transition-transform duration-[0.6s] ease-in-out ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
        </div>
    </div>
</div>
    );
};

export default MusicPlayerBar;
