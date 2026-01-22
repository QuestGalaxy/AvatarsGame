
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore, CHARACTERS } from '../store';
import { hexToWorld } from '../utils/hexMath';
import * as THREE from 'three';
import { Vector3, Group } from 'three';
import { Sparkles } from '@react-three/drei';
import DragonMesh from './DragonMesh';
import { Ownership } from '../types';

interface UnitProps {
  owner: Ownership;
}

const Unit: React.FC<UnitProps> = ({ owner }) => {
  const { playerPos, enemyPos, selectedCharacterId } = useGameStore();
  const groupRef = useRef<Group>(null);

  const char = useMemo(() => {
    if (owner === Ownership.PLAYER) return CHARACTERS.find(c => c.id === selectedCharacterId) || CHARACTERS[0];
    return CHARACTERS[1]; // Enemy uses Ruby/Red
  }, [selectedCharacterId, owner]);

  const targetCoord = owner === Ownership.PLAYER ? playerPos : enemyPos;

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const [x, , z] = hexToWorld(targetCoord.q, targetCoord.r);
    const targetVec = new Vector3(x, 0.4, z);
    groupRef.current.position.lerp(targetVec, delta * 8);
    groupRef.current.position.y = 0.4 + Math.sin(state.clock.elapsedTime * 3) * 0.05;
  });

  return (
    <group ref={groupRef}>
      <group position={[0, 0, -0.4]}>
        <Sparkles count={10} scale={0.5} size={2} speed={1} color={char.trailColor} />
      </group>
      <DragonMesh characterId={char.id} isMoving={false} />
    </group>
  );
};

const Dragon: React.FC = () => {
  return (
    <group>
      <Unit owner={Ownership.PLAYER} />
      <Unit owner={Ownership.ENEMY} />
    </group>
  );
};

export default Dragon;
