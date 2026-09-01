'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Bond } from '../../domain/molecular/Bond';
import { Atom } from '../../domain/molecular/Atom';
import { useSelectionStore } from '../../stores/selectionStore';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import { useMoleculeStore } from '../../stores/moleculeStore';
import { distance, midpoint, subtract, normalize } from '../../lib/math';

interface BondRendererProps {
  bond: Bond;
  atomA: Atom;
  atomB: Atom;
}

export const BondRenderer: React.FC<BondRendererProps> = ({ bond, atomA, atomB }) => {
  const selectedBondIds = useSelectionStore((state) => state.selectedBondIds);
  const hoveredBondId = useSelectionStore((state) => state.hoveredBondId);
  const selectBond = useSelectionStore((state) => state.selectBond);
  const setHoveredBond = useSelectionStore((state) => state.setHoveredBond);
  const activeTool = useWorkspaceStore((state) => state.activeTool);
  const bondThickness = useWorkspaceStore((state) => state.bondThickness);
  const renderingMode = useWorkspaceStore((state) => state.renderingMode);

  const isSelected = selectedBondIds.includes(bond.id);
  const isHovered = hoveredBondId === bond.id;

  const { pos, rot, len } = useMemo(() => {
    const pA = new THREE.Vector3(atomA.position.x, atomA.position.y, atomA.position.z);
    const pB = new THREE.Vector3(atomB.position.x, atomB.position.y, atomB.position.z);

    const mid = new THREE.Vector3().addVectors(pA, pB).multiplyScalar(0.5);
    const bondVec = new THREE.Vector3().subVectors(pB, pA);
    const length = bondVec.length();

    const orientation = new THREE.Matrix4();
    const up = new THREE.Vector3(0, 1, 0);
    const direction = bondVec.clone().normalize();

    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(up, direction);
    const euler = new THREE.Euler().setFromQuaternion(quaternion);

    return { pos: [mid.x, mid.y, mid.z] as [number, number, number], rot: [euler.x, euler.y, euler.z] as [number, number, number], len: length };
  }, [atomA.position, atomB.position]);

  const radius = bondThickness * (renderingMode === 'SPACE_FILLING' ? 0.5 : 1.0);

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (activeTool === 'delete') {
      useMoleculeStore.getState().deleteSelection([], [bond.id]);
      return;
    }
    selectBond(bond.id, e.shiftKey || e.ctrlKey);
  };

  const isDouble = bond.order === 2;
  const isTriple = bond.order === 3;

  if (renderingMode === 'SPACE_FILLING') {
    return null; // Bonds hidden in space-filling mode
  }

  // Render multiple cylinders for double/triple bonds
  const offsets = isDouble ? [-0.12, 0.12] : isTriple ? [-0.18, 0, 0.18] : [0];

  return (
    <group position={pos} rotation={rot}>
      {offsets.map((offset, idx) => (
        <mesh
          key={idx}
          position={[offset, 0, 0]}
          onClick={handleClick}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHoveredBond(bond.id);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            setHoveredBond(null);
          }}
          userData={{ entityId: bond.id, entityType: 'bond' }}
        >
          <cylinderGeometry args={[radius, radius, len, 16]} />
          <meshStandardMaterial
            color="#A0A0A0"
            roughness={0.3}
            wireframe={renderingMode === 'WIREFRAME'}
            emissive={isSelected ? '#3b82f6' : isHovered ? '#60a5fa' : '#000000'}
            emissiveIntensity={isSelected ? 0.4 : isHovered ? 0.2 : 0}
          />
        </mesh>
      ))}
    </group>
  );
};
