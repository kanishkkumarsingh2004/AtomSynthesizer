import { Command } from './Command';
import { MolecularGraph } from '../../domain/molecular/MolecularGraph';
import { AtomId, Vector3D } from '../../domain/molecular/MolecularTypes';

export class MoveAtomCommand implements Command {
  public readonly description: string;
  private graph: MolecularGraph;
  private atomId: AtomId;
  private oldPosition: Vector3D;
  private newPosition: Vector3D;

  constructor(graph: MolecularGraph, atomId: AtomId, oldPosition: Vector3D, newPosition: Vector3D) {
    this.graph = graph;
    this.atomId = atomId;
    this.oldPosition = { ...oldPosition };
    this.newPosition = { ...newPosition };
    this.description = `Move Atom (${atomId})`;
  }

  public execute(): void {
    const atom = this.graph.getAtom(this.atomId);
    if (atom) {
      atom.position = { ...this.newPosition };
    }
  }

  public undo(): void {
    const atom = this.graph.getAtom(this.atomId);
    if (atom) {
      atom.position = { ...this.oldPosition };
    }
  }
}
