'use client';

import React from 'react';
import { TransformControls } from '@react-three/drei';
import { useSelectionStore } from '../../stores/selectionStore';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import { useMoleculeStore } from '../../stores/moleculeStore';
import { Vector3D } from '../../domain/molecular/MolecularTypes';

export const SelectionRenderer: React.FC = () => {
  const selectedAtomIds = useSelectionStore((state) => state.selectedAtomIds);
  const activeTool = useWorkspaceStore((state) => state.activeTool);
  const molecule = useMoleculeStore((state) => state.molecule);
  const moveAtom = useMoleculeStore((state) => state.moveAtom);

  const selectedAtom =
    selectedAtomIds.length === 1
      ? molecule.atoms.find((a) => a.id === selectedAtomIds[0])
      : null;

  if (!selectedAtom || (activeTool !== 'move' && activeTool !== 'rotate')) {
    return null;
  }

  const initialPos: Vector3D = { ...selectedAtom.position };

  return (
    <TransformControls
      position={[selectedAtom.position.x, selectedAtom.position.y, selectedAtom.position.z]}
      mode={activeTool === 'move' ? 'translate' : 'rotate'}
      size={0.7}
      onMouseUp={(e: any) => {
        if (!e || !e.target || !e.target.object) return;
        const newPosVec = e.target.object.position;
        const newPos: Vector3D = {
          x: Math.round(newPosVec.x * 100) / 100,
          y: Math.round(newPosVec.y * 100) / 100,
          z: Math.round(newPosVec.z * 100) / 100
        };

        if (
          newPos.x !== initialPos.x ||
          newPos.y !== initialPos.y ||
          newPos.z !== initialPos.z
        ) {
          moveAtom(selectedAtom.id, initialPos, newPos);
        }
      }}
    />
  );
};
