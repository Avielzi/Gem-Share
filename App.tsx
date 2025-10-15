import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header.tsx';
import HomePage from './pages/HomePage.tsx';
import SharePage from './pages/SharePage.tsx';
import RunPage from './pages/RunPage.tsx';
import SettingsPage from './pages/SettingsPage.tsx';
import { GemsProvider } from './hooks/useGems.ts';
import { LanguageProvider } from './hooks/useLanguage.ts';
import { ThemeProvider } from './hooks/useTheme.ts';

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <GemsProvider>
          <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8 text-start">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/share/:data" element={<SharePage />} />
                <Route path="/run/:data" element={<RunPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </div>
        </GemsProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
};

export default App;