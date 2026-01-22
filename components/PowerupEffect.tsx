import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { PowerupKind } from '../types';

type PowerupEffectProps = {
  position: [number, number, number];
  kind: PowerupKind;
  powerupId: string;
};

const PowerupEffect: React.FC<PowerupEffectProps> = ({ position, kind, powerupId }) => {
  const ringRef = useRef<THREE.Mesh>(null);
  const columnRef = useRef<THREE.Mesh>(null);
  const smokeRef = useRef<THREE.Mesh>(null);
  const burstRef = useRef<THREE.InstancedMesh>(null);
  const startRef = useRef(0);

  const colorMap: Record<string, string> = {
    surge: '#22d3ee',
    overclock: '#38bdf8',
    aegis: '#a5f3fc',
    stasis: '#fb7185',
    emp: '#f97316',
    corrupt: '#f43f5e',
  };
  const sparkleMap: Record<string, string> = {
    surge: '#a5f3fc',
    overclock: '#bae6fd',
    aegis: '#e0f2fe',
    stasis: '#fecaca',
    emp: '#fed7aa',
    corrupt: '#fecdd3',
  };
  const color = colorMap[powerupId] || (kind === 'positive' ? '#22d3ee' : '#fb7185');
  const sparkleColor = sparkleMap[powerupId] || (kind === 'positive' ? '#a5f3fc' : '#fecaca');
  const duration = powerupId === 'emp' ? 1.3 : powerupId === 'overclock' ? 0.9 : 1.1;

  const particles = useMemo(() => {
    const count = powerupId === 'emp' ? 36 : powerupId === 'overclock' ? 26 : kind === 'positive' ? 22 : 28;
    return new Array(count).fill(0).map(() => {
      const dir = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        Math.random() * 0.9 + 0.2,
        (Math.random() - 0.5) * 2
      ).normalize();
      const speed = powerupId === 'overclock'
        ? 2.4 + Math.random() * 1.0
        : powerupId === 'emp'
          ? 3.0 + Math.random() * 1.4
          : kind === 'positive'
            ? 1.6 + Math.random() * 0.8
            : 2.0 + Math.random() * 1.1;
      return { dir, speed, spin: Math.random() * Math.PI * 2 };
    });
  }, [kind, powerupId]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!startRef.current) startRef.current = state.clock.elapsedTime;
    const t = state.clock.elapsedTime - startRef.current;
    const progress = Math.min(t / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);

    if (ringRef.current) {
      const s = 0.45 + eased * 2.6;
      ringRef.current.scale.set(s, s, s);
      const mat = ringRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity = (1 - progress) * 0.8;
    }

    if (columnRef.current) {
      const s = 0.6 + eased * 1.6;
      columnRef.current.scale.set(1, s, 1);
      const mat = columnRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity = (1 - progress) * 0.55;
    }

    if (smokeRef.current) {
      const s = 0.6 + eased * 2.0;
      smokeRef.current.scale.set(s, s, s);
      const mat = smokeRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity = (1 - progress) * 0.5;
    }

    if (burstRef.current) {
      particles.forEach((particle, i) => {
        const distance = eased * particle.speed;
        dummy.position.set(
          particle.dir.x * distance,
          particle.dir.y * distance + 0.2,
          particle.dir.z * distance
        );
        const scale = Math.max(0.1, (1 - progress) * 0.7);
        dummy.scale.set(scale, scale, scale);
        dummy.rotation.set(
          particle.spin + t * 4,
          particle.spin + t * 2,
          particle.spin + t * 3
        );
        dummy.updateMatrix();
        burstRef.current.setMatrixAt(i, dummy.matrix);
      });
      burstRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group position={position}>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.18, 0.38, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.6} transparent opacity={0.8} />
      </mesh>

      {powerupId === 'surge' && (
        <mesh ref={columnRef} position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.08, 0.24, 0.12, 16]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.4} transparent opacity={0.65} />
        </mesh>
      )}
      {powerupId === 'overclock' && (
        <mesh ref={columnRef} position={[0, 0.35, 0]}>
          <coneGeometry args={[0.2, 0.3, 20]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.6} transparent opacity={0.6} />
        </mesh>
      )}
      {powerupId === 'aegis' && (
        <mesh ref={columnRef} position={[0, 0.3, 0]}>
          <sphereGeometry args={[0.22, 18, 18]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.2} transparent opacity={0.55} />
        </mesh>
      )}
      {powerupId === 'stasis' && (
        <mesh ref={smokeRef} position={[0, 0.25, 0]}>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshStandardMaterial color="#0f172a" emissive={color} emissiveIntensity={0.7} transparent opacity={0.55} />
        </mesh>
      )}
      {powerupId === 'emp' && (
        <mesh ref={smokeRef} position={[0, 0.28, 0]}>
          <dodecahedronGeometry args={[0.26]} />
          <meshStandardMaterial color="#0b1120" emissive={color} emissiveIntensity={0.9} transparent opacity={0.6} />
        </mesh>
      )}
      {powerupId === 'corrupt' && (
        <mesh ref={smokeRef} position={[0, 0.26, 0]}>
          <icosahedronGeometry args={[0.24, 0]} />
          <meshStandardMaterial color="#0b1120" emissive={color} emissiveIntensity={0.8} transparent opacity={0.55} />
        </mesh>
      )}

      <instancedMesh ref={burstRef} args={[undefined, undefined, particles.length]}>
        <sphereGeometry args={[0.06, 10, 10]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.4} transparent opacity={0.9} />
      </instancedMesh>

      <Sparkles
        count={powerupId === 'emp' ? 40 : kind === 'positive' ? 22 : 14}
        speed={powerupId === 'overclock' ? 1.1 : kind === 'positive' ? 0.6 : 0.8}
        size={powerupId === 'emp' ? 7 : kind === 'positive' ? 4 : 6}
        opacity={0.85}
        scale={[1.8, 1.0, 1.8]}
        color={sparkleColor}
      />
    </group>
  );
};

export default PowerupEffect;
