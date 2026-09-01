import { create } from 'zustand';
import { Molecule } from '../domain/molecular/Molecule';
import { MoleculeService } from '../application/services/MoleculeService';
import { Vector3D, BondOrder, BondType, AtomId, BondId } from '../domain/molecular/MolecularTypes';
import { useHistoryStore } from './historyStore';
import { useWorkspaceStore } from './workspaceStore';
import { AutoBondEngine } from '../chemistry/core/AutoBondEngine';
import { GeometryOptimizationEngine } from '../chemistry/core/GeometryOptimizationEngine';
import { ExplosionPhysicsEngine } from '../chemistry/core/ExplosionPhysicsEngine';
import { MoveAtomCommand } from '../application/commands/MoveAtomCommand';
import { ChangeBondOrderCommand } from '../application/commands/ChangeBondOrderCommand';
import { ChangeChargeCommand } from '../application/commands/ChangeChargeCommand';
import { MolecularGraph } from '../domain/molecular/MolecularGraph';

export interface MoleculeState {
  molecule: Molecule;

  setMolecule: (molecule: Molecule) => void;
  createEmptyMolecule: (name?: string) => void;
  addAtom: (atomicNumber: number, position: Vector3D) => AtomId;
  createBond: (atomA: AtomId, atomB: AtomId, order?: BondOrder, type?: BondType) => BondId | null;
  moveAtom: (atomId: AtomId, oldPos: Vector3D, newPos: Vector3D) => void;
  changeBondOrder: (bondId: BondId, newOrder: BondOrder, newType?: BondType) => void;
  changeAtomCharge: (atomId: AtomId, newCharge: number) => void;
  deleteSelection: (atomIds: AtomId[], bondIds: BondId[]) => void;
  triggerAutoBonding: () => void;
  optimizeGeometry: () => { initialEnergy: number; finalEnergy: number; steps: number };
  triggerExplosion: () => { energyReleased: number; summary: string };
}

export const useMoleculeStore = create<MoleculeState>((set, get) => ({
  molecule: MoleculeService.createEmptyMolecule('Default Molecule'),

  setMolecule: (molecule) => set({ molecule }),

  createEmptyMolecule: (name) => {
    const newMol = MoleculeService.createEmptyMolecule(name);
    set({ molecule: newMol });
  },

  addAtom: (atomicNumber, position) => {
    const { molecule } = get();
    const { updatedMolecule, command, atomId } = MoleculeService.addAtom(molecule, atomicNumber, position);
    
    // Auto-bonding check
    const autoBondEnabled = useWorkspaceStore.getState().autoBondingEnabled;
    let finalMolecule = updatedMolecule;
    if (autoBondEnabled) {
      const res = AutoBondEngine.autoBondMolecule(updatedMolecule, { toleranceRatio: 1.3 });
      finalMolecule = res.updatedMolecule;
    }

    set({ molecule: finalMolecule });
    useHistoryStore.getState().pushCommand(command);
    return atomId;
  },

  createBond: (atomA, atomB, order = 1, type = 'SINGLE') => {
    const { molecule } = get();
    // Check if bond already exists
    const graph = MolecularGraph.fromMolecule(molecule);
    if (graph.findBond(atomA, atomB)) {
      return null;
    }

    const { updatedMolecule, command, bondId } = MoleculeService.createBond(molecule, atomA, atomB, order, type);
    set({ molecule: updatedMolecule });
    useHistoryStore.getState().pushCommand(command);
    return bondId;
  },

  moveAtom: (atomId, oldPos, newPos) => {
    const { molecule } = get();
    const graph = MolecularGraph.fromMolecule(molecule);
    const command = new MoveAtomCommand(graph, atomId, oldPos, newPos);
    command.execute();
    let updatedMol = graph.toMolecule();

    // Auto-bonding check
    const autoBondEnabled = useWorkspaceStore.getState().autoBondingEnabled;
    if (autoBondEnabled) {
      const res = AutoBondEngine.autoBondMolecule(updatedMol, { toleranceRatio: 1.3 });
      updatedMol = res.updatedMolecule;
    }

    set({ molecule: updatedMol });
    useHistoryStore.getState().pushCommand(command);
  },

  changeBondOrder: (bondId, newOrder, newType = 'SINGLE') => {
    const { molecule } = get();
    const graph = MolecularGraph.fromMolecule(molecule);
    const command = new ChangeBondOrderCommand(graph, bondId, newOrder, newType);
    command.execute();
    set({ molecule: graph.toMolecule() });
    useHistoryStore.getState().pushCommand(command);
  },

  changeAtomCharge: (atomId, newCharge) => {
    const { molecule } = get();
    const graph = MolecularGraph.fromMolecule(molecule);
    const command = new ChangeChargeCommand(graph, atomId, newCharge);
    command.execute();
    set({ molecule: graph.toMolecule() });
    useHistoryStore.getState().pushCommand(command);
  },

  deleteSelection: (atomIds, bondIds) => {
    const { molecule } = get();
    const { updatedMolecule, commands } = MoleculeService.deleteSelection(molecule, atomIds, bondIds);
    set({ molecule: updatedMolecule });
    for (const cmd of commands) {
      useHistoryStore.getState().pushCommand(cmd);
    }
  },

  triggerAutoBonding: () => {
    const { molecule } = get();
    const res = AutoBondEngine.autoBondMolecule(molecule, { toleranceRatio: 1.3, autoBreakDistantBonds: true });
    set({ molecule: res.updatedMolecule });
  },

  optimizeGeometry: () => {
    const { molecule } = get();
    const res = GeometryOptimizationEngine.optimizeGeometry(molecule);
    set({ molecule: res.optimizedMolecule });
    return {
      initialEnergy: res.initialEnergyKj,
      finalEnergy: res.finalEnergyKj,
      steps: res.stepsExecuted
    };
  },

  triggerExplosion: () => {
    const { molecule } = get();
    const res = ExplosionPhysicsEngine.triggerExplosion(molecule);
    set({ molecule: res.explodedMolecule });
    return {
      energyReleased: res.energyReleasedKj,
      summary: res.summary
    };
  }
}));
