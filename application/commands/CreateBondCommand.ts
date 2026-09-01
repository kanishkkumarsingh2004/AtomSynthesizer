import { Command } from './Command';
import { Bond } from '../../domain/molecular/Bond';
import { MolecularGraph } from '../../domain/molecular/MolecularGraph';

export class CreateBondCommand implements Command {
  public readonly description: string;
  private graph: MolecularGraph;
  private bond: Bond;

  constructor(graph: MolecularGraph, bond: Bond) {
    this.graph = graph;
    this.bond = bond;
    this.description = `Create Bond (${bond.atomA} - ${bond.atomB})`;
  }

  public execute(): void {
    this.graph.addBond(this.bond);
  }

  public undo(): void {
    this.graph.removeBond(this.bond.id);
  }
}
