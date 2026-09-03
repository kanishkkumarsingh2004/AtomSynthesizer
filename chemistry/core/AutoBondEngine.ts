import { Molecule } from '../../domain/molecular/Molecule';
import { MolecularGraph } from '../../domain/molecular/MolecularGraph';
import { ElementRepository } from '../../domain/elements/ElementRepository';
import { distance } from '../../lib/math';
import { Bond } from '../../domain/molecular/Bond';
import { generateBondId } from '../../lib/ids';
import { BondOrder, BondType } from '../../domain/molecular/MolecularTypes';

export interface AutoBondOptions {
  toleranceRatio?: number; // default 1.85 (185% of sum of covalent radii, up to ~2.4 Å)
  maxBondsPerAtom?: boolean; // respect valence capacity limits if true
  autoBreakDistantBonds?: boolean;
}

export class AutoBondEngine {
  public static autoBondMolecule(
    molecule: Molecule,
    options: AutoBondOptions = {}
  ): { updatedMolecule: Molecule; newBondsCount: number; brokenBondsCount: number } {
    const {
      toleranceRatio = 1.25, // Physical covalent distance cutoff: 125% of sum of covalent radii
      maxBondsPerAtom = true,
      autoBreakDistantBonds = true
    } = options;

    const graph = MolecularGraph.fromMolecule(molecule);
    const atoms = graph.getAllAtoms();
    let newBondsCount = 0;
    let brokenBondsCount = 0;

    // 1. Break hyper-bonded Hydrogen, Halogens, or excessively distant non-covalent bonds
    for (const bond of graph.getAllBonds()) {
      const atomA = graph.getAtom(bond.atomA);
      const atomB = graph.getAtom(bond.atomB);
      if (!atomA || !atomB) continue;

      // Hydrogen can NEVER have more than 1 bond! Break extra bonds
      if ((atomA.atomicNumber === 1 && graph.calculateValence(atomA.id) > 1) ||
          (atomB.atomicNumber === 1 && graph.calculateValence(atomB.id) > 1)) {
        graph.removeBond(bond.id);
        brokenBondsCount++;
        continue;
      }

      // Halogens (F, Cl, Br, I) cannot have more than 1 covalent bond
      if (([9, 17, 35, 53].includes(atomA.atomicNumber) && graph.calculateValence(atomA.id) > 1) ||
          ([9, 17, 35, 53].includes(atomB.atomicNumber) && graph.calculateValence(atomB.id) > 1)) {
        graph.removeBond(bond.id);
        brokenBondsCount++;
        continue;
      }

      if (autoBreakDistantBonds) {
        const elA = ElementRepository.getByAtomicNumber(atomA.atomicNumber);
        const elB = ElementRepository.getByAtomicNumber(atomB.atomicNumber);
        const radA = elA ? elA.covalentRadius : 0.8;
        const radB = elB ? elB.covalentRadius : 0.8;
        const dist = distance(atomA.position, atomB.position);

        const breakThreshold = (radA + radB) * 1.45;
        if (dist > breakThreshold) {
          graph.removeBond(bond.id);
          brokenBondsCount++;
        }
      }
    }

    // 2. Check candidate atom pairs for covalent auto-bonding
    for (let i = 0; i < atoms.length; i++) {
      for (let j = i + 1; j < atoms.length; j++) {
        const atomA = atoms[i];
        const atomB = atoms[j];

        // Skip if bond already exists
        if (graph.findBond(atomA.id, atomB.id)) continue;

        const elA = ElementRepository.getByAtomicNumber(atomA.atomicNumber);
        const elB = ElementRepository.getByAtomicNumber(atomB.atomicNumber);

        // Noble gases (He, Ne, Ar, etc.) do not form covalent bonds
        if (elA?.category === 'noble-gas' || elB?.category === 'noble-gas') {
          continue;
        }

        // Electronegativity Difference Condition: Δχ > 1.7 leads to Ionic interaction, not covalent electron sharing
        const chiA = elA?.electronegativity ?? 2.2;
        const chiB = elB?.electronegativity ?? 2.2;
        if (Math.abs(chiA - chiB) > 1.7) {
          continue; // Ionic regime: electron transfer instead of covalent sharing
        }

        // 1,3-Pair Non-Bonded Exclusion: atoms connected to a common neighbor should not auto-cross-bond
        const neighborsA = graph.getNeighbors(atomA.id).map((n) => n.id);
        const neighborsB = graph.getNeighbors(atomB.id).map((n) => n.id);
        const sharesCommonNeighbor = neighborsA.some((nId) => neighborsB.includes(nId));

        const radA = elA ? elA.covalentRadius : 0.8;
        const radB = elB ? elB.covalentRadius : 0.8;
        const rSingle = radA + radB;
        const dist = distance(atomA.position, atomB.position);

        if (sharesCommonNeighbor && dist > rSingle * 1.10) {
          continue; // Prevent 1,3-cross bonding in angles (e.g. C1-C3 in propane/isobutane)
        }

        const valA = graph.calculateValence(atomA.id);
        const valB = graph.calculateValence(atomB.id);

        const maxValA = elA ? Math.max(...elA.typicalValence, 1) : 4;
        const maxValB = elB ? Math.max(...elB.typicalValence, 1) : 4;

        // STRICT HARD OCTET & VALENCE CAP:
        // Hydrogen (H) or Halogens (F, Cl, Br, I) cannot exceed 1 bond
        if (atomA.atomicNumber === 1 && valA >= 1) continue;
        if (atomB.atomicNumber === 1 && valB >= 1) continue;
        if ([9, 17, 35, 53].includes(atomA.atomicNumber) && valA >= 1) continue;
        if ([9, 17, 35, 53].includes(atomB.atomicNumber) && valB >= 1) continue;

        // Carbon (C) strictly max 4 bonds (Octet rule)
        if (atomA.atomicNumber === 6 && valA >= 4) continue;
        if (atomB.atomicNumber === 6 && valB >= 4) continue;

        // General valence capacity check
        if (maxBondsPerAtom) {
          if (valA >= maxValA || valB >= maxValB) {
            continue;
          }
        }

        const maxDist = rSingle * toleranceRatio; // Strict physical covalent cutoff (125% of r_single)

        if (dist <= maxDist && dist > 0.05) {
          const neededA = maxValA - valA;
          const neededB = maxValB - valB;

          // Determine bond order (Single, Double, or Triple) based on needed valence and distance
          let order: BondOrder = 1;
          let type: BondType = 'SINGLE';

          if (atomA.atomicNumber !== 1 && atomB.atomicNumber !== 1) {
            // Triple bond condition: both atoms need >= 3 bonds and distance is close (C≡C, N≡N)
            if (neededA >= 3 && neededB >= 3 && dist <= rSingle * 0.90) {
              order = 3;
              type = 'TRIPLE';
            }
            // Double bond condition: both atoms need >= 2 bonds and distance is close (C=C, O=O, C=O)
            else if (neededA >= 2 && neededB >= 2 && dist <= rSingle * 1.05) {
              order = 2;
              type = 'DOUBLE';
            }
          }

          const newBond: Bond = {
            id: generateBondId(),
            atomA: atomA.id,
            atomB: atomB.id,
            order,
            type
          };

          try {
            graph.addBond(newBond);
            newBondsCount++;
          } catch {
            // Ignore if graph rejects
          }
        }
      }
    }

    return {
      updatedMolecule: graph.toMolecule(),
      newBondsCount,
      brokenBondsCount
    };
  }
}
