import { ValidationSeverity } from './ValidationSeverity';
import { AtomId, BondId } from '../molecular/MolecularTypes';

export interface ValidationIssue {
  severity: ValidationSeverity;
  code: string;
  message: string;
  atomIds?: AtomId[];
  bondIds?: BondId[];
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}
