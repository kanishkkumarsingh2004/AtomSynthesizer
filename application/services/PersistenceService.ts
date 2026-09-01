import { openDB, IDBPDatabase } from 'idb';
import { Molecule } from '../../domain/molecular/Molecule';

const DB_NAME = 'AtomSynthesizerDB';
const DB_VERSION = 1;
const STORE_MOLECULES = 'molecules';

export interface SavedProjectRecord {
  id: string;
  name: string;
  molecule: Molecule;
  createdAt: string;
  updatedAt: string;
}

class PersistenceServiceImpl {
  private dbPromise: Promise<IDBPDatabase> | null = null;

  private getDB(): Promise<IDBPDatabase> {
    if (typeof window === 'undefined') {
      return Promise.reject(new Error('IndexedDB unavailable on server side.'));
    }

    if (!this.dbPromise) {
      this.dbPromise = openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(STORE_MOLECULES)) {
            db.createObjectStore(STORE_MOLECULES, { keyPath: 'id' });
          }
        }
      });
    }
    return this.dbPromise;
  }

  public async saveMolecule(molecule: Molecule): Promise<SavedProjectRecord> {
    const db = await this.getDB();
    const now = new Date().toISOString();

    const existing = await db.get(STORE_MOLECULES, molecule.id);
    const record: SavedProjectRecord = {
      id: molecule.id,
      name: molecule.name || 'Untitled Molecule',
      molecule,
      createdAt: existing ? existing.createdAt : now,
      updatedAt: now
    };

    await db.put(STORE_MOLECULES, record);
    return record;
  }

  public async loadMolecule(id: string): Promise<Molecule | null> {
    const db = await this.getDB();
    const record: SavedProjectRecord | undefined = await db.get(STORE_MOLECULES, id);
    return record ? record.molecule : null;
  }

  public async listProjects(): Promise<SavedProjectRecord[]> {
    const db = await this.getDB();
    return db.getAll(STORE_MOLECULES);
  }

  public async deleteProject(id: string): Promise<void> {
    const db = await this.getDB();
    await db.delete(STORE_MOLECULES, id);
  }
}

export const PersistenceService = new PersistenceServiceImpl();
