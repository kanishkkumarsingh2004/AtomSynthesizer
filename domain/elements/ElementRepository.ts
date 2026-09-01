import { ElementDefinition, ElementCategory } from './Element';
import rawElements from '../../data/elements.json';

// Helper to create a fallback definition for elements not yet fully specified in raw JSON
function createFallbackElement(atomicNumber: number): ElementDefinition {
  return {
    atomicNumber,
    symbol: `E${atomicNumber}`,
    name: `Element ${atomicNumber}`,
    atomicMass: atomicNumber * 2.1,
    period: Math.min(7, Math.floor(atomicNumber / 18) + 1),
    group: null,
    block: 'd',
    category: 'transition-metal',
    electronegativity: null,
    covalentRadius: 1.2,
    vanDerWaalsRadius: 1.8,
    commonOxidationStates: [0],
    typicalValence: [2],
    defaultColor: '#E0E0E0',
    meltingPoint: null,
    boilingPoint: null,
    density: null,
    electronConfiguration: ''
  };
}

class ElementRepositoryImpl {
  private elementsByNumber: Map<number, ElementDefinition> = new Map();
  private elementsBySymbol: Map<string, ElementDefinition> = new Map();
  private allElements: ElementDefinition[] = [];

  constructor() {
    // Load defined elements
    for (const item of rawElements) {
      const def: ElementDefinition = {
        ...item,
        category: item.category as ElementCategory,
        block: item.block as 's' | 'p' | 'd' | 'f'
      };
      this.elementsByNumber.set(def.atomicNumber, def);
      this.elementsBySymbol.set(def.symbol.toUpperCase(), def);
    }

    // Populate full 1..118 set if any are missing from the JSON dataset
    for (let i = 1; i <= 118; i++) {
      let el = this.elementsByNumber.get(i);
      if (!el) {
        el = createFallbackElement(i);
        this.elementsByNumber.set(i, el);
        this.elementsBySymbol.set(el.symbol.toUpperCase(), el);
      }
      this.allElements.push(el);
    }

    // Sort by atomic number
    this.allElements.sort((a, b) => a.atomicNumber - b.atomicNumber);
  }

  public getAll(): ElementDefinition[] {
    return this.allElements;
  }

  public getByAtomicNumber(atomicNumber: number): ElementDefinition | undefined {
    return this.elementsByNumber.get(atomicNumber);
  }

  public getBySymbol(symbol: string): ElementDefinition | undefined {
    return this.elementsBySymbol.get(symbol.trim().toUpperCase());
  }

  public search(query: string): ElementDefinition[] {
    const q = query.trim().toLowerCase();
    if (!q) return this.allElements;

    const num = parseInt(q, 10);
    if (!isNaN(num)) {
      const el = this.getByAtomicNumber(num);
      return el ? [el] : [];
    }

    return this.allElements.filter(
      (el) =>
        el.symbol.toLowerCase().includes(q) ||
        el.name.toLowerCase().includes(q)
    );
  }
}

export const ElementRepository = new ElementRepositoryImpl();
