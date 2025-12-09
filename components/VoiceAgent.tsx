import React, { useEffect, useState } from 'react';
import { Mic, MicOff, X } from 'lucide-react';
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
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-tr from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white rounded-full shadow-lg shadow-rose-200/50 flex items-center justify-center transition-all z-50 group hover:scale-110 animate-float"
        title="Chat with Memoria"
      >
        <Mic className="w-7 h-7 group-hover:scale-110 transition-transform" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-8 right-8 flex flex-col items-end z-50">
        {error && (
            <div className="mb-3 bg-red-50 text-red-500 px-4 py-2 rounded-xl text-sm shadow-sm border border-red-100 flex items-center gap-2">
                <span>{error}</span>
                <button onClick={() => setError(null)} className="font-bold hover:bg-red-100 rounded-full p-1 w-6 h-6 flex items-center justify-center">&times;</button>
            </div>
        )}
      <div className={`
        bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-rose-200/50 border border-white/50 p-6 w-80 transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) origin-bottom-right
        ${isActive ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-10 pointer-events-none'}
      `}>
        <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-700 flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75 ${isSpeaking ? 'duration-500' : 'duration-1000'}`}></span>
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${isSpeaking ? 'bg-rose-500' : 'bg-green-400'}`}></span>
                </span>
                Memoria Live
            </h3>
            <button onClick={toggleSession} className="text-slate-300 hover:text-slate-500 hover:bg-slate-100 p-1 rounded-full transition-colors">
                <X className="w-5 h-5" />
            </button>
        </div>

        {/* Visualizer Orb */}
        <div className="h-32 flex items-center justify-center mb-6 relative">
            <div className={`absolute inset-0 bg-gradient-to-tr from-rose-100 to-pink-50 rounded-full blur-2xl transition-opacity duration-500 ${isSpeaking ? 'opacity-100' : 'opacity-50'}`}></div>
            
            {/* Core Orb */}
            <div className={`
                relative w-24 h-24 rounded-full bg-gradient-to-tr from-rose-400 to-pink-500 shadow-lg flex items-center justify-center text-white transition-all duration-300
                ${isSpeaking ? 'scale-110 animate-bounce-slow shadow-rose-300/50' : 'scale-100 shadow-rose-200/30'}
            `}>
                {isSpeaking ? (
                     <div className="flex gap-1 h-8 items-center">
                        <div className="w-1.5 bg-white/90 rounded-full animate-[bounce_0.5s_infinite] h-4" style={{ animationDelay: '0s' }}></div>
                        <div className="w-1.5 bg-white/90 rounded-full animate-[bounce_0.5s_infinite] h-8" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-1.5 bg-white/90 rounded-full animate-[bounce_0.5s_infinite] h-6" style={{ animationDelay: '0.2s' }}></div>
                     </div>
                ) : (
                    <Mic className="w-8 h-8 opacity-90" />
                )}
            </div>
        </div>

        <div className="text-center mb-6">
             <p className={`text-sm font-medium transition-colors ${isSpeaking ? 'text-rose-500' : 'text-slate-400'}`}>
                {isSpeaking ? "Speaking..." : "Listening..."}
             </p>
        </div>
        
        <div className="flex justify-center">
            <button 
                onClick={toggleSession}
                className="w-full py-3 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-500 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
            >
                <MicOff className="w-4 h-4" /> End Chat
            </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceAgent;