import { WorkspaceTool } from '../domain/molecular/MolecularTypes';

export interface ShortcutDefinition {
  key: string;
  ctrlOrCmd?: boolean;
  shift?: boolean;
  tool?: WorkspaceTool;
  action?: 'undo' | 'redo' | 'deleteSelection' | 'focusSelection';
  label: string;
}

export const SHORTCUTS: ShortcutDefinition[] = [
  { key: 'v', label: 'Select Tool', tool: 'select' },
  { key: 'm', label: 'Move Tool', tool: 'move' },
  { key: 'r', label: 'Rotate Tool', tool: 'rotate' },
  { key: 'a', label: 'Add Atom Tool', tool: 'add_atom' },
  { key: 'b', label: 'Create Bond Tool', tool: 'create_bond' },
  { key: 'd', label: 'Delete Tool', tool: 'delete' },
  { key: 'Delete', label: 'Delete Selected', action: 'deleteSelection' },
  { key: 'Backspace', label: 'Delete Selected', action: 'deleteSelection' },
  { key: 'z', ctrlOrCmd: true, label: 'Undo', action: 'undo' },
  { key: 'z', ctrlOrCmd: true, shift: true, label: 'Redo', action: 'redo' },
  { key: 'f', label: 'Focus Selection', action: 'focusSelection' }
];
