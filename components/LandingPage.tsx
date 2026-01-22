
import React from 'react';
import { useGameStore } from '../store';
import { AppFlow } from '../types';
import { Play, HelpCircle, Target, Github } from 'lucide-react';
import { audio } from '../utils/audio';

const LandingPage: React.FC = () => {
  const setAppFlow = useGameStore(state => state.setAppFlow);

  const handleStart = () => {
    audio.unlock();
    setAppFlow(AppFlow.CHARACTER_SELECT);
  };

  return (
    <div className="absolute inset-0 z-[90] flex flex-col items-center justify-center p-6 bg-gradient-to-br from-sky-200 via-fuchsia-200 to-amber-200 animate-in fade-in duration-500">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-8 w-32 h-32 rounded-full bg-white/50 blur-2xl" />
        <div className="absolute top-28 right-10 w-40 h-40 rounded-full bg-yellow-200/60 blur-3xl" />
        <div className="absolute bottom-10 right-6 w-36 h-36 rounded-full bg-pink-200/60 blur-2xl" />
      </div>
      <div className="w-full max-w-sm flex flex-col items-center gap-8 relative">
        
        {/* Title Block */}
        <div className="text-center animate-in slide-in-from-top-8 duration-700">
          <div className="inline-block bg-white/85 px-8 py-5 rounded-[32px] shadow-[0_20px_60px_rgba(59,130,246,0.25)] border border-white/80 mb-4 animate-float">
             <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-tight">
               AVATARS<br/>
               <span className="text-fuchsia-500 animate-shimmer inline-block">GALAXY</span>
             </h1>
          </div>
          <p className="text-blue-700 font-bold bg-white/70 px-4 py-1.5 rounded-full text-sm inline-block border border-white/80 tracking-wide shadow-sm">OWN THE COSMOS</p>
        </div>

        {/* Action Block */}
        <div className="w-full flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          <button 
            onClick={handleStart}
            className="group relative w-full bg-fuchsia-500 hover:bg-fuchsia-400 text-white font-black py-6 rounded-[32px] text-2xl shadow-[0_12px_40px_rgba(244,114,182,0.45)] transition-all active:scale-95 border-b-[8px] border-fuchsia-700 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <span className="flex items-center justify-center gap-4">
               DEPLOY UNIT <Play fill="white" size={28} />
            </span>
          </button>

          <div className="grid grid-cols-2 gap-4">
            <button className="bg-white/90 hover:bg-white text-slate-900 font-black py-4 rounded-3xl shadow-lg transition-all active:scale-95 border-b-4 border-slate-200 flex items-center justify-center gap-2 border border-white">
              <HelpCircle size={20} className="text-fuchsia-500" /> INTEL
            </button>
            <button className="bg-sky-400 hover:bg-sky-300 text-white font-black py-4 rounded-3xl shadow-lg transition-all active:scale-95 border-b-4 border-sky-600 flex items-center justify-center gap-2">
              <Github size={20} /> FLEET
            </button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="w-full bg-white/85 p-6 rounded-[40px] shadow-2xl border border-white/80 space-y-4 animate-in zoom-in duration-700 delay-300">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-sky-100 rounded-2xl flex items-center justify-center text-sky-500 shrink-0 border border-sky-200">
               <Target size={24} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 uppercase tracking-tight">System Capture</h3>
              <p className="text-xs text-slate-600 font-medium">Encircle planetary clusters to gain immediate control of entire solar sectors.</p>
            </div>
          </div>
          <div className="h-px bg-slate-200 w-full" />
          <p className="text-[10px] text-center font-black text-slate-500 tracking-widest uppercase">Deep Space Protocol 1.0 • v.Galaxy</p>
        </div>
      </div>

      <div className="absolute bottom-8 text-center">
         <p className="text-blue-700/70 font-black text-[10px] tracking-[0.2em] uppercase">Initialize transmission to begin</p>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-shimmer {
          background: linear-gradient(
            to right,
            #f472b6 0%,
            #facc15 25%,
            #38bdf8 50%,
            #a78bfa 75%,
            #f472b6 100%
          );
          background-size: 200% auto;
          color: transparent;
          -webkit-background-clip: text;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
