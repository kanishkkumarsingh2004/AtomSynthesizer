import { Command } from './Command';
import { MolecularGraph } from '../../domain/molecular/MolecularGraph';
import { BondId, BondOrder, BondType } from '../../domain/molecular/MolecularTypes';

export class ChangeBondOrderCommand implements Command {
  public readonly description: string;
  private graph: MolecularGraph;
  private bondId: BondId;
  private oldOrder: BondOrder;
  private oldType: BondType;
  private newOrder: BondOrder;
  private newType: BondType;

  constructor(
    graph: MolecularGraph,
    bondId: BondId,
    newOrder: BondOrder,
    newType: BondType
  ) {
    this.graph = graph;
    this.bondId = bondId;
    const bond = graph.getBond(bondId);
    this.oldOrder = bond ? bond.order : 1;
    this.oldType = bond ? bond.type : 'SINGLE';
    this.newOrder = newOrder;
    this.newType = newType;
    this.description = `Change Bond Order (${bondId} -> ${newOrder})`;
  }

  public execute(): void {
    const bond = this.graph.getBond(this.bondId);
    if (bond) {
      bond.order = this.newOrder;
      bond.type = this.newType;
    }
  }

  public undo(): void {
    const bond = this.graph.getBond(this.bondId);
    if (bond) {
      bond.order = this.oldOrder;
      bond.type = this.oldType;
    }
  }
}
