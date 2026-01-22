
import React, { useEffect } from 'react';
import { useGameStore } from '../store';
import { AppFlow } from '../types';
import { Orbit, Sparkles } from 'lucide-react';

const SplashScreen: React.FC = () => {
  const setAppFlow = useGameStore(state => state.setAppFlow);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAppFlow(AppFlow.LANDING);
    }, 3000);
    return () => clearTimeout(timer);
  }, [setAppFlow]);

  return (
    <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black animate-pulse-slow" />
      
      {/* Decorative Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-purple-500/20 blur-[100px] animate-blob" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-cyan-500/20 blur-[100px] animate-blob animation-delay-2000" />
        <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] rounded-full bg-pink-500/20 blur-[100px] animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Logo Container */}
        <div className="relative mb-8 group">
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400 to-purple-500 rounded-3xl rotate-6 blur-lg opacity-60 group-hover:opacity-80 transition-opacity duration-500 animate-tilt" />
          <div className="relative w-32 h-32 bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-white/10 flex items-center justify-center shadow-2xl rotate-3 transition-transform duration-500 hover:rotate-0 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl" />
            <Orbit className="text-cyan-400 animate-spin-slow" size={64} strokeWidth={1.5} />
            <Sparkles className="absolute top-2 right-2 text-purple-400 animate-pulse" size={20} />
          </div>
        </div>

        {/* Text Content */}
        <div className="text-center space-y-4 mb-16">
          <h1 className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-purple-300 drop-shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-700">
            AVATARS
          </h1>
          <div className="flex items-center justify-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-cyan-500/50" />
            <p className="text-cyan-400 font-bold text-sm uppercase tracking-[0.4em]">Own The Galaxy</p>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-cyan-500/50" />
          </div>
        </div>
        
        {/* Loading Indicator */}
        <div className="absolute bottom-20 w-64 space-y-3 animate-in fade-in duration-1000 delay-500">
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5">
            <div className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 w-[200%] animate-loading-bar" />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            <span>Initializing...</span>
            <span className="animate-pulse">v1.0.0</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes loading-bar {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        .animate-loading-bar {
          animation: loading-bar 1.5s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
