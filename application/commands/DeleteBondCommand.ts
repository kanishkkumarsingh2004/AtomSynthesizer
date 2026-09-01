import { Command } from './Command';
import { Bond } from '../../domain/molecular/Bond';
import { MolecularGraph } from '../../domain/molecular/MolecularGraph';
import { BondId } from '../../domain/molecular/MolecularTypes';

export class DeleteBondCommand implements Command {
  public readonly description: string;
  private graph: MolecularGraph;
  private bondId: BondId;
  private removedBond?: Bond;

  constructor(graph: MolecularGraph, bondId: BondId) {
    this.graph = graph;
    this.bondId = bondId;
    this.description = `Delete Bond (${bondId})`;
  }

  public execute(): void {
    const bond = this.graph.getBond(this.bondId);
    if (!bond) return;
    this.removedBond = { ...bond };
    this.graph.removeBond(this.bondId);
  }

  public undo(): void {
    if (this.removedBond) {
      this.graph.addBond(this.removedBond);
    }
  }
}
