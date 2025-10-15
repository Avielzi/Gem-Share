import React, { useState, useEffect, useCallback } from 'react';
import type { Gem, GemInput, LocalizedString, UnencryptedData } from '../types.ts';
import { useLanguage } from '../hooks/useLanguage.ts';
import useEncryption from '../hooks/useEncryption.ts';
import { ICONS, CATEGORIES } from '../constants.ts';
import { Plus, Trash2, Lock, Unlock, Image, Shield, Wand2, Loader } from 'lucide-react';
import Icon from './Icon.tsx';
import * as geminiService from '../services/geminiService.ts';


interface GemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (gemData: Gem | Omit<Gem, 'id' | 'integrity'>) => void;
  gem: Gem | null;
}

const GemFormModal: React.FC<GemFormModalProps> = ({ isOpen, onClose, onSave, gem }) => {
  const { t, language } = useLanguage();
  const { encrypt, decrypt } = useEncryption();
  
  const [name, setName] = useState<LocalizedString>({ en: '', he: '' });
  const [description, setDescription] = useState<LocalizedString>({ en: '', he: '' });
  const [version, setVersion] = useState('1.0.0');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [icon, setIcon] = useState(ICONS[0]);
  const [color, setColor] = useState('#3b82f6');
  const [tags, setTags] = useState('');
  const [inputs, setInputs] = useState<GemInput[]>([]);
  const [promptText, setPromptText] = useState('');
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [password, setPassword] = useState('');
  const [breakingChanges, setBreakingChanges] = useState('');
  const [models, setModels] = useState({ text: 'gemini-2.5-flash', imageEnabled: false });
  const [decryptedForEditing, setDecryptedForEditing] = useState(false);
  const [isImproving, setIsImproving] = useState(false);

  const resetForm = useCallback(() => {
    setName({ en: '', he: '' });
    setDescription({ en: '', he: '' });
    setVersion('1.0.0');
    setCategory(CATEGORIES[0]);
    setIcon(ICONS[0]);
    setColor('#3b82f6');
    setTags('');
    setInputs([]);
    setPromptText('');
    setIsEncrypted(false);
    setPassword('');
    setBreakingChanges('');
    setModels({ text: 'gemini-2.5-flash', imageEnabled: false });
    setDecryptedForEditing(false);
  }, []);

  useEffect(() => {
    if (gem) {
      setName(gem.name);
      setDescription(gem.description);
      setVersion(gem.version);
      setCategory(gem.category);
      setIcon(gem.icon);
      setColor(gem.color);
      setTags(gem.tags?.join(', ') || '');
      setInputs(gem.inputs || []);
      if (gem.prompt.enc === false) {
        setPromptText(gem.prompt.content);
        setIsEncrypted(false);
      } else {
        setPromptText('');
        setIsEncrypted(true);
      }
      setDecryptedForEditing(false);
      setBreakingChanges(gem.meta.breakingChanges?.join('\n') || '');
      setModels(gem.models || { text: 'gemini-2.5-flash', imageEnabled: false });
    } else {
      resetForm();
    }
  }, [gem, resetForm]);
  
  const handleDecryptForEditing = async () => {
      if (!gem || gem.prompt.enc === false || !password) return;
      try {
        const decryptedContent = await decrypt(gem.prompt, password);
        setPromptText(decryptedContent);
        setDecryptedForEditing(true);
        setPassword(''); // Clear password after successful decryption
      } catch (e) {
        alert(t('incorrectPassword'));
      }
  };

  const handleImprovePrompt = async () => {
    if (!promptText) return;
    setIsImproving(true);
    try {
      const metaPrompt = `You are an expert in prompt engineering. Refine and expand the following prompt template for a large language model. The template may use {{variable}} syntax for inputs. It is crucial that you preserve these {{variable}} placeholders exactly as they are in the output. The goal is to make the prompt more robust, detailed, and structured to elicit higher-quality, more consistent responses. Return only the improved prompt template text, without any explanations or markdown formatting.

Original Prompt:
---
${promptText}`;
      
      const response = await geminiService.generateText(metaPrompt);
      const improvedText = response.text;
      
      if (improvedText) {
        setPromptText(improvedText.trim());
      } else {
        throw new Error("Received an empty response from the AI.");
      }

    } catch (error) {
      console.error("Failed to improve prompt:", error);
      alert(t('errorImprovePrompt'));
    } finally {
      setIsImproving(false);
    }
  };

  const validateForm = (): boolean => {
    if (!name.en && !name.he) {
        alert(t('gemNameRequired'));
        return false;
    }
    const inputKeys = new Set<string>();
    for (const input of inputs) {
        if (!input.key) {
             alert(t('inputKeyRequired'));
             return false;
        }
        if (inputKeys.has(input.key)) {
            alert(t('duplicateInputKey', { key: input.key }));
            return false;
        }
        inputKeys.add(input.key);
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    let promptData;
    if (isEncrypted) {
      if (!password && !decryptedForEditing) {
        alert(t('passwordRequired'));
        return;
      }
      try {
        // Re-encrypt with new password if provided, or old one if just editing
        const passwordToUse = password || (gem?.prompt.enc ? 'temp-placeholder' : '');
        if (!passwordToUse) {
            alert(t('passwordRequired'));
            return;
        }
        promptData = await encrypt(promptText, passwordToUse);
      } catch (e) {
        alert(t('encryptionFailed'));
        return;
      }
    } else {
      promptData = { enc: false, content: promptText };
    }

    const gemData = {
      name,
      description,
      version,
      category,
      icon,
      color,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      inputs,
      prompt: promptData,
      models,
      meta: {
        createdAt: gem?.meta.createdAt || '',
        updatedAt: '',
        breakingChanges: breakingChanges.split('\n').filter(Boolean)
      }
    };

    if (gem) {
      onSave({ ...gemData, id: gem.id });
    } else {
      onSave(gemData);
    }
    onClose();
  };

  const handleAddInput = () => {
    setInputs([...inputs, { key: '', label: { en: '', he: '' }, type: 'string', required: true }]);
  };

  const handleInputChange = <K extends keyof GemInput>(index: number, field: K, value: GemInput[K]) => {
    const newInputs = [...inputs];
    const inputToUpdate = { ...newInputs[index], [field]: value };
    newInputs[index] = inputToUpdate;
    setInputs(newInputs);
  };

  const handleInputLabelChange = (index: number, lang: 'en' | 'he', value: string) => {
    const newInputs = [...inputs];
    newInputs[index].label[lang] = value;
    setInputs(newInputs);
  };

  const handleRemoveInput = (index: number) => {
    setInputs(inputs.filter((_, i) => i !== index));
  };
  
  if (!isOpen) return null;
  
  const isEditingEncryptedAndLocked = gem?.prompt.enc && !decryptedForEditing;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-start p-2 sm:p-4 sm:items-center">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] flex flex-col">
        <div className="p-4 border-b flex-shrink-0">
          <h2 className="text-xl font-bold">{gem ? t('editGem') : t('createGemTitle')}</h2>
        </div>
        <div className="p-4 overflow-y-auto flex-grow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('gemName')} (EN)</label>
              <input type="text" value={name.en} onChange={e => setName(p => ({ ...p, en: e.target.value }))} className="w-full bg-secondary p-2 rounded-md" />
            </div>
             <div>
              <label className="block text-sm font-medium mb-1">{t('gemName')} (HE)</label>
              <input type="text" value={name.he} onChange={e => setName(p => ({ ...p, he: e.target.value }))} className="w-full bg-secondary p-2 rounded-md" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">{t('description')} (EN)</label>
              <input value={description.en} onChange={e => setDescription(p => ({...p, en: e.target.value}))} className="w-full bg-secondary p-2 rounded-md" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">{t('description')} (HE)</label>
              <input value={description.he} onChange={e => setDescription(p => ({...p, he: e.target.value}))} className="w-full bg-secondary p-2 rounded-md" />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">{t('category')}</label>
                <select value={category} onChange={e => setCategory(e.target.value as any)} className="w-full bg-secondary p-2 rounded-md">
                    {CATEGORIES.map(c => <option key={c} value={c}>{t(c)}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">{t('version')}</label>
                <input type="text" value={version} onChange={e => setVersion(e.target.value)} className="w-full bg-secondary p-2 rounded-md" />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">{t('icon')}</label>
                <select value={icon} onChange={e => setIcon(e.target.value)} className="w-full bg-secondary p-2 rounded-md">
                    {ICONS.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Color</label>
                <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-full h-10 p-1 bg-secondary rounded-md" />
            </div>
             <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">{t('tags')}</label>
              <input type="text" value={tags} onChange={e => setTags(e.target.value)} className="w-full bg-secondary p-2 rounded-md" />
            </div>
            <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium p-3 bg-secondary rounded-md cursor-pointer">
                    <Image size={16} />
                    <input type="checkbox" checked={models.imageEnabled} onChange={e => setModels(prev => ({...prev, imageEnabled: e.target.checked}))} />
                    {t('enableImageGeneration')}
                </label>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">{t('breakingChanges')}</label>
              <textarea value={breakingChanges} onChange={e => setBreakingChanges(e.target.value)} rows={2} className="w-full bg-secondary p-2 rounded-md" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">{t('inputs')}</h3>
            {inputs.map((input, index) => (
              <div key={index} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 p-2 border rounded-md mb-2">
                <input type="text" placeholder={t('inputKeyPlaceholder')} value={input.key} onChange={e => handleInputChange(index, 'key', e.target.value)} className="bg-secondary p-2 rounded-md" />
                <input type="text" placeholder={`${t('inputLabelPlaceholder')} (EN)`} value={input.label.en} onChange={e => handleInputLabelChange(index, 'en', e.target.value)} className="bg-secondary p-2 rounded-md" />
                <input type="text" placeholder={`${t('inputLabelPlaceholder')} (HE)`} value={input.label.he} onChange={e => handleInputLabelChange(index, 'he', e.target.value)} className="bg-secondary p-2 rounded-md" />
                <select value={input.type} onChange={e => handleInputChange(index, 'type', e.target.value as GemInput['type'])} className="bg-secondary p-2 rounded-md">
                  <option value="string">{t('shortText')}</option>
                  <option value="textarea">{t('longText')}</option>
                  <option value="boolean">{t('trueFalse')}</option>
                  <option value="number">{t('number')}</option>
                  <option value="enum">{t('enum')}</option>
                </select>
                {input.type === 'enum' && <input type="text" placeholder={t('inputEnumOptionsPlaceholder')} value={input.options?.join(',')} onChange={e => handleInputChange(index, 'options', e.target.value.split(','))} className="lg:col-span-4 bg-secondary p-2 rounded-md" />}
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={input.required} onChange={e => handleInputChange(index, 'required', e.target.checked)} /> {t('required')}</label>
                    <button onClick={() => handleRemoveInput(index)}><Trash2 size={16} className="text-red-500" /></button>
                </div>
              </div>
            ))}
            <button onClick={handleAddInput} className="flex items-center gap-2 text-sm bg-secondary px-3 py-1.5 rounded-md"><Plus size={14} /> {t('addInput')}</button>
          </div>
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">{t('prompt')}</h3>
                 {!isEditingEncryptedAndLocked && (
                    <button 
                        onClick={handleImprovePrompt} 
                        disabled={isImproving || !promptText}
                        className="flex items-center gap-2 text-sm bg-secondary px-3 py-1.5 rounded-md hover:bg-accent disabled:opacity-50"
                        title={t('improvePromptTooltip')}
                    >
                        {isImproving ? <Loader size={14} className="animate-spin" /> : <Wand2 size={14} />}
                        {t('improveWithAI')}
                    </button>
                 )}
            </div>
            {isEditingEncryptedAndLocked ? (
                 <div className="bg-secondary p-4 rounded-lg">
                    <Shield size={20} className="text-yellow-500 mb-2"/>
                    <h3 className="font-semibold">{t('editEncryptedPrompt')}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{t('decryptToEdit')}</p>
                    <div className="flex flex-col sm:flex-row gap-2 mt-2">
                      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={t('passwordToDecrypt')} className="w-full bg-background p-2 rounded-md"/>
                      <button onClick={handleDecryptForEditing} className="bg-primary text-primary-foreground px-4 py-2 rounded-md">{t('decrypt')}</button>
                    </div>
                  </div>
            ) : (
                <>
                    <textarea value={promptText} onChange={e => setPromptText(e.target.value)} rows={8} className="w-full bg-secondary p-2 rounded-md" placeholder={t('promptPlaceholder')} />
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-2">
                        <button onClick={() => setIsEncrypted(!isEncrypted)} className="flex items-center gap-2 text-sm">
                            {isEncrypted ? <Lock size={14}/> : <Unlock size={14}/>}
                            {isEncrypted ? t('promptWillBeEncrypted') : t('promptWillNotBeEncrypted')}
                        </button>
                        {isEncrypted && <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={decryptedForEditing ? t('newPasswordOptional') : t('passwordForEncryption')} className="bg-secondary p-2 rounded-md flex-grow"/>}
                    </div>
                </>
            )}
          </div>
        </div>
        <div className="p-4 border-t flex-shrink-0 flex justify-end gap-2">
          <button onClick={onClose} className="bg-secondary px-4 py-2 rounded-md">{t('cancel')}</button>
          <button onClick={handleSave} className="bg-primary text-primary-foreground px-4 py-2 rounded-md">{t('save')}</button>
        </div>
      </div>
    </div>
  );
};

export default GemFormModal;