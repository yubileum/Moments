import React, { useMemo, useState } from 'react';
import * as d3 from 'd3';
import { Photo } from '../types';
import { MapPin, Info } from 'lucide-react';

interface MapViewProps {
  photos: Photo[];
  onSelectPhoto: (photo: Photo) => void;
}

// Simplified World Data (Abstract representation)
// In a real app, we'd fetch TopoJSON. Here we use a functional background or simple grid.
// Since we can't easily include a 100KB+ path string, we will visualize lat/long on a mercator-like plane
// and rely on the aesthetics.
const MapView: React.FC<MapViewProps> = ({ photos, onSelectPhoto }) => {
  const [width, setWidth] = useState(800);
  const height = 400;

  // Simple Mercator projection function
  const projection = (lat: number, lng: number) => {
    const x = (lng + 180) * (width / 360);
    const latRad = lat * Math.PI / 180;
    const mercN = Math.log(Math.tan((Math.PI / 4) + (latRad / 2)));
    const y = (height / 2) - (width * mercN / (2 * Math.PI));
    // Clamp y to avoid infinity at poles
    return { 
        x, 
        y: Math.max(0, Math.min(height, y)) 
    };
  };

  return (
    <div className="w-full h-full bg-slate-50 relative overflow-hidden rounded-xl border border-rose-100 shadow-inner flex items-center justify-center p-4">
       <div className="absolute inset-0 opacity-10 pointer-events-none" 
            style={{ 
                backgroundImage: 'radial-gradient(#e11d48 1px, transparent 1px)', 
                backgroundSize: '20px 20px' 
            }}>
       </div>
       
       <div className="relative w-full max-w-4xl aspect-[2/1] bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          {/* Abstract Map Background */}
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full bg-slate-100">
            {/* Equator Line */}
            <line x1="0" y1={height/2} x2={width} y2={height/2} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
            
            {/* Content Points */}
            {photos.map((photo) => {
                const { x, y } = projection(photo.location.lat, photo.location.lng);
                return (
                    <g key={photo.id} 
                       className="cursor-pointer hover:opacity-80 transition-opacity group"
                       onClick={() => onSelectPhoto(photo)}>
                        <circle 
                            cx={x} cy={y} 
                            r={6} 
                            fill="#e11d48" 
                            className="animate-pulse"
                        />
                        <circle cx={x} cy={y} r={12} fill="#e11d48" opacity={0.2} />
                        
                        {/* Tooltip on Hover */}
                        <g className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <rect x={x - 50} y={y - 45} width="100" height="35" rx="4" fill="white" stroke="#e2e8f0" />
                            <text x={x} y={y - 23} textAnchor="middle" fontSize="10" fill="#334155" fontWeight="bold">
                                {photo.location.name}
                            </text>
                        </g>
                    </g>
                );
            })}
          </svg>
          
          <div className="absolute bottom-4 right-4 bg-white/90 p-2 rounded text-xs text-slate-500 shadow backdrop-blur-sm">
             <Info className="w-3 h-3 inline mr-1" />
             Select a pin to explore details
          </div>
       </div>
    </div>
  );
};

export default MapView;