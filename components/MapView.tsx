import React, { useState } from 'react';
import { Photo } from '../types';
import { Info } from 'lucide-react';

interface MapViewProps {
  photos: Photo[];
  onSelectPhoto: (photo: Photo) => void;
}

const MapView: React.FC<MapViewProps> = ({ photos, onSelectPhoto }) => {
  const [width, setWidth] = useState(800);
  const height = 400;

  // Simple Mercator projection
  const projection = (lat: number, lng: number) => {
    const x = (lng + 180) * (width / 360);
    const latRad = lat * Math.PI / 180;
    const mercN = Math.log(Math.tan((Math.PI / 4) + (latRad / 2)));
    const y = (height / 2) - (width * mercN / (2 * Math.PI));
    return { 
        x, 
        y: Math.max(0, Math.min(height, y)) 
    };
  };

  return (
    <div className="w-full h-full relative overflow-hidden rounded-[2.5rem] bg-white border border-slate-100 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] flex items-center justify-center p-6 group">
       
       {/* Background Grid */}
       <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
            style={{ 
                backgroundImage: 'linear-gradient(#475569 1px, transparent 1px), linear-gradient(90deg, #475569 1px, transparent 1px)', 
                backgroundSize: '40px 40px' 
            }}>
       </div>
       
       <div className="relative w-full max-w-5xl aspect-[2.2/1] bg-slate-50/50 rounded-2xl overflow-hidden border border-slate-200/50">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
            
            {/* Abstract Land Masses (Stylized) - normally this would be TopoJSON */}
            <path d={`M0,${height/2} L${width},${height/2}`} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="8 8" opacity="0.5" />
            
            {/* Connections Lines */}
            <path 
                d={photos.map((p, i) => {
                    const { x, y } = projection(p.location.lat, p.location.lng);
                    return `${i === 0 ? 'M' : 'L'}${x},${y}`;
                }).join(' ')}
                fill="none"
                stroke="#fda4af"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                className="animate-[dash_20s_linear_infinite]"
            />

            {/* Content Points */}
            {photos.map((photo) => {
                const { x, y } = projection(photo.location.lat, photo.location.lng);
                return (
                    <g key={photo.id} 
                       className="cursor-pointer hover:opacity-80 transition-all duration-300 group/pin"
                       onClick={() => onSelectPhoto(photo)}>
                        
                        {/* Ripple Effect */}
                        <circle cx={x} cy={y} r={8} fill="#f43f5e" className="animate-ping opacity-20" />
                        
                        {/* Pin */}
                        <circle cx={x} cy={y} r={4} fill="#e11d48" className="drop-shadow-sm" />
                        <circle cx={x} cy={y} r={12} fill="transparent" stroke="#e11d48" strokeWidth="1.5" opacity={0} className="group-hover/pin:opacity-30 transition-opacity" />

                        {/* Tooltip */}
                        <foreignObject x={x - 60} y={y - 50} width="120" height="40" className="opacity-0 group-hover/pin:opacity-100 transition-all duration-300 transform translate-y-2 group-hover/pin:translate-y-0 pointer-events-none">
                            <div className="bg-slate-800 text-white text-[10px] font-bold py-1 px-3 rounded-full text-center shadow-lg mx-auto w-max max-w-full truncate">
                                {photo.location.name}
                            </div>
                        </foreignObject>
                    </g>
                );
            })}
          </svg>
       </div>
       
       <div className="absolute bottom-6 right-6 bg-white/90 px-4 py-2 rounded-full text-xs font-bold text-slate-500 shadow-sm backdrop-blur-sm border border-slate-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            Live Locations
       </div>
    </div>
  );
};

export default MapView;