import { Command } from './Command';
import { MolecularGraph } from '../../domain/molecular/MolecularGraph';
import { AtomId } from '../../domain/molecular/MolecularTypes';

export class ChangeChargeCommand implements Command {
  public readonly description: string;
  private graph: MolecularGraph;
  private atomId: AtomId;
  private oldCharge: number;
  private newCharge: number;

  constructor(graph: MolecularGraph, atomId: AtomId, newCharge: number) {
    this.graph = graph;
    this.atomId = atomId;
    const atom = graph.getAtom(atomId);
    this.oldCharge = atom ? atom.formalCharge : 0;
    this.newCharge = newCharge;
    this.description = `Change Charge (${atomId} -> ${newCharge})`;
  }

  public execute(): void {
    const atom = this.graph.getAtom(this.atomId);
    if (atom) {
      atom.formalCharge = this.newCharge;
    }
  }

  public undo(): void {
    const atom = this.graph.getAtom(this.atomId);
    if (atom) {
      atom.formalCharge = this.oldCharge;
    }
  }
}
