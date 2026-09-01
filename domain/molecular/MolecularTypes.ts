export type AtomId = string;
export type BondId = string;
export type MoleculeId = string;

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export type BondOrder = 1 | 2 | 3 | 1.5;

export type BondType =
  | 'SINGLE'
  | 'DOUBLE'
  | 'TRIPLE'
  | 'AROMATIC'
  | 'HYDROGEN';

export type Hybridization =
  | 's'
  | 'sp'
  | 'sp2'
  | 'sp3'
  | 'sp3d'
  | 'sp3d2'
  | 'unknown';

export interface AtomMetadata {
  label?: string;
  notes?: string;
  colorOverride?: string;
  customRadius?: number;
}

export interface MoleculeMetadata {
  description?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export type WorkspaceTool =
  | 'select'
  | 'move'
  | 'rotate'
  | 'add_atom'
  | 'create_bond'
  | 'measure'
  | 'delete';
