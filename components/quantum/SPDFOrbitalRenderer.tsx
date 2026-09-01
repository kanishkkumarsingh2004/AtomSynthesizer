'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { QuantumAtomStructure } from '../../chemistry/core/QuantumShellEngine';

interface SPDFOrbitalRendererProps {
  quantumData: QuantumAtomStructure;
  selectedSubshellFilter?: 'ALL' | 's' | 'p' | 'd' | 'f';
}

export const SPDFOrbitalRenderer: React.FC<SPDFOrbitalRendererProps> = ({
  quantumData,
  selectedSubshellFilter = 'ALL'
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  // Slow orbital rotation
  useFrame((_, delta) => {
    timeRef.current += delta;
    if (groupRef.current) {
      groupRef.current.rotation.y = timeRef.current * 0.25;
    }
  });

  // Extract filled subshells (e.g. 1s, 2s, 2p, 3s, 3p, 3d, 4f)
  const activeSubshells = useMemo(() => {
    const list: { name: string; n: number; type: 's' | 'p' | 'd' | 'f'; count: number }[] = [];
    for (const shell of quantumData.shells) {
      for (const sub of shell.subshells) {
        if (selectedSubshellFilter === 'ALL' || selectedSubshellFilter === sub.subshell) {
          list.push({
            name: `${shell.n}${sub.subshell}`,
            n: shell.n,
            type: sub.subshell,
            count: sub.count
          });
        }
      }
    }
    return list;
  }, [quantumData, selectedSubshellFilter]);

  // Construct 3D geometries for p_x, p_y, p_z dumbbell lobes
  const pLobeGeometry = useMemo(() => {
    const geom = new THREE.SphereGeometry(0.55, 32, 32);
    geom.scale(0.7, 1.6, 0.7); // Stretch along Y into dumbbell lobe
    geom.translate(0, 0.8, 0); // Offset along axis so node is at origin (0,0,0)
    return geom;
  }, []);

  // Construct 3D geometries for d_xy, d_xz, d_yz, d_x2y2 cloverleaf lobes
  const dLobeGeometry = useMemo(() => {
    const geom = new THREE.SphereGeometry(0.45, 32, 32);
    geom.scale(0.65, 1.4, 0.65);
    geom.translate(0, 0.7, 0);
    return geom;
  }, []);

  return (
    <group ref={groupRef}>
      {/* Central Nucleus */}
      <mesh>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.2} metalness={0.8} />
      </mesh>

      {activeSubshells.map((sub, idx) => {
        const baseRadius = sub.n * 0.75;

        return (
          <group key={`${sub.name}-${idx}`}>
            {/* s-Orbital: Spherical Shell (l=0) - Solid Blue */}
            {sub.type === 's' && (
              <mesh>
                <sphereGeometry args={[baseRadius * 0.65, 32, 32]} />
                <meshStandardMaterial
                  color="#3b82f6"
                  transparent
                  opacity={0.35}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )}

            {/* p-Orbitals: Dumbbells px, py, pz (l=1) - Both directions SAME Magenta/Pink color */}
            {sub.type === 'p' && (
              <group scale={[baseRadius * 0.6, baseRadius * 0.6, baseRadius * 0.6]}>
                {/* p_z orbital (vertical Z) */}
                <group rotation={[0, 0, 0]}>
                  <mesh geometry={pLobeGeometry}>
                    <meshStandardMaterial color="#ec4899" transparent opacity={0.65} side={THREE.DoubleSide} />
                  </mesh>
                  <mesh geometry={pLobeGeometry} rotation={[Math.PI, 0, 0]}>
                    <meshStandardMaterial color="#ec4899" transparent opacity={0.65} side={THREE.DoubleSide} />
                  </mesh>
                </group>

                {/* p_x orbital (horizontal X) */}
                <group rotation={[0, 0, Math.PI / 2]}>
                  <mesh geometry={pLobeGeometry}>
                    <meshStandardMaterial color="#ec4899" transparent opacity={0.65} side={THREE.DoubleSide} />
                  </mesh>
                  <mesh geometry={pLobeGeometry} rotation={[Math.PI, 0, 0]}>
                    <meshStandardMaterial color="#ec4899" transparent opacity={0.65} side={THREE.DoubleSide} />
                  </mesh>
                </group>

                {/* p_y orbital (depth Y) */}
                <group rotation={[Math.PI / 2, 0, 0]}>
                  <mesh geometry={pLobeGeometry}>
                    <meshStandardMaterial color="#ec4899" transparent opacity={0.65} side={THREE.DoubleSide} />
                  </mesh>
                  <mesh geometry={pLobeGeometry} rotation={[Math.PI, 0, 0]}>
                    <meshStandardMaterial color="#ec4899" transparent opacity={0.65} side={THREE.DoubleSide} />
                  </mesh>
                </group>
              </group>
            )}

            {/* d-Orbitals: 4-lobed Cloverleafs & d_z2 Donut (l=2) - All lobes SAME Purple color */}
            {sub.type === 'd' && (
              <group scale={[baseRadius * 0.75, baseRadius * 0.75, baseRadius * 0.75]}>
                {/* d_z2: Dumbbell + Torus Donut */}
                <group>
                  <mesh geometry={pLobeGeometry}>
                    <meshStandardMaterial color="#a855f7" transparent opacity={0.7} side={THREE.DoubleSide} />
                  </mesh>
                  <mesh geometry={pLobeGeometry} rotation={[Math.PI, 0, 0]}>
                    <meshStandardMaterial color="#a855f7" transparent opacity={0.7} side={THREE.DoubleSide} />
                  </mesh>
                  {/* Equatorial Donut Ring */}
                  <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[0.5, 0.15, 16, 32]} />
                    <meshStandardMaterial color="#a855f7" transparent opacity={0.7} side={THREE.DoubleSide} />
                  </mesh>
                </group>

                {/* d_x2-y2: 4-Lobed Cloverleaf along X & Y axes */}
                <group rotation={[0, Math.PI / 4, 0]}>
                  {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((rotAngle, i) => (
                    <group key={i} rotation={[0, 0, rotAngle]}>
                      <mesh geometry={dLobeGeometry}>
                        <meshStandardMaterial
                          color="#a855f7"
                          transparent
                          opacity={0.65}
                          side={THREE.DoubleSide}
                        />
                      </mesh>
                    </group>
                  ))}
                </group>
              </group>
            )}

            {/* f-Orbitals: 8-Lobed Quantum Spherical Harmonics (l=3) - All lobes SAME Emerald Green color */}
            {sub.type === 'f' && (
              <group scale={[baseRadius * 0.85, baseRadius * 0.85, baseRadius * 0.85]}>
                {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((rotY, i) => (
                  <group key={i} rotation={[0, rotY, Math.PI / 4]}>
                    <mesh geometry={dLobeGeometry}>
                      <meshStandardMaterial color="#10b981" transparent opacity={0.6} side={THREE.DoubleSide} />
                    </mesh>
                    <mesh geometry={dLobeGeometry} rotation={[Math.PI, 0, 0]}>
                      <meshStandardMaterial color="#10b981" transparent opacity={0.6} side={THREE.DoubleSide} />
                    </mesh>
                  </group>
                ))}
              </group>
            )}
          </group>
        );
      })}
    </group>
  );
};
