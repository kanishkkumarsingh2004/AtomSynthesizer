import { ElementDefinition } from '../../domain/elements/Element';
import { ElementRepository } from '../../domain/elements/ElementRepository';

export interface ShellPopulation {
  shellName: 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q';
  n: number; // Principal quantum number 1..7
  electronCount: number;
  subshells: { subshell: 's' | 'p' | 'd' | 'f'; count: number }[];
}

export interface QuantumAtomStructure {
  atomicNumber: number;
  protons: number;
  neutrons: number;
  massNumber: number;
  shells: ShellPopulation[];
  spdfString: string;
  valenceElectrons: number;
}

export class QuantumShellEngine {
  /**
   * Calculates shell populations (K, L, M, N, O, P, Q) and spdf subshell configurations for any element Z=1..118
   */
  public static getQuantumStructure(atomicNumber: number): QuantumAtomStructure {
    const element = ElementRepository.getByAtomicNumber(atomicNumber);
    const z = element ? element.atomicNumber : atomicNumber;
    const atomicMass = element ? element.atomicMass : z * 2.2;
    const protons = z;
    const massNumber = Math.round(atomicMass);
    const neutrons = Math.max(0, massNumber - protons);

    // Standard subshell filling order (Aufbau Principle)
    const subshellCapacity: { n: number; subshell: 's' | 'p' | 'd' | 'f'; name: string; capacity: number }[] = [
      { n: 1, subshell: 's', name: '1s', capacity: 2 },
      { n: 2, subshell: 's', name: '2s', capacity: 2 },
      { n: 2, subshell: 'p', name: '2p', capacity: 6 },
      { n: 3, subshell: 's', name: '3s', capacity: 2 },
      { n: 3, subshell: 'p', name: '3p', capacity: 6 },
      { n: 4, subshell: 's', name: '4s', capacity: 2 },
      { n: 3, subshell: 'd', name: '3d', capacity: 10 },
      { n: 4, subshell: 'p', name: '4p', capacity: 6 },
      { n: 5, subshell: 's', name: '5s', capacity: 2 },
      { n: 4, subshell: 'd', name: '4d', capacity: 10 },
      { n: 5, subshell: 'p', name: '5p', capacity: 6 },
      { n: 6, subshell: 's', name: '6s', capacity: 2 },
      { n: 4, subshell: 'f', name: '4f', capacity: 14 },
      { n: 5, subshell: 'd', name: '5d', capacity: 10 },
      { n: 6, subshell: 'p', name: '6p', capacity: 6 },
      { n: 7, subshell: 's', name: '7s', capacity: 2 },
      { n: 5, subshell: 'f', name: '5f', capacity: 14 },
      { n: 6, subshell: 'd', name: '6d', capacity: 10 },
      { n: 7, subshell: 'p', name: '7p', capacity: 6 }
    ];

    let remainingElectrons = z;
    const shellMap: Map<number, ShellPopulation> = new Map();

    const shellNames: Record<number, 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q'> = {
      1: 'K',
      2: 'L',
      3: 'M',
      4: 'N',
      5: 'O',
      6: 'P',
      7: 'Q'
    };

    for (let i = 1; i <= 7; i++) {
      shellMap.set(i, {
        shellName: shellNames[i],
        n: i,
        electronCount: 0,
        subshells: []
      });
    }

    const spdfParts: string[] = [];

    for (const sub of subshellCapacity) {
      if (remainingElectrons <= 0) break;

      const fill = Math.min(remainingElectrons, sub.capacity);
      remainingElectrons -= fill;

      spdfParts.push(`${sub.name}^${fill}`);

      const shellObj = shellMap.get(sub.n)!;
      shellObj.electronCount += fill;
      shellObj.subshells.push({ subshell: sub.subshell, count: fill });
    }

    // Filter active shells
    const activeShells = Array.from(shellMap.values()).filter((s) => s.electronCount > 0);

    // Outer shell valence electrons
    const outerShell = activeShells[activeShells.length - 1];
    const valenceElectrons = outerShell ? outerShell.electronCount : 0;

    return {
      atomicNumber: z,
      protons,
      neutrons,
      massNumber,
      shells: activeShells,
      spdfString: spdfParts.join(' '),
      valenceElectrons
    };
  }
}
