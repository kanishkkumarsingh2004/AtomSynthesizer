import { z } from 'zod';
import { Molecule } from '../../domain/molecular/Molecule';

const Vector3DSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number()
});

const AtomSchema = z.object({
  id: z.string(),
  atomicNumber: z.number().int().min(1).max(118),
  position: Vector3DSchema,
  formalCharge: z.number().default(0),
  isotope: z.number().optional(),
  moleculeId: z.string()
});

const BondSchema = z.object({
  id: z.string(),
  atomA: z.string(),
  atomB: z.string(),
  order: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(1.5)]),
  type: z.enum(['SINGLE', 'DOUBLE', 'TRIPLE', 'AROMATIC', 'HYDROGEN']).default('SINGLE')
});

const MoleculeSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  atoms: z.array(AtomSchema),
  bonds: z.array(BondSchema),
  charge: z.number().default(0),
  multiplicity: z.number().default(1)
});

const SerializedFileSchema = z.object({
  schemaVersion: z.number().int(),
  type: z.string(),
  molecule: MoleculeSchema
});

export class JsonParser {
  public static parseMolecule(jsonString: string): Molecule {
    const raw = JSON.parse(jsonString);

    // Support both direct Molecule objects and wrapped SerializedMoleculeFile objects
    if (raw.type === 'AtomSynthesizerMolecule' && raw.molecule) {
      const parsed = SerializedFileSchema.parse(raw);
      return parsed.molecule as Molecule;
    }

    return MoleculeSchema.parse(raw) as Molecule;
  }
}
