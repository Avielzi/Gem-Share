import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { GemCategory, type Gem, type LocalizedString } from '../types.ts';
import * as db from '../services/dbService.ts';
import { calculateHash } from '../utils/helpers.ts';

interface GemsContextType {
  gems: Gem[];
  loading: boolean;
  addGem: (gemData: Omit<Gem, 'id' | 'integrity'>) => Promise<void>;
  updateGem: (gem: Gem) => Promise<void>;
  deleteGem: (id: string) => Promise<void>;
  importGems: (gemsData: Gem[]) => Promise<{ added: number; updated: number; skipped: number; }>;
}

const GemsContext = createContext<GemsContextType | undefined>(undefined);

export const GemsProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [gems, setGems] = useState<Gem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadGems = useCallback(async () => {
    setLoading(true);
    try {
      const allGems = await db.getAllGems();
      setGems(allGems);
    } catch (error) {
      console.error("Failed to load gems from DB", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGems();
  }, [loadGems]);

  const addGem = useCallback(async (gemData: Omit<Gem, 'id' | 'integrity'>) => {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    const gemToSave: Omit<Gem, 'integrity'> = {
      ...gemData,
      id,
      meta: {
        ...gemData.meta,
        createdAt: now,
        updatedAt: now,
      },
    };
    
    const integrity = await calculateHash(JSON.stringify(gemToSave));
    const newGem: Gem = { ...gemToSave, integrity };

    await db.saveGem(newGem);
    setGems(prev => [...prev, newGem]);
  }, []);

  const updateGem = useCallback(async (gem: Gem) => {
    const now = new Date().toISOString();
    const gemToSave: Omit<Gem, 'integrity'> = {
        ...gem,
        meta: {
            ...gem.meta,
            updatedAt: now,
        }
    };

    const integrity = await calculateHash(JSON.stringify(gemToSave));
    const updatedGem: Gem = { ...gemToSave, integrity };
    
    await db.saveGem(updatedGem);
    setGems(prev => prev.map(g => g.id === updatedGem.id ? updatedGem : g));
  }, []);

  const deleteGem = useCallback(async (id: string) => {
    await db.deleteGemDB(id);
    setGems(prev => prev.filter(g => g.id !== id));
  }, []);
  
  const importGems = useCallback(async (gemsData: Gem[]): Promise<{ added: number; updated: number; skipped: number; }> => {
      const stats = { added: 0, updated: 0, skipped: 0 };
      const currentGems = await db.getAllGems();
      const gemsMap = new Map(currentGems.map(g => [g.id, g]));

      const stringToLocalizedString = (str: string | LocalizedString): LocalizedString => {
        if (typeof str === 'object' && str !== null && 'en' in str && 'he' in str) return str;
        const s = String(str || '');
        return { en: s, he: s };
      }

      for (const gemData of gemsData) {
        if (!gemData.id || !gemData.name || !gemData.prompt || !gemData.meta || !gemData.meta.updatedAt) {
          stats.skipped++;
          continue;
        }

        // Backward compatibility: convert string fields to LocalizedString and add default models
        const compatibleGemData = {
          ...gemData,
          name: stringToLocalizedString(gemData.name),
          description: stringToLocalizedString(gemData.description),
          inputs: gemData.inputs?.map(i => ({...i, label: stringToLocalizedString(i.label)})) || [],
          models: gemData.models || { text: 'gemini-2.5-flash', imageEnabled: false },
        };
        
        const { integrity, ...gemToHash } = compatibleGemData;
        const newIntegrity = await calculateHash(JSON.stringify(gemToHash));
        const gemToImport: Gem = { ...(gemToHash as Gem), integrity: newIntegrity };

        const existing = gemsMap.get(gemToImport.id);

        if (!existing) {
            await db.saveGem(gemToImport);
            stats.added++;
        } else {
            const existingDate = new Date(existing.meta.updatedAt);
            const importDate = new Date(gemToImport.meta.updatedAt);
            
            if (importDate > existingDate) {
                await db.saveGem(gemToImport);
                stats.updated++;
            } else {
                stats.skipped++;
            }
        }
      }

      await loadGems(); // Refresh list after import
      return stats;
  }, [loadGems]);

  const value = { gems, loading, addGem, updateGem, deleteGem, importGems };

  return React.createElement(GemsContext.Provider, { value: value }, children);
};

export const useGems = (): GemsContextType => {
  const context = useContext(GemsContext);
  if (context === undefined) {
    throw new Error('useGems must be used within a GemsProvider');
  }
  return context;
};