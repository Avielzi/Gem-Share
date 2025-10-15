import React, { useState, useRef, useEffect } from 'react';
import type { Gem } from '../types.ts';
import { useLanguage } from '../hooks/useLanguage.ts';
import { COLORS } from '../constants.ts';
import Icon from './Icon.tsx';
import { Play, Share2, MoreVertical, Edit, Trash2, Copy, Check } from 'lucide-react';
import { createShareData, createRunShareData } from '../utils/helpers.ts';

interface GemCardProps {
  gem: Gem;
  onRun: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const GemCard: React.FC<GemCardProps> = ({ gem, onRun, onEdit, onDelete }) => {
  const { t, lt } = useLanguage();
  const [showMenu, setShowMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copiedLink, setCopiedLink] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLink(type);
      setTimeout(() => setCopiedLink(''), 2000);
      // FIX: The catch block was syntactically incorrect, missing curly braces.
      // This caused a chain of parsing errors, including the inability to find 'err' and 'gem'.
    } catch (err) {
      console.error('Failed to copy link: ', err);
      alert(t('copyFailed'));
    }
  };

  const shareImportLink = `${window.location.origin}${window.location.pathname}#/share/${createShareData(gem)}`;
  const shareRunLink = `${window.location.origin}${window.location.pathname}#/run/${createRunShareData(gem)}`;

  const cardColor = gem.color || COLORS[gem.category] || '#94a3b8';

  return (
    <div className="bg-card border rounded-lg shadow-sm flex flex-col h-full" style={{ borderColor: cardColor }}>
      <div className="p-4 flex-grow">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: cardColor }}>
              <Icon name={gem.icon} size={24} className="text-white" />
            </div>
            <div className="overflow-hidden">
              <h3 className="font-bold text-lg truncate" title={lt(gem.name)}>{lt(gem.name)}</h3>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>v{gem.version}</p>
            </div>
          </div>
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setShowMenu(!showMenu)} 
              className="p-1 rounded-full hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={t('gemActions')}
            >
              <MoreVertical size={18} />
            </button>
            {showMenu && (
              <div className="absolute end-0 mt-2 w-48 bg-card border rounded-md shadow-lg z-10">
                <button onClick={() => { onEdit(); setShowMenu(false); }} className="w-full text-start flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary">
                  <Edit size={14} className="text-primary" /> {t('editGem')}
                </button>
                <button onClick={() => { onDelete(); setShowMenu(false); }} className="w-full text-start flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-secondary">
                  <Trash2 size={14} /> {t('deleteGem')}
                </button>
              </div>
            )}
          </div>
        </div>
        <p className="text-sm mt-3" style={{ color: 'var(--muted-foreground)', height: '60px', overflow: 'hidden' }}>{lt(gem.description)}</p>
      </div>
      <div className="p-4 border-t flex justify-between items-center" style={{ borderColor: 'var(--border)' }}>
        <button onClick={onRun} className="flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-4 py-1.5 rounded-md text-sm hover:opacity-90 transition-opacity">
          <Play size={14} />
          {t('run')}
        </button>
        <div className="relative" ref={shareMenuRef}>
            <button 
              onClick={() => setShowShareMenu(!showShareMenu)} 
              className="flex items-center gap-2 text-sm p-1.5 rounded-md hover:bg-secondary"
              aria-label={t('shareGem')}
            >
              <Share2 size={16} />
            </button>
            {showShareMenu && (
              <div className="absolute end-0 bottom-full mb-2 w-72 max-w-[80vw] bg-card border rounded-md shadow-lg z-10 p-2">
                <div className="text-sm font-semibold mb-1">{t('shareToImport')}</div>
                <p className="text-xs mb-2" style={{color: 'var(--muted-foreground)'}}>{t('shareToImportDesc')}</p>
                <div className="flex">
                  <input type="text" readOnly value={shareImportLink} className="w-full bg-secondary text-xs rounded-s-md px-2 border-y border-s truncate" />
                  <button onClick={() => handleCopy(shareImportLink, 'import')} className="bg-secondary p-2 rounded-e-md border-y border-e">
                    {copiedLink === 'import' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  </button>
                </div>
                <div className="text-sm font-semibold mt-3 mb-1">{t('shareToRun')}</div>
                <p className="text-xs mb-2" style={{color: 'var(--muted-foreground)'}}>{t('shareToRunDesc')}</p>
                <div className="flex">
                  <input type="text" readOnly value={shareRunLink} className="w-full bg-secondary text-xs rounded-s-md px-2 border-y border-s truncate" />
                  <button onClick={() => handleCopy(shareRunLink, 'run')} className="bg-secondary p-2 rounded-e-md border-y border-e">
                    {copiedLink === 'run' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            )}
          </div>
      </div>
    </div>
  );
};

export default GemCard;