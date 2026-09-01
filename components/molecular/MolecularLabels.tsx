'use client';

import React from 'react';
import { Html } from '@react-three/drei';
import { Molecule } from '../../domain/molecular/Molecule';
import { ElementRepository } from '../../domain/elements/ElementRepository';
import { useWorkspaceStore } from '../../stores/workspaceStore';

interface MolecularLabelsProps {
  molecule: Molecule;
}

export const MolecularLabels: React.FC<MolecularLabelsProps> = ({ molecule }) => {
  const showLabels = useWorkspaceStore((state) => state.showLabels);

  if (!showLabels) return null;

  return (
    <group>
      {molecule.atoms.map((atom) => {
        const elDef = ElementRepository.getByAtomicNumber(atom.atomicNumber);
        const symbol = elDef ? elDef.symbol : `E${atom.atomicNumber}`;
        const chargeStr =
          atom.formalCharge > 0
            ? `+${atom.formalCharge}`
            : atom.formalCharge < 0
            ? `${atom.formalCharge}`
            : '';

        return (
          <group key={atom.id} position={[atom.position.x, atom.position.y + 0.6, atom.position.z]}>
            <Html center distanceFactor={12}>
              <div className="pointer-events-none select-none rounded bg-black/75 px-1.5 py-0.5 text-xs font-mono font-semibold text-white backdrop-blur-sm shadow border border-white/10 flex items-center gap-0.5">
                <span>{symbol}</span>
                {chargeStr && (
                  <sup className="text-[10px] text-amber-400 font-bold">{chargeStr}</sup>
                )}
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
};
