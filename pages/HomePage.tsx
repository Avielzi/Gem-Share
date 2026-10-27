import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGems } from '../hooks/useGems.ts';
import GemCard from '../components/GemCard.tsx';
import GemFormModal from '../components/GemFormModal.tsx';
import GemRunnerModal from '../components/GemRunnerModal.tsx';
import StatsBanner from '../components/StatsBanner.tsx';
import StarterGemCard from '../components/StarterGemCard.tsx';
import CategoryFilter from '../components/CategoryFilter.tsx';
import { starterGems } from '../data/starterGems.ts';
import { Gem, GemCategory } from '../types.ts';
import { CATEGORIES, SortOptions, ICONS } from '../constants.ts';
import { Plus, Bot, Search, ArrowUpDown, Frown, ChevronDown, ChevronRight, Wand2, Loader } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage.ts';
import { Type } from '@google/genai';
import * as geminiService from '../services/geminiService.ts';
import { MissingApiKeyError } from '../services/apiKey.ts';

const COLLAPSED_CATEGORIES_KEY = 'gem_share_collapsed_categories';

const HomePage: React.FC = () => {
  const { gems, loading, addGem, updateGem, deleteGem } = useGems();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isRunnerOpen, setIsRunnerOpen] = useState(false);
  const [selectedGem, setSelectedGem] = useState<Gem | null>(null);
  const [addedStarterGems, setAddedStarterGems] = useState<string[]>([]);
  const { t, lt } = useLanguage();
  
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = searchParams.get('q') || '';
  const sortBy = searchParams.get('sort') || SortOptions.UPDATED_DESC;
  const selectedCategories = searchParams.getAll('cat') as GemCategory[];
  const isFiltered = searchTerm || selectedCategories.length > 0;
  
  const [collapsedCategories, setCollapsedCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(COLLAPSED_CATEGORIES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [formMode, setFormMode] = useState<'create' | 'edit' | 'magic'>('create');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingCategory, setGeneratingCategory] = useState<string | null | 'global'>(null);


  useEffect(() => {
    // Only persist collapsed state when not filtering to avoid confusion
    if (!isFiltered) {
        localStorage.setItem(COLLAPSED_CATEGORIES_KEY, JSON.stringify(collapsedCategories));
    }
  }, [collapsedCategories, isFiltered]);

  const toggleCategoryCollapse = (category: string) => {
    setCollapsedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const updateSearchParams = (updates: Record<string, string | string[] | null>) => {
    const newParams = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(updates)) {
        newParams.delete(key); // Clear existing values for the key
        if (value) {
            if (Array.isArray(value)) {
                value.forEach(v => newParams.append(key, v));
            } else {
                newParams.set(key, value);
            }
        }
    }
    setSearchParams(newParams);
  };

  const handleCreate = () => {
    setFormMode('create');
    setSelectedGem(null);
    setIsFormOpen(true);
  };
  
  const handleEdit = (gem: Gem) => {
    setFormMode('edit');
    setSelectedGem(gem);
    setIsFormOpen(true);
  };

  const handleRun = (gem: Gem) => {
    setSelectedGem(gem);
    setIsRunnerOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('confirmDelete'))) {
      deleteGem(id);
    }
  };

  const handleSave = (gemData: Gem | Omit<Gem, 'id' | 'integrity'>) => {
    if (formMode === 'edit' && 'id' in gemData) {
      updateGem(gemData as Gem);
    } else { // 'create' or 'magic'
      const gemToAdd: Omit<Gem, 'id' | 'integrity'> = 'id' in gemData
        ? (({ id, integrity, ...rest }) => rest)(gemData as Gem)
        : gemData;
      addGem(gemToAdd);
    }
    setIsFormOpen(false);
    setSelectedGem(null);
  };
  
  const handleAddStarterGem = (starterGem: Omit<Gem, 'id' | 'integrity'>) => {
    addGem(starterGem);
    setAddedStarterGems(prev => [...prev, lt(starterGem.name)]);
  };

  const handleAddAllStarterGems = () => {
    starterGems.forEach(gem => {
      if (!gems.some(g => lt(g.name) === lt(gem.name))) {
        addGem(gem);
      }
    });
    setAddedStarterGems(starterGems.map(g => lt(g.name)));
  };

  const handleMagicGenerate = async (category?: GemCategory) => {
    const generationId = category || 'global';
    setIsGenerating(true);
    setGeneratingCategory(generationId);

    const schema = {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.OBJECT, properties: { en: { type: Type.STRING }, he: { type: Type.STRING } } },
            description: { type: Type.OBJECT, properties: { en: { type: Type.STRING }, he: { type: Type.STRING } } },
            category: { type: Type.STRING, enum: CATEGORIES },
            icon: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            inputs: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { key: { type: Type.STRING }, label: { type: Type.OBJECT, properties: { en: { type: Type.STRING }, he: { type: Type.STRING } } }, type: { type: Type.STRING, enum: ['string', 'textarea', 'boolean', 'number', 'enum'] }, required: { type: Type.BOOLEAN }, options: { type: Type.ARRAY, items: { type: Type.STRING } }, }, required: ['key', 'label', 'type', 'required'] } },
            prompt: { type: Type.STRING },
            models: { type: Type.OBJECT, properties: { text: { type: Type.STRING, enum: ['gemini-2.5-flash'] }, imageEnabled: { type: Type.BOOLEAN } }, required: ['text', 'imageEnabled'] }
        },
        required: ['name', 'description', 'category', 'icon', 'tags', 'inputs', 'prompt', 'models']
    };

    const promptInstruction = category
      ? `Generate a complete, professional, and creative Gem configuration in JSON format for the "${t(category)}" category. The idea should be novel and useful for users interested in ${t(category)}. The name and description must be localized for English (en) and Hebrew (he).`
      : `Generate a complete, professional, and creative Gem configuration in JSON format on a completely random but interesting and useful topic. Surprise me. The name and description must be localized for English (en) and Hebrew (he).`;

    try {
        const response = await geminiService.generateGemConfiguration(promptInstruction, schema);
        const resultJson = JSON.parse(response.text);
        
        if (category) resultJson.category = category;
        if (!ICONS.includes(resultJson.icon)) resultJson.icon = 'Sparkles';

        const tempGem: Gem = {
          ...resultJson,
          version: '1.0.0',
          color: '#8B5CF6',
          prompt: { enc: false, content: resultJson.prompt },
          models: resultJson.models || { text: 'gemini-2.5-flash', imageEnabled: false },
          meta: { createdAt: '', updatedAt: '' },
          id: `temp-${Date.now()}`,
          integrity: '',
        };

        setFormMode('magic');
        setSelectedGem(tempGem);
        setIsFormOpen(true);
    } catch (error) {
        console.error("Magic Generate Error:", error);
        alert(t(error instanceof MissingApiKeyError ? 'apiKeyMissing' : 'errorMagicGem'));
    } finally {
        setIsGenerating(false);
        setGeneratingCategory(null);
    }
  };


  const filteredAndSortedGems = useMemo(() => {
    return gems
      .filter(gem => {
        const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(gem.category);
        const searchMatch = !searchTerm ||
          lt(gem.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
          lt(gem.description).toLowerCase().includes(searchTerm.toLowerCase()) ||
          gem.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        return categoryMatch && searchMatch;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case SortOptions.NAME_ASC:
            return lt(a.name).localeCompare(lt(b.name));
          case SortOptions.NAME_DESC:
            return lt(b.name).localeCompare(lt(a.name));
          case SortOptions.CREATED_AT_ASC:
            return new Date(a.meta.createdAt).getTime() - new Date(b.meta.createdAt).getTime();
          case SortOptions.CATEGORY:
             if (a.category === b.category) {
                return new Date(b.meta.updatedAt).getTime() - new Date(a.meta.updatedAt).getTime();
             }
             return a.category.localeCompare(b.category);
          default: // UPDATED_DESC
            return new Date(b.meta.updatedAt).getTime() - new Date(a.meta.updatedAt).getTime();
        }
      });
  }, [gems, selectedCategories, searchTerm, sortBy, lt]);
  
  const groupedGems = useMemo(() => {
    return filteredAndSortedGems.reduce((acc, gem) => {
      (acc[gem.category] = acc[gem.category] || []).push(gem);
      return acc;
    }, {} as Record<string, Gem[]>);
  }, [filteredAndSortedGems]);

  const sortedCategories = useMemo(() => {
    return Object.keys(groupedGems).sort((a, b) => {
        if (sortBy === SortOptions.CATEGORY) {
            return a.localeCompare(b);
        }
        // Keep original order for other sorts
        const firstA = gems.find(g => g.category === a)?.meta.updatedAt || '';
        const firstB = gems.find(g => g.category === b)?.meta.updatedAt || '';
        return new Date(firstB).getTime() - new Date(firstA).getTime();
    })
  }, [groupedGems, sortBy, gems]);

  if (loading) {
    return <div>{t('loadingGems')}</div>;
  }

  return (
    <div className="text-start">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <h1 className="text-3xl font-bold">{t('myGems')}</h1>
        <div className="flex items-center gap-2">
           <button
              onClick={() => handleMagicGenerate()}
              disabled={isGenerating}
              title={t('magicCreateTooltip')}
              className="flex items-center gap-2 bg-purple-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-purple-700 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50"
            >
              {isGenerating && generatingCategory === 'global' ? <Loader size={18} className="animate-spin" /> : <Wand2 size={18} />}
              <span className="hidden sm:inline">{isGenerating && generatingCategory === 'global' ? t('generatingMagicGem') : t('magicCreate')}</span>
            </button>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Plus size={18} />
              {t('createGem')}
            </button>
        </div>
      </div>
      
      <StatsBanner gems={gems} />

      <div className="sticky top-12 z-30 bg-background/80 backdrop-blur-sm -mx-4 px-4 py-3 mb-6 border-b" style={{ borderColor: 'var(--border)'}}>
        <CategoryFilter
          categories={CATEGORIES}
          selected={selectedCategories}
          onSelect={(cats) => updateSearchParams({ cat: cats })}
        />
        <div className="flex flex-col sm:flex-row gap-2 mt-3">
            <div className="relative flex-grow">
                <Search size={18} className="absolute start-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--subtle-icon-color)' }} />
                <input 
                    type="text"
                    placeholder={t('searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => updateSearchParams({ q: e.target.value })}
                    className="w-full bg-card border rounded-lg ps-10 pe-3 py-2 text-sm focus:outline-none focus-visible:ring-2"
                    style={{ borderColor: 'var(--border)', color: 'var(--foreground)', '--tw-ring-color': 'var(--ring)' } as React.CSSProperties}
                />
            </div>
            <div className="relative">
                <ArrowUpDown size={18} className="absolute start-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--subtle-icon-color)' }}/>
                <select 
                    value={sortBy}
                    onChange={(e) => updateSearchParams({ sort: e.target.value })}
                    className="w-full sm:w-auto appearance-none bg-card border rounded-lg ps-10 pe-4 py-2 text-sm focus:outline-none focus-visible:ring-2"
                    style={{ borderColor: 'var(--border)', color: 'var(--foreground)', '--tw-ring-color': 'var(--ring)' } as React.CSSProperties}
                >
                    <option value={SortOptions.UPDATED_DESC}>{t('sort_lastUpdated')}</option>
                    <option value={SortOptions.NAME_ASC}>{t('sort_nameAsc')}</option>
                    <option value={SortOptions.NAME_DESC}>{t('sort_nameDesc')}</option>
                    <option value={SortOptions.CREATED_AT_ASC}>{t('sort_newest')}</option>
                    <option value={SortOptions.CATEGORY}>{t('sort_category')}</option>
                </select>
            </div>
        </div>
      </div>

      {gems.length === 0 ? (
        <div className="text-center py-10 bg-card border-2 border-dashed rounded-lg" style={{ borderColor: 'var(--border)' }}>
          <Bot size={40} className="mx-auto text-primary" />
          <h2 className="text-2xl font-bold mt-4">{t('welcome')}</h2>
          <p className="mt-2 mb-6" style={{ color: 'var(--muted-foreground)' }}>{t('libraryEmpty')}</p>
          <button
              onClick={handleAddAllStarterGems}
              className="bg-primary text-primary-foreground font-semibold px-6 py-2 rounded-md hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          >
              {t('addAllStarterGems')}
          </button>
          <div className="px-4 mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {starterGems.map((gem) => (
                <StarterGemCard
                  key={lt(gem.name)}
                  gem={gem}
                  onAdd={() => handleAddStarterGem(gem)}
                  isAdded={addedStarterGems.includes(lt(gem.name))}
                />
              ))}
            </div>
          </div>
        </div>
      ) : filteredAndSortedGems.length === 0 ? (
        <div className="text-center py-10 bg-card border-2 border-dashed rounded-lg" style={{ borderColor: 'var(--border)' }}>
          <Frown size={40} className="mx-auto text-primary" />
          <h2 className="text-2xl font-bold mt-4">{t('noResultsFound')}</h2>
          <p className="mt-2" style={{ color: 'var(--muted-foreground)' }}>{t('noResultsFoundDesc')}</p>
        </div>
      ) : (
        <div className="space-y-8">
            {sortedCategories.map(category => {
                // When filtering, always show categories with results. Otherwise, respect user's collapsed state.
                const isCollapsed = isFiltered ? false : collapsedCategories.includes(category);
                return (
                    <section key={category}>
                        <div className="flex items-center gap-3 mb-4">
                             <button
                                onClick={() => toggleCategoryCollapse(category)}
                                className="flex items-center gap-2 text-xl font-semibold hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md -ms-2 ps-2 pe-2 py-1"
                                aria-expanded={!isCollapsed}
                                aria-controls={`category-grid-${category}`}
                            >
                                {isCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                                <span>{t(category) || category} ({groupedGems[category].length})</span>
                            </button>
                             <button
                                onClick={() => handleMagicGenerate(category as GemCategory)}
                                disabled={isGenerating}
                                title={t('magicCreateForCategoryTooltip', { category: t(category) })}
                                className="p-1 rounded-full text-muted-foreground hover:bg-secondary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isGenerating && generatingCategory === category ? <Loader size={16} className="animate-spin" /> : <Wand2 size={16} />}
                            </button>
                            <div className="flex-grow h-px" style={{ backgroundColor: 'var(--border)' }}></div>
                        </div>
                        <div id={`category-grid-${category}`} className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 ${isCollapsed ? 'hidden' : ''}`}>
                            {groupedGems[category].map((gem) => (
                                <GemCard
                                    key={gem.id}
                                    gem={gem}
                                    onRun={() => handleRun(gem)}
                                    onEdit={() => handleEdit(gem)}
                                    onDelete={() => handleDelete(gem.id)}
                                />
                            ))}
                        </div>
                    </section>
                )
            })}
        </div>
      )}
      
      <GemFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedGem(null);
        }}
        onSave={handleSave}
        gem={selectedGem}
      />

      {selectedGem && (
        <GemRunnerModal
          isOpen={isRunnerOpen}
          onClose={() => {
            setIsRunnerOpen(false);
            setSelectedGem(null);
          }}
          gem={selectedGem}
        />
      )}
    </div>
  );
};

export default HomePage;