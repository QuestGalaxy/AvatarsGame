
import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore, POWERUP_MAP } from '../store';
import { CellType, Ownership, GameState, HexCoord, HEX_DIRECTIONS, PowerupKind } from '../types';
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
        <cylinderGeometry args={[0.3, 0.38, 0.6, 6]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} metalness={0.6} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.45, 0]}>
        <octahedronGeometry args={[0.18]} />
        <meshStandardMaterial color="white" emissive={color} emissiveIntensity={1.4} />
      </mesh>
      <pointLight color={color} intensity={1.4} distance={3.5} />
    </group>
  );
};

const MoveIndicator: React.FC = () => {
  const ref = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    if (!ref.current || !materialRef.current) return;
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 4.5) * 0.08;
    ref.current.scale.set(pulse, 1, pulse);
    materialRef.current.opacity = 0.2 + Math.sin(state.clock.elapsedTime * 4.5) * 0.05;
  });

  return (
    <mesh ref={ref} position={[0, 0.12, 0]} rotation={[0, Math.PI / 6, 0]}>
      <cylinderGeometry args={[0.85, 0.85, 0.06, 6]} />
      <meshStandardMaterial
        ref={materialRef}
        color="#fef9c3"
        emissive="#fde68a"
        emissiveIntensity={0.25}
        transparent
        opacity={0.2}
        roughness={0.55}
      />
    </mesh>
  );
};

const PowerupPickup: React.FC<{ kind: PowerupKind; powerupId: string }> = ({ kind, powerupId }) => {
  const ref = useRef<THREE.Group>(null);
  const color = kind === 'positive' ? '#22d3ee' : '#fb7185';

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y += 0.03;
    ref.current.position.y = 0.35 + Math.sin(state.clock.elapsedTime * 3) * 0.05;
  });

  return (
    <group ref={ref} position={[0, 0.42, 0]}>
      {powerupId === 'surge' && (
        <mesh position={[0, 0.08, 0]}>
          <octahedronGeometry args={[0.18]} />
          <meshStandardMaterial color="white" emissive={color} emissiveIntensity={3.2} roughness={0.1} />
        </mesh>
      )}
      {powerupId === 'overclock' && (
        <mesh position={[0, 0.1, 0]}>
          <coneGeometry args={[0.2, 0.32, 18]} />
          <meshStandardMaterial color="white" emissive={color} emissiveIntensity={3.0} roughness={0.12} />
        </mesh>
      )}
      {powerupId === 'aegis' && (
        <mesh position={[0, 0.09, 0]}>
          <sphereGeometry args={[0.18, 18, 18]} />
          <meshStandardMaterial color="white" emissive={color} emissiveIntensity={2.8} roughness={0.12} />
        </mesh>
      )}
      {powerupId === 'stasis' && (
        <mesh position={[0, 0.08, 0]}>
          <tetrahedronGeometry args={[0.2]} />
          <meshStandardMaterial color="#0f172a" emissive={color} emissiveIntensity={2.6} roughness={0.2} />
        </mesh>
      )}
      {powerupId === 'emp' && (
        <mesh position={[0, 0.08, 0]}>
          <dodecahedronGeometry args={[0.2]} />
          <meshStandardMaterial color="#0f172a" emissive={color} emissiveIntensity={2.8} roughness={0.2} />
        </mesh>
      )}
      {powerupId === 'corrupt' && (
        <mesh position={[0, 0.08, 0]}>
          <icosahedronGeometry args={[0.2, 0]} />
          <meshStandardMaterial color="#0b1120" emissive={color} emissiveIntensity={2.6} roughness={0.2} />
        </mesh>
      )}
      <pointLight color={color} intensity={2.2} distance={3.2} />
    </group>
  );
};

interface HexCellProps {
  q: number;
  r: number;
  type: CellType;
  owner: Ownership;
  powerupId?: string;
}

const HexCell: React.FC<HexCellProps> = ({ q, r, type, owner, powerupId }) => {
  const { movePlayer, playerPos, enemyPos, gameState } = useGameStore();
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
      {type === CellType.BASE && !(playerPos.q === q && playerPos.r === r) && !(enemyPos.q === q && enemyPos.r === r) && (
        <BaseStructure owner={owner} />
      )}

      {type === CellType.ROCK && (
        <mesh position={[0, 0.4, 0]} castShadow>
          <dodecahedronGeometry args={[0.4]} />
          <meshStandardMaterial color="#64748b" roughness={0.1} metalness={0.9} emissive="#22d3ee" emissiveIntensity={0.15} />
        </mesh>
      )}

      {powerupId && POWERUP_MAP[powerupId] && (
        <PowerupPickup kind={POWERUP_MAP[powerupId].kind} powerupId={powerupId} />
      )}
    </group>
  );
};

export default HexCell;
