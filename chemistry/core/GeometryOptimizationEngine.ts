import { Molecule } from '../../domain/molecular/Molecule';
import { MolecularGraph } from '../../domain/molecular/MolecularGraph';
import { ElementRepository } from '../../domain/elements/ElementRepository';
import { distance, subtract, normalize, add, scale, angle, dot, cross, magnitude } from '../../lib/math';
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

    // AX4 (Tetrahedral): Methane CH4, Ethane C-sp3 -> 109.47 degrees
    if (numNeighbors >= 4) {
      return 109.47;
    }
    // AX3 (Trigonal Planar / Pyramidal): Ethene (120.0), Ammonia (107.0)
    if (numNeighbors === 3) {
      if (atom.atomicNumber === 7 || atom.atomicNumber === 15) return 107.0; // Ammonia / Phosphine
      return 120.0; // Trigonal planar
    }
    // AX2 (Bent or Linear): Water H2O -> 104.5 degrees, CO2 -> 180 degrees
    if (numNeighbors === 2) {
      if (atom.atomicNumber === 8 || atom.atomicNumber === 16) return 104.5; // Water / H2S bent (AX2E2)
      if (atom.atomicNumber === 7) return 115.0; // NO2- bent (AX2E1)
      if (atom.atomicNumber === 6) return 180.0; // Carbon in CO2, HCN, Acetylene is sp hybridized -> linear (180 deg)
      const bonds = graph.getBondsForAtom(centralAtomId);
      const isLinear = bonds.some((b) => b.order >= 2);
      return isLinear ? 180.0 : 180.0;
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

      let r0 = (elA?.covalentRadius ?? 0.8) + (elB?.covalentRadius ?? 0.8);
      if (bond.order === 2) r0 *= 0.88;
      if (bond.order === 3) r0 *= 0.78;

      const r = distance(atomA.position, atomB.position);
      const kb = 1600; // kJ/(mol * Å^2)

      energy += 0.5 * kb * Math.pow(r - r0, 2);
    }

    // 2. VSEPR Angle bending energy: E_angle = 0.5 * k_theta * (theta - theta0)^2
    for (const center of atoms) {
      const neighbors = graph.getNeighbors(center.id);
      if (neighbors.length >= 2) {
        const theta0Deg = this.getIdealVSEPRAngle(graph, center.id);
        const theta0Rad = (theta0Deg * Math.PI) / 180;
        const kTheta = 350.0; // kJ/(mol * rad^2)

        for (let i = 0; i < neighbors.length; i++) {
          for (let j = i + 1; j < neighbors.length; j++) {
            const currentDeg = angle(neighbors[i].position, center.position, neighbors[j].position);
            const currentRad = (currentDeg * Math.PI) / 180;
            energy += 0.5 * kTheta * Math.pow(currentRad - theta0Rad, 2);
          }
        }
      }
    }

    // 3. Non-bonded repulsion energy (excl. 1,2 and 1,3 pairs)
    for (let i = 0; i < atoms.length; i++) {
      for (let j = i + 1; j < atoms.length; j++) {
        const a1 = atoms[i];
        const a2 = atoms[j];
        if (graph.findBond(a1.id, a2.id)) continue;
        const n1 = graph.getNeighbors(a1.id);
        const n2 = graph.getNeighbors(a2.id);
        if (n1.some((neighbor) => n2.some((n) => n.id === neighbor.id))) continue;

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
    maxSteps = 160,
    stepSize = 0.14
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
        let r0 = (elA?.covalentRadius ?? 0.8) + (elB?.covalentRadius ?? 0.8);
        if (bond.order === 2) r0 *= 0.88;
        if (bond.order === 3) r0 *= 0.78;

        const r = distance(atomA.position, atomB.position);

        if (r > 0.001) {
          const delta = r - r0;
          const k = 1500;
          const forceMag = -k * delta;

          const dirAtoB = normalize(subtract(atomB.position, atomA.position));
          const fA = scale(dirAtoB, -forceMag);
          const fB = scale(dirAtoB, forceMag);

          forces.set(atomA.id, add(forces.get(atomA.id)!, fA));
          forces.set(atomB.id, add(forces.get(atomB.id)!, fB));
        }
      }

      // 2. Analytical VSEPR 3D Harmonic Angle Bending forces (F = -dU/dr)
      for (const center of atoms) {
        const neighbors = graph.getNeighbors(center.id);
        if (neighbors.length < 2) continue;

        const theta0Deg = this.getIdealVSEPRAngle(graph, center.id);
        const theta0Rad = (theta0Deg * Math.PI) / 180;
        const kTheta = 450.0; // Angle stiffness constant

        for (let i = 0; i < neighbors.length; i++) {
          for (let j = i + 1; j < neighbors.length; j++) {
            const n1 = neighbors[i];
            const n2 = neighbors[j];

            const v1 = subtract(n1.position, center.position);
            const v2 = subtract(n2.position, center.position);
            const r1 = Math.max(0.1, magnitude(v1));
            const r2 = Math.max(0.1, magnitude(v2));

            const e1 = scale(v1, 1 / r1);
            const e2 = scale(v2, 1 / r2);

            const cosTheta = Math.max(-1.0, Math.min(1.0, dot(e1, e2)));
            const currentRad = Math.acos(cosTheta);
            const deltaTheta = currentRad - theta0Rad;

            let perp1: Vector3D;
            let perp2: Vector3D;

            const sinTheta = Math.sin(currentRad);
            if (sinTheta > 1e-4) {
              // perp1 = (e2 - cosTheta * e1) / sinTheta (unit vector perpendicular to e1 pointing towards e2)
              const u1 = subtract(e2, scale(e1, cosTheta));
              perp1 = scale(u1, 1 / sinTheta);

              // perp2 = (e1 - cosTheta * e2) / sinTheta (unit vector perpendicular to e2 pointing towards e1)
              const u2 = subtract(e1, scale(e2, cosTheta));
              perp2 = scale(u2, 1 / sinTheta);
            } else {
              // Collinear case (sinTheta ~ 0)
              let perpAxis = cross(e1, { x: 0, y: 0, z: 1 });
              if (magnitude(perpAxis) < 0.1) {
                perpAxis = cross(e1, { x: 1, y: 0, z: 0 });
              }
              perp1 = normalize(perpAxis);
              perp2 = scale(perp1, -1);
            }

            // Analytical restoring forces: F1 = k_theta * deltaTheta * perp1 / r1
            // When deltaTheta < 0 (current angle < target), F1 acts opposite to perp1 (moves AWAY from n2, opening angle)
            const f1 = scale(perp1, (kTheta * deltaTheta) / r1);
            const f2 = scale(perp2, (kTheta * deltaTheta) / r2);

            forces.set(n1.id, add(forces.get(n1.id)!, f1));
            forces.set(n2.id, add(forces.get(n2.id)!, f2));
            forces.set(center.id, subtract(forces.get(center.id)!, add(f1, f2)));
          }
        }
      }

    // 3. Non-bonded repulsion forces (Excludes 1,2 bonded and 1,3 1-3 angle pairs as per MM force fields)
    for (let i = 0; i < atoms.length; i++) {
      for (let j = i + 1; j < atoms.length; j++) {
        const a1 = atoms[i];
        const a2 = atoms[j];

        // Skip 1,2 bonded atoms and 1,3 atoms sharing a central atom
        if (graph.findBond(a1.id, a2.id)) continue;
        const n1 = graph.getNeighbors(a1.id);
        const n2 = graph.getNeighbors(a2.id);
        const shareCentralAtom = n1.some((neighbor) => n2.some((n) => n.id === neighbor.id));
        if (shareCentralAtom) continue;

        const el1 = ElementRepository.getByAtomicNumber(a1.atomicNumber);
        const el2 = ElementRepository.getByAtomicNumber(a2.atomicNumber);
        const sigma = ((el1?.vanDerWaalsRadius ?? 1.5) + (el2?.vanDerWaalsRadius ?? 1.5)) * 0.85;

        const r = Math.max(0.2, distance(a1.position, a2.position));
        if (r < sigma) {
          const dir1to2 = normalize(subtract(a2.position, a1.position));
          const repForceMag = Math.min(650, 40.0 * (Math.pow(sigma / r, 12) / r));
          const f1 = scale(dir1to2, -repForceMag);
          const f2 = scale(dir1to2, repForceMag);

          forces.set(a1.id, add(forces.get(a1.id)!, f1));
          forces.set(a2.id, add(forces.get(a2.id)!, f2));
        }
      }
    }

      // Apply gradient step displacement: dr = alpha * F (Steepest Descent Optimization)
      let maxDisplacement = 0;
      const alpha = 0.00035; // Gradient descent learning rate (Å per kJ/mol force)
      for (const atom of atoms) {
        const force = forces.get(atom.id)!;
        const fMag = magnitude(force);

        if (fMag > 1e-5) {
          const dispMag = Math.min(0.08, alpha * fMag);
          const disp = scale(force, dispMag / fMag);

          atom.position = {
            x: atom.position.x + disp.x,
            y: atom.position.y + disp.y,
            z: atom.position.z + disp.z
          };

          if (dispMag > maxDisplacement) {
            maxDisplacement = dispMag;
          }
        }
      }

      const newEnergy = this.calculatePotentialEnergy(graph);
      if (maxDisplacement < 0.0002 || Math.abs(newEnergy - currentEnergy) < 0.0001) {
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
