import { create } from 'zustand';
import { Command } from '../application/commands/Command';

export interface HistoryState {
  undoStack: Command[];
  redoStack: Command[];

  pushCommand: (command: Command) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  undoStack: [],
  redoStack: [],
  canUndo: false,
  canRedo: false,

  pushCommand: (command) => {
    set((state) => {
      const newUndo = [...state.undoStack, command];
      return {
        undoStack: newUndo,
        redoStack: [], // clear redo stack on new action
        canUndo: true,
        canRedo: false
      };
    });
  },

  undo: () => {
    const { undoStack, redoStack } = get();
    if (undoStack.length === 0) return;

    const command = undoStack[undoStack.length - 1];
    command.undo();

    const newUndo = undoStack.slice(0, undoStack.length - 1);
    const newRedo = [...redoStack, command];

    set({
      undoStack: newUndo,
      redoStack: newRedo,
      canUndo: newUndo.length > 0,
      canRedo: true
    });
  },

  redo: () => {
    const { undoStack, redoStack } = get();
    if (redoStack.length === 0) return;

    const command = redoStack[redoStack.length - 1];
    command.execute();

    const newRedo = redoStack.slice(0, redoStack.length - 1);
    const newUndo = [...undoStack, command];

    set({
      undoStack: newUndo,
      redoStack: newRedo,
      canUndo: true,
      canRedo: newRedo.length > 0
    });
  }
}));
