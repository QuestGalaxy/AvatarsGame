import React, { useState } from 'react';
import { useGameStore, WORLDS } from '../store';
import { GameState, AppFlow, Ownership, CellData } from '../types';
import { audio } from '../utils/audio';
import { 
  Menu, 
  Home, 
  Trophy, 
  ChevronRight, 
  Shield, 
  Target,
  Zap,
  Sword,
  X,
  Info,
  Activity,
  Maximize2
} from 'lucide-react';

const UIOverlay: React.FC = () => {
  const [showRules, setShowRules] = useState(false);
  const { 
    gameState, 
    levelIndex,
    isLevelMenuOpen,
    toggleLevelMenu,
    initLevel,
    grid,
    setAppFlow,
    lastPowerup,
    playerShield,
    enemyShield,
    skipPlayerTurn,
    skipEnemyTurn,
    selectedWorldId
  } = useGameStore();

  const currentWorld = WORLDS.find(w => w.id === selectedWorldId) || WORLDS[0];
  const currentLevel = currentWorld.levels[levelIndex % currentWorld.levels.length];

  const stats = React.useMemo(() => {
    let p = 0, e = 0, t = 0;
    const gridValues = Object.values(grid) as CellData[];
    gridValues.forEach(c => {
      if (c.owner === Ownership.PLAYER) p++;
      else if (c.owner === Ownership.ENEMY) e++;
      t++;
    });
    return { 
      pCount: p, 
      eCount: e, 
      total: t || 1, 
      pPerc: Math.round((p / (t || 1)) * 100), 
      ePerc: Math.round((e / (t || 1)) * 100) 
    };
  }, [grid]);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 pb-8 overflow-hidden font-sans safe-top safe-bottom">
      
      {/* Top Navigation & Stats Bar */}
      <div className="flex justify-between items-start pointer-events-auto z-50">
        
        {/* Left: Controls */}
        <div className="flex flex-col gap-2">
          <button 
            onClick={toggleLevelMenu}
            className="group bg-slate-900/40 backdrop-blur-xl p-3 rounded-2xl shadow-lg border border-white/10 hover:border-cyan-500/50 transition-all active:scale-95"
          >
            <div className="flex items-center gap-3">
              <Menu size={20} className="text-slate-300 group-hover:text-cyan-400" />
              <div className="flex flex-col items-start">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider group-hover:text-cyan-500/70">Sector</span>
                <span className="text-xs font-bold text-slate-200">{currentLevel?.name || 'Unknown'}</span>
              </div>
            </div>
          </button>

          <div className="flex gap-2">
            <button 
              onClick={() => {
                audio.playConfirm();
                setAppFlow(AppFlow.WORLD_SELECT);
              }}
              className="bg-slate-900/40 backdrop-blur-xl p-3 rounded-2xl shadow-lg border border-white/10 hover:border-cyan-500/50 transition-all active:scale-95 flex-1 flex justify-center"
            >
               <Home size={20} className="text-slate-300 hover:text-cyan-400" />
            </button>
            <button 
              onClick={() => setShowRules(!showRules)}
              className="bg-slate-900/40 backdrop-blur-xl p-3 rounded-2xl shadow-lg border border-white/10 hover:border-cyan-500/50 transition-all active:scale-95 flex-1 flex justify-center"
            >
               <Info size={20} className="text-slate-300 hover:text-cyan-400" />
            </button>
          </div>
        </div>

        {/* Right: Territory Stats & Turn Indicator */}
        <div className="flex flex-col gap-2 items-end">
          <div className="bg-slate-900/40 backdrop-blur-xl p-3 rounded-2xl shadow-lg border border-white/10 flex flex-col gap-2 w-48 transition-all duration-300">
            
            {/* Stats Header */}
            <div className="flex justify-between items-center px-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-wider">YOU</span>
                <span className="text-sm font-bold text-white leading-none">{stats.pPerc}%</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white leading-none">{stats.ePerc}%</span>
                <span className="text-[10px] font-black text-rose-400 uppercase tracking-wider">ENEMY</span>
              </div>
            </div>
            
            {/* Single Progress Bar */}
            <div className="h-2 w-full bg-slate-800/50 rounded-full overflow-hidden flex relative shadow-inner">
              <div 
                className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.6)] transition-all duration-500 ease-out"
                style={{ width: `${stats.pPerc}%` }}
              />
              <div className="flex-1" />
              <div 
                className="h-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)] transition-all duration-500 ease-out"
                style={{ width: `${stats.ePerc}%` }}
              />
            </div>

            {/* Turn Indicator (Compact) */}
            <div className={`
              flex items-center justify-center gap-2 py-1 rounded-lg border transition-all duration-500
              ${gameState === GameState.PLAYER_TURN 
                ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300' 
                : 'bg-rose-500/10 border-rose-500/20 text-rose-300'}
            `}>
              {gameState === GameState.PLAYER_TURN ? (
                 <Zap size={12} className="animate-pulse" />
              ) : (
                 <Activity size={12} className="animate-pulse" />
              )}
              <span className="text-[9px] font-bold tracking-widest uppercase">
                {gameState === GameState.PLAYER_TURN ? 'COMMAND PHASE' : 'ENEMY TACTICS'}
              </span>
            </div>

          </div>
        </div>
      </div>

      {/* Center Notifications (Powerups / Skips) */}
      <div className="absolute top-24 left-0 right-0 flex flex-col items-center gap-2 pointer-events-none">
         {lastPowerup && (
          <div className="animate-in slide-in-from-top-4 fade-in duration-300">
             <div className={`px-4 py-2 rounded-xl backdrop-blur-md border shadow-lg flex items-center gap-3 ${
              lastPowerup.kind === 'positive' 
                ? 'bg-cyan-950/60 border-cyan-500/30 text-cyan-200' 
                : 'bg-rose-950/60 border-rose-500/30 text-rose-200'
             }`}>
               <div className={`p-1.5 rounded-lg ${lastPowerup.kind === 'positive' ? 'bg-cyan-500/20' : 'bg-rose-500/20'}`}>
                 {lastPowerup.kind === 'positive' ? <Maximize2 size={14} /> : <Sword size={14} />}
               </div>
               <div className="flex flex-col">
                 <span className="text-[9px] font-black uppercase tracking-widest opacity-70">
                   {lastPowerup.owner === Ownership.PLAYER ? 'You' : 'Enemy'} Acquired
                 </span>
                 <span className="text-xs font-bold">{lastPowerup.name}</span>
               </div>
             </div>
          </div>
         )}
         
         {(skipPlayerTurn || skipEnemyTurn) && (
            <div className="animate-in zoom-in duration-300 px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-700 text-slate-300 text-[10px] font-bold tracking-widest uppercase shadow-lg backdrop-blur">
              ⚠️ Stasis Field Active
            </div>
         )}
      </div>

      {/* Bottom Status Bar */}
      <div className="pointer-events-none flex justify-between items-end">
        {/* Shields Status */}
        <div className="flex gap-2">
           <div className={`
             bg-slate-900/80 backdrop-blur-md p-2 rounded-xl border transition-all duration-300
             ${playerShield > 0 ? 'border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]' : 'border-slate-800'}
           `}>
             <div className="flex items-center gap-2">
               <Shield size={16} className={playerShield > 0 ? 'text-cyan-400' : 'text-slate-600'} />
               <div className="flex flex-col">
                 <span className="text-[8px] font-black uppercase text-slate-500">Shields</span>
                 <span className={`text-xs font-bold ${playerShield > 0 ? 'text-cyan-400' : 'text-slate-600'}`}>{playerShield}</span>
               </div>
             </div>
           </div>

           <div className={`
             bg-slate-900/80 backdrop-blur-md p-2 rounded-xl border transition-all duration-300
             ${enemyShield > 0 ? 'border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.15)]' : 'border-slate-800'}
           `}>
             <div className="flex items-center gap-2">
               <Shield size={16} className={enemyShield > 0 ? 'text-rose-400' : 'text-slate-600'} />
               <div className="flex flex-col">
                 <span className="text-[8px] font-black uppercase text-slate-500">Enemy</span>
                 <span className={`text-xs font-bold ${enemyShield > 0 ? 'text-rose-400' : 'text-slate-600'}`}>{enemyShield}</span>
               </div>
             </div>
           </div>
        </div>
      </div>

      {/* Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 pointer-events-auto animate-in fade-in duration-200" onClick={() => setShowRules(false)}>
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-3xl max-w-sm w-full shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black text-white uppercase tracking-wider">Tactical Guide</h3>
              <button onClick={() => setShowRules(false)} className="p-1 hover:bg-slate-800 rounded-full transition-colors"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-3 text-sm text-slate-300">
              <p><span className="text-cyan-400 font-bold">Objective:</span> Capture more territory than the enemy or completely surround them.</p>
              <p><span className="text-purple-400 font-bold">Movement:</span> Tap adjacent hexagons to move. Leaving a trail captures cells.</p>
              <p><span className="text-yellow-400 font-bold">Strategy:</span> Enclose a region of empty space to capture all cells inside.</p>
              <p><span className="text-green-400 font-bold">Powerups:</span> Collect glowing orbs for shields, extra moves, or to sabotage the enemy.</p>
            </div>
          </div>
        </div>
      )}

      {/* Victory / Defeat Modal */}
      {(gameState === GameState.WON || gameState === GameState.LOST) && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/90 backdrop-blur-lg pointer-events-auto p-6 animate-in fade-in duration-500">
          <div className="w-full max-w-sm flex flex-col items-center gap-8 relative">
            
            {/* Glow Effect behind */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[100px] opacity-40 ${
              gameState === GameState.WON ? 'bg-cyan-500' : 'bg-rose-500'
            }`} />

            <div className="relative bg-slate-900/80 border border-white/10 p-8 rounded-[40px] shadow-2xl flex flex-col items-center gap-6 backdrop-blur-xl w-full">
              
              <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.3)] border-4 ${
                gameState === GameState.WON 
                  ? 'bg-gradient-to-br from-cyan-500 to-blue-600 border-cyan-300 text-white' 
                  : 'bg-gradient-to-br from-rose-500 to-red-600 border-rose-300 text-white'
              }`}>
                {gameState === GameState.WON ? <Trophy size={48} strokeWidth={2} /> : <Target size={48} strokeWidth={2} />}
              </div>
              
              <div className="text-center space-y-1">
                <h2 className="text-4xl font-black text-white tracking-tighter">
                  {gameState === GameState.WON ? 'VICTORY' : 'DEFEAT'}
                </h2>
                <p className={`text-xs font-bold uppercase tracking-[0.2em] ${
                  gameState === GameState.WON ? 'text-cyan-400' : 'text-rose-400'
                }`}>
                  {gameState === GameState.WON ? 'Sector Secured' : 'Mission Failed'}
                </p>
              </div>

              <div className="w-full grid grid-cols-2 gap-3 text-center">
                 <div className="bg-slate-800/50 p-3 rounded-2xl border border-white/5">
                   <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Score</div>
                   <div className="text-xl font-black text-white">{stats.pCount * 100}</div>
                 </div>
                 <div className="bg-slate-800/50 p-3 rounded-2xl border border-white/5">
                   <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Control</div>
                   <div className="text-xl font-black text-white">{stats.pPerc}%</div>
                 </div>
              </div>

              <div className="flex flex-col gap-3 w-full pt-2">
                <button 
                  onClick={() => initLevel(levelIndex + (gameState === GameState.WON ? 1 : 0))}
                  className={`w-full py-4 rounded-xl font-black text-lg shadow-lg transition-all active:scale-[0.98] border border-white/20 relative overflow-hidden group ${
                    gameState === GameState.WON 
                      ? 'bg-cyan-600 hover:bg-cyan-500 text-white' 
                      : 'bg-slate-700 hover:bg-slate-600 text-white'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  {gameState === GameState.WON ? 'NEXT MISSION' : 'RETRY SYSTEM'}
                </button>
                <button 
                  onClick={() => setAppFlow(AppFlow.LANDING)}
                  className="w-full py-4 rounded-xl font-bold text-slate-400 hover:text-white border border-transparent hover:border-slate-700 hover:bg-slate-800/50 transition-all active:scale-[0.98]"
                >
                  RETURN TO BASE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Level Selection Drawer */}
      <div className={`fixed inset-y-0 left-0 w-80 bg-slate-900/95 backdrop-blur-xl shadow-2xl z-[200] transition-transform duration-500 ease-out pointer-events-auto border-r border-slate-700/50 flex flex-col ${
        isLevelMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 flex justify-between items-center border-b border-slate-800">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-cyan-950/50 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
               <Target size={20} />
             </div>
             <div>
               <h2 className="text-xl font-black text-white tracking-tight">MISSIONS</h2>
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Select Sector</p>
             </div>
          </div>
          <button onClick={toggleLevelMenu} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
            <X className="text-slate-400" size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {currentWorld.levels.map((level, i) => (
            <div 
              key={i}
              onClick={() => { initLevel(i); toggleLevelMenu(); }}
              className={`group p-4 rounded-2xl cursor-pointer border transition-all duration-300 ${
                levelIndex === i 
                  ? 'bg-cyan-950/40 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.1)]' 
                  : 'bg-slate-800/20 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className={`text-xs font-black uppercase tracking-widest ${
                  levelIndex === i ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                }`}>
                  Sector {i + 1}
                </span>
                {levelIndex === i && <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />}
              </div>
              <h3 className={`text-lg font-bold ${
                levelIndex === i ? 'text-white' : 'text-slate-300 group-hover:text-white'
              }`}>
                {level.name}
              </h3>
              <div className="flex items-center gap-2 mt-3 text-[10px] text-slate-500">
                 <div className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700">
                   {level.difficulty || 'Normal'}
                 </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-slate-800 bg-slate-950/50">
           <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
             <Info size={16} className="text-cyan-500 mt-0.5 shrink-0" />
             <p className="text-xs text-slate-400 leading-relaxed">
               <strong className="text-slate-200">Tip:</strong> Create closed loops to capture all territory within.
             </p>
           </div>
        </div>
      </div>

    </div>
  );
};

export default UIOverlay;
