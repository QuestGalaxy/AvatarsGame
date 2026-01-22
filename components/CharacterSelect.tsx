
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
    <div className="absolute inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-between py-12 px-6 safe-top safe-bottom overflow-hidden">
      
      {/* Background Decorative Element */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none transition-colors duration-1000"
        style={{ background: `radial-gradient(circle at center, ${char.color} 0%, transparent 70%)` }}
      />

      {/* Header */}
      <div className="relative text-center animate-in slide-in-from-top-4 duration-500">
        <h2 className="text-sm font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Select Unit</h2>
        <h1 className="text-5xl font-black text-white tracking-tighter">AVATAR</h1>
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
          <button onClick={handlePrev} className="p-4 bg-slate-900/90 backdrop-blur rounded-full shadow-2xl pointer-events-auto active:scale-90 transition-transform border border-slate-700">
            <ChevronLeft size={32} className="text-white" />
          </button>
          <button onClick={handleNext} className="p-4 bg-slate-900/90 backdrop-blur rounded-full shadow-2xl pointer-events-auto active:scale-90 transition-transform border border-slate-700">
            <ChevronRight size={32} className="text-white" />
          </button>
        </div>
      </div>

      {/* Character Info Card */}
      <div className="w-full max-w-sm bg-slate-900/95 p-8 rounded-[40px] shadow-[0_30px_100px_rgba(0,0,0,0.8)] border border-slate-800 relative animate-in slide-in-from-bottom-8 duration-500">
        <div 
          className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg animate-bounce border-2 border-white/20"
          style={{ backgroundColor: char.color }}
        >
          <Zap size={24} fill="white" />
        </div>

        <div className="text-center mb-6">
          <h3 className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: char.color }}>{char.title}</h3>
          <h2 className="text-3xl font-black text-white tracking-tight">{char.name}</h2>
          <p className="mt-3 text-slate-400 font-medium leading-relaxed">{char.description}</p>
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
        className="mt-6 text-slate-600 font-bold uppercase text-[10px] tracking-[0.3em] hover:text-cyan-400 transition-colors"
      >
        Cancel Mission
      </button>

    </div>
  );
};

export default CharacterSelect;
