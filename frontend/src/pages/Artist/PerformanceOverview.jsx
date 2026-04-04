import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Play, 
  Heart, 
  TrendingUp, 
  TrendingDown,
  Clock,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';
import { getArtistStatsApi } from '../../services/api_services';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Area,
  AreaChart
} from 'recharts';
import { cn } from '../../lib/utils';

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316', '#84cc16'];

const PerformanceOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('28d');

  useEffect(() => {
    let intervalId;

    const fetchStats = async (isInitial = false) => {
      if (isInitial) setLoading(true);
      try {
        const response = await getArtistStatsApi(range);
        setStats(response.data || response);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        if (isInitial) setLoading(false);
      }
    };

    fetchStats(true);

    // Auto-refresh mỗi 15 giây để realtime dữ liệu
    intervalId = setInterval(() => {
      fetchStats(false);
    }, 15000);

    return () => clearInterval(intervalId);
  }, [range]);

  const cards = [
    { title: 'Tổng lượt nghe', value: stats?.totalStreams?.toLocaleString() || '0', icon: Play, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: 'Lượt thả tim', value: stats?.totalSaves?.toLocaleString() || '0', icon: Heart, color: 'text-rose-600', bg: 'bg-rose-50' },
    { title: 'Người nghe trực tiếp', value: stats?.realTimeListeners || '0', icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Followers', value: stats?.followerCount?.toLocaleString() || '0', icon: Users, color: 'text-violet-600', bg: 'bg-violet-50',
      trend: stats?.followerChangeMonth > 0 ? "up" : "down", trendValue: stats?.followerChangeMonth },
  ];

  const distributionData = stats?.songDistribution || [];
  const trendData = stats?.streamTrend || [];
  const totalMonthlyListens = distributionData.reduce((sum, entry) => sum + entry.value, 0);

  const ranges = [
    { id: '7d', label: '7 ngày' },
    { id: '28d', label: '28 ngày' },
    { id: '1y', label: '1 năm' }
  ];

  if (loading && !stats) return (
    <div className="flex flex-col h-96 items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin"></div>
      <p className="text-gray-400 font-medium italic">Đang đồng bộ dữ liệu thực tế...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-10">
      {/* Top Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Thống kê hiệu suất 👋</h2>
          <p className="text-gray-500 mt-1 font-medium">Theo dõi sự tăng trưởng âm nhạc của bạn qua các con số thực.</p>
        </div>

        <div className="flex bg-gray-100/50 p-1 rounded-2xl border border-gray-100">
          {ranges.map((r) => (
            <button
              key={r.id}
              onClick={() => setRange(r.id)}
              className={cn(
                "px-5 py-2 text-sm font-bold rounded-xl transition-all",
                range === r.id ? "bg-white text-indigo-600 shadow-sm ring-1 ring-black/5" : "text-gray-500 hover:text-gray-900"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <div key={idx} className="bg-white p-7 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
            <div className="flex justify-between items-start mb-6">
              <div className={cn("p-4 rounded-2xl shadow-sm", card.bg)}>
                <card.icon size={26} className={card.color} />
              </div>
              {card.trend && (
                <div className={cn(
                  "flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter",
                  card.trend === 'up' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                )}>
                  {card.trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {card.trendValue}%
                </div>
              )}
            </div>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{card.title}</p>
            <h3 className="text-3xl font-black text-gray-900 mt-1">{card.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left: Trend Chart (Logical Main Chart) */}
        <div className="xl:col-span-2 bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-10">
                <div>
                   <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600"><Activity size={24} /></div>
                      Xu hướng lượt nghe
                   </h3>
                   <p className="text-sm text-gray-400 font-medium mt-1">Lượt nghe mỗi ngày trong 14 ngày qua</p>
                </div>
            </div>

            <div className="flex-1 h-[400px]">
                {trendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} 
                        dy={15}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} 
                        dx={-10}
                      />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-gray-900 text-white p-4 rounded-2xl shadow-2xl border-none animate-in zoom-in-95">
                                <p className="text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest">{payload[0].payload.date}</p>
                                <p className="text-xl font-black">{payload[0].value.toLocaleString()} <span className="text-xs font-medium text-gray-400">lượt nghe</span></p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#6366f1" 
                        strokeWidth={4} 
                        fillOpacity={1} 
                        fill="url(#colorValue)" 
                        animationDuration={2000}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-300 font-medium italic">Không có dữ liệu xu hướng.</div>
                )}
            </div>
        </div>

        {/* Right: Distribution Chart (Visual Beauty) */}
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute top-8 left-8">
               <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <div className="p-1.5 bg-rose-50 rounded-lg text-rose-600"><PieChartIcon size={18} /></div>
                  Top bài hát
               </h3>
               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Phân bổ trong tháng</p>
            </div>

            <div className="relative w-full h-[350px] mt-10">
                {distributionData.length > 0 ? (
                  <>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-10 pt-4">
                       <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">TOTAL</p>
                       <p className="text-2xl font-black text-gray-900">{totalMonthlyListens.toLocaleString()}</p>
                    </div>

                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={distributionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          {distributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="hover:opacity-80 cursor-pointer outline-none" />
                          ))}
                        </Pie>
                        <Tooltip 
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload;
                                  return (
                                    <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-gray-100 min-w-[200px]">
                                      <p className="text-sm font-black text-gray-900 leading-tight mb-2">{data.date}</p>
                                      <div className="flex items-center justify-between">
                                          <span className="text-[10px] font-bold text-gray-400">LƯỢT NGHE</span>
                                          <span className="text-base font-black text-indigo-600">{data.value.toLocaleString()}</span>
                                      </div>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-300 font-medium italic">Không có dữ liệu.</div>
                )}
            </div>

            <div className="w-full space-y-3 mt-4">
                {distributionData.slice(0, 4).map((item, i) => (
                   <div key={i} className="flex items-center justify-between group">
                      <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[i]}} />
                         <span className="text-[11px] font-bold text-gray-500 group-hover:text-gray-900 transition-colors truncate max-w-[150px]">{item.date}</span>
                      </div>
                      <span className="text-[11px] font-black text-gray-900">
                          {totalMonthlyListens > 0 ? ((item.value / totalMonthlyListens) * 100).toFixed(0) : 0}%
                      </span>
                   </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceOverview;
