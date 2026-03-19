import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ChevronLeft, ChevronRight, LayoutGrid, Play 
} from 'lucide-react';
import ImgFallback, { imgUrl } from '../../components/Common/ImgFallback';
import { getAlbumsApi, getSongsApi } from '../../services/api_services';

const ExploreView = () => {
    const navigate = useNavigate();
    const [featured, setFeatured] = useState([]);
    const [loading, setLoading] = useState(true);

    const genres = [
        "Hip-Hop", "Pop", "R&B / Soul", "Country", "Latin", 
        "Rock / Indie", "Dance & Electronic", "Jazz", "Rising"
    ];

    useEffect(() => {
        const fetchExplore = async () => {
            setLoading(true);
            try {
                const aRes = await getAlbumsApi();
                setFeatured(Array.isArray(aRes) ? aRes.slice(0, 4) : (aRes?.data?.slice(0, 4) || []));
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchExplore();
    }, []);

    if (loading) return <div className="p-10 animate-pulse">Loading explore...</div>;

    return (
        <div className="flex-1 overflow-y-auto px-8 py-10 custom-main-scroll" data-lenis-prevent>
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-10">Explore</h1>

            {/* Featured Section (Image 4) */}
            <section className="mb-20">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-white uppercase tracking-[0.2em]">Featured</h2>
                    <div className="flex items-center gap-3">
                        <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"><ChevronLeft size={20} /></button>
                        <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"><ChevronRight size={20} /></button>
                    </div>
                </div>

                <div className="flex gap-8 overflow-x-auto pb-4 hide-scrollbar px-1">
                    {featured.map((item, i) => (
                        <div key={item.id} className="flex-shrink-0 w-[450px] group cursor-pointer" onClick={() => navigate(`/home/album/${item.id}`)}>
                            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-5 bg-gray-900 shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-[0_30px_60px_rgba(0,0,0,0.6)]">
                                <ImgFallback src={item.anhBia} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-all duration-700" alt="" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                
                                {/* Status Label (Image 4) */}
                                <div className="absolute top-6 left-6">
                                    <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                                        {i === 0 ? "TRENDING NOW" : (i === 1 ? "LISTEN: NEW SINGLE" : "HOT ALBUM")}
                                    </span>
                                </div>

                                <div className="absolute bottom-8 left-8 right-8">
                                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-1 drop-shadow-lg">{item.tieuDe}</h3>
                                    <p className="text-sm font-bold text-white/60 truncate uppercase tracking-widest">{item.artistName || "Artist Name"}</p>
                                </div>

                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-2xl">
                                        <Play size={28} fill="black" className="ml-1" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Genres Section (Image 4) */}
            <section className="mb-20">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-white uppercase tracking-[0.2em]">Genres</h2>
                    <button className="text-xs font-black text-white/40 uppercase tracking-widest hover:text-white transition-colors">View all</button>
                </div>
                <div className="flex flex-wrap gap-4">
                    {genres.map(g => (
                        <button key={g} className="px-8 py-4 rounded-2xl bg-[#1a1a1a] border border-white/5 text-sm font-black text-white/60 uppercase tracking-widest hover:bg-white/10 hover:text-white hover:border-white/10 transition-all active:scale-95 shadow-lg">
                            {g}
                        </button>
                    ))}
                    <button className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors border border-white/5"><ChevronRight size={24} /></button>
                </div>
            </section>
        </div>
    );
};

export default ExploreView;
