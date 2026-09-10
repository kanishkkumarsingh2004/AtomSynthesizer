'use client';

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Molecule } from '../../domain/molecular/Molecule';
import { SchrodingerOrbitalEngine } from '../../chemistry/core/SchrodingerOrbitalEngine';

interface ElectronCloudRendererProps {
  molecule: Molecule;
}

// Create glowing soft radial particle texture procedurally
function createGlowParticleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    gradient.addColorStop(0.25, 'rgba(255, 180, 40, 0.95)');
    gradient.addColorStop(0.55, 'rgba(255, 60, 10, 0.6)');
    gradient.addColorStop(0.85, 'rgba(180, 15, 0, 0.2)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export const ElectronCloudRenderer: React.FC<ElectronCloudRendererProps> = ({ molecule }) => {
  const pointsRef = useRef<THREE.Points>(null);

  const particleTexture = useMemo(() => createGlowParticleTexture(), []);

  // Compute exact static Schrödinger wavefunction probability density cloud points (|Psi_{n,l,m}|^2)
  const { positions, colors } = useMemo(() => {
    return SchrodingerOrbitalEngine.sampleMolecularCloud(molecule, 32000);
  }, [molecule]);

  return (
    <group>
      {/* 1. Clean Glowing Core Nuclei (Bright atomic centers) */}
      {molecule.atoms.map((atom) => {
        const isHydrogen = atom.atomicNumber === 1;
        const isCarbon = atom.atomicNumber === 6;
        const coreColor = isHydrogen ? '#FFFFFF' : isCarbon ? '#FF8800' : '#FF3300';
        const emissiveColor = isHydrogen ? '#FFF59D' : isCarbon ? '#FF4400' : '#E65100';

        return (
          <mesh key={`cloud_nuc_${atom.id}`} position={[atom.position.x, atom.position.y, atom.position.z]}>
            <sphereGeometry args={[isHydrogen ? 0.07 : 0.1, 24, 24]} />
            <meshStandardMaterial
              color={coreColor}
              emissive={emissiveColor}
              emissiveIntensity={3.0}
              roughness={0.1}
              metalness={0.9}
            />
          </mesh>
        );
      })}

      {/* 2. Pure Static Schrödinger Wavefunction Quantum Orbital Point Cloud Field */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.11}
          vertexColors
          map={particleTexture}
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
    </group>
  );
};
