import { Command } from './Command';
import { Atom } from '../../domain/molecular/Atom';
import { MolecularGraph } from '../../domain/molecular/MolecularGraph';
import { useMoleculeStore } from '../../stores/moleculeStore';

export class AddAtomCommand implements Command {
  public readonly description: string;
  public graph: MolecularGraph;
  private atom: Atom;

  constructor(graph: MolecularGraph, atom: Atom) {
    this.graph = graph;
    this.atom = atom;
    this.description = `Add Atom (Atomic Number ${atom.atomicNumber})`;
  }

  public execute(): void {
    this.graph.addAtom(this.atom);
    useMoleculeStore.getState().setMolecule(this.graph.toMolecule());
  }

  public undo(): void {
    this.graph.removeAtom(this.atom.id);
    useMoleculeStore.getState().setMolecule(this.graph.toMolecule());
  }
}

