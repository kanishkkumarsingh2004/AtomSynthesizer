import { Molecule } from '../../domain/molecular/Molecule';
import { MolecularGraph } from '../../domain/molecular/MolecularGraph';
import { GeometryOptimizationEngine } from '../core/GeometryOptimizationEngine';

export interface MoleculePreset {
  id: string;
  name: string;
  iupacName: string;
  formula: string;
  category: 'Alkanes' | 'Aromatics' | 'Gases & Solvents' | 'Carbonyls & Alcohols' | 'Biomolecules';
  description: string;
  polarizability: number; // in Å³
  dipoleMoment: number;   // in Debye
  enthalpy: number;       // in kJ/mol
  pointGroup: string;
  atomCount: number;
  bondCount: number;
  builder: () => Molecule;
}

export const MOLECULE_PRESETS: MoleculePreset[] = [
  // 1. ISOBUTANE (2-methylpropane)
  {
    id: 'isobutane',
    name: 'Isobutane',
    iupacName: '2-Methylpropane',
    formula: 'C4H10',
    category: 'Alkanes',
    description: 'Branched alkane used as an environmentally friendly refrigerant (R-600a) and chemical feedstock.',
    polarizability: 8.00,
    dipoleMoment: 0.13,
    enthalpy: -134.5,
    pointGroup: 'C3v',
    atomCount: 14,
    bondCount: 13,
    builder: () => {
      const graph = new MolecularGraph('mol_isobutane', 'Isobutane');
      // Central Carbon C1
      graph.addAtom({ id: 'c1', atomicNumber: 6, position: { x: 0, y: 0, z: 0 }, formalCharge: 0, moleculeId: 'mol_isobutane' });
      // 3 Methyl Carbons (C2, C3, C4) in tetrahedral disposition
      graph.addAtom({ id: 'c2', atomicNumber: 6, position: { x: 1.25, y: 0.72, z: 0.45 }, formalCharge: 0, moleculeId: 'mol_isobutane' });
      graph.addAtom({ id: 'c3', atomicNumber: 6, position: { x: -1.25, y: 0.72, z: -0.45 }, formalCharge: 0, moleculeId: 'mol_isobutane' });
      graph.addAtom({ id: 'c4', atomicNumber: 6, position: { x: 0, y: -1.44, z: 0.45 }, formalCharge: 0, moleculeId: 'mol_isobutane' });

      // C-C bonds
      graph.addBond({ id: 'b_cc1', atomA: 'c1', atomB: 'c2', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b_cc2', atomA: 'c1', atomB: 'c3', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b_cc3', atomA: 'c1', atomB: 'c4', order: 1, type: 'SINGLE' });

      // Methine H on C1
      graph.addAtom({ id: 'h_c1', atomicNumber: 1, position: { x: 0, y: 0, z: -1.1 }, formalCharge: 0, moleculeId: 'mol_isobutane' });
      graph.addBond({ id: 'b_hc1', atomA: 'c1', atomB: 'h_c1', order: 1, type: 'SINGLE' });

      // 9 Methyl H's
      const parents = ['c2', 'c3', 'c4'];
      let hCounter = 1;
      for (const parent of parents) {
        for (let j = 1; j <= 3; j++) {
          const hId = `h_${parent}_${j}`;
          const pAtom = graph.getAtom(parent)!;
          graph.addAtom({
            id: hId,
            atomicNumber: 1,
            position: {
              x: pAtom.position.x + (j === 1 ? 0.9 : j === 2 ? -0.5 : 0.2),
              y: pAtom.position.y + (j === 1 ? 0.3 : j === 2 ? 0.8 : -0.9),
              z: pAtom.position.z + (j === 3 ? 0.8 : -0.5)
            },
            formalCharge: 0,
            moleculeId: 'mol_isobutane'
          });
          graph.addBond({ id: `b_h_${hCounter++}`, atomA: parent, atomB: hId, order: 1, type: 'SINGLE' });
        }
      }

      const opt = GeometryOptimizationEngine.optimizeGeometry(graph.toMolecule(), 50);
      return opt.optimizedMolecule;
    }
  },
  // 1b. NEOPENTANE (2,2-dimethylpropane)
  {
    id: 'neopentane',
    name: 'Neopentane',
    iupacName: '2,2-Dimethylpropane',
    formula: 'C5H12',
    category: 'Alkanes',
    description: 'Double-branched quaternary alkane featuring perfect Td tetrahedral symmetry and 4 methyl groups.',
    polarizability: 9.95,
    dipoleMoment: 0.00,
    enthalpy: -168.0,
    pointGroup: 'Td',
    atomCount: 17,
    bondCount: 16,
    builder: () => {
      const graph = new MolecularGraph('mol_neopentane', 'Neopentane');
      // Quaternary Central Carbon C1
      graph.addAtom({ id: 'c1', atomicNumber: 6, position: { x: 0, y: 0, z: 0 }, formalCharge: 0, moleculeId: 'mol_neopentane' });

      // 4 Methyl Carbons (C2, C3, C4, C5) in Td symmetry
      const dC = 1.54 / Math.sqrt(3);
      graph.addAtom({ id: 'c2', atomicNumber: 6, position: { x: dC, y: dC, z: dC }, formalCharge: 0, moleculeId: 'mol_neopentane' });
      graph.addAtom({ id: 'c3', atomicNumber: 6, position: { x: -dC, y: -dC, z: dC }, formalCharge: 0, moleculeId: 'mol_neopentane' });
      graph.addAtom({ id: 'c4', atomicNumber: 6, position: { x: -dC, y: dC, z: -dC }, formalCharge: 0, moleculeId: 'mol_neopentane' });
      graph.addAtom({ id: 'c5', atomicNumber: 6, position: { x: dC, y: -dC, z: -dC }, formalCharge: 0, moleculeId: 'mol_neopentane' });

      // 4 C-C bonds
      graph.addBond({ id: 'b_cc1', atomA: 'c1', atomB: 'c2', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b_cc2', atomA: 'c1', atomB: 'c3', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b_cc3', atomA: 'c1', atomB: 'c4', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b_cc4', atomA: 'c1', atomB: 'c5', order: 1, type: 'SINGLE' });

      // 12 Methyl Hydrogens (3 per methyl carbon)
      const methyls = ['c2', 'c3', 'c4', 'c5'];
      let hCounter = 1;
      for (const mId of methyls) {
        const mAtom = graph.getAtom(mId)!;
        for (let j = 1; j <= 3; j++) {
          const hId = `h_${mId}_${j}`;
          graph.addAtom({
            id: hId,
            atomicNumber: 1,
            position: {
              x: mAtom.position.x + (j === 1 ? 0.9 : j === 2 ? -0.5 : 0.2),
              y: mAtom.position.y + (j === 1 ? 0.3 : j === 2 ? 0.8 : -0.9),
              z: mAtom.position.z + (j === 3 ? 0.8 : -0.5)
            },
            formalCharge: 0,
            moleculeId: 'mol_neopentane'
          });
          graph.addBond({ id: `b_h_${hCounter++}`, atomA: mId, atomB: hId, order: 1, type: 'SINGLE' });
        }
      }

      const opt = GeometryOptimizationEngine.optimizeGeometry(graph.toMolecule(), 50);
      return opt.optimizedMolecule;
    }
  },

  // 2. METHANE
  {
    id: 'methane',
    name: 'Methane',
    iupacName: 'Methane',
    formula: 'CH4',
    category: 'Alkanes',
    description: 'Simplest alkane and principal component of natural gas. Perfect Td tetrahedral symmetry.',
    polarizability: 2.59,
    dipoleMoment: 0.00,
    enthalpy: -74.8,
    pointGroup: 'Td',
    atomCount: 5,
    bondCount: 4,
    builder: () => {
      const graph = new MolecularGraph('mol_methane', 'Methane');
      graph.addAtom({ id: 'c1', atomicNumber: 6, position: { x: 0, y: 0, z: 0 }, formalCharge: 0, moleculeId: 'mol_methane' });
      
      const d = 1.09;
      graph.addAtom({ id: 'h1', atomicNumber: 1, position: { x: d / Math.sqrt(3), y: d / Math.sqrt(3), z: d / Math.sqrt(3) }, formalCharge: 0, moleculeId: 'mol_methane' });
      graph.addAtom({ id: 'h2', atomicNumber: 1, position: { x: -d / Math.sqrt(3), y: -d / Math.sqrt(3), z: d / Math.sqrt(3) }, formalCharge: 0, moleculeId: 'mol_methane' });
      graph.addAtom({ id: 'h3', atomicNumber: 1, position: { x: -d / Math.sqrt(3), y: d / Math.sqrt(3), z: -d / Math.sqrt(3) }, formalCharge: 0, moleculeId: 'mol_methane' });
      graph.addAtom({ id: 'h4', atomicNumber: 1, position: { x: d / Math.sqrt(3), y: -d / Math.sqrt(3), z: -d / Math.sqrt(3) }, formalCharge: 0, moleculeId: 'mol_methane' });

      for (let i = 1; i <= 4; i++) {
        graph.addBond({ id: `b_ch${i}`, atomA: 'c1', atomB: `h${i}`, order: 1, type: 'SINGLE' });
      }

      const opt = GeometryOptimizationEngine.optimizeGeometry(graph.toMolecule(), 40);
      return opt.optimizedMolecule;
    }
  },

  // 3. PROPANE
  {
    id: 'propane',
    name: 'Propane',
    iupacName: 'Propane',
    formula: 'C3H8',
    category: 'Alkanes',
    description: 'Three-carbon alkane gas used as fuel for heating and cooking.',
    polarizability: 5.92,
    dipoleMoment: 0.08,
    enthalpy: -103.8,
    pointGroup: 'C2v',
    atomCount: 11,
    bondCount: 10,
    builder: () => {
      const graph = new MolecularGraph('mol_propane', 'Propane');
      graph.addAtom({ id: 'c1', atomicNumber: 6, position: { x: -1.27, y: 0.25, z: 0 }, formalCharge: 0, moleculeId: 'mol_propane' });
      graph.addAtom({ id: 'c2', atomicNumber: 6, position: { x: 0, y: -0.4, z: 0 }, formalCharge: 0, moleculeId: 'mol_propane' });
      graph.addAtom({ id: 'c3', atomicNumber: 6, position: { x: 1.27, y: 0.25, z: 0 }, formalCharge: 0, moleculeId: 'mol_propane' });

      graph.addBond({ id: 'b_cc1', atomA: 'c1', atomB: 'c2', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b_cc2', atomA: 'c2', atomB: 'c3', order: 1, type: 'SINGLE' });

      for (let i = 1; i <= 8; i++) {
        const parentC = i <= 3 ? 'c1' : i <= 5 ? 'c2' : 'c3';
        graph.addAtom({ id: `h${i}`, atomicNumber: 1, position: { x: (i - 4) * 0.4, y: i % 2 === 0 ? 1.0 : -1.0, z: i % 3 === 0 ? 0.8 : -0.8 }, formalCharge: 0, moleculeId: 'mol_propane' });
        graph.addBond({ id: `b_ch${i}`, atomA: parentC, atomB: `h${i}`, order: 1, type: 'SINGLE' });
      }

      const opt = GeometryOptimizationEngine.optimizeGeometry(graph.toMolecule(), 50);
      return opt.optimizedMolecule;
    }
  },

  // 4. WATER
  {
    id: 'water',
    name: 'Water',
    iupacName: 'Oxidane',
    formula: 'H2O',
    category: 'Gases & Solvents',
    description: 'Essential polar solvent with C2v bent geometry (104.5° angle).',
    polarizability: 3.94,
    dipoleMoment: 1.85,
    enthalpy: -241.8,
    pointGroup: 'C2v',
    atomCount: 3,
    bondCount: 2,
    builder: () => {
      const graph = new MolecularGraph('mol_water', 'Water');
      graph.addAtom({ id: 'o1', atomicNumber: 8, position: { x: 0, y: 0.12, z: 0 }, formalCharge: 0, moleculeId: 'mol_water' });
      graph.addAtom({ id: 'h1', atomicNumber: 1, position: { x: -0.76, y: -0.48, z: 0 }, formalCharge: 0, moleculeId: 'mol_water' });
      graph.addAtom({ id: 'h2', atomicNumber: 1, position: { x: 0.76, y: -0.48, z: 0 }, formalCharge: 0, moleculeId: 'mol_water' });

      graph.addBond({ id: 'b_oh1', atomA: 'o1', atomB: 'h1', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b_oh2', atomA: 'o1', atomB: 'h2', order: 1, type: 'SINGLE' });

      const opt = GeometryOptimizationEngine.optimizeGeometry(graph.toMolecule(), 30);
      return opt.optimizedMolecule;
    }
  },

  // 5. CARBON DIOXIDE
  {
    id: 'co2',
    name: 'Carbon Dioxide',
    iupacName: 'Carbon Dioxide',
    formula: 'CO2',
    category: 'Gases & Solvents',
    description: 'Linear 180° centrosymmetric D∞h triatomic molecule with zero dipole moment.',
    polarizability: 2.91,
    dipoleMoment: 0.00,
    enthalpy: -393.5,
    pointGroup: 'D∞h',
    atomCount: 3,
    bondCount: 2,
    builder: () => {
      const graph = new MolecularGraph('mol_co2', 'Carbon Dioxide');
      graph.addAtom({ id: 'c1', atomicNumber: 6, position: { x: 0, y: 0, z: 0 }, formalCharge: 0, moleculeId: 'mol_co2' });
      graph.addAtom({ id: 'o1', atomicNumber: 8, position: { x: -1.16, y: 0, z: 0 }, formalCharge: 0, moleculeId: 'mol_co2' });
      graph.addAtom({ id: 'o2', atomicNumber: 8, position: { x: 1.16, y: 0, z: 0 }, formalCharge: 0, moleculeId: 'mol_co2' });

      graph.addBond({ id: 'b_co1', atomA: 'c1', atomB: 'o1', order: 2, type: 'DOUBLE' });
      graph.addBond({ id: 'b_co2', atomA: 'c1', atomB: 'o2', order: 2, type: 'DOUBLE' });

      const opt = GeometryOptimizationEngine.optimizeGeometry(graph.toMolecule(), 30);
      return opt.optimizedMolecule;
    }
  },

  // 6. BENZENE
  {
    id: 'benzene',
    name: 'Benzene',
    iupacName: '1,3,5-Cyclohexatriene',
    formula: 'C6H6',
    category: 'Aromatics',
    description: 'Classic planar D6h aromatic hydrocarbon ring with delocalized 6-pi electron cloud.',
    polarizability: 10.00,
    dipoleMoment: 0.00,
    enthalpy: 82.9,
    pointGroup: 'D6h',
    atomCount: 12,
    bondCount: 12,
    builder: () => {
      const graph = new MolecularGraph('mol_benzene', 'Benzene');
      const rC = 1.40;
      const rH = 2.48;

      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        graph.addAtom({
          id: `c${i + 1}`,
          atomicNumber: 6,
          position: { x: rC * Math.cos(angle), y: rC * Math.sin(angle), z: 0 },
          formalCharge: 0,
          moleculeId: 'mol_benzene'
        });
        graph.addAtom({
          id: `h${i + 1}`,
          atomicNumber: 1,
          position: { x: rH * Math.cos(angle), y: rH * Math.sin(angle), z: 0 },
          formalCharge: 0,
          moleculeId: 'mol_benzene'
        });
      }

      for (let i = 0; i < 6; i++) {
        const cA = `c${i + 1}`;
        const cB = `c${(i + 1) % 6 + 1}`;
        const hId = `h${i + 1}`;

        graph.addBond({
          id: `b_cc${i + 1}`,
          atomA: cA,
          atomB: cB,
          order: i % 2 === 0 ? 2 : 1,
          type: i % 2 === 0 ? 'DOUBLE' : 'SINGLE',
          aromatic: true
        });
        graph.addBond({ id: `b_ch${i + 1}`, atomA: cA, atomB: hId, order: 1, type: 'SINGLE' });
      }

      const opt = GeometryOptimizationEngine.optimizeGeometry(graph.toMolecule(), 40);
      return opt.optimizedMolecule;
    }
  },

  // 7. AMMONIA
  {
    id: 'ammonia',
    name: 'Ammonia',
    iupacName: 'Azane',
    formula: 'NH3',
    category: 'Gases & Solvents',
    description: 'Trigonal pyramidal C3v inorganic gas with a lone pair on nitrogen.',
    polarizability: 2.26,
    dipoleMoment: 1.47,
    enthalpy: -45.9,
    pointGroup: 'C3v',
    atomCount: 4,
    bondCount: 3,
    builder: () => {
      const graph = new MolecularGraph('mol_ammonia', 'Ammonia');
      graph.addAtom({ id: 'n1', atomicNumber: 7, position: { x: 0, y: 0, z: 0.12 }, formalCharge: 0, moleculeId: 'mol_ammonia' });
      graph.addAtom({ id: 'h1', atomicNumber: 1, position: { x: 0, y: 0.94, z: -0.28 }, formalCharge: 0, moleculeId: 'mol_ammonia' });
      graph.addAtom({ id: 'h2', atomicNumber: 1, position: { x: 0.81, y: -0.47, z: -0.28 }, formalCharge: 0, moleculeId: 'mol_ammonia' });
      graph.addAtom({ id: 'h3', atomicNumber: 1, position: { x: -0.81, y: -0.47, z: -0.28 }, formalCharge: 0, moleculeId: 'mol_ammonia' });

      graph.addBond({ id: 'b_nh1', atomA: 'n1', atomB: 'h1', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b_nh2', atomA: 'n1', atomB: 'h2', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b_nh3', atomA: 'n1', atomB: 'h3', order: 1, type: 'SINGLE' });

      const opt = GeometryOptimizationEngine.optimizeGeometry(graph.toMolecule(), 30);
      return opt.optimizedMolecule;
    }
  },

  // 8. ETHANOL
  {
    id: 'ethanol',
    name: 'Ethanol',
    iupacName: 'Ethanol',
    formula: 'C2H5OH',
    category: 'Carbonyls & Alcohols',
    description: 'Volatile, flammable alcohol present in beverages and used as a solvent.',
    polarizability: 5.11,
    dipoleMoment: 1.69,
    enthalpy: -235.3,
    pointGroup: 'Cs',
    atomCount: 9,
    bondCount: 8,
    builder: () => {
      const graph = new MolecularGraph('mol_ethanol', 'Ethanol');
      graph.addAtom({ id: 'c1', atomicNumber: 6, position: { x: -1.2, y: -0.2, z: 0 }, formalCharge: 0, moleculeId: 'mol_ethanol' });
      graph.addAtom({ id: 'c2', atomicNumber: 6, position: { x: 0.1, y: 0.5, z: 0 }, formalCharge: 0, moleculeId: 'mol_ethanol' });
      graph.addAtom({ id: 'o1', atomicNumber: 8, position: { x: 1.2, y: -0.3, z: 0 }, formalCharge: 0, moleculeId: 'mol_ethanol' });
      graph.addAtom({ id: 'ho', atomicNumber: 1, position: { x: 2.0, y: 0.2, z: 0 }, formalCharge: 0, moleculeId: 'mol_ethanol' });

      graph.addBond({ id: 'b_cc', atomA: 'c1', atomB: 'c2', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b_co', atomA: 'c2', atomB: 'o1', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b_oh', atomA: 'o1', atomB: 'ho', order: 1, type: 'SINGLE' });

      // Add hydrogens to C1 and C2
      const hPositions = [
        { c: 'c1', x: -1.8, y: 0.3, z: 0.8 },
        { c: 'c1', x: -1.8, y: 0.3, z: -0.8 },
        { c: 'c1', x: -1.2, y: -1.3, z: 0 },
        { c: 'c2', x: 0.1, y: 1.1, z: 0.9 },
        { c: 'c2', x: 0.1, y: 1.1, z: -0.9 }
      ];

      hPositions.forEach((hp, idx) => {
        const hId = `h_eth_${idx + 1}`;
        graph.addAtom({ id: hId, atomicNumber: 1, position: { x: hp.x, y: hp.y, z: hp.z }, formalCharge: 0, moleculeId: 'mol_ethanol' });
        graph.addBond({ id: `b_eth_h${idx + 1}`, atomA: hp.c, atomB: hId, order: 1, type: 'SINGLE' });
      });

      const opt = GeometryOptimizationEngine.optimizeGeometry(graph.toMolecule(), 40);
      return opt.optimizedMolecule;
    }
  },

  // 9. ACETONE
  {
    id: 'acetone',
    name: 'Acetone',
    iupacName: 'Propan-2-one',
    formula: 'CH3COCH3',
    category: 'Carbonyls & Alcohols',
    description: 'Simplest ketone solvent with a polar C=O double bond.',
    polarizability: 6.40,
    dipoleMoment: 2.88,
    enthalpy: -217.5,
    pointGroup: 'C2v',
    atomCount: 10,
    bondCount: 9,
    builder: () => {
      const graph = new MolecularGraph('mol_acetone', 'Acetone');
      graph.addAtom({ id: 'c1', atomicNumber: 6, position: { x: 0, y: 0.2, z: 0 }, formalCharge: 0, moleculeId: 'mol_acetone' });
      graph.addAtom({ id: 'o1', atomicNumber: 8, position: { x: 0, y: 1.4, z: 0 }, formalCharge: 0, moleculeId: 'mol_acetone' });
      graph.addAtom({ id: 'c2', atomicNumber: 6, position: { x: -1.2, y: -0.6, z: 0 }, formalCharge: 0, moleculeId: 'mol_acetone' });
      graph.addAtom({ id: 'c3', atomicNumber: 6, position: { x: 1.2, y: -0.6, z: 0 }, formalCharge: 0, moleculeId: 'mol_acetone' });

      graph.addBond({ id: 'b_co', atomA: 'c1', atomB: 'o1', order: 2, type: 'DOUBLE' });
      graph.addBond({ id: 'b_cc1', atomA: 'c1', atomB: 'c2', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b_cc2', atomA: 'c1', atomB: 'c3', order: 1, type: 'SINGLE' });

      for (let i = 1; i <= 6; i++) {
        const parent = i <= 3 ? 'c2' : 'c3';
        const hId = `h_act_${i}`;
        const pAtom = graph.getAtom(parent)!;
        graph.addAtom({
          id: hId,
          atomicNumber: 1,
          position: {
            x: pAtom.position.x + (i % 2 === 0 ? 0.6 : -0.6),
            y: pAtom.position.y - 0.7,
            z: i % 3 === 0 ? 0.8 : -0.8
          },
          formalCharge: 0,
          moleculeId: 'mol_acetone'
        });
        graph.addBond({ id: `b_act_h${i}`, atomA: parent, atomB: hId, order: 1, type: 'SINGLE' });
      }

      const opt = GeometryOptimizationEngine.optimizeGeometry(graph.toMolecule(), 40);
      return opt.optimizedMolecule;
    }
  },

  // 10. ACETIC ACID
  {
    id: 'acetic_acid',
    name: 'Acetic Acid',
    iupacName: 'Ethanoic Acid',
    formula: 'CH3COOH',
    category: 'Carbonyls & Alcohols',
    description: 'Main component of vinegar, featuring a carboxylic acid group -COOH.',
    polarizability: 5.25,
    dipoleMoment: 1.74,
    enthalpy: -484.5,
    pointGroup: 'Cs',
    atomCount: 8,
    bondCount: 7,
    builder: () => {
      const graph = new MolecularGraph('mol_acetic', 'Acetic Acid');
      graph.addAtom({ id: 'c1', atomicNumber: 6, position: { x: -1.1, y: -0.1, z: 0 }, formalCharge: 0, moleculeId: 'mol_acetic' });
      graph.addAtom({ id: 'c2', atomicNumber: 6, position: { x: 0.3, y: 0.3, z: 0 }, formalCharge: 0, moleculeId: 'mol_acetic' });
      graph.addAtom({ id: 'o1', atomicNumber: 8, position: { x: 0.7, y: 1.4, z: 0 }, formalCharge: 0, moleculeId: 'mol_acetic' });
      graph.addAtom({ id: 'o2', atomicNumber: 8, position: { x: 1.1, y: -0.7, z: 0 }, formalCharge: 0, moleculeId: 'mol_acetic' });
      graph.addAtom({ id: 'ho', atomicNumber: 1, position: { x: 2.0, y: -0.5, z: 0 }, formalCharge: 0, moleculeId: 'mol_acetic' });

      graph.addBond({ id: 'b_cc', atomA: 'c1', atomB: 'c2', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b_co_dbl', atomA: 'c2', atomB: 'o1', order: 2, type: 'DOUBLE' });
      graph.addBond({ id: 'b_co_sgl', atomA: 'c2', atomB: 'o2', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b_oh', atomA: 'o2', atomB: 'ho', order: 1, type: 'SINGLE' });

      for (let i = 1; i <= 3; i++) {
        const hId = `h_ace_${i}`;
        graph.addAtom({
          id: hId,
          atomicNumber: 1,
          position: { x: -1.7, y: i === 1 ? -1.0 : 0.4, z: i === 2 ? 0.9 : -0.9 },
          formalCharge: 0,
          moleculeId: 'mol_acetic'
        });
        graph.addBond({ id: `b_ace_h${i}`, atomA: 'c1', atomB: hId, order: 1, type: 'SINGLE' });
      }

      const opt = GeometryOptimizationEngine.optimizeGeometry(graph.toMolecule(), 40);
      return opt.optimizedMolecule;
    }
  },

  // 11. CAFFEINE
  {
    id: 'caffeine',
    name: 'Caffeine',
    iupacName: '1,3,7-Trimethylxanthine',
    formula: 'C8H10N4O2',
    category: 'Biomolecules',
    description: 'Central nervous system stimulant found in coffee and tea.',
    polarizability: 18.50,
    dipoleMoment: 3.64,
    enthalpy: -268.0,
    pointGroup: 'C1',
    atomCount: 24,
    bondCount: 25,
    builder: () => {
      const graph = new MolecularGraph('mol_caffeine', 'Caffeine');
      // Purine core atoms
      graph.addAtom({ id: 'n1', atomicNumber: 7, position: { x: -1.2, y: 1.2, z: 0 }, formalCharge: 0, moleculeId: 'mol_caffeine' });
      graph.addAtom({ id: 'c2', atomicNumber: 6, position: { x: 0.1, y: 1.5, z: 0 }, formalCharge: 0, moleculeId: 'mol_caffeine' });
      graph.addAtom({ id: 'o2', atomicNumber: 8, position: { x: 0.5, y: 2.6, z: 0 }, formalCharge: 0, moleculeId: 'mol_caffeine' });
      graph.addAtom({ id: 'n3', atomicNumber: 7, position: { x: 1.0, y: 0.5, z: 0 }, formalCharge: 0, moleculeId: 'mol_caffeine' });
      graph.addAtom({ id: 'c4', atomicNumber: 6, position: { x: 0.6, y: -0.8, z: 0 }, formalCharge: 0, moleculeId: 'mol_caffeine' });
      graph.addAtom({ id: 'c5', atomicNumber: 6, position: { x: -0.8, y: -1.0, z: 0 }, formalCharge: 0, moleculeId: 'mol_caffeine' });
      graph.addAtom({ id: 'c6', atomicNumber: 6, position: { x: -1.6, y: 0.1, z: 0 }, formalCharge: 0, moleculeId: 'mol_caffeine' });
      graph.addAtom({ id: 'o6', atomicNumber: 8, position: { x: -2.8, y: 0.1, z: 0 }, formalCharge: 0, moleculeId: 'mol_caffeine' });

      // Imidazole ring fusion
      graph.addAtom({ id: 'n7', atomicNumber: 7, position: { x: 1.6, y: -1.7, z: 0 }, formalCharge: 0, moleculeId: 'mol_caffeine' });
      graph.addAtom({ id: 'c8', atomicNumber: 6, position: { x: 0.8, y: -2.7, z: 0 }, formalCharge: 0, moleculeId: 'mol_caffeine' });
      graph.addAtom({ id: 'n9', atomicNumber: 7, position: { x: -0.6, y: -2.3, z: 0 }, formalCharge: 0, moleculeId: 'mol_caffeine' });

      // Bonds
      graph.addBond({ id: 'b1', atomA: 'n1', atomB: 'c2', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b2', atomA: 'c2', atomB: 'o2', order: 2, type: 'DOUBLE' });
      graph.addBond({ id: 'b3', atomA: 'c2', atomB: 'n3', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b4', atomA: 'n3', atomB: 'c4', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b5', atomA: 'c4', atomB: 'c5', order: 2, type: 'DOUBLE', aromatic: true });
      graph.addBond({ id: 'b6', atomA: 'c5', atomB: 'c6', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b7', atomA: 'c6', atomB: 'o6', order: 2, type: 'DOUBLE' });
      graph.addBond({ id: 'b8', atomA: 'c6', atomB: 'n1', order: 1, type: 'SINGLE' });

      graph.addBond({ id: 'b9', atomA: 'c4', atomB: 'n7', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b10', atomA: 'n7', atomB: 'c8', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b11', atomA: 'c8', atomB: 'n9', order: 2, type: 'DOUBLE', aromatic: true });
      graph.addBond({ id: 'b12', atomA: 'n9', atomB: 'c5', order: 1, type: 'SINGLE' });

      // 3 Methyl groups on N1, N3, N7 + H on C8
      const methyls = [
        { n: 'n1', cId: 'cm1', pos: { x: -2.1, y: 2.3, z: 0 } },
        { n: 'n3', cId: 'cm3', pos: { x: 2.4, y: 0.8, z: 0 } },
        { n: 'n7', cId: 'cm7', pos: { x: 3.0, y: -1.9, z: 0 } }
      ];

      methyls.forEach((m) => {
        graph.addAtom({ id: m.cId, atomicNumber: 6, position: m.pos, formalCharge: 0, moleculeId: 'mol_caffeine' });
        graph.addBond({ id: `b_nm_${m.cId}`, atomA: m.n, atomB: m.cId, order: 1, type: 'SINGLE' });

        for (let j = 1; j <= 3; j++) {
          const hId = `h_${m.cId}_${j}`;
          graph.addAtom({
            id: hId,
            atomicNumber: 1,
            position: { x: m.pos.x + (j === 1 ? 0.7 : -0.4), y: m.pos.y + (j === 2 ? 0.7 : -0.5), z: j === 3 ? 0.9 : -0.9 },
            formalCharge: 0,
            moleculeId: 'mol_caffeine'
          });
          graph.addBond({ id: `b_h_${hId}`, atomA: m.cId, atomB: hId, order: 1, type: 'SINGLE' });
        }
      });

      // C8 Hydrogen
      graph.addAtom({ id: 'h8', atomicNumber: 1, position: { x: 1.2, y: -3.7, z: 0 }, formalCharge: 0, moleculeId: 'mol_caffeine' });
      graph.addBond({ id: 'b_c8h', atomA: 'c8', atomB: 'h8', order: 1, type: 'SINGLE' });

      const opt = GeometryOptimizationEngine.optimizeGeometry(graph.toMolecule(), 50);
      return opt.optimizedMolecule;
    }
  },

  // 13. TNT (Trinitrotoluene)
  {
    id: 'tnt',
    name: 'TNT',
    iupacName: '2,4,6-Trinitrotoluene',
    formula: 'C7H5N3O6',
    category: 'Aromatics',
    description: 'Nitroaromatic explosive compound featuring a central toluene core substituted with 3 nitro groups (-NO2).',
    polarizability: 17.5,
    dipoleMoment: 1.15,
    enthalpy: -64.2,
    pointGroup: 'C1',
    atomCount: 21,
    bondCount: 21,
    builder: () => {
      const graph = new MolecularGraph('mol_tnt', 'TNT');
      // Benzene ring carbons (C1 to C6)
      const r = 1.40;
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3;
        graph.addAtom({
          id: `c${i + 1}`,
          atomicNumber: 6,
          position: { x: r * Math.cos(ang), y: r * Math.sin(ang), z: 0 },
          formalCharge: 0,
          moleculeId: 'mol_tnt'
        });
      }
      for (let i = 0; i < 6; i++) {
        const next = (i + 1) % 6;
        graph.addBond({
          id: `b_cc_${i + 1}_${next + 1}`,
          atomA: `c${i + 1}`,
          atomB: `c${next + 1}`,
          order: 1.5,
          type: 'AROMATIC',
          aromatic: true
        });
      }

      // Methyl group on C1 (at 0 deg)
      graph.addAtom({ id: 'c_methyl', atomicNumber: 6, position: { x: 2.9, y: 0, z: 0 }, formalCharge: 0, moleculeId: 'mol_tnt' });
      graph.addBond({ id: 'b_c1_m', atomA: 'c1', atomB: 'c_methyl', order: 1, type: 'SINGLE' });
      graph.addAtom({ id: 'h_m1', atomicNumber: 1, position: { x: 3.5, y: 0.8, z: 0.5 }, formalCharge: 0, moleculeId: 'mol_tnt' });
      graph.addAtom({ id: 'h_m2', atomicNumber: 1, position: { x: 3.5, y: -0.8, z: 0.5 }, formalCharge: 0, moleculeId: 'mol_tnt' });
      graph.addAtom({ id: 'h_m3', atomicNumber: 1, position: { x: 3.2, y: 0, z: -1.0 }, formalCharge: 0, moleculeId: 'mol_tnt' });
      graph.addBond({ id: 'b_hm1', atomA: 'c_methyl', atomB: 'h_m1', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b_hm2', atomA: 'c_methyl', atomB: 'h_m2', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b_hm3', atomA: 'c_methyl', atomB: 'h_m3', order: 1, type: 'SINGLE' });

      // Nitro groups on C2, C4, C6
      const nitroSub = [
        { cId: 'c2', nId: 'n2', o1: 'o2a', o2: 'o2b', angle: Math.PI / 3 },
        { cId: 'c4', nId: 'n4', o1: 'o4a', o2: 'o4b', angle: Math.PI },
        { cId: 'c6', nId: 'n6', o1: 'o6a', o2: 'o6b', angle: (5 * Math.PI) / 3 }
      ];

      nitroSub.forEach((nGroup) => {
        const nx = 2.65 * Math.cos(nGroup.angle);
        const ny = 2.65 * Math.sin(nGroup.angle);
        graph.addAtom({ id: nGroup.nId, atomicNumber: 7, position: { x: nx, y: ny, z: 0 }, formalCharge: 1, moleculeId: 'mol_tnt' });
        graph.addBond({ id: `b_${nGroup.cId}_${nGroup.nId}`, atomA: nGroup.cId, atomB: nGroup.nId, order: 1, type: 'SINGLE' });

        const o1x = nx + 1.25 * Math.cos(nGroup.angle + 0.5);
        const o1y = ny + 1.25 * Math.sin(nGroup.angle + 0.5);
        const o2x = nx + 1.25 * Math.cos(nGroup.angle - 0.5);
        const o2y = ny + 1.25 * Math.sin(nGroup.angle - 0.5);

        graph.addAtom({ id: nGroup.o1, atomicNumber: 8, position: { x: o1x, y: o1y, z: 0 }, formalCharge: -1, moleculeId: 'mol_tnt' });
        graph.addAtom({ id: nGroup.o2, atomicNumber: 8, position: { x: o2x, y: o2y, z: 0 }, formalCharge: 0, moleculeId: 'mol_tnt' });

        graph.addBond({ id: `b_${nGroup.nId}_${nGroup.o1}`, atomA: nGroup.nId, atomB: nGroup.o1, order: 1, type: 'SINGLE' });
        graph.addBond({ id: `b_${nGroup.nId}_${nGroup.o2}`, atomA: nGroup.nId, atomB: nGroup.o2, order: 2, type: 'DOUBLE' });
      });

      // Hydrogens on C3 and C5
      graph.addAtom({ id: 'h3', atomicNumber: 1, position: { x: 2.3 * Math.cos((2 * Math.PI) / 3), y: 2.3 * Math.sin((2 * Math.PI) / 3), z: 0 }, formalCharge: 0, moleculeId: 'mol_tnt' });
      graph.addAtom({ id: 'h5', atomicNumber: 1, position: { x: 2.3 * Math.cos((4 * Math.PI) / 3), y: 2.3 * Math.sin((4 * Math.PI) / 3), z: 0 }, formalCharge: 0, moleculeId: 'mol_tnt' });
      graph.addBond({ id: 'b_c3h', atomA: 'c3', atomB: 'h3', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b_c5h', atomA: 'c5', atomB: 'h5', order: 1, type: 'SINGLE' });

      const opt = GeometryOptimizationEngine.optimizeGeometry(graph.toMolecule(), 50);
      return opt.optimizedMolecule;
    }
  },

  // 14. DOPAMINE
  {
    id: 'dopamine',
    name: 'Dopamine',
    iupacName: '4-(2-Aminoethyl)benzene-1,2-diol',
    formula: 'C8H11NO2',
    category: 'Biomolecules',
    description: 'Crucial catecholamine neurotransmitter governing reward, motivation, motor control, and cognitive executive function.',
    polarizability: 16.2,
    dipoleMoment: 2.85,
    enthalpy: -312.0,
    pointGroup: 'C1',
    atomCount: 22,
    bondCount: 22,
    builder: () => {
      const graph = new MolecularGraph('mol_dopamine', 'Dopamine');
      // Benzene ring carbons
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3;
        graph.addAtom({
          id: `c${i + 1}`,
          atomicNumber: 6,
          position: { x: 1.4 * Math.cos(ang), y: 1.4 * Math.sin(ang), z: 0 },
          formalCharge: 0,
          moleculeId: 'mol_dopamine'
        });
      }
      for (let i = 0; i < 6; i++) {
        const next = (i + 1) % 6;
        graph.addBond({ id: `b_cc_${i + 1}_${next + 1}`, atomA: `c${i + 1}`, atomB: `c${next + 1}`, order: 1.5, type: 'AROMATIC', aromatic: true });
      }

      // 1,2-Diol Hydroxyls on C1 and C2
      graph.addAtom({ id: 'o1', atomicNumber: 8, position: { x: 2.7, y: 0.2, z: 0 }, formalCharge: 0, moleculeId: 'mol_dopamine' });
      graph.addAtom({ id: 'h_o1', atomicNumber: 1, position: { x: 3.4, y: -0.4, z: 0 }, formalCharge: 0, moleculeId: 'mol_dopamine' });
      graph.addBond({ id: 'b_c1o1', atomA: 'c1', atomB: 'o1', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b_o1h', atomA: 'o1', atomB: 'h_o1', order: 1, type: 'SINGLE' });

      graph.addAtom({ id: 'o2', atomicNumber: 8, position: { x: 1.4, y: 2.7, z: 0 }, formalCharge: 0, moleculeId: 'mol_dopamine' });
      graph.addAtom({ id: 'h_o2', atomicNumber: 1, position: { x: 2.2, y: 3.2, z: 0 }, formalCharge: 0, moleculeId: 'mol_dopamine' });
      graph.addBond({ id: 'b_c2o2', atomA: 'c2', atomB: 'o2', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b_o2h', atomA: 'o2', atomB: 'h_o2', order: 1, type: 'SINGLE' });

      // Ethylamine chain on C4
      graph.addAtom({ id: 'ca', atomicNumber: 6, position: { x: -2.7, y: -0.2, z: 0 }, formalCharge: 0, moleculeId: 'mol_dopamine' });
      graph.addAtom({ id: 'cb', atomicNumber: 6, position: { x: -4.0, y: 0.6, z: 0 }, formalCharge: 0, moleculeId: 'mol_dopamine' });
      graph.addAtom({ id: 'n_amine', atomicNumber: 7, position: { x: -5.3, y: -0.2, z: 0 }, formalCharge: 0, moleculeId: 'mol_dopamine' });

      graph.addBond({ id: 'b_c4ca', atomA: 'c4', atomB: 'ca', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b_cacb', atomA: 'ca', atomB: 'cb', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b_cbn', atomA: 'cb', atomB: 'n_amine', order: 1, type: 'SINGLE' });

      // Amine Hydrogens
      graph.addAtom({ id: 'hn1', atomicNumber: 1, position: { x: -6.0, y: 0.3, z: 0.6 }, formalCharge: 0, moleculeId: 'mol_dopamine' });
      graph.addAtom({ id: 'hn2', atomicNumber: 1, position: { x: -6.0, y: 0.3, z: -0.6 }, formalCharge: 0, moleculeId: 'mol_dopamine' });
      graph.addBond({ id: 'b_nh1', atomA: 'n_amine', atomB: 'hn1', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b_nh2', atomA: 'n_amine', atomB: 'hn2', order: 1, type: 'SINGLE' });

      // Ring hydrogens on C3, C5, C6
      const rHydrogens = [
        { cId: 'c3', hId: 'h3', pos: { x: -0.7, y: 2.3, z: 0 } },
        { cId: 'c5', hId: 'h5', pos: { x: -2.3, y: -1.7, z: 0 } },
        { cId: 'c6', hId: 'h6', pos: { x: 1.2, y: -2.3, z: 0 } }
      ];
      rHydrogens.forEach((rh) => {
        graph.addAtom({ id: rh.hId, atomicNumber: 1, position: rh.pos, formalCharge: 0, moleculeId: 'mol_dopamine' });
        graph.addBond({ id: `b_${rh.cId}h`, atomA: rh.cId, atomB: rh.hId, order: 1, type: 'SINGLE' });
      });

      // Chain hydrogens on Ca and Cb
      graph.addAtom({ id: 'hca1', atomicNumber: 1, position: { x: -2.7, y: -0.8, z: 0.9 }, formalCharge: 0, moleculeId: 'mol_dopamine' });
      graph.addAtom({ id: 'hca2', atomicNumber: 1, position: { x: -2.7, y: -0.8, z: -0.9 }, formalCharge: 0, moleculeId: 'mol_dopamine' });
      graph.addBond({ id: 'b_cah1', atomA: 'ca', atomB: 'hca1', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b_cah2', atomA: 'ca', atomB: 'hca2', order: 1, type: 'SINGLE' });

      graph.addAtom({ id: 'hcb1', atomicNumber: 1, position: { x: -4.0, y: 1.2, z: 0.9 }, formalCharge: 0, moleculeId: 'mol_dopamine' });
      graph.addAtom({ id: 'hcb2', atomicNumber: 1, position: { x: -4.0, y: 1.2, z: -0.9 }, formalCharge: 0, moleculeId: 'mol_dopamine' });
      graph.addBond({ id: 'b_cbh1', atomA: 'cb', atomB: 'hcb1', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b_cbh2', atomA: 'cb', atomB: 'hcb2', order: 1, type: 'SINGLE' });

      const opt = GeometryOptimizationEngine.optimizeGeometry(graph.toMolecule(), 50);
      return opt.optimizedMolecule;
    }
  },

  // 15. ADRENALINE (Epinephrine)
  {
    id: 'adrenaline',
    name: 'Adrenaline',
    iupacName: '4-[1-Hydroxy-2-(methylamino)ethyl]benzene-1,2-diol',
    formula: 'C9H13NO3',
    category: 'Biomolecules',
    description: 'Hormone and neurotransmitter driving fight-or-flight response, increasing heart rate, vascular tone, and metabolic alertness.',
    polarizability: 18.1,
    dipoleMoment: 3.12,
    enthalpy: -410.5,
    pointGroup: 'C1',
    atomCount: 26,
    bondCount: 26,
    builder: () => {
      const graph = new MolecularGraph('mol_adrenaline', 'Adrenaline');
      // Benzene ring carbons
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3;
        graph.addAtom({
          id: `c${i + 1}`,
          atomicNumber: 6,
          position: { x: 1.4 * Math.cos(ang), y: 1.4 * Math.sin(ang), z: 0 },
          formalCharge: 0,
          moleculeId: 'mol_adrenaline'
        });
      }
      for (let i = 0; i < 6; i++) {
        const next = (i + 1) % 6;
        graph.addBond({ id: `b_cc_${i + 1}_${next + 1}`, atomA: `c${i + 1}`, atomB: `c${next + 1}`, order: 1.5, type: 'AROMATIC', aromatic: true });
      }

      // Catechol 1,2-Diol OH groups
      graph.addAtom({ id: 'o1', atomicNumber: 8, position: { x: 2.7, y: 0.2, z: 0 }, formalCharge: 0, moleculeId: 'mol_adrenaline' });
      graph.addAtom({ id: 'h_o1', atomicNumber: 1, position: { x: 3.4, y: -0.4, z: 0 }, formalCharge: 0, moleculeId: 'mol_adrenaline' });
      graph.addBond({ id: 'b_c1o1', atomA: 'c1', atomB: 'o1', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b_o1h', atomA: 'o1', atomB: 'h_o1', order: 1, type: 'SINGLE' });

      graph.addAtom({ id: 'o2', atomicNumber: 8, position: { x: 1.4, y: 2.7, z: 0 }, formalCharge: 0, moleculeId: 'mol_adrenaline' });
      graph.addAtom({ id: 'h_o2', atomicNumber: 1, position: { x: 2.2, y: 3.2, z: 0 }, formalCharge: 0, moleculeId: 'mol_adrenaline' });
      graph.addBond({ id: 'b_c2o2', atomA: 'c2', atomB: 'o2', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b_o2h', atomA: 'o2', atomB: 'h_o2', order: 1, type: 'SINGLE' });

      // Sidechain: C4-CH(OH)-CH2-NH-CH3
      graph.addAtom({ id: 'ca', atomicNumber: 6, position: { x: -2.7, y: -0.2, z: 0 }, formalCharge: 0, moleculeId: 'mol_adrenaline' });
      graph.addAtom({ id: 'oa', atomicNumber: 8, position: { x: -2.7, y: -1.5, z: 0 }, formalCharge: 0, moleculeId: 'mol_adrenaline' });
      graph.addAtom({ id: 'hoa', atomicNumber: 1, position: { x: -3.5, y: -1.9, z: 0 }, formalCharge: 0, moleculeId: 'mol_adrenaline' });
      graph.addBond({ id: 'b_caoa', atomA: 'ca', atomB: 'oa', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b_oah', atomA: 'oa', atomB: 'hoa', order: 1, type: 'SINGLE' });

      graph.addAtom({ id: 'cb', atomicNumber: 6, position: { x: -4.0, y: 0.6, z: 0 }, formalCharge: 0, moleculeId: 'mol_adrenaline' });
      graph.addAtom({ id: 'n_sec', atomicNumber: 7, position: { x: -5.3, y: -0.2, z: 0 }, formalCharge: 0, moleculeId: 'mol_adrenaline' });
      graph.addAtom({ id: 'c_methyl', atomicNumber: 6, position: { x: -6.6, y: 0.5, z: 0 }, formalCharge: 0, moleculeId: 'mol_adrenaline' });

      graph.addBond({ id: 'b_c4ca', atomA: 'c4', atomB: 'ca', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b_cacb', atomA: 'ca', atomB: 'cb', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b_cbn', atomA: 'cb', atomB: 'n_sec', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b_ncm', atomA: 'n_sec', atomB: 'c_methyl', order: 1, type: 'SINGLE' });

      // N-H Hydrogen
      graph.addAtom({ id: 'hn', atomicNumber: 1, position: { x: -5.3, y: -1.2, z: 0 }, formalCharge: 0, moleculeId: 'mol_adrenaline' });
      graph.addBond({ id: 'b_nh', atomA: 'n_sec', atomB: 'hn', order: 1, type: 'SINGLE' });

      // N-Methyl Hydrogens
      for (let j = 1; j <= 3; j++) {
        const hId = `h_m_${j}`;
        graph.addAtom({
          id: hId,
          atomicNumber: 1,
          position: { x: -7.2 + (j === 1 ? 0.6 : -0.2), y: 0.5 + (j === 2 ? 0.8 : -0.6), z: j === 3 ? 0.9 : -0.9 },
          formalCharge: 0,
          moleculeId: 'mol_adrenaline'
        });
        graph.addBond({ id: `b_cm_${hId}`, atomA: 'c_methyl', atomB: hId, order: 1, type: 'SINGLE' });
      }

      // Ring Hydrogens
      const rH = [
        { cId: 'c3', hId: 'h3', pos: { x: -0.7, y: 2.3, z: 0 } },
        { cId: 'c5', hId: 'h5', pos: { x: -2.3, y: -1.7, z: 0 } },
        { cId: 'c6', hId: 'h6', pos: { x: 1.2, y: -2.3, z: 0 } }
      ];
      rH.forEach((rh) => {
        graph.addAtom({ id: rh.hId, atomicNumber: 1, position: rh.pos, formalCharge: 0, moleculeId: 'mol_adrenaline' });
        graph.addBond({ id: `b_${rh.cId}h`, atomA: rh.cId, atomB: rh.hId, order: 1, type: 'SINGLE' });
      });

      // Chain H's on Ca and Cb
      graph.addAtom({ id: 'hca', atomicNumber: 1, position: { x: -2.7, y: 0.4, z: 0.9 }, formalCharge: 0, moleculeId: 'mol_adrenaline' });
      graph.addBond({ id: 'b_cah', atomA: 'ca', atomB: 'hca', order: 1, type: 'SINGLE' });

      graph.addAtom({ id: 'hcb1', atomicNumber: 1, position: { x: -4.0, y: 1.2, z: 0.9 }, formalCharge: 0, moleculeId: 'mol_adrenaline' });
      graph.addAtom({ id: 'hcb2', atomicNumber: 1, position: { x: -4.0, y: 1.2, z: -0.9 }, formalCharge: 0, moleculeId: 'mol_adrenaline' });
      graph.addBond({ id: 'b_cbh1', atomA: 'cb', atomB: 'hcb1', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b_cbh2', atomA: 'cb', atomB: 'hcb2', order: 1, type: 'SINGLE' });

      const opt = GeometryOptimizationEngine.optimizeGeometry(graph.toMolecule(), 50);
      return opt.optimizedMolecule;
    }
  },

  // 16. ADENINE (DNA / RNA Nucleobase A)
  {
    id: 'adenine',
    name: 'Adenine (A)',
    iupacName: '9H-Purin-6-amine',
    formula: 'C5H5N5',
    category: 'Biomolecules',
    description: 'Purine nucleobase A constituent of DNA/RNA genetic material and ATP energy transfer currency.',
    polarizability: 13.8,
    dipoleMoment: 2.50,
    enthalpy: 97.2,
    pointGroup: 'Cs',
    atomCount: 15,
    bondCount: 16,
    builder: () => {
      const graph = new MolecularGraph('mol_adenine', 'Adenine');
      // Purine ring system
      graph.addAtom({ id: 'n1', atomicNumber: 7, position: { x: -1.2, y: 1.2, z: 0 }, formalCharge: 0, moleculeId: 'mol_adenine' });
      graph.addAtom({ id: 'c2', atomicNumber: 6, position: { x: 0.1, y: 1.5, z: 0 }, formalCharge: 0, moleculeId: 'mol_adenine' });
      graph.addAtom({ id: 'n3', atomicNumber: 7, position: { x: 1.0, y: 0.5, z: 0 }, formalCharge: 0, moleculeId: 'mol_adenine' });
      graph.addAtom({ id: 'c4', atomicNumber: 6, position: { x: 0.6, y: -0.8, z: 0 }, formalCharge: 0, moleculeId: 'mol_adenine' });
      graph.addAtom({ id: 'c5', atomicNumber: 6, position: { x: -0.8, y: -1.0, z: 0 }, formalCharge: 0, moleculeId: 'mol_adenine' });
      graph.addAtom({ id: 'c6', atomicNumber: 6, position: { x: -1.6, y: 0.1, z: 0 }, formalCharge: 0, moleculeId: 'mol_adenine' });

      // 6-Amino group (-NH2) on C6
      graph.addAtom({ id: 'n6_amino', atomicNumber: 7, position: { x: -2.9, y: 0.2, z: 0 }, formalCharge: 0, moleculeId: 'mol_adenine' });
      graph.addAtom({ id: 'hn6a', atomicNumber: 1, position: { x: -3.5, y: 1.0, z: 0 }, formalCharge: 0, moleculeId: 'mol_adenine' });
      graph.addAtom({ id: 'hn6b', atomicNumber: 1, position: { x: -3.5, y: -0.6, z: 0 }, formalCharge: 0, moleculeId: 'mol_adenine' });

      graph.addBond({ id: 'b_c6n6', atomA: 'c6', atomB: 'n6_amino', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b_n6ha', atomA: 'n6_amino', atomB: 'hn6a', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b_n6hb', atomA: 'n6_amino', atomB: 'hn6b', order: 1, type: 'SINGLE' });

      // Imidazole ring fusion (N7, C8, N9)
      graph.addAtom({ id: 'n7', atomicNumber: 7, position: { x: 1.6, y: -1.7, z: 0 }, formalCharge: 0, moleculeId: 'mol_adenine' });
      graph.addAtom({ id: 'c8', atomicNumber: 6, position: { x: 0.8, y: -2.7, z: 0 }, formalCharge: 0, moleculeId: 'mol_adenine' });
      graph.addAtom({ id: 'n9', atomicNumber: 7, position: { x: -0.6, y: -2.3, z: 0 }, formalCharge: 0, moleculeId: 'mol_adenine' });

      // Ring bonds
      graph.addBond({ id: 'b1', atomA: 'n1', atomB: 'c2', order: 2, type: 'DOUBLE', aromatic: true });
      graph.addBond({ id: 'b2', atomA: 'c2', atomB: 'n3', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b3', atomA: 'n3', atomB: 'c4', order: 2, type: 'DOUBLE', aromatic: true });
      graph.addBond({ id: 'b4', atomA: 'c4', atomB: 'c5', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b5', atomA: 'c5', atomB: 'c6', order: 2, type: 'DOUBLE', aromatic: true });
      graph.addBond({ id: 'b6', atomA: 'c6', atomB: 'n1', order: 1, type: 'SINGLE' });

      graph.addBond({ id: 'b7', atomA: 'c4', atomB: 'n7', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b8', atomA: 'n7', atomB: 'c8', order: 2, type: 'DOUBLE', aromatic: true });
      graph.addBond({ id: 'b9', atomA: 'c8', atomB: 'n9', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b10', atomA: 'n9', atomB: 'c5', order: 1, type: 'SINGLE' });

      // Hydrogens on C2, C8, N9
      graph.addAtom({ id: 'h2', atomicNumber: 1, position: { x: 0.4, y: 2.5, z: 0 }, formalCharge: 0, moleculeId: 'mol_adenine' });
      graph.addAtom({ id: 'h8', atomicNumber: 1, position: { x: 1.2, y: -3.7, z: 0 }, formalCharge: 0, moleculeId: 'mol_adenine' });
      graph.addAtom({ id: 'h9', atomicNumber: 1, position: { x: -1.3, y: -2.9, z: 0 }, formalCharge: 0, moleculeId: 'mol_adenine' });

      graph.addBond({ id: 'b_c2h', atomA: 'c2', atomB: 'h2', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b_c8h', atomA: 'c8', atomB: 'h8', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b_n9h', atomA: 'n9', atomB: 'h9', order: 1, type: 'SINGLE' });

      const opt = GeometryOptimizationEngine.optimizeGeometry(graph.toMolecule(), 50);
      return opt.optimizedMolecule;
    }
  },

  // 17. THYMINE (DNA Nucleobase T)
  {
    id: 'thymine',
    name: 'Thymine (T)',
    iupacName: '5-Methylpyrimidine-2,4(1H,3H)-dione',
    formula: 'C5H6N2O2',
    category: 'Biomolecules',
    description: 'Pyrimidine nucleobase T exclusive to DNA genetic code, pairing with Adenine via 2 hydrogen bonds.',
    polarizability: 12.1,
    dipoleMoment: 4.10,
    enthalpy: -342.1,
    pointGroup: 'Cs',
    atomCount: 15,
    bondCount: 15,
    builder: () => {
      const graph = new MolecularGraph('mol_thymine', 'Thymine');
      // Pyrimidine-2,4-dione core
      graph.addAtom({ id: 'n1', atomicNumber: 7, position: { x: -1.2, y: 0.7, z: 0 }, formalCharge: 0, moleculeId: 'mol_thymine' });
      graph.addAtom({ id: 'c2', atomicNumber: 6, position: { x: 0, y: 1.4, z: 0 }, formalCharge: 0, moleculeId: 'mol_thymine' });
      graph.addAtom({ id: 'o2', atomicNumber: 8, position: { x: 0, y: 2.6, z: 0 }, formalCharge: 0, moleculeId: 'mol_thymine' });

      graph.addAtom({ id: 'n3', atomicNumber: 7, position: { x: 1.2, y: 0.7, z: 0 }, formalCharge: 0, moleculeId: 'mol_thymine' });
      graph.addAtom({ id: 'c4', atomicNumber: 6, position: { x: 1.2, y: -0.7, z: 0 }, formalCharge: 0, moleculeId: 'mol_thymine' });
      graph.addAtom({ id: 'o4', atomicNumber: 8, position: { x: 2.3, y: -1.4, z: 0 }, formalCharge: 0, moleculeId: 'mol_thymine' });

      graph.addAtom({ id: 'c5', atomicNumber: 6, position: { x: 0, y: -1.4, z: 0 }, formalCharge: 0, moleculeId: 'mol_thymine' });
      graph.addAtom({ id: 'c6', atomicNumber: 6, position: { x: -1.2, y: -0.7, z: 0 }, formalCharge: 0, moleculeId: 'mol_thymine' });

      // C5 Methyl group (-CH3)
      graph.addAtom({ id: 'c5_methyl', atomicNumber: 6, position: { x: 0, y: -2.9, z: 0 }, formalCharge: 0, moleculeId: 'mol_thymine' });

      // Core bonds
      graph.addBond({ id: 'b1', atomA: 'n1', atomB: 'c2', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b2', atomA: 'c2', atomB: 'o2', order: 2, type: 'DOUBLE' });
      graph.addBond({ id: 'b3', atomA: 'c2', atomB: 'n3', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b4', atomA: 'n3', atomB: 'c4', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b5', atomA: 'c4', atomB: 'o4', order: 2, type: 'DOUBLE' });
      graph.addBond({ id: 'b6', atomA: 'c4', atomB: 'c5', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b7', atomA: 'c5', atomB: 'c6', order: 2, type: 'DOUBLE' });
      graph.addBond({ id: 'b8', atomA: 'c6', atomB: 'n1', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b9', atomA: 'c5', atomB: 'c5_methyl', order: 1, type: 'SINGLE' });

      // Hydrogens on N1, N3, C6, and C5-methyl
      graph.addAtom({ id: 'hn1', atomicNumber: 1, position: { x: -2.1, y: 1.2, z: 0 }, formalCharge: 0, moleculeId: 'mol_thymine' });
      graph.addAtom({ id: 'hn3', atomicNumber: 1, position: { x: 2.1, y: 1.2, z: 0 }, formalCharge: 0, moleculeId: 'mol_thymine' });
      graph.addAtom({ id: 'hc6', atomicNumber: 1, position: { x: -2.1, y: -1.2, z: 0 }, formalCharge: 0, moleculeId: 'mol_thymine' });

      graph.addBond({ id: 'b_n1h', atomA: 'n1', atomB: 'hn1', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b_n3h', atomA: 'n3', atomB: 'hn3', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b_c6h', atomA: 'c6', atomB: 'hc6', order: 1, type: 'SINGLE' });

      for (let j = 1; j <= 3; j++) {
        const hId = `h_m_${j}`;
        graph.addAtom({
          id: hId,
          atomicNumber: 1,
          position: { x: (j === 1 ? 0.9 : -0.5), y: -3.5, z: j === 3 ? 0.9 : -0.5 },
          formalCharge: 0,
          moleculeId: 'mol_thymine'
        });
        graph.addBond({ id: `b_cm_${hId}`, atomA: 'c5_methyl', atomB: hId, order: 1, type: 'SINGLE' });
      }

      const opt = GeometryOptimizationEngine.optimizeGeometry(graph.toMolecule(), 50);
      return opt.optimizedMolecule;
    }
  },

  // 18. GUANINE (DNA / RNA Nucleobase G)
  {
    id: 'guanine',
    name: 'Guanine (G)',
    iupacName: '2-Amino-1H-purin-6(9H)-one',
    formula: 'C5H5N5O',
    category: 'Biomolecules',
    description: 'Purine nucleobase G constituent of DNA/RNA genetic code, forming 3 hydrogen bonds with Cytosine.',
    polarizability: 14.5,
    dipoleMoment: 6.80,
    enthalpy: -12.4,
    pointGroup: 'Cs',
    atomCount: 16,
    bondCount: 17,
    builder: () => {
      const graph = new MolecularGraph('mol_guanine', 'Guanine');
      // Purine core
      graph.addAtom({ id: 'n1', atomicNumber: 7, position: { x: -1.2, y: 1.2, z: 0 }, formalCharge: 0, moleculeId: 'mol_guanine' });
      graph.addAtom({ id: 'c2', atomicNumber: 6, position: { x: 0.1, y: 1.5, z: 0 }, formalCharge: 0, moleculeId: 'mol_guanine' });
      graph.addAtom({ id: 'n2_amino', atomicNumber: 7, position: { x: 0.5, y: 2.8, z: 0 }, formalCharge: 0, moleculeId: 'mol_guanine' });
      graph.addAtom({ id: 'n3', atomicNumber: 7, position: { x: 1.0, y: 0.5, z: 0 }, formalCharge: 0, moleculeId: 'mol_guanine' });
      graph.addAtom({ id: 'c4', atomicNumber: 6, position: { x: 0.6, y: -0.8, z: 0 }, formalCharge: 0, moleculeId: 'mol_guanine' });
      graph.addAtom({ id: 'c5', atomicNumber: 6, position: { x: -0.8, y: -1.0, z: 0 }, formalCharge: 0, moleculeId: 'mol_guanine' });
      graph.addAtom({ id: 'c6', atomicNumber: 6, position: { x: -1.6, y: 0.1, z: 0 }, formalCharge: 0, moleculeId: 'mol_guanine' });
      graph.addAtom({ id: 'o6', atomicNumber: 8, position: { x: -2.8, y: 0.1, z: 0 }, formalCharge: 0, moleculeId: 'mol_guanine' });

      // Imidazole ring fusion
      graph.addAtom({ id: 'n7', atomicNumber: 7, position: { x: 1.6, y: -1.7, z: 0 }, formalCharge: 0, moleculeId: 'mol_guanine' });
      graph.addAtom({ id: 'c8', atomicNumber: 6, position: { x: 0.8, y: -2.7, z: 0 }, formalCharge: 0, moleculeId: 'mol_guanine' });
      graph.addAtom({ id: 'n9', atomicNumber: 7, position: { x: -0.6, y: -2.3, z: 0 }, formalCharge: 0, moleculeId: 'mol_guanine' });

      // Bonds
      graph.addBond({ id: 'b1', atomA: 'n1', atomB: 'c2', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b2', atomA: 'c2', atomB: 'n2_amino', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b3', atomA: 'c2', atomB: 'n3', order: 2, type: 'DOUBLE', aromatic: true });
      graph.addBond({ id: 'b4', atomA: 'n3', atomB: 'c4', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b5', atomA: 'c4', atomB: 'c5', order: 2, type: 'DOUBLE', aromatic: true });
      graph.addBond({ id: 'b6', atomA: 'c5', atomB: 'c6', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b7', atomA: 'c6', atomB: 'o6', order: 2, type: 'DOUBLE' });
      graph.addBond({ id: 'b8', atomA: 'c6', atomB: 'n1', order: 1, type: 'SINGLE' });

      graph.addBond({ id: 'b9', atomA: 'c4', atomB: 'n7', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b10', atomA: 'n7', atomB: 'c8', order: 2, type: 'DOUBLE', aromatic: true });
      graph.addBond({ id: 'b11', atomA: 'c8', atomB: 'n9', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b12', atomA: 'n9', atomB: 'c5', order: 1, type: 'SINGLE' });

      // Hydrogens on N1, N2(a,b), C8, N9
      graph.addAtom({ id: 'hn1', atomicNumber: 1, position: { x: -1.9, y: 1.9, z: 0 }, formalCharge: 0, moleculeId: 'mol_guanine' });
      graph.addAtom({ id: 'hn2a', atomicNumber: 1, position: { x: 1.5, y: 3.0, z: 0 }, formalCharge: 0, moleculeId: 'mol_guanine' });
      graph.addAtom({ id: 'hn2b', atomicNumber: 1, position: { x: -0.1, y: 3.5, z: 0 }, formalCharge: 0, moleculeId: 'mol_guanine' });
      graph.addAtom({ id: 'h8', atomicNumber: 1, position: { x: 1.2, y: -3.7, z: 0 }, formalCharge: 0, moleculeId: 'mol_guanine' });
      graph.addAtom({ id: 'h9', atomicNumber: 1, position: { x: -1.3, y: -2.9, z: 0 }, formalCharge: 0, moleculeId: 'mol_guanine' });

      graph.addBond({ id: 'b_n1h', atomA: 'n1', atomB: 'hn1', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b_n2ha', atomA: 'n2_amino', atomB: 'hn2a', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b_n2hb', atomA: 'n2_amino', atomB: 'hn2b', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b_c8h', atomA: 'c8', atomB: 'h8', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b_n9h', atomA: 'n9', atomB: 'h9', order: 1, type: 'SINGLE' });

      const opt = GeometryOptimizationEngine.optimizeGeometry(graph.toMolecule(), 50);
      return opt.optimizedMolecule;
    }
  },

  // 19. CYTOSINE (DNA / RNA Nucleobase C)
  {
    id: 'cytosine',
    name: 'Cytosine (C)',
    iupacName: '4-Aminopyrimidin-2(1H)-one',
    formula: 'C4H5N3O',
    category: 'Biomolecules',
    description: 'Pyrimidine nucleobase C constituent of DNA/RNA genetic code, forming 3 hydrogen bonds with Guanine.',
    polarizability: 11.2,
    dipoleMoment: 6.20,
    enthalpy: -218.4,
    pointGroup: 'Cs',
    atomCount: 13,
    bondCount: 13,
    builder: () => {
      const graph = new MolecularGraph('mol_cytosine', 'Cytosine');
      // Pyrimidin-2-one core
      graph.addAtom({ id: 'n1', atomicNumber: 7, position: { x: -1.2, y: 0.7, z: 0 }, formalCharge: 0, moleculeId: 'mol_cytosine' });
      graph.addAtom({ id: 'c2', atomicNumber: 6, position: { x: 0, y: 1.4, z: 0 }, formalCharge: 0, moleculeId: 'mol_cytosine' });
      graph.addAtom({ id: 'o2', atomicNumber: 8, position: { x: 0, y: 2.6, z: 0 }, formalCharge: 0, moleculeId: 'mol_cytosine' });

      graph.addAtom({ id: 'n3', atomicNumber: 7, position: { x: 1.2, y: 0.7, z: 0 }, formalCharge: 0, moleculeId: 'mol_cytosine' });
      graph.addAtom({ id: 'c4', atomicNumber: 6, position: { x: 1.2, y: -0.7, z: 0 }, formalCharge: 0, moleculeId: 'mol_cytosine' });
      graph.addAtom({ id: 'n4_amino', atomicNumber: 7, position: { x: 2.4, y: -1.4, z: 0 }, formalCharge: 0, moleculeId: 'mol_cytosine' });

      graph.addAtom({ id: 'c5', atomicNumber: 6, position: { x: 0, y: -1.4, z: 0 }, formalCharge: 0, moleculeId: 'mol_cytosine' });
      graph.addAtom({ id: 'c6', atomicNumber: 6, position: { x: -1.2, y: -0.7, z: 0 }, formalCharge: 0, moleculeId: 'mol_cytosine' });

      // Core bonds
      graph.addBond({ id: 'b1', atomA: 'n1', atomB: 'c2', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b2', atomA: 'c2', atomB: 'o2', order: 2, type: 'DOUBLE' });
      graph.addBond({ id: 'b3', atomA: 'c2', atomB: 'n3', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b4', atomA: 'n3', atomB: 'c4', order: 2, type: 'DOUBLE', aromatic: true });
      graph.addBond({ id: 'b5', atomA: 'c4', atomB: 'n4_amino', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b6', atomA: 'c4', atomB: 'c5', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b7', atomA: 'c5', atomB: 'c6', order: 2, type: 'DOUBLE' });
      graph.addBond({ id: 'b8', atomA: 'c6', atomB: 'n1', order: 1, type: 'SINGLE' });

      // Hydrogens on N1, N4(a,b), C5, C6
      graph.addAtom({ id: 'hn1', atomicNumber: 1, position: { x: -2.1, y: 1.2, z: 0 }, formalCharge: 0, moleculeId: 'mol_cytosine' });
      graph.addAtom({ id: 'hn4a', atomicNumber: 1, position: { x: 3.2, y: -0.9, z: 0 }, formalCharge: 0, moleculeId: 'mol_cytosine' });
      graph.addAtom({ id: 'hn4b', atomicNumber: 1, position: { x: 2.4, y: -2.4, z: 0 }, formalCharge: 0, moleculeId: 'mol_cytosine' });
      graph.addAtom({ id: 'hc5', atomicNumber: 1, position: { x: 0, y: -2.5, z: 0 }, formalCharge: 0, moleculeId: 'mol_cytosine' });
      graph.addAtom({ id: 'hc6', atomicNumber: 1, position: { x: -2.1, y: -1.2, z: 0 }, formalCharge: 0, moleculeId: 'mol_cytosine' });

      graph.addBond({ id: 'b_n1h', atomA: 'n1', atomB: 'hn1', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b_n4ha', atomA: 'n4_amino', atomB: 'hn4a', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b_n4hb', atomA: 'n4_amino', atomB: 'hn4b', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b_c5h', atomA: 'c5', atomB: 'hc5', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b_c6h', atomA: 'c6', atomB: 'hc6', order: 1, type: 'SINGLE' });

      const opt = GeometryOptimizationEngine.optimizeGeometry(graph.toMolecule(), 50);
      return opt.optimizedMolecule;
    }
  },

  // 20. URACIL (RNA Nucleobase U)
  {
    id: 'uracil',
    name: 'Uracil (U)',
    iupacName: 'Pyrimidine-2,4(1H,3H)-dione',
    formula: 'C4H4N2O2',
    category: 'Biomolecules',
    description: 'Pyrimidine nucleobase U exclusive to RNA genetic code, replacing Thymine to pair with Adenine.',
    polarizability: 10.4,
    dipoleMoment: 4.25,
    enthalpy: -302.5,
    pointGroup: 'Cs',
    atomCount: 12,
    bondCount: 12,
    builder: () => {
      const graph = new MolecularGraph('mol_uracil', 'Uracil');
      // Pyrimidine-2,4-dione core
      graph.addAtom({ id: 'n1', atomicNumber: 7, position: { x: -1.2, y: 0.7, z: 0 }, formalCharge: 0, moleculeId: 'mol_uracil' });
      graph.addAtom({ id: 'c2', atomicNumber: 6, position: { x: 0, y: 1.4, z: 0 }, formalCharge: 0, moleculeId: 'mol_uracil' });
      graph.addAtom({ id: 'o2', atomicNumber: 8, position: { x: 0, y: 2.6, z: 0 }, formalCharge: 0, moleculeId: 'mol_uracil' });

      graph.addAtom({ id: 'n3', atomicNumber: 7, position: { x: 1.2, y: 0.7, z: 0 }, formalCharge: 0, moleculeId: 'mol_uracil' });
      graph.addAtom({ id: 'c4', atomicNumber: 6, position: { x: 1.2, y: -0.7, z: 0 }, formalCharge: 0, moleculeId: 'mol_uracil' });
      graph.addAtom({ id: 'o4', atomicNumber: 8, position: { x: 2.3, y: -1.4, z: 0 }, formalCharge: 0, moleculeId: 'mol_uracil' });

      graph.addAtom({ id: 'c5', atomicNumber: 6, position: { x: 0, y: -1.4, z: 0 }, formalCharge: 0, moleculeId: 'mol_uracil' });
      graph.addAtom({ id: 'c6', atomicNumber: 6, position: { x: -1.2, y: -0.7, z: 0 }, formalCharge: 0, moleculeId: 'mol_uracil' });

      // Core bonds
      graph.addBond({ id: 'b1', atomA: 'n1', atomB: 'c2', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b2', atomA: 'c2', atomB: 'o2', order: 2, type: 'DOUBLE' });
      graph.addBond({ id: 'b3', atomA: 'c2', atomB: 'n3', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b4', atomA: 'n3', atomB: 'c4', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b5', atomA: 'c4', atomB: 'o4', order: 2, type: 'DOUBLE' });
      graph.addBond({ id: 'b6', atomA: 'c4', atomB: 'c5', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b7', atomA: 'c5', atomB: 'c6', order: 2, type: 'DOUBLE' });
      graph.addBond({ id: 'b8', atomA: 'c6', atomB: 'n1', order: 1, type: 'SINGLE' });

      // Hydrogens on N1, N3, C5, C6
      graph.addAtom({ id: 'hn1', atomicNumber: 1, position: { x: -2.1, y: 1.2, z: 0 }, formalCharge: 0, moleculeId: 'mol_uracil' });
      graph.addAtom({ id: 'hn3', atomicNumber: 1, position: { x: 2.1, y: 1.2, z: 0 }, formalCharge: 0, moleculeId: 'mol_uracil' });
      graph.addAtom({ id: 'hc5', atomicNumber: 1, position: { x: 0, y: -2.5, z: 0 }, formalCharge: 0, moleculeId: 'mol_uracil' });
      graph.addAtom({ id: 'hc6', atomicNumber: 1, position: { x: -2.1, y: -1.2, z: 0 }, formalCharge: 0, moleculeId: 'mol_uracil' });

      graph.addBond({ id: 'b_n1h', atomA: 'n1', atomB: 'hn1', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b_n3h', atomA: 'n3', atomB: 'hn3', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b_c5h', atomA: 'c5', atomB: 'hc5', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b_c6h', atomA: 'c6', atomB: 'hc6', order: 1, type: 'SINGLE' });

      const opt = GeometryOptimizationEngine.optimizeGeometry(graph.toMolecule(), 50);
      return opt.optimizedMolecule;
    }
  },

  // 21. GLUCOSE (D-Glucose / Glucopyranose)
  {
    id: 'glucose',
    name: 'D-Glucose',
    iupacName: '(2R,3S,4R,5R)-2,3,4,5,6-Pentahydroxyhexanal',
    formula: 'C6H12O6',
    category: 'Biomolecules',
    description: 'Essential hexose monosaccharide carbohydrate providing primary cellular energy currency in living organisms.',
    polarizability: 15.4,
    dipoleMoment: 3.80,
    enthalpy: -1271.0,
    pointGroup: 'C1',
    atomCount: 24,
    bondCount: 24,
    builder: () => {
      const graph = new MolecularGraph('mol_glucose', 'D-Glucose');
      // Pyranose 6-membered ring: C1, C2, C3, C4, C5, O5
      const cPos = [
        { id: 'c1', pos: { x: 1.4, y: 0.8, z: 0.2 } },
        { id: 'c2', pos: { x: 0.7, y: -0.5, z: -0.2 } },
        { id: 'c3', pos: { x: -0.7, y: -0.5, z: 0.2 } },
        { id: 'c4', pos: { x: -1.4, y: 0.8, z: -0.2 } },
        { id: 'c5', pos: { x: -0.7, y: 1.9, z: 0.2 } },
        { id: 'o5', pos: { x: 0.7, y: 1.9, z: -0.2 } }
      ];

      graph.addAtom({ id: 'c1', atomicNumber: 6, position: cPos[0].pos, formalCharge: 0, moleculeId: 'mol_glucose' });
      graph.addAtom({ id: 'c2', atomicNumber: 6, position: cPos[1].pos, formalCharge: 0, moleculeId: 'mol_glucose' });
      graph.addAtom({ id: 'c3', atomicNumber: 6, position: cPos[2].pos, formalCharge: 0, moleculeId: 'mol_glucose' });
      graph.addAtom({ id: 'c4', atomicNumber: 6, position: cPos[3].pos, formalCharge: 0, moleculeId: 'mol_glucose' });
      graph.addAtom({ id: 'c5', atomicNumber: 6, position: cPos[4].pos, formalCharge: 0, moleculeId: 'mol_glucose' });
      graph.addAtom({ id: 'o5', atomicNumber: 8, position: cPos[5].pos, formalCharge: 0, moleculeId: 'mol_glucose' });

      // Ring bonds
      graph.addBond({ id: 'b_c1c2', atomA: 'c1', atomB: 'c2', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b_c2c3', atomA: 'c2', atomB: 'c3', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b_c3c4', atomA: 'c3', atomB: 'c4', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b_c4c5', atomA: 'c4', atomB: 'c5', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b_c5o5', atomA: 'c5', atomB: 'o5', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b_o5c1', atomA: 'o5', atomB: 'c1', order: 1, type: 'SINGLE' });

      // C6 hydroxymethyl group (-CH2OH on C5)
      graph.addAtom({ id: 'c6', atomicNumber: 6, position: { x: -1.4, y: 3.1, z: 0.5 }, formalCharge: 0, moleculeId: 'mol_glucose' });
      graph.addAtom({ id: 'o6', atomicNumber: 8, position: { x: -2.7, y: 3.1, z: 0.1 }, formalCharge: 0, moleculeId: 'mol_glucose' });
      graph.addAtom({ id: 'ho6', atomicNumber: 1, position: { x: -3.1, y: 3.9, z: 0.4 }, formalCharge: 0, moleculeId: 'mol_glucose' });

      graph.addBond({ id: 'b_c5c6', atomA: 'c5', atomB: 'c6', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b_c6o6', atomA: 'c6', atomB: 'o6', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b_o6h', atomA: 'o6', atomB: 'ho6', order: 1, type: 'SINGLE' });

      // C6 Hydrogens
      graph.addAtom({ id: 'hc6a', atomicNumber: 1, position: { x: -1.4, y: 3.1, z: 1.6 }, formalCharge: 0, moleculeId: 'mol_glucose' });
      graph.addAtom({ id: 'hc6b', atomicNumber: 1, position: { x: -0.9, y: 3.9, z: 0.1 }, formalCharge: 0, moleculeId: 'mol_glucose' });
      graph.addBond({ id: 'b_c6ha', atomA: 'c6', atomB: 'hc6a', order: 1, type: 'SINGLE' });
      graph.addBond({ id: 'b_c6hb', atomA: 'c6', atomB: 'hc6b', order: 1, type: 'SINGLE' });

      // Hydroxyl (-OH) groups on C1, C2, C3, C4
      const hydroxyls = [
        { cId: 'c1', oId: 'o1', hId: 'ho1', oPos: { x: 2.7, y: 0.8, z: 0.5 }, hPos: { x: 3.2, y: 0.1, z: 0.2 } },
        { cId: 'c2', oId: 'o2', hId: 'ho2', oPos: { x: 1.4, y: -1.6, z: -0.5 }, hPos: { x: 1.0, y: -2.3, z: -0.9 } },
        { cId: 'c3', oId: 'o3', hId: 'ho3', oPos: { x: -1.4, y: -1.6, z: 0.5 }, hPos: { x: -1.0, y: -2.3, z: 0.9 } },
        { cId: 'c4', oId: 'o4', hId: 'ho4', oPos: { x: -2.7, y: 0.8, z: -0.5 }, hPos: { x: -3.2, y: 1.5, z: -0.2 } }
      ];

      hydroxyls.forEach((oh) => {
        graph.addAtom({ id: oh.oId, atomicNumber: 8, position: oh.oPos, formalCharge: 0, moleculeId: 'mol_glucose' });
        graph.addAtom({ id: oh.hId, atomicNumber: 1, position: oh.hPos, formalCharge: 0, moleculeId: 'mol_glucose' });
        graph.addBond({ id: `b_${oh.cId}${oh.oId}`, atomA: oh.cId, atomB: oh.oId, order: 1, type: 'SINGLE' });
        graph.addBond({ id: `b_${oh.oId}h`, atomA: oh.oId, atomB: oh.hId, order: 1, type: 'SINGLE' });
      });

      // Hydrogens on C1, C2, C3, C4, C5
      const ringHydrogens = [
        { cId: 'c1', hId: 'hc1', pos: { x: 1.4, y: 0.8, z: -0.9 } },
        { cId: 'c2', hId: 'hc2', pos: { x: 0.7, y: -0.5, z: 0.9 } },
        { cId: 'c3', hId: 'hc3', pos: { x: -0.7, y: -0.5, z: -0.9 } },
        { cId: 'c4', hId: 'hc4', pos: { x: -1.4, y: 0.8, z: 0.9 } },
        { cId: 'c5', hId: 'hc5', pos: { x: -0.7, y: 1.9, z: -0.9 } }
      ];

      ringHydrogens.forEach((rh) => {
        graph.addAtom({ id: rh.hId, atomicNumber: 1, position: rh.pos, formalCharge: 0, moleculeId: 'mol_glucose' });
        graph.addBond({ id: `b_${rh.cId}h`, atomA: rh.cId, atomB: rh.hId, order: 1, type: 'SINGLE' });
      });

      const opt = GeometryOptimizationEngine.optimizeGeometry(graph.toMolecule(), 50);
      return opt.optimizedMolecule;
    }
  }
];

