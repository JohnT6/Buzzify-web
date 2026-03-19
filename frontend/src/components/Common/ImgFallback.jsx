import React, { useState } from 'react';
import { Music2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

const imgUrl = (src) => {
    if (!src) return null;
    if (src.startsWith('http://') || src.startsWith('https://')) return src;
    return `${API_BASE}${src.startsWith('/') ? '' : '/'}${src}`;
};

const ImgFallback = ({ src, alt, className, iconSize = 28 }) => {
    const [err, setErr] = useState(false);
    const fullSrc = imgUrl(src);
    
    if (!fullSrc || err) return (
        <div className={`${className} bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center`}>
            <Music2 size={iconSize} className="text-gray-600" />
        </div>
    );
    
    return (
        <img 
            src={fullSrc} 
            alt={alt} 
            className={`${className} object-cover`} 
            onError={() => setErr(true)} 
        />
    );
};

export { imgUrl };
export default ImgFallback;
