import { create } from 'zustand';

export interface UIState {
  periodicTableOpen: boolean;
  inspectorOpen: boolean;
  marketplaceOpen: boolean;
  elementSearchQuery: string;
  activeBottomTab: 'molecules' | 'analysis' | 'console';
  toastMessage: string | null;

  setPeriodicTableOpen: (open: boolean) => void;
  togglePeriodicTable: () => void;
  setInspectorOpen: (open: boolean) => void;
  toggleInspector: () => void;
  setMarketplaceOpen: (open: boolean) => void;
  toggleMarketplace: () => void;
  setElementSearchQuery: (query: string) => void;
  setActiveBottomTab: (tab: 'molecules' | 'analysis' | 'console') => void;
  showToast: (msg: string) => void;
  clearToast: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  periodicTableOpen: true,
  inspectorOpen: true,
  marketplaceOpen: false,
  elementSearchQuery: '',
  activeBottomTab: 'molecules',
  toastMessage: null,

  setPeriodicTableOpen: (open) => set({ periodicTableOpen: open }),
  togglePeriodicTable: () => set((state) => ({ periodicTableOpen: !state.periodicTableOpen })),
  setInspectorOpen: (open) => set({ inspectorOpen: open }),
  toggleInspector: () => set((state) => ({ inspectorOpen: !state.inspectorOpen })),
  setMarketplaceOpen: (open) => set({ marketplaceOpen: open }),
  toggleMarketplace: () => set((state) => ({ marketplaceOpen: !state.marketplaceOpen })),
  setElementSearchQuery: (query) => set({ elementSearchQuery: query }),
  setActiveBottomTab: (tab) => set({ activeBottomTab: tab }),
  showToast: (msg) => set({ toastMessage: msg }),
  clearToast: () => set({ toastMessage: null })
}));
