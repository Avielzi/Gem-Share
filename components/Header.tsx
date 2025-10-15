import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Gem, Settings, Languages, Sun, Moon } from 'lucide-react';
import Icon from './Icon.tsx';
import { useLanguage } from '../hooks/useLanguage.ts';
import { useTheme } from '../hooks/useTheme.ts';

const Header: React.FC = () => {
  const location = useLocation();
  const { t, toggleLanguage, language } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const navLinkClasses = (path: string) => 
    `flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
      location.pathname === path
        ? 'bg-secondary text-foreground'
        : 'text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
    }`;

  const controlButtonClasses = "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:bg-secondary/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <header className="bg-card border-b border-border sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-12">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-md">
                <Icon name="Sparkles" size={18} className="text-primary-foreground" />
            </div>
            <span className="text-lg sm:text-xl font-bold">{t('appTitle')}</span>
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            <nav className="flex items-center gap-1 sm:gap-2">
              <Link to="/" className={navLinkClasses('/')} title={t('myGems')}>
                <Gem size={16} />
                <span className="hidden md:inline">{t('myGems')}</span>
              </Link>
              <Link to="/settings" className={navLinkClasses('/settings')} title={t('settings')}>
                <Settings size={16} />
                <span className="hidden md:inline">{t('settings')}</span>
              </Link>
            </nav>
            <div className="w-px h-6 bg-border mx-1"></div>
            <button
              onClick={toggleLanguage}
              className={controlButtonClasses}
              aria-label={t('toggleLanguage')}
              title={t('toggleLanguage')}
            >
              <Languages size={16} />
              <span className="hidden sm:inline font-semibold">{language === 'he' ? 'EN' : 'עב'}</span>
            </button>
             <button
              onClick={toggleTheme}
              className={controlButtonClasses}
              aria-label={t('toggleTheme')}
              title={t('toggleTheme')}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;