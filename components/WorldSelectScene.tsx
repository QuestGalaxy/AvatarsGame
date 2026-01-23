
import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Sparkles, Html, Text } from '@react-three/drei';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as THREE from 'three';
import { WORLDS, useGameStore } from '../store';
import { AppFlow, WeatherType } from '../types';
import { audio } from '../utils/audio';
import DragonMesh from './DragonMesh';

// --- Copied Galaxy Background Components ---

const GalaxyBackdrop: React.FC<{ atmosphere: WeatherType }> = ({ atmosphere }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const uniforms = useMemo(
    () => ({
      time: { value: 0 },
      color1: { value: new THREE.Color('#2dd4bf') },
      color2: { value: new THREE.Color('#38bdf8') },
      color3: { value: new THREE.Color('#f472b6') },
      color4: { value: new THREE.Color('#a78bfa') },
      color5: { value: new THREE.Color('#fbbf24') },
      intensity: { value: 1.15 },
    }),
    []
  );

  useEffect(() => {
    // Default to a mix or specific atmosphere for the menu
    const palette = { color1: '#1e40af', color2: '#38bdf8', color3: '#f472b6', color4: '#a78bfa', color5: '#fbbf24', intensity: 1.2 };

    uniforms.color1.value.set(palette.color1);
    uniforms.color2.value.set(palette.color2);
    uniforms.color3.value.set(palette.color3);
    uniforms.color4.value.set(palette.color4);
    uniforms.color5.value.set(palette.color5);
    uniforms.intensity.value = palette.intensity;
  }, [atmosphere, uniforms]);

  useFrame((_, delta) => {
    uniforms.time.value += delta;
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.01;
      meshRef.current.rotation.x += delta * 0.002;
    }
  });

  return (
    <mesh ref={meshRef} scale={180} frustumCulled={false}>
      <sphereGeometry args={[1, 64, 64]} />
      <shaderMaterial
        side={THREE.BackSide}
        depthWrite={false}
        uniforms={uniforms}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float time;
          uniform vec3 color1;
          uniform vec3 color2;
          uniform vec3 color3;
          uniform vec3 color4;
          uniform vec3 color5;
          uniform float intensity;
          varying vec2 vUv;

          float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
          }

          float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            float a = hash(i);
            float b = hash(i + vec2(1.0, 0.0));
            float c = hash(i + vec2(0.0, 1.0));
            float d = hash(i + vec2(1.0, 1.0));
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
          }

          float fbm(vec2 p) {
            float f = 0.0;
            f += 0.5000 * noise(p);
            p *= 2.02;
            f += 0.2500 * noise(p);
            p *= 2.03;
            f += 0.1250 * noise(p);
            p *= 2.01;
            f += 0.0625 * noise(p);
            return f;
          }

          void main() {
            vec2 uv = vUv;
            vec2 centered = uv * 2.0 - 1.0;
            float radius = length(centered);
            float gradient = smoothstep(0.0, 1.2, radius);

            vec3 base = mix(color1, color2, pow(1.0 - gradient, 1.15));

            vec2 nebulaUv = uv * 2.2;
            nebulaUv += vec2(time * 0.02, -time * 0.015);
            float nebulaNoise = fbm(nebulaUv * 1.3);
            float nebulaMask = smoothstep(0.2, 0.7, nebulaNoise);
            vec3 nebulaColor = mix(color3, color4, nebulaNoise);
            base = mix(base, nebulaColor, nebulaMask * 0.85);

            float dust = pow(fbm(nebulaUv * 5.0), 2.0);
            base += dust * 0.22;

            vec2 bandUv = uv - 0.5;
            float angle = 0.45;
            bandUv = vec2(
              cos(angle) * bandUv.x - sin(angle) * bandUv.y,
              sin(angle) * bandUv.x + cos(angle) * bandUv.y
            );
            float band = smoothstep(0.25, 0.02, abs(bandUv.y));
            float bandNoise = fbm((bandUv + vec2(time * 0.02, 0.0)) * 3.5);
            band *= smoothstep(0.2, 0.75, bandNoise);
            base = mix(base, color5, band * 0.7);
            base += band * (0.25 + bandNoise * 0.35);

            float vignette = smoothstep(0.35, 1.2, radius);
            base *= 1.0 - vignette * 0.25;

            base *= intensity;

            gl_FragColor = vec4(base, 1.0);
          }
        `}
      />
    </mesh>
  );
};

const GalaxyField: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.012;
      groupRef.current.rotation.x += delta * 0.003;
    }
  });

  return (
    <group ref={groupRef}>
      <Sparkles count={220} speed={0.2} size={6} opacity={0.9} scale={[120, 70, 120]} color="#fcd34d" />
      <Sparkles count={160} speed={0.18} size={4.2} opacity={0.85} scale={[90, 50, 90]} color="#60a5fa" />
    </group>
  );
};

// --- Mini World Component ---

interface MiniWorldProps {
  world: typeof WORLDS[0];
  position: [number, number, number];
  index: number;
  isFocused: boolean;
  onClick: (id: string) => void;
}

const MiniWorld: React.FC<MiniWorldProps> = ({ world, position, index, isFocused, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      // Gentle floating animation
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 1.5;
      
      // Rotate slowly
      groupRef.current.rotation.y += 0.005;
      
      // Scale on hover or focus
      const targetScale = hovered || isFocused ? 1.2 : 1.0;
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  // Mock hex grid positions (center + 6 neighbors)
  const hexPositions = [
    [0, 0, 0],
    [1.8, 0, 0], [-1.8, 0, 0],
    [0.9, 0, 1.55], [-0.9, 0, 1.55],
    [0.9, 0, -1.55], [-0.9, 0, -1.55]
  ];

  const primaryColor = world.galaxyPos.color;
  const platformColor = world.levels[0].platformColors.base;

  return (
    <group 
      ref={groupRef} 
      position={position}
      onClick={(e) => { e.stopPropagation(); onClick(world.id); }}
      onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
    >
      {/* Numbering */}
      <Text
        position={[-5, 2, -2]}
        rotation={[0, Math.PI / 4, 0]}
        fontSize={3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {`0${index + 1}`}
        <meshStandardMaterial color="white" opacity={0.3} transparent />
      </Text>

      {/* Label */}
      <Html position={[0, 4, 0]} center distanceFactor={15} style={{ pointerEvents: 'none' }}>
        <div className={`transition-all duration-300 ${isFocused ? 'opacity-100 scale-110' : hovered ? 'opacity-100' : 'opacity-60'} text-center min-w-[200px]`}>
          <div className={`backdrop-blur-md border p-3 rounded-xl shadow-xl ${isFocused ? 'bg-slate-900/90 border-cyan-500/50' : 'bg-slate-900/60 border-white/10'}`}>
            <h3 className="text-white font-bold text-lg font-mono tracking-wider whitespace-nowrap" style={{ color: primaryColor }}>{world.name}</h3>
            {(hovered || isFocused) && <p className="text-xs text-slate-300 mt-1 max-w-[180px] mx-auto">{world.description}</p>}
            {isFocused && (
              <div className="mt-2 text-[10px] font-bold uppercase tracking-widest text-white/50 animate-pulse">
                Click to Deploy
              </div>
            )}
          </div>
          {/* Connector Line */}
          <div className="w-0.5 h-8 bg-gradient-to-b from-white/20 to-transparent mx-auto mt-1" />
        </div>
      </Html>

      {/* Base Platform */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[4.5, 2.5, 2, 6]} />
        <meshStandardMaterial color="#1e293b" roughness={0.3} />
      </mesh>
      
      {/* Energy Ring */}
      <mesh position={[0, -0.2, 0]}>
        <torusGeometry args={[4.8, 0.1, 8, 32]} />
        <meshStandardMaterial color={primaryColor} emissive={primaryColor} emissiveIntensity={isFocused ? 3 : 2} />
      </mesh>

      {/* Hex Tiles */}
      {hexPositions.map((pos, i) => (
        <group key={i} position={[pos[0], 0.5, pos[2]]}>
          <mesh rotation={[0, Math.PI/6, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.95, 0.95, 0.4, 6]} />
            <meshStandardMaterial color={platformColor} roughness={0.2} metalness={0.5} />
          </mesh>
          <mesh position={[0, 0.21, 0]} rotation={[0, Math.PI/6, 0]}>
             <cylinderGeometry args={[0.9, 0.9, 0.05, 6]} />
             <meshStandardMaterial color={primaryColor} emissive={primaryColor} emissiveIntensity={0.5} transparent opacity={0.3} />
          </mesh>
        </group>
      ))}

      {/* Characters Battling */}
      <group position={[-2, 1, 0]} rotation={[0, Math.PI/2, 0]} scale={0.8}>
        <DragonMesh characterId="emerald" isMoving={true} />
      </group>
      
      <group position={[2, 1, 0]} rotation={[0, -Math.PI/2, 0]} scale={0.8}>
        <DragonMesh characterId="ruby" isMoving={true} />
      </group>

      {/* Effects */}
      <pointLight position={[0, 3, 0]} color={primaryColor} intensity={isFocused ? 4 : 2} distance={10} />
    </group>
  );
};

// --- Camera Controller ---

const CameraRig: React.FC<{ targetPos: [number, number, number] }> = ({ targetPos }) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  
  // Calculate ideal camera offset relative to target
  // We want to be somewhat "in front" and "above"
  const offset = new THREE.Vector3(0, 15, 25); 

  useFrame((state, delta) => {
    if (controlsRef.current) {
      const targetVec = new THREE.Vector3(...targetPos);
      
      // Smoothly move the controls target to the focused world
      controlsRef.current.target.lerp(targetVec, delta * 2.5);
      
      // Smoothly move the camera to follow
      // We only strictly enforce this if we are far away, to allow some rotation
      // But for a "select screen" feel, a strict follow is often nicer
      const idealPos = targetVec.clone().add(offset);
      camera.position.lerp(idealPos, delta * 2.0);
      
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls 
      ref={controlsRef}
      enablePan={false}
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI / 2.2}
      minDistance={10}
      maxDistance={60}
      enableDamping={true}
      dampingFactor={0.05}
    />
  );
};

// --- Main Scene ---

const WorldSelectScene: React.FC = () => {
  const { setSelectedWorldId, setAppFlow, initLevel } = useGameStore();
  const [focusedId, setFocusedId] = useState(WORLDS[0].id);

  const handleWorldClick = (worldId: string) => {
    if (focusedId === worldId) {
      // Enter the world
      setSelectedWorldId(worldId);
      initLevel(0);
      audio.playMove();
      setAppFlow(AppFlow.GAME);
    } else {
      // Focus the world
      setFocusedId(worldId);
      audio.playSwitch(); // Reuse hover sound for focus change
    }
  };

  // Calculate 3D positions based on galaxyPos (2D %)
  const worldNodes = useMemo(() => {
    return WORLDS.map((world, index) => {
      // Distribute them with more space
      const x = (index - 1) * 35; 
      const z = Math.abs(index - 1) * 15; // Slight arc
      return {
        ...world,
        pos3d: [x, 0, z] as [number, number, number]
      };
    });
  }, []);

  const focusedWorld = worldNodes.find(w => w.id === focusedId) || worldNodes[0];
  const currentIndex = worldNodes.findIndex(w => w.id === focusedId);

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % worldNodes.length;
    setFocusedId(worldNodes[nextIndex].id);
    audio.playSwitch();
  };

  const handlePrev = () => {
    const prevIndex = (currentIndex - 1 + worldNodes.length) % worldNodes.length;
    setFocusedId(worldNodes[prevIndex].id);
    audio.playSwitch();
  };

  const handleSelect = () => {
    setSelectedWorldId(focusedId);
    initLevel(0);
    audio.playMove();
    setAppFlow(AppFlow.GAME);
  };

  return (
    <div className="w-full h-full relative">
      {/* UI Navigation Hints */}
      <div className="absolute top-8 left-0 right-0 z-10 flex flex-col items-center pointer-events-none">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 tracking-tighter drop-shadow-lg">
          SELECT SECTOR
        </h1>
        <div className="flex gap-8 mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
           <span>Drag to Rotate</span>
           <span>Scroll to Zoom</span>
        </div>
      </div>

      {/* Navigation Controls */}
      <button 
        onClick={handlePrev}
        className="absolute left-8 top-1/2 -translate-y-1/2 z-20 p-4 rounded-full bg-slate-900/50 hover:bg-slate-800/80 border border-slate-700 text-white transition-all hover:scale-110 active:scale-95 backdrop-blur-md group"
      >
        <ChevronLeft size={48} className="text-slate-400 group-hover:text-white" />
      </button>

      <button 
        onClick={handleNext}
        className="absolute right-8 top-1/2 -translate-y-1/2 z-20 p-4 rounded-full bg-slate-900/50 hover:bg-slate-800/80 border border-slate-700 text-white transition-all hover:scale-110 active:scale-95 backdrop-blur-md group"
      >
        <ChevronRight size={48} className="text-slate-400 group-hover:text-white" />
      </button>

      {/* Bottom Action */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-6">
         <div className="flex gap-3 mb-2">
            {worldNodes.map((w, i) => (
              <div 
                key={w.id} 
                onClick={() => { setFocusedId(w.id); audio.playSwitch(); }}
                className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-300 ${i === currentIndex ? 'bg-cyan-400 scale-150 shadow-[0_0_10px_rgba(34,211,238,0.8)]' : 'bg-slate-600 hover:bg-slate-500'}`} 
              />
            ))}
         </div>
         <button
            onClick={handleSelect}
            className="px-16 py-5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-2xl rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.4)] border border-cyan-400/30 transition-all hover:scale-105 active:scale-95 tracking-widest uppercase"
         >
            DEPLOY TO SECTOR
         </button>
      </div>

      <Canvas
        shadows
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
        camera={{ position: [0, 20, 45], fov: 45 }}
      >
        <color attach="background" args={['#0f172a']} />
        
        <GalaxyBackdrop atmosphere="night" />
        <GalaxyField />
        
        <Environment preset="city" />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />

        {/* Connecting Lines */}
        <line>
          <bufferGeometry attach="geometry" onUpdate={geo => {
            const points = worldNodes.map(w => new THREE.Vector3(...w.pos3d));
            geo.setFromPoints(points);
          }} />
          <lineBasicMaterial attach="material" color="#cbd5e1" transparent opacity={0.1} linewidth={1} />
        </line>

        {worldNodes.map((world, index) => (
          <MiniWorld 
            key={world.id} 
            world={world} 
            position={world.pos3d}
            index={index}
            isFocused={focusedId === world.id}
            onClick={handleWorldClick} 
          />
        ))}

        <CameraRig targetPos={focusedWorld.pos3d} />

      </Canvas>
    </div>
  );
};

export default WorldSelectScene;
