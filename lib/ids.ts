import { nanoid } from 'nanoid';
import { AtomId, BondId, MoleculeId } from '../domain/molecular/MolecularTypes';

export function generateAtomId(): AtomId {
  return `atom_${nanoid(8)}`;
}

export function generateBondId(): BondId {
  return `bond_${nanoid(8)}`;
}

export function generateMoleculeId(): MoleculeId {
  return `mol_${nanoid(8)}`;
}

export function generateProjectId(): string {
  return `project_${nanoid(8)}`;
}
