import { Atom } from './Atom';
import { Bond } from './Bond';
import { Molecule } from './Molecule';
import { AtomId, BondId, MoleculeId } from './MolecularTypes';

export class MolecularGraph {
  public readonly id: MoleculeId;
  public name?: string;
  private atomsMap: Map<AtomId, Atom> = new Map();
  private bondsMap: Map<BondId, Bond> = new Map();
  private adjacencyMap: Map<AtomId, Set<BondId>> = new Map();

  constructor(id: MoleculeId, name?: string) {
    this.id = id;
    this.name = name;
  }

  public static fromMolecule(molecule: Molecule): MolecularGraph {
    const graph = new MolecularGraph(molecule.id, molecule.name);
    for (const atom of molecule.atoms) {
      graph.addAtom({ ...atom });
    }
    for (const bond of molecule.bonds) {
      graph.addBond({ ...bond });
    }
    return graph;
  }

  public addAtom(atom: Atom): void {
    this.atomsMap.set(atom.id, atom);
    if (!this.adjacencyMap.has(atom.id)) {
      this.adjacencyMap.set(atom.id, new Set());
    }
  }

  public removeAtom(atomId: AtomId): Atom | undefined {
    const atom = this.atomsMap.get(atomId);
    if (!atom) return undefined;

    // Remove all connected bonds first
    const bondIds = this.adjacencyMap.get(atomId);
    if (bondIds) {
      for (const bondId of Array.from(bondIds)) {
        this.removeBond(bondId);
      }
    }

    this.adjacencyMap.delete(atomId);
    this.atomsMap.delete(atomId);
    return atom;
  }

  public addBond(bond: Bond): void {
    if (!this.atomsMap.has(bond.atomA) || !this.atomsMap.has(bond.atomB)) {
      throw new Error(`Cannot create bond: atom ${bond.atomA} or ${bond.atomB} does not exist in graph.`);
    }
    if (bond.atomA === bond.atomB) {
      throw new Error('Self-bonds are invalid in a molecular graph.');
    }

    // Check if bond already exists between these atoms
    const existing = this.findBond(bond.atomA, bond.atomB);
    if (existing) {
      throw new Error(`Bond already exists between atom ${bond.atomA} and ${bond.atomB}.`);
    }

    this.bondsMap.set(bond.id, bond);
    this.adjacencyMap.get(bond.atomA)?.add(bond.id);
    this.adjacencyMap.get(bond.atomB)?.add(bond.id);
  }

  public removeBond(bondId: BondId): Bond | undefined {
    const bond = this.bondsMap.get(bondId);
    if (!bond) return undefined;

    this.adjacencyMap.get(bond.atomA)?.delete(bondId);
    this.adjacencyMap.get(bond.atomB)?.delete(bondId);
    this.bondsMap.delete(bondId);
    return bond;
  }

  public getAtom(atomId: AtomId): Atom | undefined {
    return this.atomsMap.get(atomId);
  }

  public getBond(bondId: BondId): Bond | undefined {
    return this.bondsMap.get(bondId);
  }

  public getAllAtoms(): Atom[] {
    return Array.from(this.atomsMap.values());
  }

  public getAllBonds(): Bond[] {
    return Array.from(this.bondsMap.values());
  }

  public getBondsForAtom(atomId: AtomId): Bond[] {
    const bondIds = this.adjacencyMap.get(atomId);
    if (!bondIds) return [];
    const bonds: Bond[] = [];
    for (const bId of bondIds) {
      const b = this.bondsMap.get(bId);
      if (b) bonds.push(b);
    }
    return bonds;
  }

  public getNeighbors(atomId: AtomId): Atom[] {
    const bonds = this.getBondsForAtom(atomId);
    const neighbors: Atom[] = [];
    for (const b of bonds) {
      const neighborId = b.atomA === atomId ? b.atomB : b.atomA;
      const neighbor = this.atomsMap.get(neighborId);
      if (neighbor) neighbors.push(neighbor);
    }
    return neighbors;
  }

  public findBond(atomA: AtomId, atomB: AtomId): Bond | undefined {
    const bonds = this.getBondsForAtom(atomA);
    return bonds.find(
      (b) => (b.atomA === atomA && b.atomB === atomB) || (b.atomA === atomB && b.atomB === atomA)
    );
  }

  public getBondOrder(atomA: AtomId, atomB: AtomId): number {
    const bond = this.findBond(atomA, atomB);
    return bond ? bond.order : 0;
  }

  public calculateValence(atomId: AtomId): number {
    const bonds = this.getBondsForAtom(atomId);
    return bonds.reduce((sum, b) => sum + b.order, 0);
  }

  public getConnectedComponents(): AtomId[][] {
    const visited = new Set<AtomId>();
    const components: AtomId[][] = [];

    for (const atomId of this.atomsMap.keys()) {
      if (!visited.has(atomId)) {
        const component: AtomId[] = [];
        const queue: AtomId[] = [atomId];
        visited.add(atomId);

        while (queue.length > 0) {
          const current = queue.shift()!;
          component.push(current);

          for (const neighbor of this.getNeighbors(current)) {
            if (!visited.has(neighbor.id)) {
              visited.add(neighbor.id);
              queue.push(neighbor.id);
            }
          }
        }
        components.push(component);
      }
    }
    return components;
  }

  public calculateTotalCharge(): number {
    let charge = 0;
    for (const atom of this.atomsMap.values()) {
      charge += atom.formalCharge;
    }
    return charge;
  }

  public toMolecule(): Molecule {
    return {
      id: this.id,
      name: this.name,
      atoms: this.getAllAtoms(),
      bonds: this.getAllBonds(),
      charge: this.calculateTotalCharge(),
      multiplicity: 1
    };
  }
}
