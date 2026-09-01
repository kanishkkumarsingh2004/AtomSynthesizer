'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { QuantumShellEngine, QuantumAtomStructure } from '../../chemistry/core/QuantumShellEngine';
import { Vector3D } from '../../domain/molecular/MolecularTypes';

interface AtomicQuantumVisualizerProps {
  atomicNumber: number;
  position?: Vector3D;
  scale?: number;
}

export const AtomicQuantumVisualizer: React.FC<AtomicQuantumVisualizerProps> = ({
  atomicNumber,
  position = { x: 0, y: 0, z: 0 },
  scale = 1.0
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const electronsGroupRef = useRef<THREE.Group>(null);

  const quantumData: QuantumAtomStructure = QuantumShellEngine.getQuantumStructure(atomicNumber);

  // Generate nucleus nucleons (Protons = Red, Neutrons = Blue)
  const nucleons = React.useMemo(() => {
    const arr: { pos: [number, number, number]; isProton: boolean }[] = [];
    const total = Math.min(120, quantumData.protons + quantumData.neutrons);
    const numProtons = Math.min(60, quantumData.protons);

    const radius = Math.cbrt(total) * 0.18;

    for (let i = 0; i < total; i++) {
      const phi = Math.acos(1 - 2 * (i + 0.5) / total);
      const theta = Math.sqrt(total * Math.PI) * phi;
      const r = radius * (0.4 + 0.6 * Math.random());

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      arr.push({
        pos: [x, y, z],
        isProton: i < numProtons
      });
    }
    return arr;
  }, [quantumData]);

  const timeRef = useRef(0);

  // Rotate electrons on concentric orbits using delta time accumulator
  useFrame((_, delta) => {
    timeRef.current += delta;
    if (electronsGroupRef.current) {
      electronsGroupRef.current.rotation.y = timeRef.current * 0.4;
      electronsGroupRef.current.rotation.z = Math.sin(timeRef.current * 0.2) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[position.x, position.y, position.z]} scale={[scale, scale, scale]}>
      {/* Central Nucleus Cluster (Protons = Red, Neutrons = Blue) */}
      <group>
        {nucleons.map((nuc, idx) => (
          <mesh key={idx} position={nuc.pos}>
            <sphereGeometry args={[0.11, 16, 16]} />
            <meshStandardMaterial
              color={nuc.isProton ? '#ef4444' : '#2563eb'}
              roughness={0.2}
              metalness={0.4}
            />
          </mesh>
        ))}
      </group>

      {/* Orbiting Shell Rings (K, L, M, N, O, P, Q) & Electrons */}
      <group ref={electronsGroupRef}>
        {quantumData.shells.map((shell, sIdx) => {
          const orbitRadius = 0.9 + sIdx * 0.55;
          const eCount = shell.electronCount;

          return (
            <group key={shell.shellName} rotation={[sIdx * 0.15, sIdx * 0.2, 0]}>
              {/* Concentric Silver Orbit Ring */}
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[orbitRadius - 0.015, orbitRadius + 0.015, 64]} />
                <meshBasicMaterial
                  color="#94a3b8"
                  side={THREE.DoubleSide}
                  transparent
                  opacity={0.5}
                />
              </mesh>

              {/* Orbiting Green Electron Spheres */}
              {Array.from({ length: eCount }).map((_, eIdx) => {
                const angle = (eIdx / eCount) * Math.PI * 2;
                const ex = orbitRadius * Math.cos(angle);
                const ez = orbitRadius * Math.sin(angle);

                return (
                  <mesh key={eIdx} position={[ex, 0, ez]}>
                    <sphereGeometry args={[0.07, 16, 16]} />
                    <meshBasicMaterial color="#22c55e" />
                  </mesh>
                );
              })}
            </group>
          );
        })}
      </group>
    </group>
  );
};
