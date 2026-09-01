import { BondId, AtomId, BondOrder, BondType } from './MolecularTypes';

export interface Bond {
  id: BondId;
  atomA: AtomId;
  atomB: AtomId;
  order: BondOrder;
  type: BondType;
  aromatic?: boolean;
}
