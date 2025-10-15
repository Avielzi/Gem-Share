import React, { useState } from 'react';
import { useGems } from '../hooks/useGems.ts';
import { useLanguage } from '../hooks/useLanguage.ts';
import * as geminiService from '../services/geminiService.ts';
import type { Gem, GemCategory, GemInput } from '../types.ts';
import { Type } from '@google/genai';
import { Bot, HardDrive, KeyRound, Info, Loader, Download, Upload, Plus, Edit } from 'lucide-react';
import GemFormModal from '../components/GemFormModal.tsx';

const SettingsPage: React.FC = () => {
  const { gems, importGems, addGem } = useGems();
  const { t, lt } = useLanguage();
  const [activeTab, setActiveTab] = useState('builder');
  
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('');
  const [tone, setTone] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedGem, setGeneratedGem] = useState<Omit<Gem, 'id' | 'integrity'> | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [gemForEditing, setGemForEditing] = useState<Gem | null>(null);

  const handleExport = () => {
    if (gems.length === 0) {
      alert(t('libraryEmptyExport'));
      return;
    }
    const data = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      gems: gems,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gem_share_library_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = JSON.parse(e.target?.result as string);
        if (!content.gems || !Array.isArray(content.gems)) {
            alert(t('invalidImportFile'));
            return;
        }
        if (window.confirm(t('importConfirmation'))) {
            const stats = await importGems(content.gems);
            alert(t('importCompleteStat', {added: String(stats.added), updated: String(stats.updated), skipped: String(stats.skipped)}));
        }
      } catch (error) {
        alert(t('importFailed'));
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset file input
  };
  
  const handleGenerateGem = async () => {
      if (!topic) {
        alert(t('errorTopic'));
        return;
      }
      setGenerating(true);
      setGeneratedGem(null);
      const schema = {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.OBJECT, properties: { en: { type: Type.STRING }, he: { type: Type.STRING } } },
            description: { type: Type.OBJECT, properties: { en: { type: Type.STRING }, he: { type: Type.STRING } } },
            category: { type: Type.STRING, enum: ['Music', 'Code', 'Marketing', 'Sales', 'Misc'] },
            icon: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            inputs: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        key: { type: Type.STRING },
                        label: { type: Type.OBJECT, properties: { en: { type: Type.STRING }, he: { type: Type.STRING } } },
                        type: { type: Type.STRING, enum: ['string', 'textarea', 'boolean', 'number', 'enum'] },
                        required: { type: Type.BOOLEAN },
                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ['key', 'label', 'type', 'required']
                }
            },
            prompt: { type: Type.STRING },
            models: {
                type: Type.OBJECT,
                properties: {
                    text: { type: Type.STRING, enum: ['gemini-2.5-flash'] },
                    imageEnabled: { type: Type.BOOLEAN }
                },
                required: ['text', 'imageEnabled']
            }
        },
        required: ['name', 'description', 'category', 'icon', 'tags', 'inputs', 'prompt', 'models']
      };

      const userPrompt = `Based on the following requirements, generate a complete, professional Gem configuration in JSON format.
      - **Topic/Purpose**: ${topic}
      - **Target Audience**: ${audience}
      - **Tone**: ${tone}
      The output should be a single JSON object matching the provided schema. The 'name' and 'description' fields must be localized with 'en' and 'he' keys. It should also determine if 'imageEnabled' should be true based on the topic and configure the 'models' object accordingly (use 'gemini-2.5-flash' for the text model).`;

      try {
          const response = await geminiService.generateGemConfiguration(userPrompt, schema);
          const resultJson = JSON.parse(response.text);
          setGeneratedGem({
            ...resultJson,
            version: '1.0.0',
            color: '#3b82f6',
            prompt: { enc: false, content: resultJson.prompt },
            models: resultJson.models || { text: 'gemini-2.5-flash', imageEnabled: false },
            meta: { createdAt: '', updatedAt: '' },
          });
      } catch (error) {
          console.error(error);
          alert(t('errorFailedToGenerate'));
      } finally {
          setGenerating(false);
      }
  };

  const handleAddGeneratedGem = () => {
      if (generatedGem) {
          try {
              addGem(generatedGem);
              alert(t('gemAddedToLibrary', {gemName: lt(generatedGem.name)}));
              setGeneratedGem(null);
          } catch {
              alert(t('errorAddGem'));
          }
      }
  };
  
  const handleEditGeneratedGem = () => {
    if (generatedGem) {
      // The form modal expects a full Gem object to pre-fill.
      // We create a temporary one; the onSave logic will treat it as new.
      const tempGem: Gem = {
        ...generatedGem,
        id: `temp-${Date.now()}`, // Dummy ID
        integrity: '', // Dummy integrity
      };
      setGemForEditing(tempGem);
      setIsFormOpen(true);
    }
  };

  const handleSaveFromModal = (gemData: Gem | Omit<Gem, 'id' | 'integrity'>) => {
    // Ensure we are always adding a new gem by removing temporary/dummy id/integrity.
    const gemToAdd: Omit<Gem, 'id' | 'integrity'> = 'id' in gemData
        ? (({ id, integrity, ...rest }) => rest)(gemData as Gem)
        : gemData;
    
    addGem(gemToAdd);
    alert(t('gemAddedToLibrary', { gemName: lt(gemToAdd.name) }));

    setIsFormOpen(false);
    setGemForEditing(null);
    setGeneratedGem(null); // Also clear the preview
  };


  const TABS = [
      { id: 'builder', label: t('gemBuilderAI'), icon: Bot },
      { id: 'data', label: t('dataManagement'), icon: HardDrive },
      { id: 'api', label: t('apiConfig'), icon: KeyRound },
      { id: 'about', label: t('about'), icon: Info }
  ];

  return (
    <>
      <div className="border-b mb-6 overflow-x-auto whitespace-nowrap">
        <div className="flex">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium ${activeTab === tab.id ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}>
              <tab.icon size={16}/>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {activeTab === 'builder' && (
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-2">{t('gemBuilderAI')}</h2>
          <p className="text-muted-foreground mb-4">{t('gemBuilderDescription')}</p>
          <div className="space-y-4">
            <input type="text" placeholder={t('topicPlaceholder')} value={topic} onChange={e => setTopic(e.target.value)} className="w-full bg-card border p-2 rounded-md" />
            <input type="text" placeholder={t('audiencePlaceholder')} value={audience} onChange={e => setAudience(e.target.value)} className="w-full bg-card border p-2 rounded-md" />
            <input type="text" placeholder={t('tonePlaceholder')} value={tone} onChange={e => setTone(e.target.value)} className="w-full bg-card border p-2 rounded-md" />
          </div>
          <button onClick={handleGenerateGem} disabled={generating} className="mt-4 flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-lg w-full disabled:opacity-50">
            {generating ? <Loader className="animate-spin" size={18}/> : <Bot size={18}/>}
            {generating ? t('generatingDots') : t('generateGem')}
          </button>
          
          {generatedGem && (
            <div className="mt-6 border-t pt-6">
              <h3 className="text-xl font-bold mb-4">{t('generatedGemPreview')}</h3>
              <div className="bg-card border rounded-lg p-4">
                  <p><strong>{t('gemName')}:</strong> {lt(generatedGem.name)}</p>
                  <p><strong>{t('category')}:</strong> {generatedGem.category}</p>
                  <p><strong>{t('tagsLabel')}:</strong> {generatedGem.tags.join(', ')}</p>
                  <div className="mt-2">
                    <strong>{t('inputsLabel')}:</strong>
                    {generatedGem.inputs.length > 0 ? (
                        <ul className="list-disc list-inside">
                            {generatedGem.inputs.map((input: GemInput) => <li key={input.key}>{lt(input.label)} ({input.key})</li>)}
                        </ul>
                    ) : <p>{t('noInputsDefined')}</p>}
                  </div>
                  {/* FIX: Used an explicit check `generatedGem.prompt.enc === false` to safely access the `content` property. This resolves a TypeScript error by narrowing the discriminated union type to `UnencryptedData` before rendering. */}
                  <pre className="bg-secondary p-2 mt-2 rounded-md text-xs whitespace-pre-wrap"><strong>{t('generatedPrompt')}:</strong> {generatedGem.prompt.enc === false ? generatedGem.prompt.content : ''}</pre>
                  <div className="flex gap-2 mt-4">
                    <button onClick={handleAddGeneratedGem} className="flex items-center gap-2 bg-green-600 text-white font-semibold px-4 py-2 rounded-lg text-sm"><Plus size={16}/> {t('addToMyGems')}</button>
                    <button onClick={handleEditGeneratedGem} className="flex items-center gap-2 bg-secondary text-secondary-foreground font-semibold px-4 py-2 rounded-lg text-sm"><Edit size={16}/> Edit & Save</button>
                  </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'data' && (
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-2">{t('dataManagement')}</h2>
          <p className="text-muted-foreground mb-6">{t('dataManagementDescription')}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card border p-4 rounded-lg text-center">
                <Download size={32} className="mx-auto text-primary mb-2"/>
                <h3 className="font-semibold">{t('exportLibrary')}</h3>
                <button onClick={handleExport} className="mt-2 bg-secondary font-semibold px-4 py-2 rounded-md text-sm">{t('export')}</button>
              </div>
              <div className="bg-card border p-4 rounded-lg text-center">
                <Upload size={32} className="mx-auto text-primary mb-2"/>
                <h3 className="font-semibold">{t('importLibrary')}</h3>
                <label className="mt-2 bg-secondary font-semibold px-4 py-2 rounded-md text-sm cursor-pointer inline-block">
                    {t('importLibrary')}
                    <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                </label>
              </div>
          </div>
        </div>
      )}

      {activeTab === 'api' && (
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-2">{t('apiConfig')}</h2>
          <div className="bg-card border p-4 rounded-lg flex items-start gap-4">
              <KeyRound size={24} className="text-primary mt-1"/>
              <div>
                  <h3 className="font-semibold">Google Gemini API</h3>
                  <p className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: t('apiKeyDescription').replace('<1>', '<code>').replace('</1>', '</code>') }}></p>
                  <div className="text-xs bg-secondary p-2 rounded-md mt-2" title={t('apiKeyInfoTooltip')}>
                    <Info size={12} className="inline-block me-1"/> {t('apiKeyInfoTooltip')}
                  </div>
              </div>
          </div>
        </div>
      )}
      
      {activeTab === 'about' && (
        <div className="max-w-3xl mx-auto prose prose-invert">
          <h2 className="text-2xl font-bold mb-2">{t('about')} Gem Share</h2>
          <p>
            Gem Share is a powerful, local-first tool for creating, managing, and sharing structured prompts for generative AI models. 
            It's designed for professionals who need to reuse complex prompts with variable inputs, ensuring consistency and efficiency in their workflows.
          </p>
          <ul>
              <li><strong>Local-First:</strong> All your Gems are stored securely in your browser's IndexedDB. No server, no accounts.</li>
              <li><strong>Shareable:</strong> Easily share Gems with colleagues for import or create public links for anyone to run.</li>
              <li><strong>Secure:</strong> Optional end-to-end encryption for your prompts protects sensitive information.</li>
              <li><strong>AI-Powered:</strong> Use the Gem Builder AI to kickstart new Gem configurations from a simple description.</li>
          </ul>
        </div>
      )}
      
      <GemFormModal 
        isOpen={isFormOpen} 
        onClose={() => {
            setIsFormOpen(false);
            setGemForEditing(null);
        }} 
        onSave={handleSaveFromModal}
        gem={gemForEditing}
      />
    </>
  );
};

export default SettingsPage;