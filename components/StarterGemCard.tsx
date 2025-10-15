import React from 'react';
import type { Gem } from '../types.ts';
import { useLanguage } from '../hooks/useLanguage.ts';
import { COLORS } from '../constants.ts';
import Icon from './Icon.tsx';
import { Plus, Check } from 'lucide-react';

interface StarterGemCardProps {
  gem: Omit<Gem, 'id' | 'integrity'>;
  onAdd: () => void;
  isAdded: boolean;
}

const StarterGemCard: React.FC<StarterGemCardProps> = ({ gem, onAdd, isAdded }) => {
  const { t, lt } = useLanguage();
  const cardColor = gem.color || COLORS[gem.category] || '#94a3b8';

  return (
    <div className="bg-card border rounded-lg shadow-sm flex flex-col h-full transition-transform hover:-translate-y-1" style={{ borderColor: 'var(--border)' }}>
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
        </div>
        <p className="text-sm mt-3" style={{ color: 'var(--muted-foreground)', height: '60px', overflow: 'hidden' }}>{lt(gem.description)}</p>
      </div>
      <div className="p-4 border-t flex justify-end items-center" style={{ borderColor: 'var(--border)' }}>
        <button 
          onClick={onAdd} 
          disabled={isAdded}
          className="flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-4 py-1.5 rounded-md text-sm transition-opacity disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
        >
          {isAdded ? <Check size={14} /> : <Plus size={14} />}
          {isAdded ? t('added') : t('addToLibrary')}
        </button>
      </div>
    </div>
  );
};

export default StarterGemCard;
