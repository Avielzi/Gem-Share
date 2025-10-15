import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { Gem, GemRun, UnencryptedData } from '../types.ts';
import { useLanguage } from '../hooks/useLanguage.ts';
import useEncryption from '../hooks/useEncryption.ts';
import * as geminiService from '../services/geminiService.ts';
import * as db from '../services/dbService.ts';
import { Bot, Zap, Shield, FileText, Loader, Copy, Check, Clock, RefreshCcw, ArrowLeft, Download, Sparkles } from 'lucide-react';
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


interface GemRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  gem: Gem;
}

const formatTimestamp = (isoString: string): string => {
    const date = new Date(isoString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const timeFormat: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', hour12: true };

    if (date.toDateString() === today.toDateString()) {
        return `Today at ${date.toLocaleTimeString([], timeFormat)}`;
    }
    if (date.toDateString() === yesterday.toDateString()) {
        return `Yesterday at ${date.toLocaleTimeString([], timeFormat)}`;
    }
    return date.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
};


const GemRunnerModal: React.FC<GemRunnerModalProps> = ({ isOpen, onClose, gem }) => {
  const { t, lt } = useLanguage();
  const { decrypt } = useEncryption();
  
  const [inputs, setInputs] = useState<Record<string, any>>({});
  const [output, setOutput] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [decryptedPrompt, setDecryptedPrompt] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [view, setView] = useState<'inputs' | 'history'>('inputs');
  const [history, setHistory] = useState<GemRun[]>([]);
  const [viewingHistoryTimestamp, setViewingHistoryTimestamp] = useState<string | null>(null);
  const [isMagicMenuOpen, setIsMagicMenuOpen] = useState(false);
  const magicMenuRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (isOpen && gem) {
        const initialInputs: Record<string, any> = {};
        gem.inputs?.forEach(input => {
            initialInputs[input.key] = input.type === 'boolean' ? false : '';
        });
        setInputs(initialInputs);
        setOutput('');
        setError('');
        setPassword('');
        setCopied(false);
        if (gem.prompt.enc === false) {
            setDecryptedPrompt(gem.prompt.content);
        } else {
            setDecryptedPrompt(null);
        }
        setShowInstructions(false);
        setView('inputs');
        setViewingHistoryTimestamp(null);
        setIsMagicMenuOpen(false);
        
        db.getRunHistoryForGem(gem.id).then(runs => {
            runs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            setHistory(runs);
        });
    }
  }, [isOpen, gem]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (magicMenuRef.current && !magicMenuRef.current.contains(event.target as Node)) {
        setIsMagicMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    if (gem.prompt.enc) {
      try {
        const promptContent = await decrypt(gem.prompt, password);
        setDecryptedPrompt(promptContent);
        setError('');
      } catch {
        setError(t('incorrectPassword'));
      }
    }
  };
  
  const executeRun = async (promptToRun: string) => {
    setLoading(true);
    setLoadingMessage(t('generating'));
    setOutput('');
    setError('');
    setViewingHistoryTimestamp(null);
    setIsMagicMenuOpen(false);

    try {
      let textOutput: string | undefined;
      let imageOutput: string | undefined;

      if (gem.models?.imageEnabled) {
          imageOutput = await geminiService.generateImage(promptToRun);
          setOutput(imageOutput);
      } else {
          const response = await geminiService.generateText(promptToRun);
          textOutput = response.text || '';
          setOutput(textOutput);
      }
      
      const runLog: GemRun = {
        id: crypto.randomUUID(),
        gemId: gem.id,
        timestamp: new Date().toISOString(),
        inputs,
        outputs: { text: textOutput, image: imageOutput }
      };
      await db.saveRunHistory(runLog);
      setHistory(prev => [runLog, ...prev]);

    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const handleRun = async () => {
    if (!decryptedPrompt) {
      setError(t('promptIsEncryptedError'));
      return;
    }
    await executeRun(processedPrompt);
  };
  
  const handleMagicRun = async (modifier: 'detail' | 'creativity' | 'professional') => {
    if (!decryptedPrompt) {
        setError(t('promptIsEncryptedError'));
        return;
    }
    
    let modifiedPrompt = processedPrompt;
    switch(modifier) {
        case 'detail':
            modifiedPrompt = `Please provide a detailed and comprehensive response.\n\n${processedPrompt}`;
            break;
        case 'creativity':
            modifiedPrompt = `Be extra creative and think outside the box for this request.\n\n${processedPrompt}`;
            break;
        case 'professional':
            modifiedPrompt = `Adopt a professional, formal, and business-oriented tone for your response.\n\n${processedPrompt}`;
            break;
    }
    
    await executeRun(modifiedPrompt);
  };
  
  const handleRevert = (run: GemRun) => {
    setInputs(run.inputs);
    setOutput(run.outputs.image || run.outputs.text || '');
    setError('');
    setViewingHistoryTimestamp(run.timestamp);
    setView('inputs');
  };

  const handleFollowUp = async (action: 'summarize' | 'expand' | 'improve') => {
    if (!output) return;
    setLoading(true);
    setError('');
    setLoadingMessage(t('refining'));
    
    let followUpPrompt = '';
    switch(action) {
        case 'summarize':
            followUpPrompt = `Summarize the following text concisely:\n\n${output}`;
            break;
        case 'expand':
            followUpPrompt = `Expand on the following text, adding more detail and explanation:\n\n${output}`;
            break;
        case 'improve':
            followUpPrompt = `Improve the writing of the following text. Fix any grammatical errors, improve clarity, and make it more engaging without changing the core meaning:\n\n${output}`;
            break;
    }

    try {
        const response = await geminiService.generateText(followUpPrompt);
        const newOutput = response.text || '';
        setOutput(newOutput);
    } catch (e) {
        setError((e as Error).message);
    } finally {
        setLoading(false);
        setLoadingMessage('');
    }
  };

  const renderOutput = () => {
      if (loading) {
          return <div className="flex items-center gap-2"><Loader className="animate-spin" size={16}/>{loadingMessage}</div>;
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
          return (
            <>
                <div className="prose prose-sm max-w-full prose-invert" dangerouslySetInnerHTML={{ __html: safeHtml }} />
                <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">{t('magicActions')}</h4>
                    <div className="flex flex-wrap gap-2">
                        <button onClick={() => handleFollowUp('summarize')} disabled={loading} className="text-xs bg-accent/50 hover:bg-accent px-2 py-1 rounded-md disabled:opacity-50 transition-colors">{t('summarize')}</button>
                        <button onClick={() => handleFollowUp('expand')} disabled={loading} className="text-xs bg-accent/50 hover:bg-accent px-2 py-1 rounded-md disabled:opacity-50 transition-colors">{t('expand')}</button>
                        <button onClick={() => handleFollowUp('improve')} disabled={loading} className="text-xs bg-accent/50 hover:bg-accent px-2 py-1 rounded-md disabled:opacity-50 transition-colors">{t('improveWriting')}</button>
                    </div>
                </div>
            </>
          );
      }
      return (
         <div className="text-center text-muted-foreground pt-8">
            <Bot size={32} className="mx-auto" />
            <p>{t('outputWillAppear')}</p>
        </div>
      );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
      <div className="rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col" style={{ backgroundColor: 'var(--card)' }}>
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">{t('runGemTitle', { gemName: lt(gem.name) })}</h2>
        </div>
        <div className="p-4 overflow-y-auto flex-grow grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4">
            {view === 'inputs' ? (
              <>
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
                      <textarea value={inputs[input.key]} onChange={e => { setInputs({...inputs, [input.key]: e.target.value}); setViewingHistoryTimestamp(null); }} rows={4} className="w-full bg-secondary p-2 rounded-md" />
                    ) : input.type === 'boolean' ? (
                      <input type="checkbox" checked={inputs[input.key]} onChange={e => { setInputs({...inputs, [input.key]: e.target.checked}); setViewingHistoryTimestamp(null); }} />
                    ) : input.type === 'enum' ? (
                      <select value={inputs[input.key]} onChange={e => { setInputs({...inputs, [input.key]: e.target.value}); setViewingHistoryTimestamp(null); }} className="w-full bg-secondary p-2 rounded-md">
                        {input.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    ) : (
                      <input type={input.type} value={inputs[input.key]} onChange={e => { setInputs({...inputs, [input.key]: e.target.value}); setViewingHistoryTimestamp(null); }} className="w-full bg-secondary p-2 rounded-md" />
                    )}
                  </div>
                ))}
                 {gem.inputs?.length === 0 && (
                    <p className="text-sm text-muted-foreground">{t('noInputs')}</p>
                )}
              </>
            ) : (
                <div className="bg-secondary p-4 rounded-lg flex flex-col h-full">
                    <h3 className="font-semibold mb-2">Run History</h3>
                    <div className="flex-grow overflow-y-auto -m-4 p-4">
                        {history.length > 0 ? (
                            <ul className="space-y-2">
                                {history.map(run => (
                                    <li key={run.id} className="flex justify-between items-center bg-background p-2 rounded-md">
                                        <div className="text-sm">
                                            <p className="font-medium">{formatTimestamp(run.timestamp)}</p>
                                            <p className="text-xs text-muted-foreground truncate max-w-[150px]">{run.outputs.text?.substring(0, 30) || 'Image Output'}...</p>
                                        </div>
                                        <button onClick={() => handleRevert(run)} title="Revert to this run" className="flex items-center gap-2 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs hover:bg-primary/20">
                                            <RefreshCcw size={14} /> Revert
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center pt-8">No history for this Gem yet.</p>
                        )}
                    </div>
                </div>
            )}
          </div>
          <div className="bg-secondary rounded-lg p-4 flex flex-col">
            {viewingHistoryTimestamp && (
                <div className="text-xs text-center bg-primary/20 text-primary-foreground p-2 rounded-md mb-2">
                    Viewing run from {formatTimestamp(viewingHistoryTimestamp)}.
                </div>
            )}
            <h3 className="font-semibold mb-2">{t('output')}</h3>
            <div className="flex-grow overflow-y-auto">
              {renderOutput()}
            </div>
          </div>
        </div>
        <div className="p-4 border-t flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="bg-secondary px-4 py-2 rounded-md">{t('close')}</button>
            <button onClick={() => setView(v => v === 'inputs' ? 'history' : 'inputs')} className="flex items-center gap-2 bg-secondary px-3 py-2 rounded-md text-sm">
                {view === 'inputs' ? <Clock size={16} /> : <ArrowLeft size={16} />}
                <span className="hidden sm:inline">{view === 'inputs' ? 'History' : 'Back to Inputs'}</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleCopyPrompt} 
              disabled={!decryptedPrompt}
              className="flex items-center gap-2 bg-secondary text-secondary-foreground px-3 py-2 rounded-md text-sm disabled:opacity-50"
              title={t('copyPrompt')}
            >
              {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
              <span className="hidden sm:inline">{copied ? t('promptCopied') : t('copyPrompt')}</span>
            </button>
            <div className="relative" ref={magicMenuRef}>
                <button
                    onClick={() => setIsMagicMenuOpen(prev => !prev)}
                    disabled={loading || !decryptedPrompt}
                    className="flex items-center justify-center bg-secondary text-secondary-foreground p-2 rounded-md text-sm disabled:opacity-50 hover:bg-accent"
                    title={t('magicRun')}
                >
                    <Sparkles size={20} />
                </button>
                {isMagicMenuOpen && (
                    <div className="absolute bottom-full right-0 mb-2 w-56 bg-card border rounded-md shadow-lg z-20 animate-pop-in">
                        <button onClick={() => handleMagicRun('detail')} className="w-full text-start px-3 py-2 text-sm hover:bg-secondary rounded-t-md">{t('runWithMoreDetail')}</button>
                        <button onClick={() => handleMagicRun('creativity')} className="w-full text-start px-3 py-2 text-sm hover:bg-secondary">{t('runWithMoreCreativity')}</button>
                        <button onClick={() => handleMagicRun('professional')} className="w-full text-start px-3 py-2 text-sm hover:bg-secondary rounded-b-md">{t('runWithProfessionalTone')}</button>
                    </div>
                )}
            </div>
            <button onClick={handleRun} disabled={loading || !decryptedPrompt} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md disabled:opacity-50">
              {loading ? <Loader className="animate-spin" size={16}/> : <Zap size={16}/>}
              {loading ? t('running') : t('runGem')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GemRunnerModal;