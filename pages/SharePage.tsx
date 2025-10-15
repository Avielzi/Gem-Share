import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGems } from '../hooks/useGems.ts';
import { parseShareData } from '../utils/helpers.ts';
// FIX: Added GemCategory to imports to use it as a value for default category.
import { GemCategory, type Gem } from '../types.ts';
import { useLanguage } from '../hooks/useLanguage.ts';
import Icon from '../components/Icon.tsx';
import { CheckCircle, AlertTriangle, Home } from 'lucide-react';

const SharePage: React.FC = () => {
  const { data } = useParams<{ data: string }>();
  const { importGems } = useGems();
  const { t, lt } = useLanguage();
  const [gemData, setGemData] = useState<Partial<Gem> | null>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'added' | 'error'>('loading');

  useEffect(() => {
    if (data) {
      const parsed = parseShareData(data);
      if (parsed) {
        setGemData(parsed);
        setStatus('success');
      } else {
        setStatus('error');
      }
    }
  }, [data]);
  
  const handleAdd = async () => {
    if (gemData) {
      // The share data is partial, we need to create a full Gem object for import
      const fullGem: Gem = {
        id: gemData.id!,
        name: gemData.name!,
        description: gemData.description || { en: '', he: '' },
        version: gemData.version || '1.0.0',
        // FIX: Replaced string literal 'Misc' with GemCategory.MISC to ensure type
        // safety and resolve an enum assignment error.
        category: gemData.category || GemCategory.MISC,
        icon: gemData.icon || 'Sparkles',
        color: gemData.color || '#94a3b8',
        tags: gemData.tags || [],
        inputs: gemData.inputs || [],
        prompt: (gemData as any).isEncrypted 
          ? { enc: true, cipher: '', kdf: '', salt: '', iv: '', data: '' }
          : { enc: false, content: '' },
        models: gemData.models || { text: 'gemini-2.5-flash', imageEnabled: false },
        meta: gemData.meta || { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        integrity: '', // Integrity will be recalculated on import
      };
      
      await importGems([fullGem]);
      setStatus('added');
    }
  };

  if (status === 'loading') {
    return <div>{t('loadingGem')}</div>;
  }

  if (status === 'error' || !gemData) {
    return (
      <div className="text-center">
        <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
        <h1 className="text-2xl font-bold">{t('error')}</h1>
        <p>{t('invalidLink')}</p>
         <Link to="/" className="mt-4 inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md">
          <Home size={16} /> {t('backToHome')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-card border rounded-lg p-6">
      <h1 className="text-3xl font-bold mb-4">{lt(gemData.name!)}</h1>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg" style={{ backgroundColor: gemData.color }}>
          <Icon name={gemData.icon!} size={24} className="text-white" />
        </div>
        <div>
          <p className="font-semibold">{t('category')}: {t(gemData.category!)}</p>
          <p className="text-sm text-muted-foreground">Version: {gemData.version}</p>
        </div>
      </div>
      <p className="mb-4">{lt(gemData.description!)}</p>

      {(gemData as any).isEncrypted && (
          <div className="bg-yellow-900/50 border border-yellow-700 text-yellow-300 text-sm rounded-md p-3 mb-4">
              {t('encryptedPromptNotice')}
          </div>
      )}
      
      {status === 'added' ? (
        <div className="text-center p-4 bg-green-900/50 border border-green-700 rounded-md">
            <CheckCircle size={32} className="mx-auto text-green-400 mb-2"/>
            <p className="font-semibold">{t('gemAddedToLibrary', {gemName: lt(gemData.name!)})}</p>
        </div>
      ) : (
        <button onClick={handleAdd} className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-md">
          {t('addToMyLibrary')}
        </button>
      )}
      <div className="text-center mt-4">
        <Link to="/" className="text-sm text-primary hover:underline">{t('backToHome')}</Link>
      </div>
    </div>
  );
};

export default SharePage;