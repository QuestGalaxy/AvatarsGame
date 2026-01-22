
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
    <div className="absolute inset-0 z-[100] bg-[#020617] flex flex-col items-center justify-center animate-in fade-in duration-700">
      <div className="relative">
        <div className="w-24 h-24 bg-cyan-600 rounded-3xl rotate-45 flex items-center justify-center shadow-[0_0_50px_rgba(8,145,178,0.5)] animate-pulse">
           <div className="w-16 h-16 bg-cyan-400/20 rounded-full blur-2xl absolute animate-ping" />
           <Orbit className="text-white" size={48} />
        </div>
      </div>
      <div className="mt-12 text-center space-y-2">
        <h1 className="text-4xl font-black text-white tracking-tighter">AVATARS</h1>
        <p className="text-cyan-400 font-black text-xs uppercase tracking-[0.3em] opacity-80">OWN THE GALAXY</p>
      </div>
      
      <div className="absolute bottom-12 flex flex-col items-center">
        <div className="w-8 h-1 bg-slate-800 rounded-full overflow-hidden w-32">
          <div className="h-full bg-cyan-500 animate-[loading_2.5s_ease-in-out_infinite]" style={{ width: '40%' }} />
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
