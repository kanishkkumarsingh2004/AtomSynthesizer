import { create } from 'zustand';

export interface ReactionRecord {
  id: string;
  timestamp: string;
  reactantsSummary: string;
  productsSummary: string;
  reactionCategory: 'COMBUSTION' | 'DISSOCIATION' | 'AUTO_BONDING' | 'SYNTHESIS' | 'REDOX';
  deltaHKJPerMol: number;
  temperatureK: number;
  activationEnergyKJPerMol: number;
  rateConstantK: number;
}

export interface ReactionState {
  reactions: ReactionRecord[];
  addReaction: (record: Omit<ReactionRecord, 'id' | 'timestamp'>) => ReactionRecord;
  clearReactions: () => void;
  setReactions: (records: ReactionRecord[]) => void;
}

export const useReactionStore = create<ReactionState>((set) => ({
  reactions: [],

  addReaction: (record) => {
    const newRecord: ReactionRecord = {
      ...record,
      id: `rxn_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString()
    };

    set((state) => ({
      reactions: [newRecord, ...state.reactions].slice(0, 50) // keep top 50 recent reactions
    }));

    return newRecord;
  },

  clearReactions: () => set({ reactions: [] }),
  setReactions: (records) => set({ reactions: records })
}));
