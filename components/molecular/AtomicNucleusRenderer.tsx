'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Molecule } from '../../domain/molecular/Molecule';
import { ElementRepository } from '../../domain/elements/ElementRepository';

interface AtomicNucleusRendererProps {
  molecule: Molecule;
}

interface NucleonParticle {
  id: string;
  type: 'proton' | 'neutron';
  pos: [number, number, number];
}

interface OrbitingElectron {
  id: string;
  atomAId: string;
  atomBId: string;
  orbitIndex: number;
  speed: number;
  phase: number;
  radius: number;
}

export const AtomicNucleusRenderer: React.FC<AtomicNucleusRendererProps> = ({ molecule }) => {
  const electronGroupRef = useRef<THREE.Group>(null);

  // Build packed nuclear cluster (Protons p+ and Neutrons n0) for every atom
  const atomicNuclei = useMemo(() => {
    const nucleiMap: { atomId: string; pos: [number, number, number]; nucleons: NucleonParticle[]; symbol: string }[] = [];

    for (const atom of molecule.atoms) {
      const z = atom.atomicNumber;
      const el = ElementRepository.getByAtomicNumber(z);
      const symbol = el?.symbol || 'X';
      const mass = Math.round(el?.atomicMass ?? z * 2);
      const protonsCount = z;
      const neutronsCount = Math.max(0, mass - z);

      const totalNucleons = protonsCount + neutronsCount;
      const nucleons: NucleonParticle[] = [];

      // Fibonacci sphere packing for sub-atomic nucleus
      const goldenRatio = (1 + Math.sqrt(5)) / 2;
      const packRadius = Math.min(0.22, 0.05 * Math.pow(totalNucleons, 1 / 3));

      let pAssigned = 0;
      let nAssigned = 0;

      for (let i = 0; i < totalNucleons; i++) {
        const theta = 2 * Math.PI * i / goldenRatio;
        const phi = Math.acos(1 - 2 * (i + 0.5) / totalNucleons);

        const r = packRadius * (0.4 + 0.6 * Math.sqrt((i + 1) / totalNucleons));
        const nx = r * Math.sin(phi) * Math.cos(theta);
        const ny = r * Math.sin(phi) * Math.sin(theta);
        const nz = r * Math.cos(phi);

        let type: 'proton' | 'neutron' = 'proton';
        if (pAssigned < protonsCount && (nAssigned >= neutronsCount || i % 2 === 0)) {
          type = 'proton';
          pAssigned++;
        } else {
          type = 'neutron';
          nAssigned++;
        }

        nucleons.push({
          id: `nuc_${atom.id}_${i}`,
          type,
          pos: [nx, ny, nz]
        });
      }

      nucleiMap.push({
        atomId: atom.id,
        pos: [atom.position.x, atom.position.y, atom.position.z],
        nucleons,
        symbol
      });
    }

    return nucleiMap;
  }, [molecule.atoms]);

  // Build orbiting valence electron paths for every bond
  const bondElectrons = useMemo(() => {
    const electrons: OrbitingElectron[] = [];
    let eIdx = 0;

    for (const bond of molecule.bonds) {
      const ePairs = bond.order; // 1 pair = 2e-, 2 pairs = 4e-, 3 pairs = 6e-
      const numElectrons = ePairs * 2;

      for (let j = 0; j < numElectrons; j++) {
        electrons.push({
          id: `e_bond_${bond.id}_${j}`,
          atomAId: bond.atomA,
          atomBId: bond.atomB,
          orbitIndex: j,
          speed: 3.5 + (j % 2) * 1.2,
          phase: (j * Math.PI) / ePairs,
          radius: 0.18 + (Math.floor(j / 2)) * 0.12
        });
      }
    }

    return electrons;
  }, [molecule.bonds]);

  // Animate orbiting valence electrons in real-time
  useFrame(({ clock }) => {
    if (!electronGroupRef.current) return;
    const time = clock.getElapsedTime();

    const atomMap = new Map(molecule.atoms.map((a) => [a.id, a]));

    electronGroupRef.current.children.forEach((child, i) => {
      const eData = bondElectrons[i];
      if (!eData) return;

      const aA = atomMap.get(eData.atomAId);
      const aB = atomMap.get(eData.atomBId);
      if (!aA || !aB) return;

      // Elliptical bond orbital trajectory between Nucleus A and Nucleus B
      const u = (Math.sin(time * eData.speed + eData.phase) + 1) / 2; // Oscillate 0..1 along bond line
      const posX = aA.position.x + u * (aB.position.x - aA.position.x);
      const posY = aA.position.y + u * (aB.position.y - aA.position.y);
      const posZ = aA.position.z + u * (aB.position.z - aA.position.z);

      // Perpendicular orbital loop expansion
      const dx = aB.position.x - aA.position.x;
      const dy = aB.position.y - aA.position.y;
      const dz = aB.position.z - aA.position.z;
      const bondLen = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (bondLen > 0.001) {
        const nx = dx / bondLen;
        const ny = dy / bondLen;
        const nz = dz / bondLen;

        const perpX = -ny;
        const perpY = nx;
        const perpZ = 0;

        const loopAngle = time * (eData.speed * 2.0) + eData.phase;
        const offX = Math.cos(loopAngle) * eData.radius * perpX;
        const offY = Math.sin(loopAngle) * eData.radius * perpY;
        const offZ = Math.sin(loopAngle * 1.5) * eData.radius;

        child.position.set(posX + offX, posY + offY, posZ + offZ);
      } else {
        child.position.set(posX, posY, posZ);
      }
    });
  });

  return (
    <group>
      {/* 1. Sub-Atomic Nuclei (Protons p+ and Neutrons n0 Clusters with u & d Quarks) */}
      {atomicNuclei.map((nuc) => (
        <group key={`nuc_grp_${nuc.atomId}`} position={nuc.pos}>
          {nuc.nucleons.map((nucParticle) => {
            const isProton = nucParticle.type === 'proton';
            // Proton: uud (2 Up + 1 Down), Neutron: udd (1 Up + 2 Down)
            const quarks: { id: string; flavor: 'u' | 'd'; pos: [number, number, number] }[] = [
              { id: `q1_${nucParticle.id}`, flavor: isProton ? 'u' : 'u', pos: [0.015, 0.015, 0] },
              { id: `q2_${nucParticle.id}`, flavor: isProton ? 'u' : 'd', pos: [-0.015, 0.015, 0] },
              { id: `q3_${nucParticle.id}`, flavor: isProton ? 'd' : 'd', pos: [0, -0.015, 0.012] }
            ];

            return (
              <group key={nucParticle.id} position={nucParticle.pos}>
                {/* Nucleon Sphere Frame */}
                <mesh>
                  <sphereGeometry args={[0.048, 16, 16]} />
                  <meshStandardMaterial
                    color={isProton ? '#EF4444' : '#0EA5E9'}
                    emissive={isProton ? '#F87171' : '#38BDF8'}
                    emissiveIntensity={0.4}
                    transparent
                    opacity={0.7}
                    roughness={0.2}
                    metalness={0.5}
                  />
                </mesh>

                {/* Sub-Nucleon Quarks (u & d) */}
                {quarks.map((q) => (
                  <mesh key={q.id} position={q.pos}>
                    <sphereGeometry args={[0.014, 12, 12]} />
                    <meshStandardMaterial
                      color={q.flavor === 'u' ? '#F59E0B' : '#3B82F6'}
                      emissive={q.flavor === 'u' ? '#FDE047' : '#60A5FA'}
                      emissiveIntensity={1.0}
                    />
                  </mesh>
                ))}
              </group>
            );
          })}
        </group>
      ))}

      {/* 2. Visible Point-Particle Valence Electrons Orbiting in Space */}
      <group ref={electronGroupRef}>
        {bondElectrons.map((eData) => (
          <mesh key={eData.id}>
            <sphereGeometry args={[0.035, 16, 16]} />
            <meshStandardMaterial
              color="#FACC15"
              emissive="#FEF08A"
              emissiveIntensity={1.0}
              roughness={0.1}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
};
