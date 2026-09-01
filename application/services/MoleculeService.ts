import { Molecule } from '../../domain/molecular/Molecule';
import { MolecularGraph } from '../../domain/molecular/MolecularGraph';
import { Atom } from '../../domain/molecular/Atom';
import { Bond } from '../../domain/molecular/Bond';
import { Vector3D, BondOrder, BondType, AtomId, BondId } from '../../domain/molecular/MolecularTypes';
import { generateAtomId, generateBondId, generateMoleculeId } from '../../lib/ids';
import { AddAtomCommand } from '../commands/AddAtomCommand';
import { CreateBondCommand } from '../commands/CreateBondCommand';
import { DeleteAtomCommand } from '../commands/DeleteAtomCommand';
import { DeleteBondCommand } from '../commands/DeleteBondCommand';
import { Command } from '../commands/Command';

export class MoleculeService {
  public static createEmptyMolecule(name = 'New Molecule'): Molecule {
    const id = generateMoleculeId();
    return {
      id,
      name,
      atoms: [],
      bonds: [],
      charge: 0,
      multiplicity: 1
    };
  }

  public static addAtom(
    molecule: Molecule,
    atomicNumber: number,
    position: Vector3D
  ): { updatedMolecule: Molecule; command: Command; atomId: AtomId } {
    const graph = MolecularGraph.fromMolecule(molecule);
    const atomId = generateAtomId();
    const atom: Atom = {
      id: atomId,
      atomicNumber,
      position,
      formalCharge: 0,
      moleculeId: molecule.id
    };

    const command = new AddAtomCommand(graph, atom);
    command.execute();

    return {
      updatedMolecule: graph.toMolecule(),
      command,
      atomId
    };
  }

  public static createBond(
    molecule: Molecule,
    atomA: AtomId,
    atomB: AtomId,
    order: BondOrder = 1,
    type: BondType = 'SINGLE'
  ): { updatedMolecule: Molecule; command: Command; bondId: BondId } {
    const graph = MolecularGraph.fromMolecule(molecule);
    const bondId = generateBondId();

    // Hydrogen can NEVER have more than 1 bond!
    const entityA = graph.getAtom(atomA);
    const entityB = graph.getAtom(atomB);
    if ((entityA && entityA.atomicNumber === 1 && graph.calculateValence(atomA) >= 1) ||
        (entityB && entityB.atomicNumber === 1 && graph.calculateValence(atomB) >= 1)) {
      throw new Error('Hydrogen (H) can only form 1 covalent bond.');
    }

    const bond: Bond = {
      id: bondId,
      atomA,
      atomB,
      order,
      type
    };

    const command = new CreateBondCommand(graph, bond);
    command.execute();

    return {
      updatedMolecule: graph.toMolecule(),
      command,
      bondId
    };
  }

  public static deleteSelection(
    molecule: Molecule,
    atomIds: AtomId[],
    bondIds: BondId[]
  ): { updatedMolecule: Molecule; commands: Command[] } {
    const graph = MolecularGraph.fromMolecule(molecule);
    const commands: Command[] = [];

    // Delete bonds first
    for (const bId of bondIds) {
      if (graph.getBond(bId)) {
        const cmd = new DeleteBondCommand(graph, bId);
        cmd.execute();
        commands.push(cmd);
      }
    }

    // Delete atoms (this automatically removes remaining connected bonds)
    for (const aId of atomIds) {
      if (graph.getAtom(aId)) {
        const cmd = new DeleteAtomCommand(graph, aId);
        cmd.execute();
        commands.push(cmd);
      }
    }

    return {
      updatedMolecule: graph.toMolecule(),
      commands
    };
  }
}
