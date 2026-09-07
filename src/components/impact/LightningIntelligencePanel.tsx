import React from 'react';
import { LightningIntelligence, LocationInfo, StormCell } from '../../types/weather';
import {
  Activity,
  AlertTriangle,
  Compass,
  Radio,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react';

interface LightningIntelligencePanelProps {
  isOpen: boolean;
  onClose: () => void;
  lightning: LightningIntelligence;
  storm?: StormCell;
  location: LocationInfo;
}

export const LightningIntelligencePanel: React.FC<LightningIntelligencePanelProps> = ({
  isOpen,
  onClose,
  lightning,
  storm,
  location,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 select-none font-mono-code text-xs">
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-[#060c18] border border-cyan-500/40 rounded-3xl p-5 shadow-2xl overflow-y-auto flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-yellow-400 font-tech font-bold text-xs uppercase tracking-widest">
              <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />
              <span>TOTAL LIGHTNING DISCHARGE INTELLIGENCE</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide mt-0.5">
              Atmospheric Charge & Flash Acceleration Nowcast
            </h2>
            <div className="text-[11px] text-slate-400">
              Station {location.radarStationCode} • Total Lightning Location Sensor Stream
            </div>
          </div>

          <button
            id="close-lightning-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Acceleration Alert Banner */}
        {lightning.trend === 'ACCELERATING' && (
          <div className="bg-yellow-950/40 border border-yellow-500/50 rounded-2xl p-3.5 flex items-center gap-3 animate-pulse">
            <Zap className="w-5 h-5 text-yellow-400 shrink-0" />
            <div>
              <div className="font-bold text-yellow-300 uppercase tracking-wider text-xs">
                ⚡ LIGHTNING ACTIVITY ACCELERATING
              </div>
              <div className="text-[11px] text-yellow-200/80 mt-0.5">
                Rapid surge in intra-cloud (IC) and cloud-to-ground (CG) discharge rates. Severe updraft intensification in progress.
              </div>
            </div>
          </div>
        )}

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-[#081122] border border-slate-800 rounded-xl p-3">
            <span className="text-slate-400 text-[10px] uppercase">Flash Frequency</span>
            <div className="text-xl font-bold text-yellow-400 font-tech mt-0.5">
              {lightning.strikeRatePerMin} /min
            </div>
            <span className="text-[10px] text-slate-500">Total VLF/LF Ingest</span>
          </div>

          <div className="bg-[#081122] border border-slate-800 rounded-xl p-3">
            <span className="text-slate-400 text-[10px] uppercase">Activity Level</span>
            <div
              className={`text-xl font-bold font-tech mt-0.5 ${
                lightning.activityLevel === 'VIOLENT'
                  ? 'text-purple-400'
                  : lightning.activityLevel === 'ACTIVE'
                  ? 'text-yellow-400'
                  : 'text-emerald-400'
              }`}
            >
              {lightning.activityLevel}
            </div>
            <span className="text-[10px] text-slate-500">Potential Index</span>
          </div>

          <div className="bg-[#081122] border border-slate-800 rounded-xl p-3">
            <span className="text-slate-400 text-[10px] uppercase">Safety Radius</span>
            <div className="text-xl font-bold text-cyan-300 font-tech mt-0.5">
              {lightning.safetyRadiusKm} km
            </div>
            <span className="text-[10px] text-slate-500">Recommended Buffer</span>
          </div>

          <div className="bg-[#081122] border border-slate-800 rounded-xl p-3">
            <span className="text-slate-400 text-[10px] uppercase">Charge Separation</span>
            <div className="text-xl font-bold text-amber-300 font-tech mt-0.5">
              ~{lightning.chargeSeparationEstKvM} kV/m
            </div>
            <span className="text-[10px] text-slate-500">Mixed-Phase Core</span>
          </div>
        </div>

        {/* Discharge Trend Graph Simulation */}
        <div className="bg-[#081122] border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
            <span>FLASH RATE DENSITY PROGRESSION (T-60m to +60m)</span>
            <span className="text-yellow-400 text-[10px]">TOTAL DISCHARGES/MIN</span>
          </div>

          <div className="h-20 flex items-end gap-2 pt-2 border-b border-slate-800 pb-1">
            {[5, 8, 12, 18, 26, 38, 48, 42, 32, 22, 14, 8].map((rate, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full">
                <div
                  style={{ height: `${(rate / 50) * 100}%` }}
                  className={`w-full rounded-t transition-all ${
                    rate > 35 ? 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]' : 'bg-cyan-500/60'
                  }`}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 pt-1">
            <span>Past 60 mins</span>
            <span className="text-yellow-400 font-semibold">Peak Flash Burst</span>
            <span>Next 60 mins</span>
          </div>
        </div>

        {/* Scientific Honesty Disclaimer */}
        <div className="bg-[#050b16] border border-slate-800 rounded-xl p-3 text-[11px] text-slate-400 leading-relaxed">
          <span className="text-yellow-400 font-bold">SCIENTIFIC HONESTY MANDATE: </span>
          Individual lightning strikes cannot be pinpointed deterministically in advance. STORM-MIND computes lightning activity potential density envelopes and charge acceleration trends for mesoscale safety.
        </div>
      </div>
    </div>
  );
};
