
import React, { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Stars, Sparkles, Cloud, Sky } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../store';
import HexCell from './HexCell';
import Dragon from './Dragon';
import Confetti from './Confetti';
import { GameState, CellData } from '../types';
import { hexToWorld } from '../utils/hexMath';
import { audio } from '../utils/audio';

const CinematicCamera: React.FC = () => {
  const { camera, size } = useThree();
  const { gameState, isCinematic, setCinematic, playerPos } = useGameStore();
  const controlsRef = useRef<any>(null);
  const shakeRef = useRef(0);
  
  const initialPos = useMemo(() => new THREE.Vector3(50, 60, 50), []);
  const targetOffset = useMemo(() => new THREE.Vector3(12, 10, 12), []);
  
  const playerWorldPos = useMemo(() => {
    const [x, , z] = hexToWorld(playerPos.q, playerPos.r);
    return new THREE.Vector3(x, 0.4, z);
  }, [playerPos]);

  useEffect(() => {
    const isPortrait = size.height > size.width;
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = isPortrait ? 55 : 40;
      camera.updateProjectionMatrix();
    }
  }, [size, camera]);

  useEffect(() => {
    if (isCinematic) {
      camera.position.copy(initialPos);
      if (controlsRef.current) {
        controlsRef.current.target.set(0, 0, 0);
      }
    }
  }, [isCinematic, initialPos, camera]);

  useEffect(() => {
    if (gameState === GameState.LOST) shakeRef.current = 1.0;
  }, [gameState]);

  useFrame((state, delta) => {
    if (!controlsRef.current) return;

    if (isCinematic) {
      const targetCamPos = playerWorldPos.clone().add(targetOffset);
      camera.position.lerp(targetCamPos, delta * 2);
      controlsRef.current.target.lerp(playerWorldPos, delta * 3);
      controlsRef.current.update();

      if (camera.position.distanceTo(targetCamPos) < 0.2) {
        setCinematic(false);
      }
    } else {
      controlsRef.current.target.lerp(playerWorldPos, delta * 6);
      controlsRef.current.update();
    }

    if (shakeRef.current > 0) {
      const s = shakeRef.current;
      camera.position.x += (Math.random() - 0.5) * s;
      camera.position.y += (Math.random() - 0.5) * s;
      shakeRef.current *= 0.9;
    }
  });

  return (
    <OrbitControls 
      ref={controlsRef}
      makeDefault 
      enablePan={false} 
      minDistance={6} 
      maxDistance={40} 
      enabled={!isCinematic}
    />
  );
};

const IslandBase: React.FC = () => {
  const { atmosphere } = useGameStore();
  const glowColor = atmosphere === 'night' ? '#0891b2' : atmosphere === 'sunset' ? '#7c3aed' : '#22d3ee';
  return (
    <group position={[0, -1.2, 0]}>
      {/* Main Base - Brightened from #020617 to #1e293b */}
      <mesh rotation={[0, Math.PI / 6, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[8.5, 7.5, 2.5, 6]} />
        <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.8} />
      </mesh>
      {/* Glowing Energy Ring */}
      <mesh rotation={[0, Math.PI / 6, 0]} position={[0, -0.5, 0]}>
        <cylinderGeometry args={[8.52, 8.52, 0.1, 6]} />
        <meshStandardMaterial color={glowColor} emissive={glowColor} emissiveIntensity={5} transparent opacity={0.7} />
      </mesh>
      {/* Underside Pedestal */}
      <mesh position={[0, -2.5, 0]} rotation={[0, Math.PI / 6, 0]} castShadow>
        <cylinderGeometry args={[7.5, 0.1, 3.5, 6]} />
        <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.9} />
      </mesh>
    </group>
  );
};

const GameScene: React.FC = () => {
  const { grid, initLevel, gameState, atmosphere } = useGameStore();

  useEffect(() => { initLevel(); }, [initLevel]);
  useEffect(() => { audio.setAmbient(atmosphere); }, [atmosphere]);

  const gridArray = useMemo(() => Object.values(grid) as CellData[], [grid]);

  return (
    <Canvas 
      shadows
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, shadowMapType: THREE.PCFSoftShadowMap }}
      camera={{ position: [50, 60, 50], fov: 40 }}
    >
      <CinematicCamera />
      <color attach="background" args={[atmosphere === 'night' ? '#020617' : atmosphere === 'sunset' ? '#1e1b4b' : '#0c0a09']} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <Environment preset="night" />
      
      {/* Boosted Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[20, 30, 15]} intensity={1.8} castShadow color="#ffffff" />
      <pointLight position={[-10, 15, -10]} intensity={1.2} color="#22d3ee" />
      <pointLight position={[10, -5, 10]} intensity={0.5} color="#7c3aed" />

      <group>
        <IslandBase />
        <group position={[0, -0.05, 0]}>
          {gridArray.map((cell) => (
            <HexCell 
              key={`${cell.coord.q},${cell.coord.r}`} 
              q={cell.coord.q} 
              r={cell.coord.r} 
              type={cell.type} 
              owner={cell.owner}
            />
          ))}
          <Dragon />
        </group>
      </group>
      {gameState === GameState.WON && <Confetti />}
      <ContactShadows position={[0, -0.75, 0]} opacity={0.6} scale={30} blur={2.5} color="#000000" />
    </Canvas>
  );
};

export default GameScene;
