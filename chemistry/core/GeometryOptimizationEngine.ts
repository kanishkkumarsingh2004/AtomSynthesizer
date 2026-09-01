import { Molecule } from '../../domain/molecular/Molecule';
import { MolecularGraph } from '../../domain/molecular/MolecularGraph';
import { ElementRepository } from '../../domain/elements/ElementRepository';
import { distance, subtract, normalize, add, scale, angle, dot, cross } from '../../lib/math';
import { Vector3D } from '../../domain/molecular/MolecularTypes';

export interface OptimizationResult {
  optimizedMolecule: Molecule;
  initialEnergyKj: number;
  finalEnergyKj: number;
  stepsExecuted: number;
  converged: boolean;
}

export class GeometryOptimizationEngine {
  /**
   * Determines the ideal VSEPR bond angle for a central atom based on neighbor count and electron geometry
   */
  public static getIdealVSEPRAngle(graph: MolecularGraph, centralAtomId: string): number {
    const atom = graph.getAtom(centralAtomId);
    if (!atom) return 109.47;

    const neighbors = graph.getNeighbors(centralAtomId);
    const numNeighbors = neighbors.length;

    // AX4 (Tetrahedral): Methane CH4, C-sp3 -> 109.47 degrees
    if (numNeighbors >= 4) {
      return 109.47;
    }
    // AX3 (Trigonal Planar / Pyramidal): Ethene / Ammonia -> 120.0 or 107.0 degrees
    if (numNeighbors === 3) {
      if (atom.atomicNumber === 7) return 107.0; // Ammonia-like
      return 120.0; // Trigonal planar
    }
    // AX2 (Bent or Linear): Water H2O -> 104.5 degrees, CO2 -> 180 degrees
    if (numNeighbors === 2) {
      if (atom.atomicNumber === 8 || atom.atomicNumber === 16) return 104.5; // Water / H2S bent
      const bonds = graph.getBondsForAtom(centralAtomId);
      const isLinear = bonds.some((b) => b.order >= 2);
      return isLinear ? 180.0 : 109.47;
    }

    return 109.47;
  }

  /**
   * Calculates total potential energy (Bonds + VSEPR Angles + Repulsion + Instability) in kJ/mol
   */
  public static calculatePotentialEnergy(graph: MolecularGraph): number {
    let energy = 0;
    const atoms = graph.getAllAtoms();

    // 1. Bond stretching energy: E_bond = 0.5 * k_b * (r - r0)^2
    for (const bond of graph.getAllBonds()) {
      const atomA = graph.getAtom(bond.atomA);
      const atomB = graph.getAtom(bond.atomB);
      if (!atomA || !atomB) continue;

      const elA = ElementRepository.getByAtomicNumber(atomA.atomicNumber);
      const elB = ElementRepository.getByAtomicNumber(atomB.atomicNumber);

      const r0 = (elA?.covalentRadius ?? 0.8) + (elB?.covalentRadius ?? 0.8);
      const r = distance(atomA.position, atomB.position);
      const kb = 1400; // kJ/(mol * Å^2)

      energy += 0.5 * kb * Math.pow(r - r0, 2);
    }

    // 2. VSEPR Angle bending energy: E_angle = 0.5 * k_theta * (theta - theta0)^2
    for (const center of atoms) {
      const neighbors = graph.getNeighbors(center.id);
      if (neighbors.length >= 2) {
        const theta0 = this.getIdealVSEPRAngle(graph, center.id);
        const kTheta = 1.2; // kJ/(mol * deg^2)

        for (let i = 0; i < neighbors.length; i++) {
          for (let j = i + 1; j < neighbors.length; j++) {
            const currentAngle = angle(neighbors[i].position, center.position, neighbors[j].position);
            energy += 0.5 * kTheta * Math.pow(currentAngle - theta0, 2);
          }
        }
      }
    }

    // 3. Non-bonded repulsion energy
    for (let i = 0; i < atoms.length; i++) {
      for (let j = i + 1; j < atoms.length; j++) {
        const a1 = atoms[i];
        const a2 = atoms[j];
        if (graph.findBond(a1.id, a2.id)) continue;

        const el1 = ElementRepository.getByAtomicNumber(a1.atomicNumber);
        const el2 = ElementRepository.getByAtomicNumber(a2.atomicNumber);
        const sigma = ((el1?.vanDerWaalsRadius ?? 1.5) + (el2?.vanDerWaalsRadius ?? 1.5)) * 0.85;

        const r = Math.max(0.4, distance(a1.position, a2.position));
        if (r < sigma) {
          const ratio = sigma / r;
          energy += 4.0 * (Math.pow(ratio, 12) - Math.pow(ratio, 6));
        }
      }
    }

    // 4. Over-valence severe instability penalty (e.g. Hydrogen >1 bond)
    for (const atom of atoms) {
      const valence = graph.calculateValence(atom.id);
      if (atom.atomicNumber === 1 && valence > 1) {
        energy += (valence - 1) * 800.0;
      }
    }

    return Math.round(energy * 100) / 100;
  }

  /**
   * Aligns atoms and molecules into their stable VSEPR bond distances and 3D angles
   */
  public static optimizeGeometry(
    molecule: Molecule,
    maxSteps = 150,
    stepSize = 0.12
  ): OptimizationResult {
    const graph = MolecularGraph.fromMolecule(molecule);

    // Auto-fix any invalid hyper-bonded Hydrogen before geometry alignment
    for (const bond of graph.getAllBonds()) {
      const a1 = graph.getAtom(bond.atomA);
      const a2 = graph.getAtom(bond.atomB);
      if ((a1 && a1.atomicNumber === 1 && graph.calculateValence(a1.id) > 1) ||
          (a2 && a2.atomicNumber === 1 && graph.calculateValence(a2.id) > 1)) {
        graph.removeBond(bond.id);
      }
    }

    // Break 2D coplanar symmetry for 4-coordinate central atoms (e.g., Methane CH4 placed on 2D plane)
    for (const center of graph.getAllAtoms()) {
      const neighbors = graph.getNeighbors(center.id);
      if (neighbors.length === 4) {
        const vec0 = subtract(neighbors[0].position, center.position);
        const vec1 = subtract(neighbors[1].position, center.position);
        const vec2 = subtract(neighbors[2].position, center.position);
        const normalPlane = cross(vec0, vec1);
        const coplanarCheck = Math.abs(dot(normalize(normalPlane), normalize(vec2)));

        if (coplanarCheck < 0.25 || (Math.abs(vec0.z) < 0.1 && Math.abs(vec1.z) < 0.1 && Math.abs(vec2.z) < 0.1)) {
          // Push 0 & 2 in +Z, 1 & 3 in -Z out-of-plane
          neighbors[0].position.z += 0.45;
          neighbors[1].position.z -= 0.45;
          neighbors[2].position.z += 0.45;
          neighbors[3].position.z -= 0.45;
        }
      }
    }

    const initialEnergy = this.calculatePotentialEnergy(graph);
    let currentEnergy = initialEnergy;
    let converged = false;
    let stepsExecuted = 0;

    for (let step = 0; step < maxSteps; step++) {
      stepsExecuted++;
      const atoms = graph.getAllAtoms();
      const forces: Map<string, Vector3D> = new Map();

      for (const atom of atoms) {
        forces.set(atom.id, { x: 0, y: 0, z: 0 });
      }

      // 1. Covalent bond stretch forces
      for (const bond of graph.getAllBonds()) {
        const atomA = graph.getAtom(bond.atomA);
        const atomB = graph.getAtom(bond.atomB);
        if (!atomA || !atomB) continue;

        const elA = ElementRepository.getByAtomicNumber(atomA.atomicNumber);
        const elB = ElementRepository.getByAtomicNumber(atomB.atomicNumber);
        const r0 = (elA?.covalentRadius ?? 0.8) + (elB?.covalentRadius ?? 0.8);
        const r = distance(atomA.position, atomB.position);

        if (r > 0.001) {
          const delta = r - r0;
          const k = 1200;
          const forceMag = -k * delta;

          const dirAtoB = normalize(subtract(atomB.position, atomA.position));
          const fA = scale(dirAtoB, -forceMag);
          const fB = scale(dirAtoB, forceMag);

          forces.set(atomA.id, add(forces.get(atomA.id)!, fA));
          forces.set(atomB.id, add(forces.get(atomB.id)!, fB));
        }
      }

      // 2. VSEPR 3D Angle bending & Tetrahedral target forces
      for (const center of atoms) {
        const neighbors = graph.getNeighbors(center.id);

        // 4-COORDINATE TETRAHEDRAL (e.g. CH4 Methane, C-sp3)
        if (neighbors.length === 4) {
          const elC = ElementRepository.getByAtomicNumber(center.atomicNumber);
          const elN0 = ElementRepository.getByAtomicNumber(neighbors[0].atomicNumber);
          const r0 = (elC?.covalentRadius ?? 0.76) + (elN0?.covalentRadius ?? 0.31);
          const s = r0 / Math.sqrt(3);

          // 3D Tetrahedral basis vectors relative to center
          const idealOffsets: Vector3D[] = [
            { x:  s, y:  s, z:  s },
            { x: -s, y: -s, z:  s },
            { x: -s, y:  s, z: -s },
            { x:  s, y: -s, z: -s }
          ];

          for (let k = 0; k < 4; k++) {
            const n = neighbors[k];
            const targetPos = add(center.position, idealOffsets[k]);
            const dirToTarget = subtract(targetPos, n.position);
            const tetForce = scale(dirToTarget, 550.0);
            forces.set(n.id, add(forces.get(n.id)!, tetForce));
          }
        }

        if (neighbors.length >= 2) {
          const theta0 = this.getIdealVSEPRAngle(graph, center.id);

          for (let i = 0; i < neighbors.length; i++) {
            for (let j = i + 1; j < neighbors.length; j++) {
              const n1 = neighbors[i];
              const n2 = neighbors[j];

              const vec1 = subtract(n1.position, center.position);
              const vec2 = subtract(n2.position, center.position);
              const d1 = distance(n1.position, center.position);
              const d2 = distance(n2.position, center.position);

              if (d1 > 0.01 && d2 > 0.01) {
                const currentDeg = angle(n1.position, center.position, n2.position);
                const angleDeltaRad = ((currentDeg - theta0) * Math.PI) / 180;
                const kAngle = 180; // angular force magnitude

                // Normal to the plane of the angle
                const planeNormal = normalize(cross(vec1, vec2));
                const forceDir1 = normalize(cross(planeNormal, vec1));
                const forceDir2 = normalize(cross(vec2, planeNormal));

                const f1 = scale(forceDir1, -kAngle * angleDeltaRad);
                const f2 = scale(forceDir2, -kAngle * angleDeltaRad);

                forces.set(n1.id, add(forces.get(n1.id)!, f1));
                forces.set(n2.id, add(forces.get(n2.id)!, f2));
              }
            }
          }
        }
      }

      // 3. Non-bonded repulsion forces
      for (let i = 0; i < atoms.length; i++) {
        for (let j = i + 1; j < atoms.length; j++) {
          const a1 = atoms[i];
          const a2 = atoms[j];
          if (graph.findBond(a1.id, a2.id)) continue;

          const el1 = ElementRepository.getByAtomicNumber(a1.atomicNumber);
          const el2 = ElementRepository.getByAtomicNumber(a2.atomicNumber);
          const sigma = ((el1?.vanDerWaalsRadius ?? 1.5) + (el2?.vanDerWaalsRadius ?? 1.5)) * 0.85;

          const r = Math.max(0.2, distance(a1.position, a2.position));
          if (r < sigma) {
            const dir1to2 = normalize(subtract(a2.position, a1.position));
            const repForceMag = Math.min(600, 35.0 * (Math.pow(sigma / r, 12) / r));
            const f1 = scale(dir1to2, -repForceMag);
            const f2 = scale(dir1to2, repForceMag);

            forces.set(a1.id, add(forces.get(a1.id)!, f1));
            forces.set(a2.id, add(forces.get(a2.id)!, f2));
          }
        }
      }

      // Apply gradient step displacement
      let maxDisplacement = 0;
      for (const atom of atoms) {
        const force = forces.get(atom.id)!;
        const fMag = Math.sqrt(force.x * force.x + force.y * force.y + force.z * force.z);

        if (fMag > 0.001) {
          const dispMag = Math.min(0.22, stepSize * fMag);
          const normF = scale(force, 1 / fMag);
          const disp = scale(normF, dispMag);

          atom.position = {
            x: Math.round((atom.position.x + disp.x) * 1000) / 1000,
            y: Math.round((atom.position.y + disp.y) * 1000) / 1000,
            z: Math.round((atom.position.z + disp.z) * 1000) / 1000
          };

          if (dispMag > maxDisplacement) {
            maxDisplacement = dispMag;
          }
        }
      }

      const newEnergy = this.calculatePotentialEnergy(graph);
      if (maxDisplacement < 0.003 || Math.abs(newEnergy - currentEnergy) < 0.02) {
        converged = true;
        currentEnergy = newEnergy;
        break;
      }
      currentEnergy = newEnergy;
    }

    return {
      optimizedMolecule: graph.toMolecule(),
      initialEnergyKj: initialEnergy,
      finalEnergyKj: currentEnergy,
      stepsExecuted,
      converged
    };
  }
}
