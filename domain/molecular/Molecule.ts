import { MoleculeId, MoleculeMetadata } from './MolecularTypes';
import { Atom } from './Atom';
import { Bond } from './Bond';

export interface Molecule {
  id: MoleculeId;
  name?: string;
  atoms: Atom[];
  bonds: Bond[];
  charge: number;
  multiplicity: number;
  metadata?: MoleculeMetadata;
}
