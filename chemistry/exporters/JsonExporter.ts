import { Molecule } from '../../domain/molecular/Molecule';

export interface SerializedMoleculeFile {
  schemaVersion: number;
  type: 'AtomSynthesizerMolecule';
  exportedAt: string;
  molecule: Molecule;
}

export class JsonExporter {
  public static exportMolecule(molecule: Molecule): string {
    const data: SerializedMoleculeFile = {
      schemaVersion: 1,
      type: 'AtomSynthesizerMolecule',
      exportedAt: new Date().toISOString(),
      molecule
    };
    return JSON.stringify(data, null, 2);
  }
}
