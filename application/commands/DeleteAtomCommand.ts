import { Command } from './Command';
import { Atom } from '../../domain/molecular/Atom';
import { Bond } from '../../domain/molecular/Bond';
import { MolecularGraph } from '../../domain/molecular/MolecularGraph';
import { AtomId } from '../../domain/molecular/MolecularTypes';

export class DeleteAtomCommand implements Command {
  public readonly description: string;
  private graph: MolecularGraph;
  private atomId: AtomId;
  private removedAtom?: Atom;
  private removedBonds: Bond[] = [];

  constructor(graph: MolecularGraph, atomId: AtomId) {
    this.graph = graph;
    this.atomId = atomId;
    this.description = `Delete Atom (${atomId})`;
  }

  public execute(): void {
    const atom = this.graph.getAtom(this.atomId);
    if (!atom) return;

    this.removedAtom = { ...atom };
    this.removedBonds = this.graph.getBondsForAtom(this.atomId).map((b) => ({ ...b }));

    this.graph.removeAtom(this.atomId);
  }

  public undo(): void {
    if (!this.removedAtom) return;

    this.graph.addAtom(this.removedAtom);
    for (const bond of this.removedBonds) {
      this.graph.addBond(bond);
    }
  }
}
