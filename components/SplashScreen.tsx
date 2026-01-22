
import React, { useEffect } from 'react';
import { useGameStore } from '../store';
import { AppFlow } from '../types';
import { Orbit } from 'lucide-react';

const SplashScreen: React.FC = () => {
  const setAppFlow = useGameStore(state => state.setAppFlow);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAppFlow(AppFlow.LANDING);
    }, 2500);
    return () => clearTimeout(timer);
  }, [setAppFlow]);

  return (
    <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center animate-in fade-in duration-700 bg-gradient-to-br from-sky-300 via-fuchsia-300 to-amber-200">
      <div className="absolute inset-0 opacity-60">
        <div className="absolute -top-16 -left-10 w-40 h-40 rounded-full bg-white/30 blur-2xl" />
        <div className="absolute top-24 right-8 w-28 h-28 rounded-full bg-yellow-200/50 blur-xl" />
        <div className="absolute bottom-12 left-10 w-32 h-32 rounded-full bg-pink-200/60 blur-2xl" />
      </div>

      <div className="relative">
        <div className="w-24 h-24 bg-fuchsia-500 rounded-3xl rotate-12 flex items-center justify-center shadow-[0_0_60px_rgba(244,114,182,0.6)] animate-pulse">
          <div className="w-16 h-16 bg-yellow-200/60 rounded-full blur-xl absolute animate-ping" />
          <Orbit className="text-white" size={48} />
        </div>
      </div>
      <div className="mt-10 text-center space-y-2">
        <h1 className="text-4xl font-black text-white tracking-tighter drop-shadow-[0_6px_20px_rgba(30,64,175,0.35)]">AVATARS</h1>
        <p className="text-blue-700 font-black text-xs uppercase tracking-[0.3em] opacity-90">OWN THE GALAXY</p>
      </div>
      
      <div className="absolute bottom-12 flex flex-col items-center">
        <div className="h-2 rounded-full overflow-hidden w-32 bg-white/50 border border-white/60 shadow-[0_8px_30px_rgba(59,130,246,0.25)]">
          <div className="h-full bg-gradient-to-r from-pink-400 via-yellow-300 to-sky-400 animate-[loading_2.5s_ease-in-out_infinite]" style={{ width: '40%' }} />
        </div>
      </div>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
