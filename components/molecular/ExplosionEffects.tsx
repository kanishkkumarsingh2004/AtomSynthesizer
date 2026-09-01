'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Vector3D } from '../../domain/molecular/MolecularTypes';

interface ExplosionEffectsProps {
  active: boolean;
  origin: Vector3D;
  onComplete?: () => void;
}

export const ExplosionEffects: React.FC<ExplosionEffectsProps> = ({ active, origin, onComplete }) => {
  const meshRef = useRef<THREE.Group>(null);
  const scaleRef = useRef(0.1);
  const opacityRef = useRef(1.0);

  useFrame((_, delta) => {
    if (!active || !meshRef.current) return;

    scaleRef.current += delta * 15.0;
    opacityRef.current -= delta * 1.5;

    meshRef.current.scale.set(scaleRef.current, scaleRef.current, scaleRef.current);

    if (opacityRef.current <= 0) {
      scaleRef.current = 0.1;
      opacityRef.current = 1.0;
      if (onComplete) onComplete();
    }
  });

  if (!active) return null;

  return (
    <group ref={meshRef} position={[origin.x, origin.y, origin.z]}>
      {/* Central Flash Sphere */}
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshBasicMaterial
          color="#ff7700"
          transparent
          opacity={opacityRef.current}
        />
      </mesh>

      {/* Expanding Shockwave Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.4, 0.6, 32]} />
        <meshBasicMaterial
          color="#ffcc00"
          side={THREE.DoubleSide}
          transparent
          opacity={opacityRef.current * 0.8}
        />
      </mesh>
    </group>
  );
};
