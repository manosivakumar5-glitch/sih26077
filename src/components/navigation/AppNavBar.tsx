import React from 'react';
import {
  Activity,
  AlertTriangle,
  Compass,
  Globe,
  Radio,
  Sparkles,
  TrendingUp,
  Waves,
  Zap,
} from 'lucide-react';

export type StormMindPage =
  | 'OVERVIEW'
  | 'RADAR'
  | 'SATELLITE'
  | 'FORECAST'
  | 'AI_ANALYSIS'
  | 'IMPACT';

interface AppNavBarProps {
  currentPage: StormMindPage;
  onSelectPage: (page: StormMindPage) => void;
  activeStormCount: number;
  hasSevereAlert: boolean;
  presentationMode: boolean;
  onTogglePresentationMode: () => void;
}

export const AppNavBar: React.FC<AppNavBarProps> = ({
  currentPage,
  onSelectPage,
  activeStormCount,
  hasSevereAlert,
  presentationMode,
  onTogglePresentationMode,
}) => {
  const navItems: {
    id: StormMindPage;
    label: string;
    icon: React.ReactNode;
    badge?: string | number;
    badgeColor?: string;
  }[] = [
    {
      id: 'OVERVIEW',
      label: 'Overview',
      icon: <Compass className="w-4 h-4" />,
    },
    {
      id: 'RADAR',
      label: 'Live Radar',
      icon: <Radio className="w-4 h-4 text-amber-400" />,
      badge: activeStormCount > 0 ? `${activeStormCount} Cells` : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    },
    {
      id: 'SATELLITE',
      label: 'Satellite',
      icon: <Globe className="w-4 h-4 text-sky-400" />,
      badge: 'INSAT-3DR',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    },
    {
      id: 'FORECAST',
      label: 'Forecast',
      icon: <TrendingUp className="w-4 h-4 text-cyan-400" />,
      badge: '4h / 7d',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    },
    {
      id: 'AI_ANALYSIS',
      label: 'AI Analysis',
      icon: <Activity className="w-4 h-4 text-indigo-400" />,
      badge: 'Neuro-Symbolic',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    },
    {
      id: 'IMPACT',
      label: 'Impact',
      icon: <AlertTriangle className="w-4 h-4 text-rose-400" />,
      badge: hasSevereAlert ? 'ALERT' : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse',
    },
  ];

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-3 py-2.5 sm:px-6 bg-slate-950/85 border-b border-white/10 backdrop-blur-xl select-none font-mono-code transition-all shadow-md">
      {/* Brand Identity */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 via-sky-600 to-indigo-600 shadow-[0_0_15px_rgba(6,182,212,0.5)] border border-cyan-400/40">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-1.5 font-extrabold text-sm tracking-wider text-white">
            <span>CLIMORA</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold tracking-normal">
              STORM-MIND
            </span>
          </div>
          <div className="text-[10px] text-slate-400 hidden sm:block">
            Severe Convective Earth-Observation Platform
          </div>
        </div>
      </div>

      {/* 4. Page Navigation Tabs */}
      <nav
        id="main-app-navigation"
        className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-2xl border border-white/15 shadow-inner max-w-[calc(100vw-180px)] overflow-x-auto scrollbar-none"
      >
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id.toLowerCase()}`}
              type="button"
              onClick={() => onSelectPage(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 border ${
                isActive
                  ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.4)] font-bold'
                  : 'bg-transparent text-slate-300 border-transparent hover:bg-white/10 hover:text-white'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase border hidden md:inline ${
                    isActive ? 'bg-slate-950 text-cyan-300 border-slate-900' : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Presentation Mode / Right Actions */}
      <div className="flex items-center gap-2">
        <button
          id="nav-presentation-mode-btn"
          type="button"
          onClick={onTogglePresentationMode}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
            presentationMode
              ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
          }`}
          title="Toggle Interactive System Walkthrough"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden lg:inline">PRESENTATION</span>
        </button>
      </div>
    </header>
  );
};
