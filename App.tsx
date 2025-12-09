import React, { useState, useEffect, useMemo } from 'react';
import { Heart, Map as MapIcon, Grid, Calendar, Plus, X, Search, Info, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
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

  // Load from local storage on mount (simulated persistence)
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
          location: { name: 'Unknown Location', lat: 0, lng: 0 },
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

  // Random rotation for polaroid effect logic
  const getRandomRotation = (id: string) => {
    const num = parseInt(id) || 0;
    // Return a rotation between -3 and 3 degrees
    return (num % 6) - 3; 
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-rose-50 to-pink-100 text-slate-700">
      {/* Header */}
      <header className="flex-none px-6 py-6 flex items-center justify-between z-10 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-rose-400 to-rose-600 rounded-2xl text-white shadow-xl shadow-rose-200 ring-2 ring-white">
            <Heart className="w-6 h-6 fill-current animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold text-rose-800 tracking-tight">
            OurMoments
          </h1>
        </div>

        <nav className="hidden md:flex bg-white/60 backdrop-blur-md p-1.5 rounded-2xl shadow-sm border border-white/50">
          <button 
            onClick={() => setViewMode(ViewMode.GRID)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${viewMode === ViewMode.GRID ? 'bg-white text-rose-500 shadow-md transform scale-105' : 'text-slate-500 hover:text-rose-400'}`}
          >
            <Grid className="w-4 h-4 inline mr-2" /> Gallery
          </button>
          <button 
             onClick={() => setViewMode(ViewMode.MAP)}
             className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${viewMode === ViewMode.MAP ? 'bg-white text-rose-500 shadow-md transform scale-105' : 'text-slate-500 hover:text-rose-400'}`}
          >
            <MapIcon className="w-4 h-4 inline mr-2" /> World Map
          </button>
        </nav>

        <button 
          onClick={() => setIsUploadOpen(true)}
          className="group bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-rose-200 hover:shadow-rose-300 hover:-translate-y-0.5 flex items-center gap-2"
        >
          <div className="bg-white/20 rounded-full p-1 group-hover:rotate-90 transition-transform">
             <Plus className="w-4 h-4" /> 
          </div>
          <span>Add Photo</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto px-6 pb-6 scroll-smooth">
        <div className="max-w-7xl mx-auto h-full">
            {viewMode === ViewMode.GRID && (
            <div className="pb-8 space-y-12">
                {photosByMonth.map((group) => (
                    <div key={group.title} className="animate-[fadeIn_0.5s_ease-out]">
                        <div className="flex items-center gap-4 mb-6 sticky top-0 bg-white/80 backdrop-blur-xl p-4 z-20 rounded-2xl shadow-sm border border-rose-100 transition-all">
                             <div className="h-8 w-1 bg-rose-400 rounded-full shadow-[0_0_10px_rgba(251,113,133,0.5)]"></div>
                             <h2 className="text-2xl font-bold text-rose-800">{group.title}</h2>
                             <span className="text-xs font-bold bg-rose-100 text-rose-500 px-3 py-1 rounded-full">{group.photos.length} Memories</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-2">
                            {group.photos.map(photo => (
                            <div 
                                key={photo.id} 
                                onClick={() => handleOpenPhoto(photo)}
                                style={{ transform: `rotate(${getRandomRotation(photo.id)}deg)` }}
                                className="polaroid cursor-pointer rounded-sm bg-white"
                            >
                                <div className="aspect-[4/3] overflow-hidden bg-slate-100 mb-4 border border-slate-100 relative group">
                                     <img src={photo.url} alt={photo.description} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
                                     <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </div>
                                <div className="px-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <h3 className="font-bold text-slate-800 truncate text-lg">{photo.location.name}</h3>
                                        <Heart className="w-4 h-4 text-rose-300 fill-rose-50" />
                                    </div>
                                    <p className="text-xs text-slate-400 font-medium">{new Date(photo.date).toLocaleDateString()}</p>
                                    <p className="text-sm text-slate-500 mt-2 line-clamp-2 font-medium">"{photo.description}"</p>
                                </div>
                            </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            )}

            {viewMode === ViewMode.MAP && (
            <div className="h-full flex flex-col">
                <div className="flex-1">
                    <MapView photos={photos} onSelectPhoto={handleOpenPhoto} />
                </div>
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/80 p-6 rounded-3xl border border-white shadow-sm backdrop-blur-sm">
                        <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center mb-3 text-rose-500">
                             <Heart className="w-5 h-5" />
                        </div>
                        <h3 className="text-slate-800 font-bold mb-1">100+ Photos</h3>
                        <p className="text-sm text-slate-500">Safely stored in your shared album.</p>
                    </div>
                    <div className="bg-white/80 p-6 rounded-3xl border border-white shadow-sm backdrop-blur-sm">
                         <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-3 text-blue-500">
                             <MapIcon className="w-5 h-5" />
                        </div>
                        <h3 className="text-slate-800 font-bold mb-1">Interactive Map</h3>
                        <p className="text-sm text-slate-500">See your love story across the globe.</p>
                    </div>
                    <div className="bg-white/80 p-6 rounded-3xl border border-white shadow-sm backdrop-blur-sm">
                         <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mb-3 text-amber-500">
                             <Sparkles className="w-5 h-5" />
                        </div>
                        <h3 className="text-slate-800 font-bold mb-1">AI Memories</h3>
                        <p className="text-sm text-slate-500">Ask Memoria for fun facts & date ideas.</p>
                    </div>
                </div>
            </div>
            )}
        </div>
      </main>

      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl animate-[scaleIn_0.2s_ease-out] ring-4 ring-rose-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">New Memory</h2>
              <button onClick={() => setIsUploadOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400"/></button>
            </div>
            <div className="border-3 border-dashed border-rose-200 rounded-2xl p-10 text-center hover:bg-rose-50 hover:border-rose-300 transition-all cursor-pointer relative group">
               <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
               <div className="inline-block p-4 bg-rose-100 rounded-full text-rose-500 mb-4 group-hover:scale-110 transition-transform">
                   <Plus className="w-8 h-8" />
               </div>
               <p className="text-lg text-slate-700 font-bold">Upload a photo</p>
               <p className="text-slate-400 text-sm mt-2">JPG, PNG supported</p>
            </div>
          </div>
        </div>
      )}

      {/* Photo Detail Modal */}
      {(selectedPhoto || isClosing) && (
        <div 
            className={`fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-4 backdrop-blur-md transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100 animate-[fadeIn_0.3s_ease-out]'}`}
        >
            <button onClick={(e) => { e.stopPropagation(); handleNavigate('prev'); }} className="absolute left-4 z-50 p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hidden md:block backdrop-blur-sm border border-white/10">
                <ChevronLeft className="w-8 h-8" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); handleNavigate('next'); }} className="absolute right-4 z-50 p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hidden md:block backdrop-blur-sm border border-white/10">
                <ChevronRight className="w-8 h-8" />
            </button>

            {selectedPhoto && (
            <div 
                className={`bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl ring-1 ring-white/50 transition-all duration-300 transform 
                ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100 animate-[scaleIn_0.3s_ease-out]'}
                ${isSwitching ? 'opacity-50 scale-95' : ''}
                `}
            >
                {/* Image Side */}
                <div className="w-full md:w-7/12 bg-slate-50 flex items-center justify-center relative p-4 md:p-8">
                    <img 
                        src={selectedPhoto.url} 
                        alt="Detail" 
                        className={`w-auto h-auto max-w-full max-h-[40vh] md:max-h-full object-contain rounded-lg shadow-lg transition-opacity duration-300 ${isSwitching ? 'opacity-50' : 'opacity-100'}`} 
                    />
                    <button onClick={handleClosePhoto} className="absolute top-4 left-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 md:hidden z-10 backdrop-blur-md">
                        <X className="w-5 h-5" />
                    </button>
                    
                    {/* Mobile Nav */}
                    <div className="absolute inset-x-0 bottom-0 top-1/2 flex justify-between items-center px-2 md:hidden pointer-events-none">
                         <button onClick={(e) => { e.stopPropagation(); handleNavigate('prev'); }} className="pointer-events-auto bg-black/30 p-2 rounded-full text-white/80 backdrop-blur"><ChevronLeft className="w-6 h-6"/></button>
                         <button onClick={(e) => { e.stopPropagation(); handleNavigate('next'); }} className="pointer-events-auto bg-black/30 p-2 rounded-full text-white/80 backdrop-blur"><ChevronRight className="w-6 h-6"/></button>
                    </div>
                </div>

                {/* Details Side */}
                <div className={`w-full md:w-5/12 p-8 md:p-10 overflow-y-auto bg-white flex flex-col transition-opacity duration-300 ${isSwitching ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="flex justify-between items-start mb-6">
                        <div>
                             <h2 className="text-3xl font-bold text-slate-800 mb-2">{selectedPhoto.location.name}</h2>
                             <div className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(selectedPhoto.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                </span>
                             </div>
                        </div>
                        <button onClick={handleClosePhoto} className="hidden md:block p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <X className="w-6 h-6 text-slate-400" />
                        </button>
                    </div>

                    <div className="relative pl-4 border-l-4 border-rose-200 mb-8">
                        <p className="text-lg text-slate-600 leading-relaxed italic">
                            "{selectedPhoto.description}"
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-8">
                        {selectedPhoto.tags.map(tag => (
                            <span key={tag} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-sm rounded-lg font-bold hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-default">
                                #{tag}
                            </span>
                        ))}
                    </div>

                    {/* AI Insights Section */}
                    <div className="mt-auto bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-indigo-900 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-indigo-500" />
                                Plan a Date Here
                            </h3>
                            <button 
                                onClick={() => getInsight(selectedPhoto)}
                                disabled={loadingInsight}
                                className="text-xs bg-white border border-indigo-200 px-4 py-2 rounded-xl text-indigo-600 font-bold hover:bg-indigo-600 hover:text-white transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {loadingInsight ? (
                                    <>
                                        <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></span>
                                        Thinking...
                                    </>
                                ) : (
                                    <>
                                        <span>Ask Gemini</span>
                                    </>
                                )}
                            </button>
                        </div>
                        
                        {insight ? (
                            <div className="animate-[fadeIn_0.5s]">
                                <div className="prose prose-sm prose-indigo max-w-none mb-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    <p className="text-sm text-slate-700 whitespace-pre-line">{insight.text}</p>
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t border-indigo-100">
                                    <button onClick={() => handleTTS(insight.text)} className="text-xs text-indigo-600 font-bold hover:text-indigo-800 flex items-center gap-1.5 bg-indigo-100/50 px-3 py-1.5 rounded-lg transition-colors">
                                        <Volume2Icon />
                                        Listen to Plan
                                    </button>
                                </div>
                                {insight.links.length > 0 && (
                                    <div className="mt-3 space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sources</p>
                                        {insight.links.map((link, idx) => {
                                             const uri = link.googleMaps?.uri || link.web?.uri;
                                             const title = link.googleMaps?.title || link.web?.title || 'Source Link';
                                             if (!uri) return null;
                                             return (
                                                <a key={idx} href={uri} target="_blank" rel="noreferrer" className="block text-xs text-blue-500 hover:underline truncate">
                                                    {title}
                                                </a>
                                             )
                                        })}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-2">
                                <p className="text-xs text-indigo-400 font-medium">Get a romantic date itinerary & history facts.</p>
                            </div>
                        )}
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

const Volume2Icon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
)

export default App;