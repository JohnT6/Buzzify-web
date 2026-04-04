import React, { useState, useEffect, useRef } from 'react';
import { X, Minimize2 } from 'lucide-react';
import LyricsTab from './LyricsTab';

const API_BASE = import.meta.env.VITE_API_URL || '';
const imgUrl = (src) => {
    if (!src) return null;
    if (src.startsWith('http://') || src.startsWith('https://')) return src;
    return `${API_BASE}${src.startsWith('/') ? '' : '/'}${src}`;
};

const FullscreenPlayer = ({ currentSong, audioRef, onClose }) => {
    useEffect(() => {
        // Trigger browser fullscreen
        try {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            }
        } catch (e) {
            console.error("Fullscreen request failed:", e);
        }

        return () => {
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(e => console.error(e));
            }
        };
    }, []);

    if (!currentSong) return null;

    return (
        <div className="fixed inset-0 z-[1000] bg-black text-white overflow-hidden animate-fade-in">
            {/* Blurred Background */}
            <div 
                className="absolute inset-0 z-0 bg-cover bg-center opacity-30 blur-[100px] scale-110"
                style={{ backgroundImage: `url(${imgUrl(currentSong.anhBia)})` }}
            />
            
            {/* Dark Overlay */}
            <div className="absolute inset-0 z-10 bg-black/60" />
            <div className="relative z-20 h-full flex flex-col md:flex-row items-center justify-center px-6 md:px-32 gap-12 md:gap-32">
                
                {/* Left: Album Art & Basic Info (Centered on Mobile) */}
                <div 
                    className="w-full md:w-[450px] flex flex-col items-center justify-center animate-slide-right shrink-0 cursor-pointer active:scale-95 transition-transform"
                    onClick={onClose}
                    title="Bấm để thoát"
                >
                    <div className="w-full aspect-square md:aspect-square rounded-2xl md:rounded-xl overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.8)] mb-10 ring-1 ring-white/10 max-w-[320px] md:max-w-none">
                        <img 
                            src={imgUrl(currentSong.anhBia)} 
                            alt={currentSong.tieuDe} 
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="text-center space-y-3 w-full">
                        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight drop-shadow-2xl truncate px-4">
                            {currentSong.tieuDe}
                        </h1>
                        <p className="text-sm md:text-base font-bold text-gray-500 uppercase tracking-[0.2em] truncate px-4">
                            {currentSong.tenNgheSi}{currentSong.ngheSiHopTac ? `, ${currentSong.ngheSiHopTac}` : ''}
                        </p>
                    </div>
                </div>

                {/* Right: Lyrics Column (Hidden on Mobile) */}
                <div className="hidden md:flex flex-1 max-w-2xl h-[65vh] flex-col animate-slide-up">
                    <div className="flex-1 min-h-0">
                        <LyricsTab 
                            currentSong={currentSong} 
                            audioRef={audioRef}
                            isFullscreenView={true}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FullscreenPlayer;
