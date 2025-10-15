import React, { useState, useEffect } from 'react';
import { Gem, Lock, Database, Clock, Zap, GitCommitHorizontal } from 'lucide-react';
import type { Gem as GemType } from '../types.ts';
import { useLanguage } from '../hooks/useLanguage.ts';
import * as db from '../services/dbService.ts';

interface StatsBannerProps {
  gems: GemType[];
}

const StatCard: React.FC<{ icon: React.ElementType, value: string | number, label: string }> = ({ icon: Icon, value, label }) => (
  <div className="bg-card border rounded-xl p-3 flex flex-col items-center justify-center text-center h-[96px]" style={{ borderColor: 'var(--border)' }}>
    <Icon size={20} className="mb-1.5" style={{ color: 'var(--primary)' }} />
    <p className="text-xl font-bold">{value}</p>
    <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
  </div>
);

const SkeletonCard: React.FC = () => (
    <div className="bg-card border rounded-xl p-3 h-[96px] animate-pulse" style={{ borderColor: 'var(--border)' }}>
        <div className="h-5 w-5 rounded-md mx-auto mb-2" style={{ backgroundColor: 'var(--secondary)' }}></div>
        <div className="h-6 w-12 rounded-md mx-auto mb-1.5" style={{ backgroundColor: 'var(--secondary)' }}></div>
        <div className="h-3 w-16 rounded-md mx-auto" style={{ backgroundColor: 'var(--secondary)' }}></div>
    </div>
);

const StatsBanner: React.FC<StatsBannerProps> = ({ gems }) => {
  const { t } = useLanguage();
  const [runsToday, setRunsToday] = useState(0);
  const [appVersion, setAppVersion] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // FIX: Replaced `db.getAllRuns()` with `db.getAllRunHistory()` to match the exported function name in `dbService.ts`.
        const allRuns = await db.getAllRunHistory();
        const today = new Date().toISOString().split('T')[0];
        const todayRuns = allRuns.filter(run => run.timestamp.startsWith(today)).length;
        setRunsToday(todayRuns);

        const res = await fetch('/metadata.json');
        const meta = await res.json();
        setAppVersion(meta.version);
      } catch (e) {
        console.error("Could not fetch app stats", e);
        setAppVersion('N/A');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [gems]);

  if (loading) {
    return (
        <div className="mb-6 border-b pb-6" style={{ borderColor: 'var(--border)' }}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
        </div>
    );
  }

  const totalGems = gems.length;
  const encryptedGems = gems.filter(g => g.prompt.enc).length;
  const lastUpdated = totalGems > 0 
    ? new Date(Math.max(...gems.map(g => new Date(g.meta.updatedAt).getTime()))).toLocaleDateString() 
    : 'N/A';

  return (
    <div className="mb-6 border-b pb-6" style={{ borderColor: 'var(--border)' }}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        <StatCard icon={Database} value={totalGems} label={t('totalGems')} />
        <StatCard icon={Lock} value={encryptedGems} label={t('encrypted')} />
        <StatCard icon={Zap} value={runsToday} label={t('runsToday')} />
        <StatCard icon={Clock} value={lastUpdated} label={t('lastUpdated')} />
        <div className="bg-card border rounded-xl p-3 flex flex-col items-center justify-center text-center h-[96px]" style={{ borderColor: 'var(--primary)' }}>
          <GitCommitHorizontal size={20} className="mb-1.5 text-primary" />
          <p className="text-2xl font-extrabold text-primary">{appVersion}</p>
          <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>{t('appVersion')}</p>
        </div>
      </div>
    </div>
  );
};

export default StatsBanner;