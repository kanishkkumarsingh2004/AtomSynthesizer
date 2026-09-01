import { AtomId, MoleculeId, Vector3D, Hybridization, AtomMetadata } from './MolecularTypes';

export interface Atom {
  id: AtomId;
  atomicNumber: number;
  position: Vector3D;
  formalCharge: number;
  isotope?: number;
  radicalElectrons?: number;
  aromatic?: boolean;
  hybridization?: Hybridization;
  moleculeId: MoleculeId;
  metadata?: AtomMetadata;
}
