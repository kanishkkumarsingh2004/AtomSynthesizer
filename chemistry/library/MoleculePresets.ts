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
  }
];
