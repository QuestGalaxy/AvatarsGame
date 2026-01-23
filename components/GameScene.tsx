
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore, WORLDS } from '../store';
import HexCell from './HexCell';
import Dragon from './Dragon';
import Confetti from './Confetti';
import PowerupEffect from './PowerupEffect';
import { GameState, CellData, PowerupKind } from '../types';
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

const GalaxyBackdrop: React.FC<{ atmosphere: 'day' | 'sunset' | 'night' }> = ({ atmosphere }) => {
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
    const palette =
      atmosphere === 'night'
        ? { color1: '#1e40af', color2: '#38bdf8', color3: '#f472b6', color4: '#a78bfa', color5: '#fbbf24', intensity: 1.2 }
        : atmosphere === 'sunset'
          ? { color1: '#f97316', color2: '#fb7185', color3: '#f472b6', color4: '#a78bfa', color5: '#facc15', intensity: 1.25 }
          : { color1: '#22d3ee', color2: '#60a5fa', color3: '#f472b6', color4: '#a78bfa', color5: '#fde047', intensity: 1.3 };

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

const GalaxyField: React.FC<{ atmosphere: WeatherType }> = ({ atmosphere }) => {
  const groupRef = useRef<THREE.Group>(null);
  const sparkleColor =
    atmosphere === 'night' ? '#fde047' : atmosphere === 'sunset' ? '#fef08a' : '#fcd34d';
  const sparkleColorB = atmosphere === 'night' ? '#a78bfa' : atmosphere === 'sunset' ? '#f472b6' : '#60a5fa';

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.012;
      groupRef.current.rotation.x += delta * 0.003;
    }
  });

  return (
    <group ref={groupRef}>
      <Sparkles count={220} speed={0.2} size={6} opacity={0.9} scale={[120, 70, 120]} color={sparkleColor} />
      <Sparkles count={160} speed={0.18} size={4.2} opacity={0.85} scale={[90, 50, 90]} color={sparkleColorB} />
      <Sparkles count={120} speed={0.12} size={3.4} opacity={0.6} scale={[70, 35, 70]} color="#ffffff" />
    </group>
  );
};

const ToyboxPlanets: React.FC = () => {
  return (
    <group>
      <group position={[-70, 36, -95]}>
        <mesh>
          <sphereGeometry args={[10, 24, 24]} />
          <meshStandardMaterial color="#f472b6" roughness={0.35} metalness={0.15} />
        </mesh>
        <mesh rotation={[Math.PI / 2.6, 0.1, 0]}>
          <torusGeometry args={[15, 1.6, 16, 64]} />
          <meshStandardMaterial color="#fde047" emissive="#fcd34d" emissiveIntensity={0.45} />
        </mesh>
        <mesh position={[16, 6, 4]}>
          <sphereGeometry args={[2.8, 18, 18]} />
          <meshStandardMaterial color="#60a5fa" emissive="#38bdf8" emissiveIntensity={0.35} />
        </mesh>
      </group>

      <group position={[80, 24, -70]}>
        <mesh>
          <sphereGeometry args={[8, 24, 24]} />
          <meshStandardMaterial color="#a78bfa" roughness={0.4} metalness={0.1} />
        </mesh>
        <mesh rotation={[Math.PI / 2.8, 0.3, 0.2]}>
          <torusGeometry args={[12, 1.2, 16, 64]} />
          <meshStandardMaterial color="#fb923c" emissive="#f97316" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[-13, 5, -6]}>
          <sphereGeometry args={[2.4, 18, 18]} />
          <meshStandardMaterial color="#facc15" emissive="#fde047" emissiveIntensity={0.4} />
        </mesh>
      </group>

      <group position={[10, 55, -120]}>
        <mesh>
          <sphereGeometry args={[12, 24, 24]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.3} metalness={0.2} />
        </mesh>
        <mesh rotation={[Math.PI / 2.2, 0.15, 0]}>
          <torusGeometry args={[18, 1.4, 16, 64]} />
          <meshStandardMaterial color="#f472b6" emissive="#f472b6" emissiveIntensity={0.35} />
        </mesh>
      </group>
    </group>
  );
};

const FloatingMeteors: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const meteors = useMemo(
    () =>
      new Array(14).fill(0).map((_, index) => {
        const radius = 28 + Math.random() * 40;
        const angle = Math.random() * Math.PI * 2;
        const height = 6 + Math.random() * 22;
        return {
          position: new THREE.Vector3(Math.cos(angle) * radius, height, Math.sin(angle) * radius),
          rotation: new THREE.Euler(Math.random(), Math.random(), Math.random()),
          drift: new THREE.Vector3((Math.random() - 0.5) * 0.4, 0, (Math.random() - 0.5) * 0.4),
          scale: 0.7 + Math.random() * 1.1,
          speed: 0.15 + Math.random() * 0.35,
          offset: Math.random() * Math.PI * 2,
          color: index % 3 === 0 ? '#fb923c' : index % 3 === 1 ? '#60a5fa' : '#f472b6',
        };
      }),
    []
  );

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child, index) => {
      const data = meteors[index];
      if (!data || !(child instanceof THREE.Mesh)) return;
      child.position.y = data.position.y + Math.sin(state.clock.elapsedTime * data.speed + data.offset) * 1.2;
      child.position.x = data.position.x + Math.cos(state.clock.elapsedTime * data.speed + data.offset) * data.drift.x * 2.2;
      child.position.z = data.position.z + Math.sin(state.clock.elapsedTime * data.speed + data.offset) * data.drift.z * 2.2;
      child.rotation.x += 0.003 + data.speed * 0.002;
      child.rotation.y += 0.004 + data.speed * 0.001;
    });
  });

  return (
    <group ref={groupRef}>
      {meteors.map((meteor, index) => (
        <mesh key={index} position={meteor.position} rotation={meteor.rotation} scale={meteor.scale}>
          <boxGeometry args={[2.2, 1.6, 2.2]} />
          <meshStandardMaterial color={meteor.color} emissive={meteor.color} emissiveIntensity={0.5} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
};

const IslandBase: React.FC<{ platformColors: { base: string; ring: string; underside: string } }> = ({ platformColors }) => {
  return (
    <group position={[0, -1.2, 0]}>
      {/* Main Base - Brightened from #020617 to #1e293b */}
      <mesh rotation={[0, Math.PI / 6, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[8.5, 7.5, 2.5, 6]} />
        <meshStandardMaterial color={platformColors.base} roughness={0.25} metalness={0.35} />
      </mesh>
      {/* Glowing Energy Ring */}
      <mesh rotation={[0, Math.PI / 6, 0]} position={[0, -0.5, 0]}>
        <cylinderGeometry args={[8.52, 8.52, 0.1, 6]} />
        <meshStandardMaterial
          color={platformColors.ring}
          emissive={platformColors.ring}
          emissiveIntensity={4}
          transparent
          opacity={0.7}
        />
      </mesh>
      {/* Underside Pedestal */}
      <mesh position={[0, -2.5, 0]} rotation={[0, Math.PI / 6, 0]} castShadow>
        <cylinderGeometry args={[7.5, 0.1, 3.5, 6]} />
        <meshStandardMaterial color={platformColors.underside} roughness={0.35} metalness={0.2} />
      </mesh>
    </group>
  );
};

const GameScene: React.FC = () => {
  const { grid, initLevel, gameState, atmosphere, lastPowerup, levelIndex, selectedWorldId } = useGameStore();
  const [effects, setEffects] = useState<{ id: number; kind: PowerupKind; powerupId: string; position: [number, number, number] }[]>([]);

  const world = WORLDS.find(w => w.id === selectedWorldId) || WORLDS[0];
  const level = world.levels[levelIndex % world.levels.length];
  const platformColors = level.platformColors || {
    base: '#1e293b',
    ring: atmosphere === 'night' ? '#0891b2' : atmosphere === 'sunset' ? '#7c3aed' : '#22d3ee',
    underside: '#0f172a',
  };

  useEffect(() => { initLevel(); }, [initLevel]);
  useEffect(() => { audio.setAmbient(atmosphere); }, [atmosphere]);

  const gridArray = useMemo(() => Object.values(grid) as CellData[], [grid]);
  const lastPowerupEventId = lastPowerup?.eventId;

  useEffect(() => {
    if (!lastPowerup || lastPowerupEventId === undefined) return;
    const [x, , z] = hexToWorld(lastPowerup.coord.q, lastPowerup.coord.r);
    const effect = {
      id: lastPowerupEventId,
      kind: lastPowerup.kind,
      powerupId: lastPowerup.id,
      position: [x, 0.1, z] as [number, number, number]
    };
    setEffects(prev => [...prev, effect]);
    const timeout = setTimeout(() => {
      setEffects(prev => prev.filter(e => e.id !== effect.id));
    }, 1200);
    return () => clearTimeout(timeout);
  }, [lastPowerup, lastPowerupEventId]);

  return (
    <Canvas 
      shadows
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, shadowMapType: THREE.PCFSoftShadowMap }}
      camera={{ position: [50, 60, 50], fov: 40 }}
    >
      <CinematicCamera />
      <color attach="background" args={[atmosphere === 'night' ? '#1e3a8a' : atmosphere === 'sunset' ? '#f97316' : '#38bdf8']} />
      <GalaxyBackdrop atmosphere={atmosphere} />
      <GalaxyField atmosphere={atmosphere} />
      <ToyboxPlanets />
      <FloatingMeteors />

      <Environment preset="night" />
      
      {/* Boosted Lighting */}
      <ambientLight intensity={1.05} />
      <directionalLight position={[20, 30, 15]} intensity={2.4} castShadow color="#ffffff" />
      <pointLight position={[-10, 15, -10]} intensity={1.8} color="#38bdf8" />
      <pointLight position={[10, -5, 10]} intensity={1.0} color="#f472b6" />
      <pointLight position={[40, 50, -80]} intensity={1.6} color="#fde047" />

      <group>
        <IslandBase platformColors={platformColors} />
        <group position={[0, -0.05, 0]}>
          {gridArray.map((cell) => (
            <HexCell 
              key={`${cell.coord.q},${cell.coord.r}`} 
              q={cell.coord.q} 
              r={cell.coord.r} 
              type={cell.type} 
              owner={cell.owner}
              powerupId={cell.powerupId}
              themeColors={platformColors}
            />
          ))}
          <Dragon />
          {effects.map(effect => (
            <PowerupEffect key={effect.id} position={effect.position} kind={effect.kind} powerupId={effect.powerupId} />
          ))}
        </group>
      </group>
      {gameState === GameState.WON && <Confetti />}
    </Canvas>
  );
};

export default GameScene;
