import { create } from 'zustand';
import { WorkspaceTool } from '../domain/molecular/MolecularTypes';

export type RenderingMode = 'BALL_AND_STICK' | 'SPACE_FILLING' | 'STICK' | 'WIREFRAME';

export interface WorkspaceState {
  activeTool: WorkspaceTool;
  activeElementNumber: number; // Default: 6 (Carbon)
  renderingMode: RenderingMode;
  showLabels: boolean;
  showGrid: boolean;
  showAxes: boolean;
  bondThickness: number;
  atomScale: number;
  autoBondingEnabled: boolean;
  reactionSimulationActive: boolean;
  livePhysicsEnabled: boolean;
  quantumAtomViewEnabled: boolean;
  temperatureK: number;
  
  setActiveTool: (tool: WorkspaceTool) => void;
  setActiveElementNumber: (num: number) => void;
  setRenderingMode: (mode: RenderingMode) => void;
  setShowLabels: (show: boolean) => void;
  setShowGrid: (show: boolean) => void;
  setShowAxes: (show: boolean) => void;
  setBondThickness: (thickness: number) => void;
  setAtomScale: (scale: number) => void;
  setAutoBondingEnabled: (enabled: boolean) => void;
  setReactionSimulationActive: (active: boolean) => void;
  toggleReactionSimulation: () => void;
  setLivePhysicsEnabled: (enabled: boolean) => void;
  toggleLivePhysics: () => void;
  setQuantumAtomViewEnabled: (enabled: boolean) => void;
  toggleQuantumAtomView: () => void;
  setTemperatureK: (temp: number) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  activeTool: 'select',
  activeElementNumber: 6, // Carbon
  renderingMode: 'BALL_AND_STICK',
  showLabels: true,
  showGrid: true,
  showAxes: true,
  bondThickness: 0.15,
  atomScale: 1.0,
  autoBondingEnabled: true,
  reactionSimulationActive: false,
  livePhysicsEnabled: true,
  quantumAtomViewEnabled: false,
  temperatureK: 298.15,

  setActiveTool: (tool) => set({ activeTool: tool }),
  setActiveElementNumber: (num) => set({ activeElementNumber: num }),
  setRenderingMode: (mode) => set({ renderingMode: mode }),
  setShowLabels: (show) => set({ showLabels: show }),
  setShowGrid: (show) => set({ showGrid: show }),
  setShowAxes: (show) => set({ showAxes: show }),
  setBondThickness: (thickness) => set({ bondThickness: thickness }),
  setAtomScale: (scale) => set({ atomScale: scale }),
  setAutoBondingEnabled: (enabled) => set({ autoBondingEnabled: enabled }),
  setReactionSimulationActive: (active) => set({ reactionSimulationActive: active }),
  toggleReactionSimulation: () => set((state) => ({ reactionSimulationActive: !state.reactionSimulationActive })),
  setLivePhysicsEnabled: (enabled) => set({ livePhysicsEnabled: enabled }),
  toggleLivePhysics: () => set((state) => ({ livePhysicsEnabled: !state.livePhysicsEnabled })),
  setQuantumAtomViewEnabled: (enabled) => set({ quantumAtomViewEnabled: enabled }),
  toggleQuantumAtomView: () => set((state) => ({ quantumAtomViewEnabled: !state.quantumAtomViewEnabled })),
  setTemperatureK: (temp) => set({ temperatureK: temp })
}));
