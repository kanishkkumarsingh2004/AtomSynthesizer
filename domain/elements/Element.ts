export type ElementCategory =
  | 'nonmetal'
  | 'noble-gas'
  | 'alkali-metal'
  | 'alkaline-earth'
  | 'metalloid'
  | 'halogen'
  | 'post-transition-metal'
  | 'transition-metal'
  | 'lanthanide'
  | 'actinide'
  | 'unknown';

export interface ElementDefinition {
  atomicNumber: number;
  symbol: string;
  name: string;
  atomicMass: number;
  period: number;
  group: number | null;
  block: 's' | 'p' | 'd' | 'f';
  category: ElementCategory;
  electronegativity: number | null;
  covalentRadius: number; // in Ångströms
  vanDerWaalsRadius: number; // in Ångströms
  commonOxidationStates: number[];
  typicalValence: number[];
  defaultColor: string; // Hex color code e.g. #FF0D0D
  meltingPoint: number | null; // in Kelvin
  boilingPoint: number | null; // in Kelvin
  density: number | null; // in g/cm³
  electronConfiguration: string;
}
