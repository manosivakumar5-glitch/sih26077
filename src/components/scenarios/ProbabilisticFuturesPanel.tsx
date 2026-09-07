import React, { useState } from 'react';
import { ProbabilisticScenario } from '../../types/weather';
import {
  AlertTriangle,
  Compass,
  GitBranch,
  Layers,
  Percent,
  Shield,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react';

interface ProbabilisticFuturesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  scenarios: ProbabilisticScenario[];
  activeScenarioId: string;
  onSelectScenario: (id: string) => void;
}

export const ProbabilisticFuturesPanel: React.FC<ProbabilisticFuturesPanelProps> = ({
  isOpen,
  onClose,
  scenarios,
  activeScenarioId,
  onSelectScenario,
}) => {
  const [safeModeActive, setSafeModeActive] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 select-none font-mono-code text-xs">
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-[#060c18] border border-cyan-500/40 rounded-3xl p-5 shadow-2xl overflow-y-auto flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-tech font-bold text-xs uppercase tracking-widest">
              <GitBranch className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>PROBABILISTIC FUTURES & ENSEMBLE DISPERSION</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide mt-0.5">
              Multi-Trajectory Ensemble Scenarios
            </h2>
            <div className="text-[11px] text-slate-400">
              Probabilistic Convective Nowcasting • Model Disagreement Index • Safe Mode Guardrails
            </div>
          </div>

          <button
            id="close-probabilistic-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-Scenario Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
            <span>BRANCHING CONVECTIVE TRAJECTORIES</span>
            <span className="text-cyan-400 text-[10px]">ENSEMBLE PROBABILITIES</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {scenarios.map((scen) => {
              const isSelected = activeScenarioId === scen.id;
              return (
                <div
                  key={scen.id}
                  onClick={() => onSelectScenario(scen.id)}
                  className={`cursor-pointer rounded-2xl p-4 border transition-all flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#0a1a36] border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                      : 'bg-[#081224]/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-extrabold font-tech text-white">
                        {scen.probabilityPct}%
                      </span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                          scen.confidence === 'HIGH'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : scen.confidence === 'MEDIUM'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}
                      >
                        {scen.confidence} CONF
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-100 text-xs">{scen.name}</h3>
                    <p className="text-[11px] text-slate-400 leading-normal">{scen.description}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-800 text-[10px] space-y-1">
                    <div className="flex justify-between text-slate-400">
                      <span>Peak Reflectivity:</span>
                      <span className="text-amber-400 font-bold">{scen.peakReflectivityDbz} dBZ</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Peak Rain Rate:</span>
                      <span className="text-cyan-300 font-bold">{scen.peakRainfallMmh} mm/h</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Velocity Vector:</span>
                      <span className="text-slate-200 font-bold">
                        {scen.trackHeadingDeg}° @ {scen.trackSpeedKmh} km/h
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 20: Model Agreement Engine */}
        <div className="bg-[#091428]/80 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-200">
            <div className="flex items-center gap-2 text-cyan-300">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>MODEL DISAGREEMENT & ENSEMBLE CONSENSUS</span>
            </div>
            <span className="text-emerald-400 font-tech font-bold text-sm">74% AGREEMENT</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
            <div className="bg-[#060c18] border border-slate-800 rounded-lg p-2.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-semibold">1. Radar Optical Flow</span>
                <span className="text-emerald-400 font-bold">88% Match</span>
              </div>
              <p className="text-[10px] text-slate-400">Lucas-Kanade vector field projects cell heading at 52° NE.</p>
            </div>

            <div className="bg-[#060c18] border border-slate-800 rounded-lg p-2.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-semibold">2. AI ConvLSTM / ViT</span>
                <span className="text-cyan-300 font-bold">78% Match</span>
              </div>
              <p className="text-[10px] text-slate-400">Deep learning nowcaster projects rapid vertical echo surging.</p>
            </div>

            <div className="bg-[#060c18] border border-slate-800 rounded-lg p-2.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-semibold">3. High-Res NWP (NCMRWF)</span>
                <span className="text-amber-400 font-bold">56% Match</span>
              </div>
              <p className="text-[10px] text-slate-400">Numerical model delays peak convective trigger by 35 minutes.</p>
            </div>
          </div>
        </div>

        {/* Section 21: AI Safe Mode & Out-Of-Distribution (OOD) Guardrail */}
        <div className="bg-[#091428]/80 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className={`w-4 h-4 ${safeModeActive ? 'text-amber-400' : 'text-emerald-400'}`} />
              <span className="text-xs font-bold text-white">AI SAFE MODE & OUT-OF-DISTRIBUTION (OOD) MONITOR</span>
            </div>

            <button
              id="toggle-ai-safe-mode-btn"
              onClick={() => setSafeModeActive(!safeModeActive)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                safeModeActive
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {safeModeActive ? '⚠ TRIGGERED: SAFE MODE ACTIVE' : 'NOMINAL: AI TRUST 100%'}
            </button>
          </div>

          <div
            className={`p-3 rounded-xl border text-[11px] leading-relaxed transition-all ${
              safeModeActive
                ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                : 'bg-[#060c18] border-slate-800 text-slate-400'
            }`}
          >
            {safeModeActive ? (
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-300">OUT-OF-DISTRIBUTION DETECTED: </span>
                  Atmospheric moisture convergence and shear anomalies exceed training bounds. AI model trust reduced by 40%, physics-based numerical baselines weighted up, and uncertainty margin expanded to ±28%.
                </div>
              </div>
            ) : (
              <div>
                Neural nowcaster parameters are operating well within historical training distributions. No extreme covariance drift detected across dual-pol radar channels.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
