
import React from 'react';
import WorldSelectScene from './WorldSelectScene';

const WorldSelect: React.FC = () => {
  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden">
      {/* 3D Scene Background */}
      <div className="absolute inset-0 z-0">
        <WorldSelectScene />
      </div>

      {/* UI Overlay */}
      <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none p-8 flex flex-col items-center">
        <div className="text-center animate-in fade-in slide-in-from-top-10 duration-700">
          <h1 className="text-4xl md:text-6xl font-black mb-2 tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
            SELECT SECTOR
          </h1>
          <p className="text-slate-400 font-mono uppercase tracking-widest text-sm">
            Drag to Rotate • Scroll to Zoom • Click a World to Deploy
          </p>
        </div>
      </div>
    </div>
  );
};

export default WorldSelect;
