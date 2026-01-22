
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
    <div className="absolute inset-0 z-[90] flex flex-col items-center justify-center p-6 bg-slate-950/20 backdrop-blur-sm animate-in fade-in duration-500">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        
        {/* Title Block */}
        <div className="text-center animate-in slide-in-from-top-8 duration-700">
          <div className="inline-block bg-slate-900/90 backdrop-blur px-8 py-5 rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-slate-700 mb-4 animate-float">
             <h1 className="text-5xl font-black text-white tracking-tighter leading-tight">
               AVATARS<br/>
               <span className="text-cyan-400 animate-shimmer inline-block">GALAXY</span>
             </h1>
          </div>
          <p className="text-cyan-100 font-bold bg-cyan-950/40 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm inline-block border border-cyan-800/30 tracking-wide">OWN THE COSMOS</p>
        </div>

        {/* Action Block */}
        <div className="w-full flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          <button 
            onClick={handleStart}
            className="group relative w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black py-6 rounded-[32px] text-2xl shadow-[0_10px_40px_rgba(8,145,178,0.4)] transition-all active:scale-95 border-b-[8px] border-cyan-800 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <span className="flex items-center justify-center gap-4">
               DEPLOY UNIT <Play fill="white" size={28} />
            </span>
          </button>

          <div className="grid grid-cols-2 gap-4">
            <button className="bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-3xl shadow-lg transition-all active:scale-95 border-b-4 border-slate-950 flex items-center justify-center gap-2 border border-slate-700">
              <HelpCircle size={20} className="text-cyan-400" /> INTEL
            </button>
            <button className="bg-white text-slate-900 font-black py-4 rounded-3xl shadow-lg transition-all active:scale-95 border-b-4 border-slate-300 flex items-center justify-center gap-2">
              <Github size={20} /> FLEET
            </button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="w-full bg-slate-900/80 backdrop-blur p-6 rounded-[40px] shadow-2xl border border-slate-700/50 space-y-4 animate-in zoom-in duration-700 delay-300">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-cyan-900/50 rounded-2xl flex items-center justify-center text-cyan-400 shrink-0 border border-cyan-800/50">
               <Target size={24} />
            </div>
            <div>
              <h3 className="font-black text-white uppercase tracking-tight">System Capture</h3>
              <p className="text-xs text-slate-400 font-medium">Encircle planetary clusters to gain immediate control of entire solar sectors.</p>
            </div>
          </div>
          <div className="h-px bg-slate-800 w-full" />
          <p className="text-[10px] text-center font-black text-slate-500 tracking-widest uppercase">Deep Space Protocol 1.0 • v.Galaxy</p>
        </div>
      </div>

      <div className="absolute bottom-8 text-center">
         <p className="text-cyan-500/50 font-black text-[10px] tracking-[0.2em] uppercase">Initialize transmission to begin</p>
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
            #0891b2 0%,
            #22d3ee 25%,
            #67e8f9 50%,
            #22d3ee 75%,
            #0891b2 100%
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
