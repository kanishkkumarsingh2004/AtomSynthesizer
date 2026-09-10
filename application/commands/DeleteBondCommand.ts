import { Command } from './Command';
import { Bond } from '../../domain/molecular/Bond';
import { MolecularGraph } from '../../domain/molecular/MolecularGraph';
import { BondId } from '../../domain/molecular/MolecularTypes';
import { useMoleculeStore } from '../../stores/moleculeStore';

export class DeleteBondCommand implements Command {
  public readonly description: string;
  public graph: MolecularGraph;
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
    useMoleculeStore.getState().setMolecule(this.graph.toMolecule());
  }

  public undo(): void {
    if (this.removedBond) {
      this.graph.addBond(this.removedBond);
    }
    useMoleculeStore.getState().setMolecule(this.graph.toMolecule());
  }
}

