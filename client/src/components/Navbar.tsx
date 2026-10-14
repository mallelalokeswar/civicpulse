import React from 'react';
import { 
  Radio, 
  MapPin, 
  FileCheck2, 
  TrendingDown, 
  Bot, 
  AlertTriangle, 
  Activity, 
  Sparkles,
  RefreshCw,
  Key
} from 'lucide-react';
import { Ticket } from '../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  tickets: Ticket[];
  onRefresh: () => void;
  isLoading: boolean;
  onOpenKeyModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  tickets,
  onRefresh,
  isLoading,
  onOpenKeyModal
}) => {
  const criticalCount = tickets.filter(t => t.severity === 5 && t.status !== 'RESOLVED').length;
  const activeCount = tickets.filter(t => t.status !== 'RESOLVED').length;
  const duplicateMergedCount = tickets.reduce((acc, t) => acc + (t.duplicateCount > 1 ? t.duplicateCount - 1 : 0), 0);

  const tabs = [
    { id: 'citizen', label: 'Citizen Channel', icon: Radio, badge: 'Multimodal' },
    { id: 'heatmap', label: 'GIS Hazard Map', icon: MapPin, badge: `${activeCount}` },
    { id: 'workorders', label: 'Work Orders & Routing', icon: FileCheck2 },
    { id: 'decay', label: 'Predictive Decay', icon: TrendingDown, badge: 'AI Model' },
    { id: 'copilot', label: 'Municipal Copilot', icon: Bot, highlight: true },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      {/* Top Banner Alert if Critical Emergencies exist */}
      {criticalCount > 0 && (
        <div className="bg-rose-950/80 border-b border-rose-800/60 px-4 py-1.5 text-xs flex items-center justify-between text-rose-200">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
            <span className="font-semibold text-rose-300">CRITICAL PRIORITY-5 ALERT:</span>
            <span>{criticalCount} hazardous infrastructure event{criticalCount > 1 ? 's' : ''} require immediate municipal dispatch.</span>
          </div>
          <button 
            onClick={() => setCurrentTab('heatmap')} 
            className="underline hover:text-white font-medium ml-4 transition-colors"
          >
            Inspect on GIS Map →
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-sky-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Activity className="w-6 h-6 text-white stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-400 bg-clip-text text-transparent">
                  CivicPulse
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Autonomous Municipal Triage & Infrastructure Copilot</p>
            </div>
          </div>

          {/* Quick Stats Badges */}
          <div className="hidden lg:flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span className="text-slate-400">Active Backlog:</span>
              <span className="font-bold text-white">{activeCount}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
              <span className="text-slate-400">Deduplicated Spam:</span>
              <span className="font-bold text-sky-300">+{duplicateMergedCount} merged</span>
            </div>
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
            <button
              onClick={onOpenKeyModal}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-600/60 text-slate-400 hover:text-amber-300 transition-all"
              title="API Key Settings"
            >
              <Key className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-2 border-t border-slate-800/80 py-2 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      isActive
                        ? 'bg-emerald-500/30 text-emerald-200'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
                {tab.highlight && (
                  <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 font-mono">
                    AI
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
