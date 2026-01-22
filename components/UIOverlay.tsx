
import React, { useState } from 'react';
import { useGameStore, LEVELS } from '../store';
import { GameState, AppFlow, Ownership, CellData } from '../types';
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
  Info
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
    skipEnemyTurn
  } = useGameStore();

  const currentLevel = LEVELS[levelIndex];

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
      
      {/* Top Bar - Strategy HUD */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div className="flex flex-col gap-2">
          <div 
            onClick={toggleLevelMenu}
            className="bg-slate-900/95 backdrop-blur-sm p-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 cursor-pointer active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 bg-cyan-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Menu size={20} />
            </div>
            <div>
              <h1 className="text-sm font-black text-white leading-none tracking-tight">{currentLevel.name.toUpperCase()}</h1>
              <p className="text-[10px] font-black text-cyan-400 tracking-tighter uppercase">Signal Strength: {stats.pCount}</p>
            </div>
          </div>
          <button 
            onClick={() => setAppFlow(AppFlow.LANDING)}
            className="bg-slate-900/90 p-3 rounded-2xl shadow-lg border border-slate-700 w-fit active:scale-90 transition-transform text-white"
          >
            <Home size={18} />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowRules(prev => !prev)}
              className="bg-slate-900/90 p-3 rounded-2xl shadow-lg border border-slate-700 w-fit active:scale-90 transition-transform text-white"
              aria-label="Toggle rules"
            >
              <Info size={18} />
            </button>
            {showRules && (
              <div className="absolute left-0 mt-3 bg-slate-900/95 p-3 rounded-2xl shadow-lg border border-slate-700 w-56">
                <p className="text-[9px] font-black text-cyan-400 uppercase tracking-widest mb-2">Quick Rules</p>
                <div className="text-[10px] text-slate-300 leading-snug space-y-1">
                  <div>Move 1 hex.</div>
                  <div>Claim tiles; rocks block.</div>
                  <div>Surround to capture.</div>
                  <div>Win: enemy base or {Math.round(currentLevel.winThreshold * 100)}%.</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Global Control Bar */}
        <div className="bg-slate-900/95 backdrop-blur-sm p-4 rounded-3xl shadow-2xl border border-slate-700 w-56 flex flex-col gap-2">
          <div className="flex justify-between items-end">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">Player</span>
              <span className="text-xl font-black text-white leading-none">{stats.pPerc}%</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Enemy</span>
              <span className="text-xl font-black text-white leading-none">{stats.ePerc}%</span>
            </div>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
            <div className="bg-cyan-500 h-full transition-all duration-700 ease-out" style={{ width: `${stats.pPerc}%` }} />
            <div className="bg-slate-700 h-full flex-1" />
            <div className="bg-rose-500 h-full transition-all duration-700 ease-out" style={{ width: `${stats.ePerc}%` }} />
          </div>
          <div className="text-[8px] text-center font-black text-slate-500 uppercase tracking-tighter">
            Objective: {Math.round(currentLevel.winThreshold * 100)}% Coverage
          </div>
        </div>
      </div>

      {/* Center Turn Alert */}
      <div className="flex flex-col items-center mb-6 gap-3">
        <div className={`flex items-center gap-3 px-8 py-3 rounded-full font-black text-sm shadow-2xl transition-all border-b-4 ${
          gameState === GameState.PLAYER_TURN 
            ? 'bg-cyan-600 text-white border-cyan-800 animate-pulse' 
            : 'bg-slate-800 text-slate-400 border-slate-950 opacity-80'
        }`}>
          {gameState === GameState.PLAYER_TURN ? <Zap size={16} fill="white" /> : <Sword size={16} />}
          {gameState === GameState.PLAYER_TURN ? 'COMMAND PHASE' : 'ENEMY CALCULATING...'}
        </div>
        {lastPowerup && (
          <div className={`px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-xl ${
            lastPowerup.kind === 'positive'
              ? 'bg-cyan-950/50 text-cyan-300 border-cyan-500/40'
              : 'bg-rose-950/50 text-rose-300 border-rose-500/40'
          }`}>
            <div>{lastPowerup.owner === Ownership.PLAYER ? 'You' : 'Enemy'} picked {lastPowerup.name}</div>
            <div className="text-[9px] font-semibold tracking-[0.12em] text-slate-300">{lastPowerup.description}</div>
          </div>
        )}
        {(skipPlayerTurn || skipEnemyTurn) && (
          <div className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.25em] border shadow-xl ${
            skipPlayerTurn ? 'bg-rose-950/40 text-rose-300 border-rose-500/40' : 'bg-cyan-950/40 text-cyan-300 border-cyan-500/40'
          }`}>
            {skipPlayerTurn ? 'Stasis: Your next turn is skipped' : 'Stasis: Enemy turn skipped'}
          </div>
        )}
      </div>

      {/* Victory / Defeat Modal */}
      {(gameState === GameState.WON || gameState === GameState.LOST) && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/80 backdrop-blur-md pointer-events-auto p-6">
          <div className="bg-slate-900 w-full max-w-sm rounded-[40px] shadow-2xl p-8 flex flex-col items-center gap-6 border border-slate-700 animate-in zoom-in duration-300">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-inner border-2 ${
              gameState === GameState.WON ? 'bg-cyan-950/50 text-cyan-400 border-cyan-500/50' : 'bg-rose-950/50 text-rose-400 border-rose-500/50'
            }`}>
              {gameState === GameState.WON ? <Trophy size={48} strokeWidth={2.5} /> : <Target size={48} strokeWidth={2.5} />}
            </div>
            
            <div className="text-center">
              <h2 className="text-4xl font-black text-white tracking-tighter">
                {gameState === GameState.WON ? 'CONQUEST!' : 'OVERRUN'}
              </h2>
              <p className="text-slate-400 font-bold mt-1 uppercase tracking-widest text-[10px]">
                {gameState === GameState.WON ? 'Solar Sector Secured' : 'Critical System Failure'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full">
              <div className="bg-cyan-950/30 p-4 rounded-3xl text-center border border-cyan-800/30">
                <p className="text-[10px] font-black text-cyan-400 uppercase">FLEET</p>
                <p className="text-2xl font-black text-white leading-none mt-1">{stats.pPerc}%</p>
              </div>
              <div className="bg-rose-950/30 p-4 rounded-3xl text-center border border-rose-800/30">
                <p className="text-[10px] font-black text-rose-400 uppercase">SWARM</p>
                <p className="text-2xl font-black text-white leading-none mt-1">{stats.ePerc}%</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full">
              <button 
                onClick={() => initLevel(levelIndex + (gameState === GameState.WON ? 1 : 0))}
                className={`w-full py-5 rounded-2xl font-black text-xl shadow-xl transition-all active:scale-95 border-b-4 ${
                  gameState === GameState.WON 
                    ? 'bg-cyan-600 text-white border-cyan-800' 
                    : 'bg-slate-700 text-white border-slate-800'
                }`}
              >
                {gameState === GameState.WON ? 'NEXT SECTOR' : 'RETRY MISSION'}
              </button>
              <button 
                onClick={() => setAppFlow(AppFlow.LANDING)}
                className="w-full py-4 rounded-2xl font-black text-slate-500 border border-slate-800 hover:bg-slate-800 active:scale-95 transition-all"
              >
                BACK TO COMMAND
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Level Selection Drawer */}
      <div className={`fixed inset-y-0 left-0 w-80 bg-slate-900 shadow-2xl z-[200] transition-transform duration-500 ease-out pointer-events-auto border-r border-slate-800 flex flex-col ${
        isLevelMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-8 flex justify-between items-center border-b border-slate-800">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Star Chart</h2>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Select next target system</p>
          </div>
          <button onClick={toggleLevelMenu} className="p-2 bg-slate-800 rounded-xl text-slate-400">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {LEVELS.map((level, i) => (
            <div 
              key={i}
              onClick={() => {
                initLevel(i);
                toggleLevelMenu();
              }}
              className={`p-5 rounded-[28px] cursor-pointer transition-all border-2 flex items-center justify-between group ${
                levelIndex === i 
                  ? 'bg-cyan-950/20 border-cyan-600 shadow-md' 
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
                  levelIndex === i ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-500 group-hover:bg-slate-700'
                }`}>
                  {i + 1}
                </div>
                <div>
                  <h3 className={`font-black tracking-tight ${levelIndex === i ? 'text-cyan-400' : 'text-slate-400'}`}>
                    {level.name}
                  </h3>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[8px] font-black text-slate-600 uppercase">Sector: {level.size}</span>
                    <span className="text-[8px] font-black text-slate-600 uppercase">Goal: {level.winThreshold * 100}%</span>
                  </div>
                </div>
              </div>
              {levelIndex === i && <Shield className="text-cyan-500" size={16} />}
              {levelIndex !== i && <ChevronRight className="text-slate-700 group-hover:text-slate-500" size={16} />}
            </div>
          ))}
        </div>

        <div className="p-8 border-t border-slate-800">
           <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/30">
             <p className="text-[9px] font-black text-cyan-500 uppercase tracking-widest mb-2">Tactical Memo</p>
             <p className="text-xs text-slate-400 leading-snug">Capture planetary bases or achieve transmission coverage goal to win. Enclose clusters for mass assimilation.</p>
           </div>
        </div>
      </div>

      {/* Powerup Status */}
      <div className="absolute bottom-6 left-6 pointer-events-none">
        <div className="bg-slate-900/85 backdrop-blur-sm p-3 rounded-2xl shadow-lg border border-slate-700 text-[9px] font-black uppercase tracking-widest text-slate-400 space-y-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            <span>Positive pickup</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-rose-400" />
            <span>Negative pickup</span>
          </div>
          <div className="text-[8px] text-slate-500 tracking-widest">
            Shields: You {playerShield} / Enemy {enemyShield}
          </div>
          <div className="text-[8px] text-slate-500 tracking-widest">
            Skips: You {skipPlayerTurn ? 'Next' : 'None'} / Enemy {skipEnemyTurn ? 'Next' : 'None'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UIOverlay;
