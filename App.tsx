import React, { useState, useEffect, useMemo } from 'react';
import { Heart, Map as MapIcon, Grid, Calendar, Plus, X, Search, Info, ChevronLeft, ChevronRight, Sparkles, User, Camera, Music, Volume2 } from 'lucide-react';
import { Photo, ViewMode } from './types';
import { MOCK_PHOTOS } from './constants';
import MapView from './components/MapView';
import VoiceAgent from './components/VoiceAgent';
import { getLocationInfo, speakText } from './services/geminiService';

const App = () => {
  const [photos, setPhotos] = useState<Photo[]>(MOCK_PHOTOS);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.GRID);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [insight, setInsight] = useState<{text: string, links: any[]} | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  // Animation States
  const [isClosing, setIsClosing] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('ourmoments_photos');
    if (saved) {
      setPhotos(JSON.parse(saved));
    }
  }, []);

  const savePhotos = (newPhotos: Photo[]) => {
    setPhotos(newPhotos);
    localStorage.setItem('ourmoments_photos', JSON.stringify(newPhotos));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        const newPhoto: Photo = {
          id: Date.now().toString(),
          url: ev.target?.result as string,
          description: 'A new beautiful moment...',
          location: { name: 'New Memory', lat: 0, lng: 0 },
          date: new Date().toISOString(),
          tags: []
        };
        savePhotos([newPhoto, ...photos]);
        handleOpenPhoto(newPhoto);
      };
      reader.readAsDataURL(file);
    }
    setIsUploadOpen(false);
  };

  const getInsight = async (photo: Photo) => {
    setLoadingInsight(true);
    setInsight(null);
    const data = await getLocationInfo(photo.location.name);
    setInsight(data);
    setLoadingInsight(false);
  };
  
  const handleTTS = (text: string) => {
      speakText(text);
  };

  // --- Navigation & Animation Logic ---

  const handleOpenPhoto = (photo: Photo) => {
    setIsClosing(false);
    setIsSwitching(false);
    setSelectedPhoto(photo);
    setInsight(null);
  };

  const handleClosePhoto = () => {
    setIsClosing(true);
    setTimeout(() => {
      setSelectedPhoto(null);
      setIsClosing(false);
      setInsight(null);
    }, 300);
  };

  const handleNavigate = (direction: 'next' | 'prev') => {
    if (!selectedPhoto || isSwitching) return;

    setIsSwitching(true);
    
    setTimeout(() => {
      const currentIndex = photos.findIndex(p => p.id === selectedPhoto.id);
      let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
      
      if (newIndex >= photos.length) newIndex = 0;
      if (newIndex < 0) newIndex = photos.length - 1;
      
      setSelectedPhoto(photos[newIndex]);
      setInsight(null);

      setTimeout(() => {
        setIsSwitching(false);
      }, 50);
    }, 300);
  };

  useEffect(() => {
    if (selectedPhoto) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [selectedPhoto]);

  // Group photos by month
  const photosByMonth = useMemo(() => {
    const sorted = [...photos].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const groups: { title: string; photos: Photo[] }[] = [];
    
    sorted.forEach(photo => {
      const date = new Date(photo.date);
      const title = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      
      let group = groups.find(g => g.title === title);
      if (!group) {
        group = { title, photos: [] };
        groups.push(group);
      }
      group.photos.push(photo);
    });
    
    return groups;
  }, [photos]);

  const getRandomRotation = (id: string) => {
    const num = parseInt(id) || 0;
    return (num % 8) - 4; 
  };

  // Washi tape colors
  const tapes = ['bg-rose-200/50', 'bg-blue-200/50', 'bg-amber-200/50', 'bg-purple-200/50'];
  const getTapeColor = (id: string) => tapes[parseInt(id) % tapes.length];

  return (
    <div className="flex flex-col h-full text-slate-700">
      
      {/* Floating Header */}
      <div className="fixed top-6 left-0 right-0 z-40 px-4 flex justify-center pointer-events-none">
        <header className="pointer-events-auto flex items-center gap-1.5 p-2 bg-white/80 backdrop-blur-xl rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 ring-1 ring-rose-100/50 max-w-2xl w-full justify-between transition-all hover:scale-[1.01] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            
            <div className="flex items-center gap-3 pl-3">
                <div className="bg-gradient-to-tr from-rose-400 to-pink-500 text-white p-2 rounded-full shadow-lg shadow-rose-200">
                    <Heart className="w-5 h-5 fill-current" />
                </div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-purple-600 tracking-tight">
                    our.moments
                </h1>
            </div>

            <nav className="flex items-center bg-slate-100/50 rounded-full p-1 border border-slate-100 hidden sm:flex">
                <button 
                    onClick={() => setViewMode(ViewMode.GRID)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-2 ${viewMode === ViewMode.GRID ? 'bg-white text-rose-500 shadow-sm' : 'text-slate-500 hover:text-rose-400 hover:bg-white/50'}`}
                >
                    <Grid className="w-3.5 h-3.5" /> Gallery
                </button>
                <button 
                    onClick={() => setViewMode(ViewMode.MAP)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-2 ${viewMode === ViewMode.MAP ? 'bg-white text-rose-500 shadow-sm' : 'text-slate-500 hover:text-rose-400 hover:bg-white/50'}`}
                >
                    <MapIcon className="w-3.5 h-3.5" /> Map
                </button>
            </nav>

            <button 
                onClick={() => setIsUploadOpen(true)}
                className="bg-black text-white p-2.5 rounded-full hover:bg-slate-800 transition-all shadow-lg hover:rotate-90 active:scale-90"
                title="Add Memory"
            >
                <Plus className="w-5 h-5" />
            </button>
        </header>
      </div>

      {/* Spacer for floating header */}
      <div className="h-28"></div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto px-4 pb-12 scroll-smooth">
        <div className="max-w-7xl mx-auto h-full">
            {viewMode === ViewMode.GRID && (
            <div className="pb-12 space-y-16">
                {photosByMonth.map((group) => (
                    <div key={group.title} className="animate-[fadeIn_0.6s_ease-out]">
                        <div className="flex items-center gap-4 mb-8 sticky top-0 z-20 py-4 transition-all -mx-2 px-2">
                             <div className="bg-white/70 backdrop-blur-md px-5 py-2 rounded-full border border-rose-100 shadow-sm flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
                                <h2 className="text-lg font-bold text-slate-800">{group.title}</h2>
                                <span className="text-[10px] font-bold bg-rose-50 text-rose-500 px-2 py-0.5 rounded-full border border-rose-100">{group.photos.length}</span>
                             </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-4">
                            {group.photos.map(photo => (
                            <div 
                                key={photo.id} 
                                onClick={() => handleOpenPhoto(photo)}
                                style={{ transform: `rotate(${getRandomRotation(photo.id)}deg)` }}
                                className="polaroid cursor-pointer group rounded-sm"
                            >
                                {/* Washi Tape */}
                                <div className={`washi-tape ${getTapeColor(photo.id)}`}></div>

                                <div className="aspect-[1/1] overflow-hidden bg-slate-100 mb-4 relative rounded-sm">
                                     <img src={photo.url} alt={photo.description} className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110 filter sepia-[0.1] group-hover:sepia-0" />
                                     <div className="absolute inset-0 bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-overlay"></div>
                                </div>
                                <div className="px-1 relative">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-hand text-2xl font-bold text-slate-800 leading-none tracking-wide">{photo.location.name}</h3>
                                        {/* <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-400 font-sans font-bold">{new Date(photo.date).getDate()}</span> */}
                                    </div>
                                    <p className="font-hand text-xl text-slate-500 leading-5 opacity-80 line-clamp-2 transform -rotate-1">{photo.description}</p>
                                </div>
                            </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            )}

            {viewMode === ViewMode.MAP && (
            <div className="h-full flex flex-col animate-[fadeIn_0.5s]">
                <div className="flex-1 min-h-[500px] mb-8">
                    <MapView photos={photos} onSelectPhoto={handleOpenPhoto} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { icon: Camera, color: "text-purple-500", bg: "bg-purple-50", title: "100+ Moments", desc: "Curated in your private album." },
                        { icon: MapIcon, color: "text-blue-500", bg: "bg-blue-50", title: "Interactive Map", desc: "Track your journey together." },
                        { icon: Sparkles, color: "text-amber-500", bg: "bg-amber-50", title: "AI Assistant", desc: "Plan dates with Gemini 3.0." }
                    ].map((feature, i) => (
                        <div key={i} className="group hover:-translate-y-1 transition-transform duration-300 bg-white/60 p-6 rounded-3xl border border-white shadow-[0_4px_20px_rgb(0,0,0,0.02)] backdrop-blur-sm">
                            <div className={`w-12 h-12 ${feature.bg} rounded-2xl flex items-center justify-center mb-4 ${feature.color} group-hover:scale-110 transition-transform`}>
                                <feature.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-slate-800 font-bold mb-1 text-lg">{feature.title}</h3>
                            <p className="text-sm text-slate-500 font-medium">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
            )}
        </div>
      </main>

      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 bg-slate-900/30 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl animate-[scaleIn_0.2s_ease-out] ring-1 ring-white/50 relative overflow-hidden">
             {/* Decorative blob */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-rose-100 rounded-full blur-3xl -z-10 translate-x-10 -translate-y-10"></div>
             
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">New Memory</h2>
              <button onClick={() => setIsUploadOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400"/></button>
            </div>
            <div className="border-4 border-dashed border-slate-100 rounded-3xl p-12 text-center hover:bg-slate-50 hover:border-rose-200 transition-all cursor-pointer relative group bg-white">
               <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
               <div className="inline-flex p-5 bg-rose-50 rounded-full text-rose-500 mb-4 group-hover:scale-110 transition-transform shadow-inner">
                   <Plus className="w-8 h-8" />
               </div>
               <p className="text-lg text-slate-700 font-bold">Drop your photo</p>
               <p className="text-slate-400 text-sm mt-2 font-medium">Capture the moment</p>
            </div>
          </div>
        </div>
      )}

      {/* Photo Detail Modal */}
      {(selectedPhoto || isClosing) && (
        <div 
            className={`fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xl transition-all duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
            onClick={handleClosePhoto}
        >
            {/* Nav Buttons */}
            <button onClick={(e) => { e.stopPropagation(); handleNavigate('prev'); }} className="absolute left-6 z-50 p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hidden md:flex backdrop-blur-lg border border-white/20 group">
                <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); handleNavigate('next'); }} className="absolute right-6 z-50 p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hidden md:flex backdrop-blur-lg border border-white/20 group">
                <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>

            {selectedPhoto && (
            <div 
                onClick={(e) => e.stopPropagation()}
                className={`bg-white/95 backdrop-blur-2xl rounded-[2.5rem] w-full max-w-6xl max-h-[85vh] overflow-hidden flex flex-col md:flex-row shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] ring-1 ring-white/50 transition-all duration-300 transform 
                ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}
                ${isSwitching ? 'opacity-80 scale-[0.98]' : ''}
                `}
            >
                {/* Image Side */}
                <div className="w-full md:w-7/12 bg-slate-100/50 flex items-center justify-center relative p-6 md:p-12 select-none">
                    <div className="relative shadow-2xl rounded-lg overflow-hidden group">
                        <img 
                            src={selectedPhoto.url} 
                            alt="Detail" 
                            className={`w-auto h-auto max-w-full max-h-[35vh] md:max-h-[70vh] object-contain rounded-lg transition-all duration-300 ${isSwitching ? 'blur-sm' : 'blur-0'}`} 
                        />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                    </div>
                    
                    <button onClick={handleClosePhoto} className="absolute top-6 left-6 bg-white/20 text-slate-800 p-2.5 rounded-full hover:bg-white md:hidden z-10 backdrop-blur-md">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Details Side */}
                <div className={`w-full md:w-5/12 p-8 md:p-10 overflow-y-auto bg-white flex flex-col transition-opacity duration-300 relative ${isSwitching ? 'opacity-50' : 'opacity-100'}`}>
                    
                    {/* Washi tape decoration */}
                    <div className="absolute top-0 right-20 w-24 h-8 bg-purple-100/80 -rotate-3 blur-[1px] opacity-50"></div>

                    <div className="flex justify-between items-start mb-6 z-10">
                        <div>
                             <h2 className="text-4xl font-bold text-slate-800 mb-3 tracking-tight font-hand">{selectedPhoto.location.name}</h2>
                             <div className="flex items-center gap-3">
                                <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(selectedPhoto.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                </span>
                             </div>
                        </div>
                        <button onClick={handleClosePhoto} className="hidden md:block p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <X className="w-6 h-6 text-slate-400" />
                        </button>
                    </div>

                    <div className="relative mb-8">
                        <p className="text-2xl text-slate-600 leading-relaxed font-hand -rotate-1">
                            "{selectedPhoto.description}"
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-10">
                        {selectedPhoto.tags.map(tag => (
                            <span key={tag} className="px-3 py-1 bg-white border border-slate-200 text-slate-500 text-xs rounded-lg font-bold hover:border-rose-300 hover:text-rose-500 transition-colors cursor-default shadow-sm">
                                #{tag}
                            </span>
                        ))}
                    </div>

                    {/* AI Insights Section */}
                    <div className="mt-auto relative overflow-hidden rounded-3xl p-1 bg-gradient-to-br from-indigo-100 via-purple-100 to-rose-100">
                        <div className="bg-white/90 backdrop-blur-sm rounded-[1.3rem] p-5 h-full">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-slate-700 flex items-center gap-2 text-sm">
                                    <Sparkles className="w-4 h-4 text-purple-500" />
                                    AI Date Planner
                                </h3>
                                <button 
                                    onClick={() => getInsight(selectedPhoto)}
                                    disabled={loadingInsight}
                                    className="text-[10px] uppercase tracking-wider bg-slate-900 text-white px-4 py-2 rounded-full font-bold hover:bg-slate-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {loadingInsight ? 'Dreaming...' : 'Generate Plan'}
                                </button>
                            </div>
                            
                            {insight ? (
                                <div className="animate-[fadeIn_0.5s]">
                                    <div className="prose prose-sm prose-slate max-w-none mb-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                        <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">{insight.text}</p>
                                    </div>
                                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                        <button onClick={() => handleTTS(insight.text)} className="text-xs text-rose-500 font-bold hover:text-rose-600 flex items-center gap-1.5 transition-colors">
                                            <Volume2 className="w-4 h-4" />
                                            Listen
                                        </button>
                                    </div>
                                    {insight.links.length > 0 && (
                                        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                                            {insight.links.map((link, idx) => {
                                                const uri = link.googleMaps?.uri || link.web?.uri;
                                                const title = link.googleMaps?.title || link.web?.title || 'Link';
                                                if (!uri) return null;
                                                return (
                                                    <a key={idx} href={uri} target="_blank" rel="noreferrer" className="flex-shrink-0 text-[10px] font-bold px-2 py-1 bg-slate-100 rounded text-slate-500 hover:bg-slate-200 truncate max-w-[100px]">
                                                        {title}
                                                    </a>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <p className="text-xs text-slate-400 font-medium">Unlock hidden gems & history for this spot.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            )}
        </div>
      )}

      {/* Voice Agent Orb */}
      <VoiceAgent />
    </div>
  );
};

export default App;