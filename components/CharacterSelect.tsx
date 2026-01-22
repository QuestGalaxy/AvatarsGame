
import React, { useState, useEffect } from 'react';
import { useGameStore, CHARACTERS } from '../store';
import { AppFlow } from '../types';
import { ChevronLeft, ChevronRight, Check, Zap } from 'lucide-react';
import { audio } from '../utils/audio';
import { Canvas } from '@react-three/fiber';
import { Environment, Float, OrbitControls, ContactShadows } from '@react-three/drei';
import DragonMesh from './DragonMesh';

const Pedestal: React.FC<{ color: string }> = ({ color }) => {
  return (
    <group position={[0, -1.3, 0]}>
      {/* Main Base */}
      <mesh receiveShadow>
        <cylinderGeometry args={[1.5, 1.8, 0.4, 32]} />
        <meshStandardMaterial color="#0f172a" roughness={0.1} metalness={0.8} />
      </mesh>
      {/* Glowing Ring */}
      <mesh position={[0, 0.21, 0]}>
        <torusGeometry args={[1.4, 0.05, 16, 64]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={4} />
      </mesh>
      {/* Spotlight for character */}
      <spotLight position={[0, 5, 0]} intensity={20} color={color} angle={0.5} penumbra={1} castShadow />
    </group>
  );
};

const CharacterSelect: React.FC = () => {
  const { setAppFlow, setSelectedCharacterId, selectedCharacterId } = useGameStore();
  const [index, setIndex] = useState(CHARACTERS.findIndex(c => c.id === selectedCharacterId));
  const char = CHARACTERS[index];
  const themeStyle = {
    '--accent': char.color,
    '--accent-dark': char.secondaryColor,
  } as React.CSSProperties;
  const traitsById: Record<string, string[]> = {
    emerald: ['Velocity', 'Recon', 'Pulse'],
    ruby: ['Siege', 'Pyre', 'Command'],
    sapphire: ['Voidstep', 'Silence', 'Blink'],
    amber: ['Radiance', 'Nova', 'Overcharge'],
  };
  const traits = traitsById[char.id] || ['Core', 'Signal', 'Drive'];

  useEffect(() => {
    audio.unlock();
    audio.setAmbient('select');
  }, []);

  const handleNext = () => {
    const nextIdx = (index + 1) % CHARACTERS.length;
    setIndex(nextIdx);
    audio.playSwitch();
  };

  const handlePrev = () => {
    const prevIdx = (index - 1 + CHARACTERS.length) % CHARACTERS.length;
    setIndex(prevIdx);
    audio.playSwitch();
  };

  const handleConfirm = () => {
    setSelectedCharacterId(char.id);
    audio.playConfirm();
    setAppFlow(AppFlow.GAME);
  };

  return (
    <div
      className="absolute inset-0 z-[100] bg-slate-950 text-white flex flex-col items-center justify-between py-12 px-6 safe-top safe-bottom overflow-hidden"
      style={themeStyle}
    >
      {/* Background Decorative Elements */}
      <div
        className="absolute inset-0 pointer-events-none transition-colors duration-1000"
        style={{
          background: `radial-gradient(circle at 50% 35%, ${char.color}33 0%, transparent 55%),
            radial-gradient(circle at 15% 20%, ${char.secondaryColor}26 0%, transparent 45%),
            radial-gradient(circle at 85% 10%, ${char.secondaryColor}22 0%, transparent 40%)`,
        }}
      />
      <div
        className="absolute inset-0 opacity-25 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(${char.color}55 1px, transparent 1px)`,
          backgroundSize: '120px 120px',
          maskImage: 'linear-gradient(to bottom, black 40%, transparent 95%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(148,163,184,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.1) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
          maskImage: 'radial-gradient(circle at 50% 40%, black 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute -top-24 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full border border-slate-700/40 opacity-40 pointer-events-none"
        style={{ boxShadow: `0 0 120px ${char.color}22` }}
      />

      {/* Header */}
      <div className="relative text-center animate-in slide-in-from-top-4 duration-500">
        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-white/10 bg-slate-900/60 backdrop-blur">
          <span className="h-2 w-2 rounded-full" style={{ background: char.color, boxShadow: `0 0 12px ${char.color}` }} />
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">Select Unit</p>
          <span className="h-[1px] w-6 bg-slate-700" />
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">Hangar Bay 7</p>
        </div>
        <h1 className="text-5xl font-black tracking-tighter mt-4">AVATAR</h1>
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500 mt-2">Atlas Command</p>
      </div>

      {/* 3D Viewer */}
      <div className="flex-1 w-full relative">
        <Canvas shadows camera={{ position: [0, 1.5, 6], fov: 35 }}>
          <ambientLight intensity={1} />
          <pointLight position={[10, 10, 10]} intensity={1.5} />
          
          <OrbitControls 
            enablePan={false} 
            enableZoom={false} 
            minPolarAngle={Math.PI / 3} 
            maxPolarAngle={Math.PI / 2.2}
            autoRotate
            autoRotateSpeed={0.5}
          />
          
          <Float speed={4} rotationIntensity={0.2} floatIntensity={0.3}>
            <group scale={1.8}>
              <DragonMesh characterId={char.id} isMoving={false} />
            </group>
          </Float>
          
          <Pedestal color={char.color} />
          <ContactShadows position={[0, -1.3, 0]} opacity={0.6} scale={10} blur={2} far={4} color={char.color} />
          <Environment preset="night" />
        </Canvas>

        {/* Navigation Buttons */}
        <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2 pointer-events-none">
          <button onClick={handlePrev} className="p-4 bg-slate-900/90 backdrop-blur rounded-full shadow-2xl pointer-events-auto active:scale-90 transition-transform border border-slate-700 hover:border-white/30">
            <ChevronLeft size={32} className="text-white" />
          </button>
          <button onClick={handleNext} className="p-4 bg-slate-900/90 backdrop-blur rounded-full shadow-2xl pointer-events-auto active:scale-90 transition-transform border border-slate-700 hover:border-white/30">
            <ChevronRight size={32} className="text-white" />
          </button>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {CHARACTERS.map((c, i) => (
            <span
              key={c.id}
              className="h-2 w-2 rounded-full transition-all"
              style={{
                background: i === index ? c.color : 'rgba(148,163,184,0.3)',
                boxShadow: i === index ? `0 0 12px ${c.color}` : 'none',
                transform: i === index ? 'scale(1.4)' : 'scale(1)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Character Info Card */}
      <div className="w-full max-w-sm md:max-w-md bg-slate-900/95 p-8 md:p-5 rounded-[40px] md:rounded-[32px] shadow-[0_40px_140px_rgba(0,0,0,0.85)] border border-white/15 relative animate-in slide-in-from-bottom-8 duration-500 overflow-hidden">
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${char.color}22 0%, transparent 55%)`,
          }}
        />
        <div
          className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg animate-bounce border-2 border-white/20"
          style={{ backgroundColor: char.color }}
        >
          <Zap size={24} fill="white" />
        </div>

        <div className="text-center mb-6 md:mb-4">
          <h3 className="text-[11px] md:text-[10px] font-black uppercase tracking-[0.3em] mb-2 md:mb-1 text-white/80">
            {char.title}
          </h3>
          <h2 className="text-4xl md:text-3xl font-black text-white tracking-tight" style={{ textShadow: `0 0 20px ${char.color}66` }}>
            {char.name}
          </h2>
          <p className="mt-3 md:mt-2 text-slate-300 font-semibold leading-relaxed md:text-sm">{char.description}</p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-6 md:mb-4 flex-wrap">
          {traits.map(trait => (
            <span
              key={trait}
              className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-[0.2em] border border-white/10 text-slate-300"
              style={{ background: `${char.secondaryColor}22` }}
            >
              {trait}
            </span>
          ))}
        </div>

        <button 
          onClick={handleConfirm}
          className="w-full py-5 rounded-[24px] text-white font-black text-xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 border-b-4"
          style={{ 
            backgroundColor: char.color,
            borderBottomColor: char.secondaryColor 
          }}
        >
          DEPLOY <Check size={24} strokeWidth={4} />
        </button>
      </div>

      <button 
        onClick={() => { audio.playSwitch(); setAppFlow(AppFlow.LANDING); }}
        className="mt-6 text-slate-600 font-bold uppercase text-[10px] tracking-[0.3em] hover:text-white transition-colors"
      >
        Cancel Mission
      </button>

    </div>
  );
};

export default CharacterSelect;
