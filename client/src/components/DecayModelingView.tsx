import React, { useEffect, useState } from 'react';
import { 
  TrendingDown, 
  ShieldAlert, 
  Activity, 
  Calendar, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Building2,
  ArrowRight
} from 'lucide-react';
import { fetchDecayModel } from '../api';
import { DecayModelSummary, DecayZone } from '../types';

export const DecayModelingView: React.FC = () => {
  const [decayData, setDecayData] = useState<DecayModelSummary | null>(null);
  const [selectedZone, setSelectedZone] = useState<DecayZone | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDecayModel()
      .then((data) => {
        setDecayData(data);
        if (data.zones.length > 0) {
          setSelectedZone(data.zones[0]);
        }
      })
      .catch((err) => console.error('Error loading decay model:', err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading || !decayData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm text-slate-400">Loading Predictive Infrastructure Decay Models...</p>
      </div>
    );
  }

  const { zones, summary } = decayData;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title & Predictive Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <TrendingDown className="w-7 h-7 text-emerald-400" />
            Predictive Infrastructure Decay Modeling
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Machine learning decay forecasts simulate sub-surface soil saturation, traffic vibration velocity, and asset aging to schedule proactive maintenance before catastrophic failures occur.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-800/60 px-4 py-2 rounded-xl text-xs text-emerald-300">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Calculated Cost Avoidance:</span>
          <strong className="text-white text-sm font-extrabold font-mono">${summary.totalReactiveCostAvoidance.toLocaleString()}</strong>
        </div>
      </div>

      {/* Top Cost-Benefit Comparison Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Monitored Municipal Corridors</span>
          <div className="text-3xl font-black text-white">{summary.totalMonitoredZones} Quadrants</div>
          <p className="text-xs text-slate-400">
            {summary.criticalZonesCount} at <span className="text-rose-400 font-bold">CRITICAL</span> decay threshold, {summary.highZonesCount} at <span className="text-amber-400 font-bold">HIGH</span> risk.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-950 border border-emerald-800/40 space-y-2">
          <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider block">Proactive Maintenance Budget</span>
          <div className="text-3xl font-black text-emerald-300 font-mono">
            ${summary.totalPreventativeBudgetNeeded.toLocaleString()}
          </div>
          <p className="text-xs text-slate-400">Targeted micro-surfacing, cathodic protection & valve seals.</p>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-sky-950/40 to-slate-950 border border-sky-800/40 space-y-2">
          <span className="text-xs text-sky-400 font-semibold uppercase tracking-wider block">Avoided Emergency Repairs</span>
          <div className="text-3xl font-black text-sky-300 font-mono">
            ${summary.totalReactiveCostAvoidance.toLocaleString()}
          </div>
          <p className="text-xs text-slate-400">Net city savings: <strong>3.45x Return on Investment (ROI)</strong>.</p>
        </div>
      </div>

      {/* Corridor Grid & Interactive Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Zones List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-400" />
            Neighborhood Decay Ratings
          </h2>

          {zones.map((zone) => {
            const isSelected = selectedZone?.neighborhood === zone.neighborhood;
            const isCritical = zone.decayRiskLevel === 'CRITICAL';
            const isHigh = zone.decayRiskLevel === 'HIGH';

            return (
              <div
                key={zone.neighborhood}
                onClick={() => setSelectedZone(zone)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-slate-900 border-emerald-500 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/50'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-3 h-3 rounded-full ${
                      isCritical ? 'bg-rose-500 animate-pulse' : isHigh ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}></span>
                    <span className="font-bold text-white text-sm">{zone.neighborhood}</span>
                  </div>

                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                    isCritical
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : isHigh
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {zone.decayRiskLevel}
                  </span>
                </div>

                {/* Health Bar */}
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                    <span>Infrastructure Health Score</span>
                    <span className="font-bold text-white">{zone.overallHealthScore} / 100</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        zone.overallHealthScore < 60
                          ? 'bg-rose-500'
                          : zone.overallHealthScore < 75
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${zone.overallHealthScore}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                  <span>Proactive Spend: <strong className="text-emerald-400">${zone.preventativeBudgetEst.toLocaleString()}</strong></span>
                  <span>Avoided Risk: <strong className="text-sky-300">${zone.reactiveCostAvoidanceEst.toLocaleString()}</strong></span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Selected Zone Breakdown (7 cols) */}
        {selectedZone && (
          <div className="lg:col-span-7 space-y-6 bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">Detailed Decay Prognosis</span>
                <h3 className="text-xl font-bold text-white mt-1">{selectedZone.neighborhood} Corridor</h3>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block">Health Rating</span>
                <span className="text-2xl font-black text-white font-mono">{selectedZone.overallHealthScore}/100</span>
              </div>
            </div>

            {/* Environmental & Wear Multipliers */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-3">
                Decay Accelerators & Telemetry
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Asset Age</span>
                  <span className="font-extrabold text-white text-base mt-0.5 block">{selectedZone.factors.infrastructureAgeYears} yrs</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Daily Traffic</span>
                  <span className="font-extrabold text-white text-base mt-0.5 block">{selectedZone.factors.dailyTrafficVolume.toLocaleString()}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Drainage Stress</span>
                  <span className="font-extrabold text-amber-400 text-base mt-0.5 block">{(selectedZone.factors.drainageStressFactor * 100).toFixed(0)}%</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">7d Report Velocity</span>
                  <span className="font-extrabold text-rose-400 text-base mt-0.5 block">{selectedZone.factors.incidentVelocity7d} reports</span>
                </div>
              </div>
            </div>

            {/* Predictive Failure Timeline Forecast */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-400" />
                Predictive Failure Projections (30 / 90 / 180 Days)
              </span>

              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-slate-950 border-l-4 border-l-rose-500 border border-slate-800 text-xs">
                  <div className="font-bold text-rose-300 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                    30-Day Outlook: Immediate Vulnerability
                  </div>
                  <p className="text-slate-300 mt-1 leading-relaxed">{selectedZone.projections.thirtyDaysFailureRisk}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border-l-4 border-l-amber-500 border border-slate-800 text-xs">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    90-Day Outlook: Subsurface Degradation
                  </div>
                  <p className="text-slate-300 mt-1 leading-relaxed">{selectedZone.projections.ninetyDaysFailureRisk}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border-l-4 border-l-sky-500 border border-slate-800 text-xs">
                  <div className="font-bold text-sky-300 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                    180-Day Outlook: Lifecycle Capital Renewal
                  </div>
                  <p className="text-slate-300 mt-1 leading-relaxed">{selectedZone.projections.oneEightyDaysFailureRisk}</p>
                </div>
              </div>
            </div>

            {/* AI Preventative Action Plan */}
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/50 space-y-2">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Copilot Recommended Preventative Action
              </span>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {selectedZone.recommendedAction}
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-emerald-900/60 text-xs">
                <span className="text-slate-400">Allocated Preventative Budget: <strong className="text-white">${selectedZone.preventativeBudgetEst.toLocaleString()}</strong></span>
                <span className="text-slate-400">Estimated Reactive Loss Averted: <strong className="text-sky-300">${selectedZone.reactiveCostAvoidanceEst.toLocaleString()}</strong></span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
