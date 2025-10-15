import type { Gem, LibraryManifest, GemRun } from '../types.ts';

const DB_NAME = 'gemshare-library';
const DB_VERSION = 2;
const GEMS_STORE = 'gems';
const MANIFEST_STORE = 'manifest';
const GEM_RUN_HISTORY_STORE = 'gemRunHistory';
const MANIFEST_KEY = 'main';

let db: IDBDatabase;

const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        if (db) {
            return resolve(db);
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error("IndexedDB error:", (event.target as any).errorCode);
            reject("IndexedDB error");
        };

        request.onsuccess = (event) => {
            db = (event.target as IDBOpenDBRequest).result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const dbInstance = (event.target as IDBOpenDBRequest).result;
            const oldVersion = event.oldVersion;

            if (oldVersion < 1) {
                if (!dbInstance.objectStoreNames.contains(GEMS_STORE)) {
                    dbInstance.createObjectStore(GEMS_STORE, { keyPath: 'id' });
                }
                if (!dbInstance.objectStoreNames.contains(MANIFEST_STORE)) {
                    dbInstance.createObjectStore(MANIFEST_STORE);
                }
                // The legacy 'runs' store for users on v1, which is now deprecated
                if (!dbInstance.objectStoreNames.contains('runs')) {
                    const runsStore = dbInstance.createObjectStore('runs', { keyPath: 'id' });
                    runsStore.createIndex('gemId', 'gemId', { unique: false });
                }
            }
            if (oldVersion < 2) {
                 // The new store for run history, as requested.
                if (!dbInstance.objectStoreNames.contains(GEM_RUN_HISTORY_STORE)) {
                    const historyStore = dbInstance.createObjectStore(GEM_RUN_HISTORY_STORE, { keyPath: 'id' });
                    historyStore.createIndex('gemId', 'gemId', { unique: false });
                }
            }
        };
    });
};

const getStore = (storeName: string, mode: IDBTransactionMode) => {
    const transaction = db.transaction(storeName, mode)
    transaction.onerror = (event) => {
        console.error(`Transaction error on ${storeName}:`, transaction.error)
    }
    return transaction.objectStore(storeName);
};

// Manifest
export const getManifest = async (): Promise<LibraryManifest | null> => {
    await openDB();
    return new Promise((resolve, reject) => {
        const request = getStore(MANIFEST_STORE, 'readonly').get(MANIFEST_KEY);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
    });
};

export const saveManifest = async (manifest: LibraryManifest): Promise<void> => {
    await openDB();
    return new Promise<void>((resolve, reject) => {
        const request = getStore(MANIFEST_STORE, 'readwrite').put(manifest, MANIFEST_KEY);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};


// Gems
export const getAllGems = async (): Promise<Gem[]> => {
    await openDB();
    return new Promise((resolve, reject) => {
        const request = getStore(GEMS_STORE, 'readonly').getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export const getGem = async (id: string): Promise<Gem | null> => {
    await openDB();
    return new Promise((resolve, reject) => {
        const request = getStore(GEMS_STORE, 'readonly').get(id);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
    });
};

export const saveGem = async (gem: Gem): Promise<void> => {
    await openDB();
    return new Promise<void>((resolve, reject) => {
        const request = getStore(GEMS_STORE, 'readwrite').put(gem);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

export const deleteGemDB = async (id: string): Promise<void> => {
    await openDB();
    return new Promise<void>((resolve, reject) => {
        const request = getStore(GEMS_STORE, 'readwrite').delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

// Run History
export const saveRunHistory = async (run: GemRun): Promise<void> => {
     await openDB();
    return new Promise<void>((resolve, reject) => {
        const request = getStore(GEM_RUN_HISTORY_STORE, 'readwrite').put(run);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

export const getRunHistoryForGem = async (gemId: string): Promise<GemRun[]> => {
    await openDB();
    return new Promise((resolve, reject) => {
        const index = getStore(GEM_RUN_HISTORY_STORE, 'readonly').index('gemId');
        const request = index.getAll(gemId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export const getAllRunHistory = async (): Promise<GemRun[]> => {
    await openDB();
    return new Promise((resolve, reject) => {
        const request = getStore(GEM_RUN_HISTORY_STORE, 'readonly').getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};