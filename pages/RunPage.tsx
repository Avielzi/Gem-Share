import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { parseRunShareData } from '../utils/helpers.ts';
import type { Gem } from '../types.ts';
import { useLanguage } from '../hooks/useLanguage.ts';
import useEncryption from '../hooks/useEncryption.ts';
import * as geminiService from '../services/geminiService.ts';
import { Bot, Zap, Shield, FileText, Loader, AlertTriangle, Home, Copy, Check, Download } from 'lucide-react';
import { marked, type Tokens } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import css from 'highlight.js/lib/languages/css';
import markdown from 'highlight.js/lib/languages/markdown';
import plaintext from 'highlight.js/lib/languages/plaintext';

// Setup for code syntax highlighting
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('css', css);
hljs.registerLanguage('markdown', markdown);
hljs.registerLanguage('plaintext', plaintext);

// FIX: The renderer `code` function signature was updated in `marked` v5+.
// It now receives a single token object. This also adds a safeguard against undefined `token.text`.
marked.use({
  renderer: {
    code(token: Tokens.Code) {
      const codeText = token.text || ''; // Prevent crash on undefined text
      const language = (token.lang && hljs.getLanguage(token.lang)) ? token.lang : 'plaintext';
      const highlightedCode = hljs.highlight(codeText, { language, ignoreIllegals: true }).value;
      // Replicates the old `langPrefix` behavior ('hljs language-') for CSS styling.
      return `<pre><code class="hljs language-${language}">${highlightedCode}</code></pre>`;
    }
  }
});

const RunPage: React.FC = () => {
  const { data } = useParams<{ data: string }>();
  const { t, lt } = useLanguage();
  const { decrypt } = useEncryption();

  const [gem, setGem] = useState<Gem | null>(null);
  const [inputs, setInputs] = useState<Record<string, any>>({});
  const [output, setOutput] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [decryptedPrompt, setDecryptedPrompt] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (data) {
      const parsedGem = parseRunShareData(data);
      setGem(parsedGem);
      if (parsedGem) {
        const initialInputs: Record<string, any> = {};
        parsedGem.inputs?.forEach(input => {
          initialInputs[input.key] = input.type === 'boolean' ? false : '';
        });
        setInputs(initialInputs);
        setDecryptedPrompt(parsedGem.prompt.enc ? null : parsedGem.prompt.content);
      } else {
        setError(t('invalidLink'));
      }
    }
  }, [data, t]);

  const processedPrompt = useMemo(() => {
    if (!decryptedPrompt) return '';
    let prompt = decryptedPrompt;
    for (const key in inputs) {
      prompt = prompt.replace(new RegExp(`{{${key}}}`, 'g'), inputs[key]);
    }
    return prompt;
  }, [decryptedPrompt, inputs]);

  const handleCopyPrompt = async () => {
    if (processedPrompt) {
      try {
        await navigator.clipboard.writeText(processedPrompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy prompt: ', err);
        alert(t('copyFailed'));
      }
    }
  };

  const handleDecrypt = async () => {
    if (gem && gem.prompt.enc) {
      try {
        const promptContent = await decrypt(gem.prompt, password);
        setDecryptedPrompt(promptContent);
        setError('');
      } catch {
        setError(t('incorrectPassword'));
      }
    }
  };

  const handleRun = async () => {
    if (!decryptedPrompt) {
      setError(t('promptIsEncryptedError'));
      return;
    }
    setLoading(true);
    setOutput('');
    setError('');

    try {
      if (gem?.models?.imageEnabled) {
          const imageOutput = await geminiService.generateImage(processedPrompt);
          setOutput(imageOutput);
      } else {
          const response = await geminiService.generateText(processedPrompt);
          setOutput(response.text || '');
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const renderOutput = () => {
      if (loading) {
          return <div className="flex items-center gap-2"><Loader className="animate-spin" size={16}/>{t('generating')}</div>;
      }
      if (error) {
          return <p className="text-red-500">{error}</p>;
      }
      if (output) {
          if (output.startsWith('data:image/')) {
            const handleDownload = () => {
              const link = document.createElement('a');
              link.href = output;
              link.download = `gem-share-image-${Date.now()}.jpeg`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            };

            return (
              <div className="relative group">
                <img src={output} alt="Generated" className="max-w-full h-auto rounded-lg mx-auto" />
                <button 
                  onClick={handleDownload} 
                  className="absolute bottom-2 right-2 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition-opacity opacity-70 hover:opacity-100 focus:opacity-100"
                  title={t('downloadImage')}
                  aria-label={t('downloadImage')}
                >
                  <Download size={18} />
                </button>
              </div>
            );
          }
          const unsafeHtml = marked.parse(output);
          const safeHtml = DOMPurify.sanitize(unsafeHtml as string);
          return <div className="prose prose-sm max-w-full prose-invert" dangerouslySetInnerHTML={{ __html: safeHtml }} />;
      }
      return (
         <div className="text-center text-muted-foreground pt-8">
            <Bot size={32} className="mx-auto" />
            <p>{t('outputWillAppear')}</p>
        </div>
      );
  };

  if (!gem) {
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
    <div className="bg-card rounded-lg shadow-xl w-full max-w-6xl mx-auto">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">{t('runGemTitle', { gemName: lt(gem.name) })}</h2>
        <p className="text-sm text-muted-foreground">{lt(gem.description)}</p>
      </div>
      <div className="p-4 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-4">
          {gem.prompt.enc && !decryptedPrompt ? (
            <div className="bg-secondary p-4 rounded-lg">
              <Shield size={20} className="text-yellow-500 mb-2"/>
              <h3 className="font-semibold">{t('promptIsEncrypted')}</h3>
              <div className="flex gap-2 mt-2">
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={t('passwordToDecrypt')} className="w-full bg-background p-2 rounded-md"/>
                <button onClick={handleDecrypt} className="bg-primary text-primary-foreground px-4 py-2 rounded-md">{t('decrypt')}</button>
              </div>
            </div>
          ) : (
            <div>
              <button onClick={() => setShowInstructions(!showInstructions)} className="flex items-center gap-2 text-sm mb-2">
                  <FileText size={16}/> {showInstructions ? t('hideInstructions') : t('showInstructions')}
              </button>
              {showInstructions && (
                  <div className="bg-secondary p-3 rounded-md text-xs prose prose-sm max-w-full">
                     <pre className="whitespace-pre-wrap bg-transparent p-0">{decryptedPrompt}</pre>
                  </div>
              )}
            </div>
          )}
          
          {gem.inputs?.map(input => (
            <div key={input.key}>
              <label className="block text-sm font-medium mb-1">{lt(input.label)}</label>
              {input.type === 'textarea' ? (
                <textarea value={inputs[input.key]} onChange={e => setInputs({...inputs, [input.key]: e.target.value})} rows={4} className="w-full bg-secondary p-2 rounded-md" />
              ) : input.type === 'boolean' ? (
                <input type="checkbox" checked={inputs[input.key]} onChange={e => setInputs({...inputs, [input.key]: e.target.checked})} />
              ) : input.type === 'enum' ? (
                <select value={inputs[input.key]} onChange={e => setInputs({...inputs, [input.key]: e.target.value})} className="w-full bg-secondary p-2 rounded-md">
                  {input.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              ) : (
                <input type={input.type} value={inputs[input.key]} onChange={e => setInputs({...inputs, [input.key]: e.target.value})} className="w-full bg-secondary p-2 rounded-md" />
              )}
            </div>
          ))}
           {gem.inputs?.length === 0 && (
              <p className="text-sm text-muted-foreground">{t('noInputs')}</p>
          )}

        </div>
        <div className="bg-secondary rounded-lg p-4 flex flex-col min-h-[400px]">
          <h3 className="font-semibold mb-2">{t('output')}</h3>
          <div className="flex-grow overflow-y-auto">
             {renderOutput()}
          </div>
        </div>
      </div>
      <div className="p-4 border-t flex justify-end gap-2">
        <button
          onClick={handleCopyPrompt}
          disabled={!decryptedPrompt}
          className="flex items-center gap-2 bg-secondary text-secondary-foreground px-3 py-2 rounded-md text-sm disabled:opacity-50"
          title={t('copyPrompt')}
        >
          {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
          <span className="hidden sm:inline">{copied ? t('promptCopied') : t('copyPrompt')}</span>
        </button>
        <button onClick={handleRun} disabled={loading || !decryptedPrompt} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md disabled:opacity-50">
          {loading ? <Loader className="animate-spin" size={16}/> : <Zap size={16}/>}
          {loading ? t('running') : t('runGem')}
        </button>
      </div>
    </div>
  );
};

export default RunPage;