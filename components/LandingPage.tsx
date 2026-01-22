import React from 'react';
import { useGameStore } from '../store';
import { AppFlow } from '../types';
import { Play, HelpCircle, Target, Github, Terminal, Cpu } from 'lucide-react';
import { audio } from '../utils/audio';

const LandingPage: React.FC = () => {
  const setAppFlow = useGameStore(state => state.setAppFlow);

  const handleStart = () => {
    audio.unlock();
    setAppFlow(AppFlow.CHARACTER_SELECT);
  };

  return (
    <div className="absolute inset-0 z-[90] flex flex-col items-center justify-center p-6 bg-slate-950 overflow-hidden font-sans">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_200px,#3b82f615,transparent)]" />
      
      <div className="w-full max-w-md flex flex-col items-center gap-12 relative z-10">
        
        {/* Title Block */}
        <div className="text-center space-y-6 animate-in slide-in-from-top-8 duration-700">
          <div className="relative inline-block">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg blur opacity-40 animate-pulse" />
            <div className="relative bg-slate-900 border border-slate-800 px-8 py-4 rounded-lg shadow-2xl">
              <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-tight">
                AVATARS<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">GALAXY</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 text-cyan-500/80 font-mono text-xs tracking-[0.2em]">
            <Terminal size={14} />
            <span>SYSTEM_READY</span>
          </div>
        </div>

        {/* Action Block */}
        <div className="w-full flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          <button 
            onClick={handleStart}
            className="group relative w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black py-6 rounded-xl text-2xl shadow-[0_0_40px_-10px_rgba(8,145,178,0.5)] transition-all active:scale-[0.98] border border-cyan-400/30 overflow-hidden"
          >
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] bg-[position:-100%_0,0_0] bg-no-repeat transition-[background-position_0s] duration-[0s] group-hover:bg-[position:200%_0,0_0] group-hover:duration-[1.5s]" />
            <span className="flex items-center justify-center gap-4 relative z-10">
               INITIALIZE MISSION <Play fill="currentColor" className="text-cyan-100" size={24} />
            </span>
          </button>

          <div className="grid grid-cols-2 gap-4">
            <button className="bg-slate-900/50 hover:bg-slate-800 text-slate-300 hover:text-white font-bold py-4 rounded-xl border border-slate-800 transition-all active:scale-95 flex items-center justify-center gap-2 backdrop-blur-sm group">
              <HelpCircle size={18} className="text-slate-500 group-hover:text-cyan-400 transition-colors" /> 
              <span className="text-sm tracking-wide">INTEL</span>
            </button>
            <button className="bg-slate-900/50 hover:bg-slate-800 text-slate-300 hover:text-white font-bold py-4 rounded-xl border border-slate-800 transition-all active:scale-95 flex items-center justify-center gap-2 backdrop-blur-sm group">
              <Github size={18} className="text-slate-500 group-hover:text-purple-400 transition-colors" /> 
              <span className="text-sm tracking-wide">SOURCE</span>
            </button>
          </div>
        </div>

        {/* Footer Status */}
        <div className="grid grid-cols-3 gap-4 w-full pt-8 border-t border-slate-800/50">
          <div className="flex flex-col items-center gap-1 text-slate-500">
            <Cpu size={16} />
            <span className="text-[10px] uppercase tracking-wider font-bold">Core: Online</span>
          </div>
          <div className="flex flex-col items-center gap-1 text-slate-500">
            <Target size={16} />
            <span className="text-[10px] uppercase tracking-wider font-bold">Target: Locked</span>
          </div>
          <div className="flex flex-col items-center gap-1 text-slate-500">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] uppercase tracking-wider font-bold">Net: Stable</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
