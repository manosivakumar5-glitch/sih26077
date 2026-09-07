import React from 'react';
import {
  AtmosphericState,
  StormCell,
  WhyNowEvidence,
} from '../../types/weather';
import {
  Activity,
  AlertCircle,
  ArrowDown,
  ArrowUp,
  BrainCircuit,
  CheckCircle,
  HelpCircle,
  Layers,
  Sliders,
  Sparkles,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react';
import { CounterfactualOverrides } from '../../services/weatherSimulation';

interface WhyNowPanelProps {
  isOpen: boolean;
  onClose: () => void;
  evidence: WhyNowEvidence[];
  atmosphere: AtmosphericState;
  storm?: StormCell;
  counterfactuals: CounterfactualOverrides;
  onUpdateCounterfactuals: (cf: CounterfactualOverrides) => void;
}

export const WhyNowPanel: React.FC<WhyNowPanelProps> = ({
  isOpen,
  onClose,
  evidence,
  atmosphere,
  storm,
  counterfactuals,
  onUpdateCounterfactuals,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 select-none font-mono-code text-xs">
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-[#060c19] border border-cyan-500/40 rounded-3xl p-5 shadow-2xl overflow-y-auto flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-tech font-bold text-xs uppercase tracking-widest">
              <BrainCircuit className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>NEURO-SYMBOLIC EXPLAINABILITY ENGINE</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide mt-0.5">
              Why Is The Severe Weather Risk Changing?
            </h2>
            <div className="text-[11px] text-slate-400">
              Decomposed Attribution Analysis • Strict Separation of Observation vs Inference
            </div>
          </div>

          <button
            id="close-why-now-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Attribution Evidence List */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
            <span>DECOMPOSED PHYSICAL & RADAR ATTRIBUTION</span>
            <span className="text-cyan-400 text-[10px]">WEIGHTED EVIDENCE VECTOR</span>
          </div>

          <div className="space-y-2">
            {evidence.map((item, idx) => (
              <div
                key={idx}
                className="bg-[#091428]/80 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-cyan-500/40 transition-colors"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        item.type === 'OBSERVED_EVIDENCE'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      }`}
                    >
                      {item.type.replace('_', ' ')}
                    </span>
                    <span className="font-bold text-slate-200 text-xs">{item.factor}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">{item.description}</p>
                </div>

                <div className="flex items-center gap-4 shrink-0 sm:border-l sm:border-slate-800 sm:pl-4">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">TELEMETRY VALUE</div>
                    <div className="font-bold text-cyan-300 text-xs font-tech">{item.observationValue}</div>
                    <div className="text-[10px] text-amber-400 font-semibold">{item.deltaValue}</div>
                  </div>

                  <div className="w-20">
                    <div className="text-[9px] text-slate-500 uppercase flex justify-between">
                      <span>WEIGHT</span>
                      <span className="text-cyan-400">{Math.round(item.riskContributionWeight * 100)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                      <div
                        style={{ width: `${item.riskContributionWeight * 100}%` }}
                        className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 28: What Changed? (Delta vs previous forecast run) */}
        <div className="bg-[#091428]/70 border border-cyan-500/30 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-200">
            <div className="flex items-center gap-2 text-amber-400">
              <TrendingUp className="w-4 h-4" />
              <span>WHAT CHANGED? (RUN-TO-RUN DELTA AT T-30m)</span>
            </div>
            <span className="text-[10px] text-cyan-400">VCP-12 VOLUME SCAN COMPARISON</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] pt-1">
            <div className="bg-[#050b16] border border-slate-800 rounded-lg p-2.5">
              <span className="text-slate-400 text-[10px]">RISK PROBABILITY DELTA</span>
              <div className="flex items-center gap-1.5 text-red-400 font-bold text-sm mt-0.5">
                <ArrowUp className="w-3.5 h-3.5" />
                <span>+27% SURGE</span>
              </div>
              <span className="text-[10px] text-slate-500">From 35% at 09:30 UTC</span>
            </div>

            <div className="bg-[#050b16] border border-slate-800 rounded-lg p-2.5">
              <span className="text-slate-400 text-[10px]">RADAR REFLECTIVITY CORE</span>
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-sm mt-0.5">
                <ArrowUp className="w-3.5 h-3.5" />
                <span>+8.4 dBZ GROWTH</span>
              </div>
              <span className="text-[10px] text-slate-500">Dual-pol hail column detected</span>
            </div>

            <div className="bg-[#050b16] border border-slate-800 rounded-lg p-2.5">
              <span className="text-slate-400 text-[10px]">STEERING MOTION SHIFT</span>
              <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-sm mt-0.5">
                <span>VEERED 14° EAST</span>
              </div>
              <span className="text-[10px] text-slate-500">Speed increased to 38 km/h</span>
            </div>
          </div>
        </div>

        {/* Section 29: Counterfactual Sensitivity Playground */}
        <div className="bg-[#091428]/70 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-200">
            <div className="flex items-center gap-2 text-cyan-300">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>COUNTERFACTUAL ANALYSIS: WHAT WOULD CHANGE THE RISK?</span>
            </div>
            <span className="text-[10px] text-amber-400 font-mono-code">MODEL SENSITIVITY PROTOTYPE</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Test how hypothetical shifts in boundary layer humidity, CAPE, and shear dynamically alter nowcast probability and storm intensity in real time.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Moisture Delta */}
            <div className="bg-[#050b16] border border-slate-800 rounded-lg p-3 space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-300">Boundary Layer Moisture (TPW)</span>
                <span className="text-cyan-400 font-bold">
                  {counterfactuals.moistureDeltaPct > 0 ? `+${counterfactuals.moistureDeltaPct}%` : `${counterfactuals.moistureDeltaPct}%`}
                </span>
              </div>
              <input
                type="range"
                min="-20"
                max="20"
                step="5"
                value={counterfactuals.moistureDeltaPct}
                onChange={(e) =>
                  onUpdateCounterfactuals({
                    ...counterfactuals,
                    moistureDeltaPct: parseInt(e.target.value, 10),
                  })
                }
                className="w-full accent-cyan-400 h-1 bg-slate-700 rounded cursor-pointer"
              />
              <div className="text-[10px] text-slate-500">
                {counterfactuals.moistureDeltaPct < 0
                  ? '↓ Drier entrainment reduces convective fuel'
                  : counterfactuals.moistureDeltaPct > 0
                  ? '↑ High moisture flux accelerates rain rate'
                  : 'Baseline observed telemetry'}
              </div>
            </div>

            {/* CAPE Multiplier */}
            <div className="bg-[#050b16] border border-slate-800 rounded-lg p-3 space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-300">Thermodynamic Instability (CAPE)</span>
                <span className="text-amber-400 font-bold">{counterfactuals.capeMultiplier}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={counterfactuals.capeMultiplier}
                onChange={(e) =>
                  onUpdateCounterfactuals({
                    ...counterfactuals,
                    capeMultiplier: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-amber-400 h-1 bg-slate-700 rounded cursor-pointer"
              />
              <div className="text-[10px] text-slate-500">
                {counterfactuals.capeMultiplier < 1
                  ? '↓ Lower thermal buoyancy dampens updraft speed'
                  : counterfactuals.capeMultiplier > 1
                  ? '↑ Higher CAPE triggers explosive lightning rate'
                  : 'Baseline observed telemetry'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
