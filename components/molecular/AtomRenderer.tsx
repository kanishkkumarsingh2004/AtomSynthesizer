'use client';

import React, { useMemo, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Atom } from '../../domain/molecular/Atom';
import { ElementRepository } from '../../domain/elements/ElementRepository';
import { useSelectionStore } from '../../stores/selectionStore';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import { useMoleculeStore } from '../../stores/moleculeStore';
import { Vector3D } from '../../domain/molecular/MolecularTypes';
import { AutoBondEngine } from '../../chemistry/core/AutoBondEngine';

interface AtomRendererProps {
  atom: Atom;
}

export const AtomRenderer: React.FC<AtomRendererProps> = ({ atom }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera, raycaster } = useThree();
  const [isDragging, setIsDragging] = useState(false);
  const initialPosRef = useRef<Vector3D>({ ...atom.position });
  const dragPlaneRef = useRef<THREE.Plane>(new THREE.Plane());

  const selectedAtomIds = useSelectionStore((state) => state.selectedAtomIds);
  const hoveredAtomId = useSelectionStore((state) => state.hoveredAtomId);
  const selectAtom = useSelectionStore((state) => state.selectAtom);
  const setHoveredAtom = useSelectionStore((state) => state.setHoveredAtom);
  const activeTool = useWorkspaceStore((state) => state.activeTool);
  const renderingMode = useWorkspaceStore((state) => state.renderingMode);
  const atomScale = useWorkspaceStore((state) => state.atomScale);
  const autoBondingEnabled = useWorkspaceStore((state) => state.autoBondingEnabled);

  const isSelected = selectedAtomIds.includes(atom.id);
  const isHovered = hoveredAtomId === atom.id;

  const elDef = useMemo(
    () => ElementRepository.getByAtomicNumber(atom.atomicNumber),
    [atom.atomicNumber]
  );

  const radius = useMemo(() => {
    if (!elDef) return 0.5;
    if (renderingMode === 'SPACE_FILLING') {
      return elDef.vanDerWaalsRadius * atomScale * 0.7;
    }
    if (renderingMode === 'STICK' || renderingMode === 'WIREFRAME') {
      return 0.25 * atomScale;
    }
    return Math.max(0.35, elDef.covalentRadius * 0.65) * atomScale;
  }, [elDef, renderingMode, atomScale]);

  const color = elDef ? elDef.defaultColor : '#CCCCCC';

  // Handle direct 3D drag movement
  const handlePointerDown = (e: any) => {
    e.stopPropagation();

    if (activeTool === 'delete') {
      useMoleculeStore.getState().deleteSelection([atom.id], []);
      return;
    }

    if (activeTool === 'create_bond') {
      if (selectedAtomIds.length === 1 && selectedAtomIds[0] !== atom.id) {
        useMoleculeStore.getState().createBond(selectedAtomIds[0], atom.id, 1, 'SINGLE');
        selectAtom(atom.id, false);
        return;
      }
    }

    selectAtom(atom.id, e.shiftKey || e.ctrlKey);

    if (activeTool === 'move' || activeTool === 'select') {
      setIsDragging(true);
      initialPosRef.current = { ...atom.position };

      // Set drag plane parallel to camera at atom depth
      const atomVec = new THREE.Vector3(atom.position.x, atom.position.y, atom.position.z);
      const normal = camera.getWorldDirection(new THREE.Vector3()).negate();
      dragPlaneRef.current.setFromNormalAndCoplanarPoint(normal, atomVec);

      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    }
  };

  const handlePointerMove = (e: any) => {
    if (!isDragging) return;
    e.stopPropagation();

    const intersectPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(dragPlaneRef.current, intersectPoint);

    if (intersectPoint) {
      const newPos: Vector3D = {
        x: Math.round(intersectPoint.x * 100) / 100,
        y: Math.round(intersectPoint.y * 100) / 100,
        z: Math.round(intersectPoint.z * 100) / 100
      };

      // Directly update position for smooth live dragging
      const moleculeStore = useMoleculeStore.getState();
      const currentMol = moleculeStore.molecule;
      const updatedAtoms = currentMol.atoms.map((a) =>
        a.id === atom.id ? { ...a, position: newPos } : a
      );

      let newMol: typeof currentMol = { ...currentMol, atoms: updatedAtoms };

      if (autoBondingEnabled) {
        const autoRes = AutoBondEngine.autoBondMolecule(newMol, {
          toleranceRatio: 1.3,
          autoBreakDistantBonds: true
        });
        newMol = autoRes.updatedMolecule;
      }

      moleculeStore.setMolecule(newMol);
    }
  };

  const handlePointerUp = (e: any) => {
    if (isDragging) {
      e.stopPropagation();
      setIsDragging(false);
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    }
  };

  return (
    <mesh
      ref={meshRef}
      position={[atom.position.x, atom.position.y, atom.position.z]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHoveredAtom(atom.id);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHoveredAtom(null);
      }}
      userData={{ entityId: atom.id, entityType: 'atom' }}
    >
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial
        color={color}
        roughness={0.2}
        metalness={0.1}
        wireframe={renderingMode === 'WIREFRAME'}
        emissive={isSelected ? '#3b82f6' : isHovered ? '#60a5fa' : isDragging ? '#fbbf24' : '#000000'}
        emissiveIntensity={isSelected ? 0.4 : isHovered || isDragging ? 0.25 : 0}
      />
    </mesh>
  );
};
