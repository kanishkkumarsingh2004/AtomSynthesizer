import { create } from 'zustand';
import { AtomId, BondId } from '../domain/molecular/MolecularTypes';

export interface SelectionState {
  selectedAtomIds: AtomId[];
  selectedBondIds: BondId[];
  hoveredAtomId: AtomId | null;
  hoveredBondId: BondId | null;

  selectAtom: (atomId: AtomId, multiSelect?: boolean) => void;
  selectBond: (bondId: BondId, multiSelect?: boolean) => void;
  clearSelection: () => void;
  setHoveredAtom: (atomId: AtomId | null) => void;
  setHoveredBond: (bondId: BondId | null) => void;
}

export const useSelectionStore = create<SelectionState>((set) => ({
  selectedAtomIds: [],
  selectedBondIds: [],
  hoveredAtomId: null,
  hoveredBondId: null,

  selectAtom: (atomId, multiSelect = false) => {
    set((state) => {
      if (multiSelect) {
        const isSelected = state.selectedAtomIds.includes(atomId);
        const newAtoms = isSelected
          ? state.selectedAtomIds.filter((id) => id !== atomId)
          : [...state.selectedAtomIds, atomId];
        return { selectedAtomIds: newAtoms };
      }
      return { selectedAtomIds: [atomId], selectedBondIds: [] };
    });
  },

  selectBond: (bondId, multiSelect = false) => {
    set((state) => {
      if (multiSelect) {
        const isSelected = state.selectedBondIds.includes(bondId);
        const newBonds = isSelected
          ? state.selectedBondIds.filter((id) => id !== bondId)
          : [...state.selectedBondIds, bondId];
        return { selectedBondIds: newBonds };
      }
      return { selectedAtomIds: [], selectedBondIds: [bondId] };
    });
  },

  clearSelection: () => set({ selectedAtomIds: [], selectedBondIds: [] }),
  setHoveredAtom: (atomId) => set({ hoveredAtomId: atomId }),
  setHoveredBond: (bondId) => set({ hoveredBondId: bondId })
}));
