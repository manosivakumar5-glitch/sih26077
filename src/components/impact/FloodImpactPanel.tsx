import React from 'react';
import { FloodRiskAssessment, LocationInfo } from '../../types/weather';
import {
  AlertTriangle,
  ArrowRight,
  Droplets,
  Layers,
  MapPin,
  ShieldAlert,
  TrendingUp,
  Waves,
  X,
} from 'lucide-react';

interface FloodImpactPanelProps {
  isOpen: boolean;
  onClose: () => void;
  floodRisk: FloodRiskAssessment;
  location: LocationInfo;
}

export const FloodImpactPanel: React.FC<FloodImpactPanelProps> = ({
  isOpen,
  onClose,
  floodRisk,
  location,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 select-none font-mono-code text-xs">
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-[#060c18] border border-cyan-500/40 rounded-3xl p-5 shadow-2xl overflow-y-auto flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-tech font-bold text-xs uppercase tracking-widest">
              <Waves className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>HYDROLOGICAL NOWCAST & FLOOD IMPACT ENGINE</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide mt-0.5">
              Terrain Runoff & Low-Lying Inundation Susceptibility
            </h2>
            <div className="text-[11px] text-slate-400">
              {location.locality}, {location.district} • Elev {location.elevationM}m • DEM Catchment Model
            </div>
          </div>

          <button
            id="close-flood-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Rain -> Runoff -> Flood Pipeline Diagram */}
        <div className="bg-[#091428]/80 border border-slate-800 rounded-2xl p-4 space-y-2.5">
          <span className="text-xs text-slate-300 font-bold uppercase tracking-wider">
            HYDROLOGICAL INUNDATION PIPELINE
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center text-[10px]">
            <div className="bg-[#050b16] border border-slate-800 rounded-lg p-2 flex flex-col justify-center items-center">
              <span className="text-slate-400">1. RAINFALL</span>
              <span className="text-cyan-300 font-bold text-xs mt-0.5">
                {floodRisk.accumulatedRainfallMm} mm Accum.
              </span>
            </div>

            <div className="bg-[#050b16] border border-slate-800 rounded-lg p-2 flex flex-col justify-center items-center">
              <span className="text-slate-400">2. DEM SLOPE</span>
              <span className="text-slate-200 font-bold text-xs mt-0.5">
                Elev {location.elevationM}m (Flat)
              </span>
            </div>

            <div className="bg-[#050b16] border border-slate-800 rounded-lg p-2 flex flex-col justify-center items-center">
              <span className="text-slate-400">3. RUNOFF RATE</span>
              <span className="text-amber-400 font-bold text-xs mt-0.5">
                {floodRisk.runoffSusceptibilityPct}% Susceptible
              </span>
            </div>

            <div className="bg-[#050b16] border border-slate-800 rounded-lg p-2 flex flex-col justify-center items-center">
              <span className="text-slate-400">4. DRAINAGE CAP.</span>
              <span className="text-red-400 font-bold text-xs mt-0.5">
                {floodRisk.drainageSaturationPct}% Saturated
              </span>
            </div>

            <div className="bg-[#050b16] border border-cyan-500/40 rounded-lg p-2 flex flex-col justify-center items-center">
              <span className="text-slate-400">5. IMPACT POTENTIAL</span>
              <span
                className={`font-bold text-xs mt-0.5 ${
                  floodRisk.overallRisk === 'VERY HIGH'
                    ? 'text-purple-400'
                    : floodRisk.overallRisk === 'HIGH'
                    ? 'text-red-400'
                    : floodRisk.overallRisk === 'MODERATE'
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {floodRisk.overallRisk}
              </span>
            </div>
          </div>
        </div>

        {/* Affected Urban Catchment Zones */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
            <span>LOCAL CATCHMENT BASIN VULNERABILITY</span>
            <span className="text-cyan-400 text-[10px]">HYDROLOGICAL MODEL DERIVATIVE</span>
          </div>

          <div className="space-y-2">
            {floodRisk.affectedCatchments.map((catchment, idx) => (
              <div
                key={idx}
                className="bg-[#091428]/70 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="font-bold text-slate-200 text-xs">{catchment.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Water Level Trend: <span className="text-amber-300 font-semibold">{catchment.waterLevelTrend}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400">EST. INUNDATION</span>
                    <div className="text-sm font-bold text-cyan-300 font-tech">
                      ~{catchment.inundationDepthEstCm} cm
                    </div>
                  </div>

                  <span
                    className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      catchment.riskLevel === 'VERY HIGH'
                        ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50'
                        : catchment.riskLevel === 'HIGH'
                        ? 'bg-red-600/30 text-red-300 border border-red-500/50'
                        : catchment.riskLevel === 'MODERATE'
                        ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {catchment.riskLevel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer Note */}
        <div className="bg-[#050b16] border border-slate-800/80 rounded-xl p-3 text-[11px] text-slate-400 leading-relaxed">
          <span className="text-cyan-400 font-bold">SCIENTIFIC HONESTY DISCLAIMER: </span>
          Inundation estimates reflect simulated hydrological runoff potential based on elevation slope, soil imperviousness, and radar-accumulated precipitation. Not an official municipal flood warning.
        </div>
      </div>
    </div>
  );
};
