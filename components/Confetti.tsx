
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Confetti: React.FC = () => {
  const count = 150;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const factor = 10 + Math.random() * 50;
      const speed = 0.01 + Math.random() / 150;
      // Start in a circle around the center
      const angle = Math.random() * Math.PI * 2;
      const radius = 2 + Math.random() * 4;
      const xFactor = Math.cos(angle) * radius;
      const zFactor = Math.sin(angle) * radius;
      const yFactor = 1 + Math.random() * 5;
      const color = new THREE.Color().setHSL(Math.random(), 0.8, 0.6);
      temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0, color });
    }
    return temp;
  }, [count]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    particles.forEach((particle, i) => {
      let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
      t = particle.t += speed;
      
      const bounce = Math.sin(t * 2) * 0.5;
      dummy.position.set(
        xFactor + Math.sin(t) * 0.5,
        yFactor + Math.cos(t * 0.5) * 2 + bounce,
        zFactor + Math.cos(t) * 0.5
      );
      
      const s = Math.max(0.2, (Math.sin(t * 4) + 1.2) * 0.1);
      dummy.scale.set(s, s, s);
      dummy.rotation.set(t * 5, t * 3, t * 2);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      meshRef.current!.setColorAt(i, particle.color);
    });
    meshRef.current!.instanceMatrix.needsUpdate = true;
    if (meshRef.current!.instanceColor) meshRef.current!.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} position={[0, 0, 0]}>
      <boxGeometry args={[0.15, 0.02, 0.15]} />
      <meshStandardMaterial roughness={0.5} metalness={0.8} />
    </instancedMesh>
  );
};

export default Confetti;
