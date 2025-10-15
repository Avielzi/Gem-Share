import React from 'react';
import type { GemCategory } from '../types.ts';
import { useLanguage } from '../hooks/useLanguage.ts';

interface CategoryFilterProps {
  categories: GemCategory[];
  selected: GemCategory[];
  onSelect: (categories: GemCategory[]) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ categories, selected, onSelect }) => {
  const { t } = useLanguage();

  const handleToggle = (category: GemCategory) => {
    const newSelected = selected.includes(category)
      ? selected.filter(c => c !== category)
      : [...selected, category];
    onSelect(newSelected);
  };

  const handleSelectAll = () => {
    onSelect([]);
  };

  const baseClasses = 'px-3 py-1.5 text-sm font-medium rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';
  
  const selectedClasses = 'bg-primary text-primary-foreground';
  const unselectedClasses = 'bg-secondary text-secondary-foreground hover:bg-secondary/80';

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={handleSelectAll}
        className={`${baseClasses} ${selected.length === 0 ? selectedClasses : unselectedClasses}`}
      >
        {t('allCategories')}
      </button>
      {categories.map(category => (
        <button
          key={category}
          onClick={() => handleToggle(category)}
          className={`${baseClasses} ${selected.includes(category) ? selectedClasses : unselectedClasses}`}
        >
          {t(category)}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
