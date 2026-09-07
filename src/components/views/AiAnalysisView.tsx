import React from 'react';
import {
  AtmosphericState,
  LocationInfo,
  StormCell,
  VerificationMetrics,
  WhyNowEvidence,
} from '../../types/weather';
import { CounterfactualOverrides } from '../../services/weatherSimulation';
import { Activity, ArrowUpRight, Award, Brain, CheckCircle2, ShieldAlert, Sparkles, Sliders } from 'lucide-react';

interface AiAnalysisViewProps {
  location: LocationInfo;
  atmosphere: AtmosphericState;
  storm?: StormCell;
  evidence: WhyNowEvidence[];
  counterfactuals: CounterfactualOverrides;
  onUpdateCounterfactuals: (params: CounterfactualOverrides) => void;
  verification: VerificationMetrics;
  onOpenStormDna: () => void;
}

export const AiAnalysisView: React.FC<AiAnalysisViewProps> = ({
  location,
  atmosphere,
  storm,
  evidence = [],
  counterfactuals,
  onUpdateCounterfactuals,
  verification,
  onOpenStormDna,
}) => {
  return (
    <div className="relative w-full h-full flex flex-col font-mono-code select-none overflow-y-auto p-4 sm:p-6 bg-slate-950/70 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
              <Brain className="w-4 h-4" />
              <span>NEURO-SYMBOLIC EXPLAINABILITY & CAUSAL INFERENCE HUB</span>
            </div>
            <h1 className="text-xl font-extrabold text-white mt-1">
              Physics-Informed Severe Weather Causal Analysis
            </h1>
          </div>

          {storm && (
            <button
              type="button"
              onClick={onOpenStormDna}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>Inspect {storm.name} DNA</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 1. Why Now Causal Explanations */}
        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              WHY IS SEVERE WEATHER TRIGGERING NOW? (CAUSAL ATTRIBUTION)
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Shapley Atmospheric Weights
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {evidence.map((ev, idx) => (
              <div
                key={idx}
                className="bg-slate-950/80 border border-slate-800 hover:border-indigo-500/40 transition rounded-xl p-4 space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white text-sm">{ev.factor}</span>
                  <span className="text-indigo-400 font-bold px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/30">
                    +{(ev.riskContributionWeight * 100).toFixed(0)}% Risk Weight
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {ev.description}
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-800/80 font-mono">
                  <span>Observed: <strong className="text-cyan-400">{ev.observationValue}</strong></span>
                  <span
                    className={`px-1.5 py-0.2 rounded font-bold ${
                      ev.status === 'CRITICAL' || ev.status === 'SURGING'
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {ev.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Counterfactual Simulator */}
        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>COUNTERFACTUAL WHAT-IF SIMULATOR (ADJUST BOUNDARY CONDITIONS)</span>
            </span>
            <button
              type="button"
              onClick={() =>
                onUpdateCounterfactuals({
                  capeMultiplier: 1.0,
                  moistureDeltaPct: 0,
                  seaBreezePenetration: 1.0,
                })
              }
              className="text-[10px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-950 border border-slate-700 cursor-pointer"
            >
              Reset Overrides
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex justify-between font-bold">
                <span className="text-slate-300">CAPE Instability Factor</span>
                <span className="text-cyan-400">{counterfactuals.capeMultiplier.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.05"
                value={counterfactuals.capeMultiplier}
                onChange={(e) =>
                  onUpdateCounterfactuals({
                    ...counterfactuals,
                    capeMultiplier: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block">
                Simulates elevated thermal buoyancy / insolation heating.
              </span>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex justify-between font-bold">
                <span className="text-slate-300">Moisture Delta (TPW)</span>
                <span className="text-cyan-400">{counterfactuals.moistureDeltaPct > 0 ? `+${counterfactuals.moistureDeltaPct}%` : `${counterfactuals.moistureDeltaPct}%`}</span>
              </div>
              <input
                type="range"
                min="-40"
                max="40"
                step="5"
                value={counterfactuals.moistureDeltaPct}
                onChange={(e) =>
                  onUpdateCounterfactuals({
                    ...counterfactuals,
                    moistureDeltaPct: parseInt(e.target.value, 10),
                  })
                }
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block">
                Alters precipitable water vapor pooling in boundary layer.
              </span>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex justify-between font-bold">
                <span className="text-slate-300">Sea Breeze Convergence</span>
                <span className="text-cyan-400">{counterfactuals.seaBreezePenetration.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="2.0"
                step="0.1"
                value={counterfactuals.seaBreezePenetration}
                onChange={(e) =>
                  onUpdateCounterfactuals({
                    ...counterfactuals,
                    seaBreezePenetration: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block">
                Controls strength of coastal squall boundary collision.
              </span>
            </div>
          </div>
        </div>

        {/* 3. Verification & Memory Metrics */}
        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>DIGITAL TWIN VERIFICATION & SKILL SCORES (HISTORICAL CALIBRATION)</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">
              Lead Time: {verification?.meanLeadTimeMinutes ?? 52} min
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5">
              <span className="text-slate-400 text-[10px]">CSI (Critical Success)</span>
              <div className="text-xl font-bold text-emerald-400 font-tech mt-1">
                {verification?.criticalSuccessIndex ?? 0.742}
              </div>
              <span className="text-[9px] text-slate-500">Benchmark &gt; 0.70</span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5">
              <span className="text-slate-400 text-[10px]">POD (Hit Rate)</span>
              <div className="text-xl font-bold text-emerald-400 font-tech mt-1">
                {verification?.probabilityOfDetection ?? 0.884}
              </div>
              <span className="text-[9px] text-slate-500">Detection Reliability</span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5">
              <span className="text-slate-400 text-[10px]">FAR (False Alarm Ratio)</span>
              <div className="text-xl font-bold text-cyan-300 font-tech mt-1">
                {verification?.falseAlarmRatio ?? 0.168}
              </div>
              <span className="text-[9px] text-slate-500">Minimizing false warnings</span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5">
              <span className="text-slate-400 text-[10px]">BRIER SCORE</span>
              <div className="text-xl font-bold text-indigo-300 font-tech mt-1">
                {verification?.brierScore ?? 0.124}
              </div>
              <span className="text-[9px] text-slate-500">Lower is better</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
