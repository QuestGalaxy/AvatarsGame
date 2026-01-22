
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CHARACTERS } from '../store';

interface DragonMeshProps {
  characterId: string;
  isMoving?: boolean;
}

const DragonMesh: React.FC<DragonMeshProps> = ({ characterId, isMoving }) => {
  const char = CHARACTERS.find(c => c.id === characterId) || CHARACTERS[0];
  const wingsRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const bodyMaterialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Breathing emissive pulse
    if (bodyMaterialRef.current) {
      const pulse = 0.2 + Math.sin(time * 2) * 0.15;
      bodyMaterialRef.current.emissiveIntensity = pulse;
    }

    if (wingsRef.current) {
      const flapSpeed = isMoving ? 25 : 6;
      const flapRange = isMoving ? 0.6 : 0.2;

      wingsRef.current.children.forEach((wing, i) => {
        if (characterId === 'amber') {
          wing.position.y = Math.sin(time * 4 + i) * 0.1;
          wing.rotation.z = (i === 0 ? 1 : -1) * (Math.sin(time * 2) * 0.1 + 0.5);
        } else {
          wing.rotation.z = (i === 0 ? 1 : -1) * (Math.sin(time * flapSpeed) * flapRange + 0.3);
        }
      });
    }
  });

  return (
    <group ref={bodyRef}>
      {/* --- BODY --- */}
      <mesh castShadow>
        {characterId === 'emerald' && <capsuleGeometry args={[0.25, 0.6, 4, 12]} />}
        {characterId === 'ruby' && <boxGeometry args={[0.6, 0.6, 0.7]} />}
        {characterId === 'sapphire' && <capsuleGeometry args={[0.2, 0.8, 4, 12]} />}
        {characterId === 'amber' && <sphereGeometry args={[0.35, 16, 16]} />}
        <meshStandardMaterial 
          ref={bodyMaterialRef} 
          color={char.color} 
          roughness={0.4} 
          metalness={0.2} 
          emissive={char.color} 
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* --- EYES --- */}
      <group position={[0, 0.2, 0.25]}>
        <mesh position={[-0.12, 0.1, 0]}>
          <sphereGeometry args={[0.08]} />
          <meshBasicMaterial color="white" />
        </mesh>
        <mesh position={[0.12, 0.1, 0]}>
          <sphereGeometry args={[0.08]} />
          <meshBasicMaterial color="white" />
        </mesh>
        <mesh position={[-0.12, 0.1, 0.04]}>
          <sphereGeometry args={[0.04]} />
          <meshBasicMaterial color="black" />
        </mesh>
        <mesh position={[0.12, 0.1, 0.04]}>
          <sphereGeometry args={[0.04]} />
          <meshBasicMaterial color="black" />
        </mesh>
      </group>

      {/* --- HEAD FEATURES (Horns/Spikes) --- */}
      {characterId === 'emerald' && (
        <group position={[0, 0.4, 0]}>
          <mesh position={[-0.15, 0.1, 0]} rotation={[0, 0, -0.4]}>
            <cylinderGeometry args={[0.02, 0.02, 0.3]} />
            <meshStandardMaterial color={char.secondaryColor} />
          </mesh>
          <mesh position={[0.15, 0.1, 0]} rotation={[0, 0, 0.4]}>
            <cylinderGeometry args={[0.02, 0.02, 0.3]} />
            <meshStandardMaterial color={char.secondaryColor} />
          </mesh>
        </group>
      )}

      {characterId === 'ruby' && (
        <group position={[0, 0.3, 0]}>
          <mesh position={[-0.2, 0.1, 0]} rotation={[0, 0, -0.8]}>
            <torusGeometry args={[0.15, 0.05, 8, 16, Math.PI]} />
            <meshStandardMaterial color={char.secondaryColor} />
          </mesh>
          <mesh position={[0.2, 0.1, 0]} rotation={[0, 0, 0.8]}>
            <torusGeometry args={[0.15, 0.05, 8, 16, Math.PI]} />
            <meshStandardMaterial color={char.secondaryColor} />
          </mesh>
        </group>
      )}

      {characterId === 'sapphire' && (
        <mesh position={[0, 0.35, -0.1]} rotation={[-0.5, 0, 0]}>
          <boxGeometry args={[0.05, 0.25, 0.3]} />
          <meshStandardMaterial color={char.secondaryColor} />
        </mesh>
      )}

      {characterId === 'amber' && (
        <group position={[0, 0.3, 0]}>
          {[0, 1, 2, 3, 4].map(i => (
            <mesh key={i} rotation={[0, (i * Math.PI * 2) / 5, 0.5]} position={[0, 0.1, 0]}>
              <coneGeometry args={[0.04, 0.2, 4]} />
              <meshStandardMaterial color={char.secondaryColor} emissive={char.secondaryColor} emissiveIntensity={2} />
            </mesh>
          ))}
        </group>
      )}

      {/* --- WINGS --- */}
      <group ref={wingsRef} position={[0, 0.1, 0]}>
        {/* Left Wing */}
        <group position={[-0.3, 0, 0]}>
           {characterId === 'emerald' && (
             <mesh rotation={[0, 0, Math.PI/2]} position={[-0.2, 0, 0]} castShadow>
               <capsuleGeometry args={[0.15, 0.4, 4, 8]} />
               <meshStandardMaterial color={char.trailColor} transparent opacity={0.8} />
             </mesh>
           )}
           {characterId === 'ruby' && (
             <mesh position={[-0.3, 0, 0]} castShadow>
               <boxGeometry args={[0.6, 0.05, 0.4]} />
               <meshStandardMaterial color={char.secondaryColor} />
             </mesh>
           )}
           {characterId === 'sapphire' && (
             <mesh rotation={[0, 0.4, 0]} position={[-0.3, 0, 0]} castShadow>
               <sphereGeometry args={[0.4, 16, 16]} scale={[1, 0.02, 0.5]} />
               <meshStandardMaterial color={char.trailColor} transparent opacity={0.6} />
             </mesh>
           )}
           {characterId === 'amber' && (
             <mesh position={[-0.4, 0.2, 0]} rotation={[0.5, 0, 0]} castShadow>
               <octahedronGeometry args={[0.15]} />
               <meshStandardMaterial color={char.trailColor} emissive={char.trailColor} emissiveIntensity={1} />
             </mesh>
           )}
        </group>
        {/* Right Wing */}
        <group position={[0.3, 0, 0]}>
           {characterId === 'emerald' && (
             <mesh rotation={[0, 0, -Math.PI/2]} position={[0.2, 0, 0]} castShadow>
               <capsuleGeometry args={[0.15, 0.4, 4, 8]} />
               <meshStandardMaterial color={char.trailColor} transparent opacity={0.8} />
             </mesh>
           )}
           {characterId === 'ruby' && (
             <mesh position={[0.3, 0, 0]} castShadow>
               <boxGeometry args={[0.6, 0.05, 0.4]} />
               <meshStandardMaterial color={char.secondaryColor} />
             </mesh>
           )}
           {characterId === 'sapphire' && (
             <mesh rotation={[0, -0.4, 0]} position={[0.3, 0, 0]} castShadow>
               <sphereGeometry args={[0.4, 16, 16]} scale={[1, 0.02, 0.5]} />
               <meshStandardMaterial color={char.trailColor} transparent opacity={0.6} />
             </mesh>
           )}
           {characterId === 'amber' && (
             <mesh position={[0.4, 0.2, 0]} rotation={[0.5, 0, 0]} castShadow>
               <octahedronGeometry args={[0.15]} />
               <meshStandardMaterial color={char.trailColor} emissive={char.trailColor} emissiveIntensity={1} />
             </mesh>
           )}
        </group>
      </group>

      {/* --- TAIL --- */}
      <group position={[0, -0.1, -0.3]} rotation={[Math.PI / 4, 0, 0]}>
        {characterId === 'emerald' && (
           <mesh position={[0, -0.1, 0]} castShadow>
             <cylinderGeometry args={[0.05, 0.1, 0.6]} />
             <meshStandardMaterial color={char.color} />
           </mesh>
        )}
        {characterId === 'ruby' && (
           <mesh position={[0, -0.1, 0]} castShadow>
             <coneGeometry args={[0.2, 0.5, 4]} />
             <meshStandardMaterial color={char.secondaryColor} />
           </mesh>
        )}
        {characterId === 'sapphire' && (
           <mesh position={[0, -0.1, 0]} rotation={[0, 0, Math.PI/2]} castShadow>
             <sphereGeometry args={[0.25, 16, 16]} scale={[1, 0.1, 0.5]} />
             <meshStandardMaterial color={char.color} />
           </mesh>
        )}
        {characterId === 'amber' && (
           <mesh position={[0, -0.1, 0]} castShadow>
             <octahedronGeometry args={[0.1]} />
             <meshStandardMaterial color={char.color} />
           </mesh>
        )}
      </group>
    </group>
  );
};

export default DragonMesh;
