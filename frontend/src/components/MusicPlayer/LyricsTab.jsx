import React, { useState, useEffect, useRef } from 'react';
import { Music2, AlertCircle, Loader2 } from 'lucide-react';
import { useMusic } from '../../context/MusicContext';

const LyricsTab = ({ currentSong, audioRef, isFullscreenView = false }) => {
    const { currentLyrics } = useMusic();
    const { synced: syncedLines, plain: plainLines, status } = currentLyrics;
    
    const [activeIndex, setActiveIndex] = useState(-1);
    const [smoothTime, setSmoothTime] = useState(0);

    const lineRefs = useRef([]);
    const containerRef = useRef(null);

    const hasSync = syncedLines.length > 0;

    // ─── Animation Loop (60FPS with Audio Extrapolation) ───
    useEffect(() => {
        let frameId;
        let lastAudioTime = -1;
        let lastSystemTime = 0;

        const loop = () => {
            if (audioRef?.current) {
                const audioTime = audioRef.current.currentTime;
                const currentSystemTime = performance.now() / 1000;

                // Cập nhật mốc thời gian khi trình duyệt update currentTime
                if (Math.abs(audioTime - lastAudioTime) > 0.05) { 
                    lastAudioTime = audioTime;
                    lastSystemTime = currentSystemTime;
                }

                // Ngoại suy thời gian (Extrapolation) giữa các lần tick của trình duyệt
                const extrapolatedTime = audioRef.current.paused 
                    ? audioTime 
                    : audioTime + (currentSystemTime - lastSystemTime);
                
                // Tránh lệch quá lớn nếu có độ trễ bất thường
                const finalTime = Math.max(audioTime, Math.min(extrapolatedTime, audioTime + 0.3));

                setSmoothTime(finalTime);

                if (hasSync && syncedLines.length > 0) {
                    let idx = -1;
                    // Tối ưu vòng lặp bằng cách duyệt ngược hoặc tìm kiếm nhị phân, nhưng duyệt thường với mảng nhỏ vẫn ổn
                    for (let i = 0; i < syncedLines.length; i++) {
                        if (finalTime >= syncedLines[i].time) idx = i;
                        else break;
                    }
                    setActiveIndex(current => current !== idx ? idx : current);
                }
            }
            frameId = requestAnimationFrame(loop);
        };
        frameId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(frameId);
    }, [audioRef, hasSync, syncedLines]);

    // ─── Auto Scroll ───
    useEffect(() => {
        if (activeIndex < 0 || !lineRefs.current[activeIndex] || !containerRef.current) return;
        const el = lineRefs.current[activeIndex];
        const container = containerRef.current;
        const targetScrollTop = el.offsetTop - container.clientHeight / 2 + el.offsetHeight / 2;
        container.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
    }, [activeIndex]);

    if (status === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-500">
                <Loader2 size={32} className="animate-spin text-[#0F5E8F]" />
                <p className="text-[11px] font-black uppercase tracking-widest text-[#0F5E8F]/60">Đang tải lời bài hát...</p>
            </div>
        );
    }

    if (status === 'error' || status === 'notfound') {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-500 p-8">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2">
                    {status === 'error' ? <AlertCircle size={28} className="text-red-400" /> : <Music2 size={28} className="text-gray-600" />}
                </div>
                <div className="text-center">
                    <p className="text-[13px] font-black uppercase tracking-widest text-white mb-1">
                        {status === 'error' ? 'Không thể tải lời bài hát' : 'Chưa có lời bài hát'}
                    </p>
                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest max-w-xs leading-relaxed mx-auto">
                        {status === 'error' ? 'Có lỗi xảy ra khi tải lời bài hát' : 'Lời bài hát này chưa có trong cơ sở dữ liệu'}
                    </p>
                </div>
            </div>
        );
    }

    if (hasSync && syncedLines.length > 0) {
        return (
            <div
                ref={containerRef}
                className="h-full overflow-y-auto hide-scrollbar px-8 pb-64 pt-32"
                data-lenis-prevent
                onWheel={(e) => e.stopPropagation()}
                style={{ scrollPaddingBlock: '25%' }}
            >
                <div className={`flex flex-col ${isFullscreenView ? 'space-y-16' : 'space-y-12'}`}>
                    {syncedLines.map((line, idx) => {
                        const isActive = idx === activeIndex;
                        const isPast = idx < activeIndex;

                        const startTime = line.time;
                        const nextLine = syncedLines[idx + 1];
                        const nextStartTime = nextLine ? nextLine.time : (audioRef?.current?.duration || startTime + 10);
                        const gap = nextStartTime - startTime;

                        const words = line.text.split(' ');
                        const totalChars = line.text.length || 1;

                        const predictedVocalTime = (words.length * 0.5) + (totalChars * 0.05);
                        const vocalTime = gap > 2.5 
                            ? Math.min(predictedVocalTime, gap * 0.9) 
                            : Math.max(gap * 0.85, 1.2);
                        
                        let linePercent = 0;
                        if (isActive) {
                            linePercent = Math.min(100, Math.max(0, ((smoothTime - startTime) / vocalTime) * 100));
                        } else if (isPast) {
                            linePercent = 100;
                        }

                        const distance = Math.abs(idx - activeIndex);
                        const containerOpacity = isActive ? 1 : (distance === 1 ? 0.5 : (distance === 2 ? 0.3 : 0.15));

                        let charCount = 0;
                        return (
                            <React.Fragment key={idx}>
                                <div
                                    ref={(el) => (lineRefs.current[idx] = el)}
                                    className="py-1 cursor-pointer group transition-all duration-700 ease-in-out origin-left flex flex-wrap gap-x-[0.35em] items-end"
                                    onClick={() => { if (audioRef?.current && line.time >= 0) audioRef.current.currentTime = line.time; }}
                                    style={{ opacity: containerOpacity }}
                                >
                                    {words.map((word, wIdx) => {
                                        const wordStartPercent = (charCount / totalChars) * 100;
                                        const wordEndPercent = ((charCount + word.length) / totalChars) * 100;
                                        charCount += word.length + 1;

                                        let wordFill = 0;
                                        if (linePercent >= wordEndPercent) wordFill = 100;
                                        else if (linePercent <= wordStartPercent) wordFill = 0;
                                        else wordFill = ((linePercent - wordStartPercent) / (wordEndPercent - wordStartPercent)) * 100;

                                        const isWordFilling = wordFill > 0 && wordFill < 100;

                                        return (
                                            <span
                                                key={wIdx}
                                                className={`
                                                    font-black leading-none select-none transition-all duration-300
                                                    ${isActive 
                                                        ? `${isFullscreenView ? 'text-6xl' : 'text-4xl'} tracking-tighter ${isWordFilling ? '-translate-y-[2px] brightness-150' : 'translate-y-0 opacity-100'}` 
                                                        : `${isFullscreenView ? 'text-4xl' : 'text-3xl'} tracking-tight text-white/20 group-hover:text-white group-hover:scale-[1.05]`
                                                    }
                                                `}
                                                style={isActive ? {
                                                    backgroundImage: `linear-gradient(to right, #fff ${wordFill}%, rgba(255,255,255,0.2) ${wordFill}%)`,
                                                    WebkitBackgroundClip: 'text',
                                                    backgroundClip: 'text',
                                                    WebkitTextFillColor: 'transparent',
                                                    color: 'transparent',
                                                } : {}}
                                            >
                                                {word}
                                            </span>
                                        );
                                    })}
                                </div>
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="h-full overflow-y-auto hide-scrollbar px-12 pb-32 pt-16" data-lenis-prevent onWheel={(e) => e.stopPropagation()}>
            <div className="mb-10 text-center">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                    Lời bài hát chưa đồng bộ
                </span>
            </div>
            <div className="space-y-10">
                {plainLines.map((line, idx) => (
                    <p key={idx} className={`font-black text-white/30 leading-tight tracking-tight hover:text-white/80 transition-all duration-300 cursor-default select-none ${isFullscreenView ? 'text-5xl' : 'text-3xl'}`}>
                        {line}
                    </p>
                ))}
            </div>
        </div>
    );
};

export default LyricsTab;
