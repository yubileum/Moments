import React, { useEffect, useState } from 'react';
import { Mic, MicOff, X, Sparkles } from 'lucide-react';
import { connectLiveSession, disconnectLiveSession } from '../services/geminiService';

const VoiceAgent: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSession = async () => {
    if (isActive) {
      await disconnectLiveSession();
      setIsActive(false);
      setIsSpeaking(false);
    } else {
      setError(null);
      setIsActive(true);
      try {
        await connectLiveSession(
          () => console.log("Live Session Open"),
          () => setIsActive(false),
          (err) => {
            console.error(err);
            setError("Connection failed");
            setIsActive(false);
          },
          (speaking) => setIsSpeaking(speaking)
        );
      } catch (e) {
        setError("Failed to start voice");
        setIsActive(false);
      }
    }
  };

  useEffect(() => {
    return () => {
      disconnectLiveSession();
    };
  }, []);

  if (!isActive && !error) {
    return (
      <button
        onClick={toggleSession}
        className="fixed bottom-8 right-8 w-14 h-14 bg-slate-900 text-white rounded-full shadow-2xl shadow-rose-200/50 flex items-center justify-center transition-all z-50 group hover:scale-110 hover:shadow-rose-400/50 animate-float active:scale-95"
        title="Chat with Memoria"
      >
        <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform text-yellow-300" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-8 right-8 flex flex-col items-end z-50">
        {error && (
            <div className="mb-3 bg-red-50 text-red-500 px-4 py-2 rounded-xl text-xs font-bold shadow-sm border border-red-100 flex items-center gap-2">
                <span>{error}</span>
                <button onClick={() => setError(null)} className="hover:bg-red-100 rounded-full p-1">&times;</button>
            </div>
        )}
      <div className={`
        bg-white/80 backdrop-blur-2xl rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-white p-6 w-80 transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) origin-bottom-right
        ${isActive ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-10 pointer-events-none'}
      `}>
        <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wider">
                <span className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-rose-500 animate-pulse' : 'bg-green-400'}`}></span>
                Memoria AI
            </h3>
            <button onClick={toggleSession} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-full transition-colors">
                <X className="w-5 h-5" />
            </button>
        </div>

        {/* Visualizer Orb */}
        <div className="h-40 flex items-center justify-center mb-8 relative">
            {/* Outer Glow */}
            <div className={`absolute inset-0 bg-gradient-to-tr from-rose-200 via-purple-200 to-blue-200 rounded-full blur-3xl transition-opacity duration-1000 ${isSpeaking ? 'opacity-80 scale-125' : 'opacity-30 scale-100'}`}></div>
            
            {/* Core Orb */}
            <div className={`
                relative w-28 h-28 rounded-full bg-gradient-to-br from-slate-900 to-slate-800 shadow-2xl flex items-center justify-center text-white transition-all duration-300 border-4 border-white/20
                ${isSpeaking ? 'scale-105 shadow-rose-500/20' : 'scale-100'}
            `}>
                {isSpeaking ? (
                     <div className="flex gap-1.5 h-10 items-center justify-center">
                        {[0, 1, 2, 3].map(i => (
                            <div key={i} className="w-1.5 bg-gradient-to-t from-rose-400 to-purple-400 rounded-full animate-[bounce_0.6s_infinite] h-full" style={{ animationDelay: `${i * 0.1}s` }}></div>
                        ))}
                     </div>
                ) : (
                    <div className="relative">
                        <Mic className="w-8 h-8 text-white/90" />
                        <div className="absolute inset-0 animate-ping opacity-20 bg-white rounded-full"></div>
                    </div>
                )}
            </div>
        </div>

        <div className="text-center mb-8">
             <p className="text-sm font-medium text-slate-500">
                {isSpeaking ? "Speaking..." : "Ask me about your trip to Paris..."}
             </p>
        </div>
        
        <div className="flex justify-center">
            <button 
                onClick={toggleSession}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
            >
                <MicOff className="w-3 h-3" /> End Session
            </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceAgent;