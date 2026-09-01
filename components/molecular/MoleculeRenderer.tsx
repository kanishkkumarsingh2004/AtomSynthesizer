'use client';

import React from 'react';
import { Molecule } from '../../domain/molecular/Molecule';
import { AtomRenderer } from './AtomRenderer';
import { BondRenderer } from './BondRenderer';
import { MolecularLabels } from './MolecularLabels';

interface MoleculeRendererProps {
  molecule: Molecule;
}

export const MoleculeRenderer: React.FC<MoleculeRendererProps> = ({ molecule }) => {
  const atomMap = new Map(molecule.atoms.map((a) => [a.id, a]));

  return (
    <group>
      {/* Render Bonds */}
      {molecule.bonds.map((bond) => {
        const atomA = atomMap.get(bond.atomA);
        const atomB = atomMap.get(bond.atomB);
        if (!atomA || !atomB) return null;
        return <BondRenderer key={bond.id} bond={bond} atomA={atomA} atomB={atomB} />;
      })}

      {/* Render Atoms */}
      {molecule.atoms.map((atom) => (
        <AtomRenderer key={atom.id} atom={atom} />
      ))}

      {/* Render Labels */}
      <MolecularLabels molecule={molecule} />
    </group>
  );
};
