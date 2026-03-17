import React from 'react';
import { Link } from 'react-router-dom';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="relative min-h-screen bg-[#020202] flex flex-col items-center justify-start pt-12 px-4 font-sans text-white overflow-hidden">
      {/* Background Sphere Glow - "Mờ mờ ảo ảo" Effect */}
      <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden pointer-events-none">
        {/* Glow Sphere Core - Wider and Dimmer */}
        <div className="w-[140vw] h-[140vw] max-w-[1400px] max-h-[1400px] bg-gradient-to-br from-[#0044ff] via-[#00a2ff] to-transparent rounded-full blur-[160px] opacity-25"></div>
        
        {/* Dark Dimming layer for depth - Darker */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[35px]"></div>
        
        {/* Noise overlay */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      </div>

      <Link to="/" className="relative z-20 mb-8 transition-transform hover:scale-105 active:scale-95 group">
        <img 
          src="/logo/FullLogo_Transparent.png" 
          alt="Buzzify Logo" 
          className="h-14 w-auto object-contain"
        />
      </Link>

      <div className="relative z-20 w-full max-w-[440px] text-center mb-6">
        <h1 className="text-2xl font-bold mb-1 tracking-tight">
          {title}
        </h1>
        {subtitle && <p className="text-gray-400 text-sm font-medium">{subtitle}</p>}
      </div>

      <div 
        className="relative z-20 w-full max-w-[440px] bg-white rounded-2xl overflow-hidden p-8 text-black shadow-[0_20px_60px_-10px_rgba(0,0,0,0.5)] border border-white/10"
      >
        {children}
      </div>

      <div className="relative z-20 mt-10 flex gap-6 text-xs text-gray-400 font-medium">
        <a href="#" className="hover:text-white transition-colors">Quyền riêng tư</a>
        <a href="#" className="hover:text-white transition-colors">Điều khoản</a>
        <a href="#" className="hover:text-white transition-colors">Trợ giúp</a>
      </div>
    </div>
  );
};

export default AuthLayout;
