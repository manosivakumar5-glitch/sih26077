import React, { useEffect } from 'react';
import { StormCell } from '../../types/weather';
import {
  Activity,
  ArrowUpRight,
  Compass,
  Gauge,
  Sparkles,
  TrendingUp,
  Wind,
  X,
  Zap,
} from 'lucide-react';

interface StormDnaModalProps {
  storm: StormCell | null;
  onClose: () => void;
}

export const StormDnaModal: React.FC<StormDnaModalProps> = ({ storm, onClose }) => {
  // 5. SUPPORT ESC KEY TO CLOSE
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // If no storm is selected, render nothing (no invisible DOM element or blocker)
  if (!storm) return null;

  const lifecycleSteps = [
    'INITIATING',
    'DEVELOPING',
    'INTENSIFYING',
    'MATURE',
    'WEAKENING',
    'DISSIPATING',
  ];

  const currentStepIdx = lifecycleSteps.indexOf(storm.lifecycle);

  return (
    // 6. BACKDROP BEHAVIOR: Clicking backdrop closes; clicking modal content does NOT close
    <div
      id="storm-cell-profiler-backdrop"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 select-none font-mono-code text-xs"
      onMouseDown={onClose}
    >
      <div
        id="storm-cell-profiler-modal"
        className="relative w-full max-w-2xl bg-[#060c18] border border-cyan-500/50 rounded-3xl p-5 shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col gap-4 max-h-[92vh] overflow-y-auto"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-tech font-bold text-xs uppercase tracking-widest">
              <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>CONVECTIVE CELL DNA PROFILER</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide mt-0.5">
              {storm.name} ({storm.id})
            </h2>
            <div className="text-[11px] text-slate-400">
              Position: {storm.lat.toFixed(4)}°N, {storm.lng.toFixed(4)}°E • Radius {storm.radiusKm} km
            </div>
          </div>

          {/* 1. X CLOSE BUTTON: Guaranteed type="button", stopPropagation, and direct handler */}
          <button
            type="button"
            id="close-storm-dna-modal-btn"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 hover:border-cyan-400 transition-colors shadow-lg cursor-pointer flex items-center justify-center"
            aria-label="Close Convective Cell DNA Profiler"
            title="Close Profiler (Esc)"
          >
            <X className="w-5 h-5 pointer-events-none" />
          </button>
        </div>

        {/* Lifecycle Stepper */}
        <div className="bg-[#091428]/70 border border-slate-800 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-300 font-bold uppercase tracking-wider">CONVECTIVE LIFE-CYCLE STAGE</span>
            <span className="text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30">
              {storm.lifecycle}
            </span>
          </div>

          <div className="grid grid-cols-6 gap-1.5 pt-1">
            {lifecycleSteps.map((step, idx) => {
              const isPastOrCurrent = currentStepIdx !== -1 && idx <= currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              return (
                <div key={step} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-full h-1.5 rounded-full transition-all ${
                      isCurrent
                        ? 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]'
                        : isPastOrCurrent
                        ? 'bg-cyan-500'
                        : 'bg-slate-800'
                    }`}
                  />
                  <span
                    className={`text-[9px] text-center leading-tight truncate w-full ${
                      isCurrent ? 'text-amber-300 font-bold' : isPastOrCurrent ? 'text-slate-300' : 'text-slate-600'
                    }`}
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-[#081122]/90 border border-slate-800 rounded-xl p-3">
            <span className="text-[10px] text-slate-400 uppercase">Reflectivity Core</span>
            <div className="text-xl font-bold text-amber-400 font-tech mt-0.5">
              {storm.maxReflectivityDbz} dBZ
            </div>
            <div className="text-[10px] text-slate-400">
              Growth: {storm.growthRateDbzHr > 0 ? `+${storm.growthRateDbzHr}` : storm.growthRateDbzHr} dBZ/h
            </div>
          </div>

          <div className="bg-[#081122]/90 border border-slate-800 rounded-xl p-3">
            <span className="text-[10px] text-slate-400 uppercase">Precipitation Rate</span>
            <div className="text-xl font-bold text-cyan-300 font-tech mt-0.5">
              {storm.rainfallRateMmh} mm/h
            </div>
            <div className="text-[10px] text-cyan-400 font-semibold">↑ Intensely Active</div>
          </div>

          <div className="bg-[#081122]/90 border border-slate-800 rounded-xl p-3">
            <span className="text-[10px] text-slate-400 uppercase">Discharge Rate</span>
            <div className="text-xl font-bold text-yellow-300 font-tech mt-0.5">
              {storm.lightningFlashesPerMin} /min
            </div>
            <div className="text-[10px] text-yellow-400">
              Trend: {storm.lightningTrend}
            </div>
          </div>

          <div className="bg-[#081122]/90 border border-slate-800 rounded-xl p-3">
            <span className="text-[10px] text-slate-400 uppercase">Movement Vector</span>
            <div className="text-xl font-bold text-slate-100 font-tech mt-0.5">
              {storm.speedKmh} km/h
            </div>
            <div className="text-[10px] text-slate-300">Heading: {storm.directionDeg}° (NE)</div>
          </div>
        </div>

        {/* Thermodynamic & Atmospheric Signature */}
        <div className="bg-[#081122]/90 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="text-xs text-slate-300 font-bold uppercase tracking-wider flex items-center justify-between">
            <span>MESOSCALE CONVECTIVE THERMODYNAMICS</span>
            <span className="text-cyan-400 text-[10px]">SOUNDING TELEMETRY</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px]">
            <div className="bg-[#060c18] border border-slate-800/80 rounded-lg p-2.5">
              <span className="text-slate-400 text-[10px]">CAPE (Instability)</span>
              <div className="text-base font-bold text-red-400 mt-0.5">{storm.capeJkg} J/kg</div>
              <span className="text-[10px] text-slate-500">Extreme Convective Risk</span>
            </div>

            <div className="bg-[#060c18] border border-slate-800/80 rounded-lg p-2.5">
              <span className="text-slate-400 text-[10px]">CIN (Inhibition)</span>
              <div className="text-base font-bold text-emerald-400 mt-0.5">{storm.cinJkg} J/kg</div>
              <span className="text-[10px] text-slate-500">Cap Fully Breached</span>
            </div>

            <div className="bg-[#060c18] border border-slate-800/80 rounded-lg p-2.5">
              <span className="text-slate-400 text-[10px]">Precipitable Water</span>
              <div className="text-base font-bold text-cyan-300 mt-0.5">{storm.totalPrecipWaterMm} mm</div>
              <span className="text-[10px] text-slate-500">Deep Tropical Moisture</span>
            </div>

            <div className="bg-[#060c18] border border-slate-800/80 rounded-lg p-2.5">
              <span className="text-slate-400 text-[10px]">0-6 km Bulk Shear</span>
              <div className="text-base font-bold text-indigo-300 mt-0.5">{storm.windShear06kmMs} m/s</div>
              <span className="text-[10px] text-slate-500">Sustained Cell Tilting</span>
            </div>

            <div className="bg-[#060c18] border border-slate-800/80 rounded-lg p-2.5">
              <span className="text-slate-400 text-[10px]">Cloud-Top Temp</span>
              <div className="text-base font-bold text-blue-300 mt-0.5">{storm.cloudTopTempC}°C</div>
              <span className="text-[10px] text-slate-500">Tropopause Overshoot</span>
            </div>

            <div className="bg-[#060c18] border border-slate-800/80 rounded-lg p-2.5">
              <span className="text-slate-400 text-[10px]">Ensemble Confidence</span>
              <div className="text-base font-bold text-emerald-300 mt-0.5">{storm.confidencePct}%</div>
              <span className="text-[10px] text-slate-500">Uncertainty ±{storm.uncertaintyMarginPct}%</span>
            </div>
          </div>
        </div>

        {/* Reflectivity Evolution History Canvas Profile */}
        <div className="bg-[#081122]/90 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
            <span>DOPPLER CORE REFLECTIVITY PROFILE (T-120m to +240m)</span>
            <span className="text-amber-400 text-[10px] font-semibold">{storm.maxReflectivityDbz} dBZ PEAK</span>
          </div>

          <div className="h-20 flex items-end gap-1.5 pt-2 border-b border-slate-800 pb-1">
            {[-120, -90, -60, -30, 0, 15, 30, 60, 90, 120, 180, 240].map((t) => {
              const isNow = t === 0;
              const dbzVal = Math.round(
                20 + Math.exp(-Math.pow(t - 45, 2) / (2 * Math.pow(65, 2))) * 45
              );
              const heightPct = Math.round((dbzVal / 70) * 100);
              return (
                <div key={t} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-t transition-all ${
                      isNow
                        ? 'bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.8)]'
                        : dbzVal > 55
                        ? 'bg-purple-500'
                        : dbzVal > 45
                        ? 'bg-red-500'
                        : dbzVal > 35
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                  />
                  <span className={`text-[9px] ${isNow ? 'text-amber-300 font-bold' : 'text-slate-500'}`}>
                    {t === 0 ? 'NOW' : `${t}m`}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 pt-1">
            <span>History (Radar VCP)</span>
            <span className="text-cyan-400">Probabilistic Forecast Envelope</span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition border border-slate-700 cursor-pointer"
          >
            Close Profiler
          </button>
        </div>
      </div>
    </div>
  );
};

// Also export alias StormCellProfiler for exact semantic compatibility
export const StormCellProfiler = StormDnaModal;
