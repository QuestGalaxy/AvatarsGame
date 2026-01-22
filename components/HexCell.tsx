
import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore, LEVELS } from '../store';
import { CellType, Ownership, GameState, HexCoord, HEX_DIRECTIONS } from '../types';
import { hexToWorld } from '../utils/hexMath';
import * as THREE from 'three';

const BaseStructure: React.FC<{ owner: Ownership }> = ({ owner }) => {
  const ref = useRef<THREE.Group>(null);
  const color = owner === Ownership.PLAYER ? '#22d3ee' : '#f43f5e';
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.02;
      ref.current.position.y = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group ref={ref}>
      <mesh castShadow>
        <cylinderGeometry args={[0.4, 0.5, 0.8, 6]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.6, 0]}>
        <octahedronGeometry args={[0.25]} />
        <meshStandardMaterial color="white" emissive={color} emissiveIntensity={2} />
      </mesh>
      <pointLight color={color} intensity={2} distance={4} />
    </group>
  );
};

const MoveIndicator: React.FC = () => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      const s = 1.1 + Math.sin(state.clock.elapsedTime * 6) * 0.05;
      ref.current.scale.set(s, 1, s);
      ref.current.rotation.y += 0.04;
    }
  });
  return (
    <mesh ref={ref} position={[0, 0.15, 0]} rotation={[0, Math.PI / 6, 0]}>
      <torusGeometry args={[0.7, 0.03, 12, 6]} />
      <meshBasicMaterial color="#22d3ee" transparent opacity={0.6} />
    </mesh>
  );
};

interface HexCellProps {
  q: number;
  r: number;
  type: CellType;
  owner: Ownership;
}

const HexCell: React.FC<HexCellProps> = ({ q, r, type, owner }) => {
  const { movePlayer, playerPos, gameState } = useGameStore();
  const position = useMemo(() => hexToWorld(q, r), [q, r]);
  const meshRef = useRef<THREE.Group>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [clickScale, setClickScale] = useState(1);

  const isValidMove = useMemo(() => {
    if (gameState !== GameState.PLAYER_TURN) return false;
    return HEX_DIRECTIONS.some(d => (playerPos.q + d.q === q && playerPos.r + d.r === r));
  }, [playerPos, q, r, gameState]);

  // Brightened core colors
  const colors = {
    [Ownership.NEUTRAL]: '#334155', // Lighter slate
    [Ownership.PLAYER]: '#0e7490', // Lighter teal
    [Ownership.ENEMY]: '#7f1d1d', // Slightly brighter red
  };

  // High-contrast cap colors
  const capColors = {
    [Ownership.NEUTRAL]: '#475569',
    [Ownership.PLAYER]: '#22d3ee',
    [Ownership.ENEMY]: '#fb7185',
  };

  useFrame((state, delta) => {
    if (meshRef.current) {
      const targetScale = isHovered ? 1.05 : clickScale;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 15);
      if (clickScale > 1) setClickScale(prev => Math.max(1, prev - delta * 2));
    }
  });

  const handleInteraction = () => {
    if (gameState !== GameState.PLAYER_TURN) return;
    movePlayer({ q, r });
    setClickScale(1.1);
  };

  return (
    <group position={position}>
      <group ref={meshRef}>
        <mesh 
          visible={false}
          onPointerDown={(e) => { e.stopPropagation(); handleInteraction(); }}
          onPointerOver={() => isValidMove && setIsHovered(true)}
          onPointerOut={() => setIsHovered(false)}
        >
          <cylinderGeometry args={[1, 1, 0.5, 6]} />
        </mesh>

        <mesh rotation={[0, Math.PI / 6, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[0.96, 0.96, 0.22, 6]} />
          <meshStandardMaterial color={colors[owner]} roughness={0.3} metalness={0.7} />
        </mesh>
        
        <mesh position={[0, 0.11, 0]} rotation={[0, Math.PI / 6, 0]} receiveShadow>
          <cylinderGeometry args={[0.9, 0.9, 0.02, 6]} />
          <meshStandardMaterial 
            color={capColors[owner]} 
            emissive={capColors[owner]} 
            emissiveIntensity={owner === Ownership.NEUTRAL ? 0.2 : 1.2} 
          />
        </mesh>
      </group>
      
      {isValidMove && <MoveIndicator />}
      {type === CellType.BASE && <BaseStructure owner={owner} />}

      {type === CellType.ROCK && (
        <mesh position={[0, 0.4, 0]} castShadow>
          <dodecahedronGeometry args={[0.4]} />
          <meshStandardMaterial color="#64748b" roughness={0.1} metalness={0.9} emissive="#22d3ee" emissiveIntensity={0.15} />
        </mesh>
      )}
    </group>
  );
};

export default HexCell;
