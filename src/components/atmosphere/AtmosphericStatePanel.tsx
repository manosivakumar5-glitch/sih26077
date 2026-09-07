import React from 'react';
import { AtmosphericState, LocationInfo } from '../../types/weather';
import {
  Activity,
  Compass,
  Droplets,
  Eye,
  Gauge,
  Thermometer,
  Wind,
  X,
  Zap,
} from 'lucide-react';

interface AtmosphericStatePanelProps {
  isOpen: boolean;
  onClose: () => void;
  atmosphere: AtmosphericState;
  location: LocationInfo;
}

export const AtmosphericStatePanel: React.FC<AtmosphericStatePanelProps> = ({
  isOpen,
  onClose,
  atmosphere,
  location,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 select-none font-mono-code text-xs">
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-[#060c19] border border-cyan-500/40 rounded-3xl p-5 shadow-2xl overflow-y-auto flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-tech font-bold text-xs uppercase tracking-widest">
              <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>SCIENTIFIC ATMOSPHERIC STATE DASHBOARD</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide mt-0.5">
              Thermodynamic & Vertical Profile Metrics
            </h2>
            <div className="text-[11px] text-slate-400">
              Station {location.radarStationCode} • Skew-T Sounding Derivative Inferences
            </div>
          </div>

          <button
            id="close-atmospheric-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overall Stability Gauge Banner */}
        <div className="bg-[#09152b] border border-cyan-500/30 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-slate-400 text-[10px] uppercase">CONVECTIVE STABILITY INDEX</span>
            <div className="text-2xl font-extrabold text-red-400 font-tech mt-0.5">
              {atmosphere.stabilityIndex}
            </div>
            <div className="text-slate-400 text-[11px]">
              Severe thunderstorm potential initiated by coastal boundary shear
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] text-slate-400">CAPE / CIN RATIO</div>
              <div className="text-lg font-bold text-amber-300 font-tech">
                {atmosphere.capeJkg} / {atmosphere.cinJkg} J/kg
              </div>
            </div>
          </div>
        </div>

        {/* High-Resolution Scientific Variable Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          <div className="bg-[#081122] border border-slate-800 rounded-xl p-3">
            <span className="text-slate-400 text-[10px]">TOTAL WATER (TPW)</span>
            <div className="text-lg font-bold text-cyan-300 font-tech mt-0.5">
              {atmosphere.tpwMm} mm
            </div>
            <span className="text-[10px] text-slate-500">Integrated Vapor</span>
          </div>

          <div className="bg-[#081122] border border-slate-800 rounded-xl p-3">
            <span className="text-slate-400 text-[10px]">CLOUD-TOP TEMP</span>
            <div className="text-lg font-bold text-blue-300 font-tech mt-0.5">
              {atmosphere.cloudTopTempC}°C
            </div>
            <span className="text-[10px] text-slate-500">Overshooting Top</span>
          </div>

          <div className="bg-[#081122] border border-slate-800 rounded-xl p-3">
            <span className="text-slate-400 text-[10px]">0-6 KM BULK SHEAR</span>
            <div className="text-lg font-bold text-indigo-300 font-tech mt-0.5">
              {atmosphere.windShearMs} m/s
            </div>
            <span className="text-[10px] text-slate-500">Updraft Tilt</span>
          </div>

          <div className="bg-[#081122] border border-slate-800 rounded-xl p-3">
            <span className="text-slate-400 text-[10px]">CONVERGENCE</span>
            <div className="text-lg font-bold text-emerald-300 font-tech mt-0.5">
              {atmosphere.lowLevelConvergence} × 10⁻⁵ s⁻¹
            </div>
            <span className="text-[10px] text-slate-500">Boundary Forcing</span>
          </div>

          <div className="bg-[#081122] border border-slate-800 rounded-xl p-3">
            <span className="text-slate-400 text-[10px]">U-WIND (ZONAL)</span>
            <div className="text-lg font-bold text-slate-200 font-tech mt-0.5">
              {atmosphere.uWindMs} m/s
            </div>
            <span className="text-[10px] text-slate-500">West-to-East Vector</span>
          </div>

          <div className="bg-[#081122] border border-slate-800 rounded-xl p-3">
            <span className="text-slate-400 text-[10px]">V-WIND (MERIDIONAL)</span>
            <div className="text-lg font-bold text-slate-200 font-tech mt-0.5">
              {atmosphere.vWindMs} m/s
            </div>
            <span className="text-[10px] text-slate-500">South-to-North Vector</span>
          </div>

          <div className="bg-[#081122] border border-slate-800 rounded-xl p-3">
            <span className="text-slate-400 text-[10px]">SURFACE PRESSURE</span>
            <div className="text-lg font-bold text-amber-300 font-tech mt-0.5">
              {atmosphere.pressureHpa} hPa
            </div>
            <span className="text-[10px] text-slate-500">Meso-Low Inflow</span>
          </div>

          <div className="bg-[#081122] border border-slate-800 rounded-xl p-3">
            <span className="text-slate-400 text-[10px]">DEW POINT SPREAD</span>
            <div className="text-lg font-bold text-cyan-300 font-tech mt-0.5">
              {(atmosphere.temperatureC - atmosphere.dewPointC).toFixed(1)}°C
            </div>
            <span className="text-[10px] text-slate-500">Low LCL Cloud Base</span>
          </div>
        </div>

        {/* Vertical Sounding Simulation Layers */}
        <div className="bg-[#081122] border border-slate-800 rounded-2xl p-4 space-y-2">
          <span className="text-xs text-slate-300 font-bold uppercase tracking-wider">
            ATMOSPHERIC STRATIFICATION LAYERS (PRESSURE LEVELS)
          </span>

          <div className="space-y-1.5 pt-1 text-[11px]">
            <div className="flex items-center justify-between p-2 rounded-lg bg-[#050b16] border border-slate-800">
              <span className="text-slate-300 font-bold">200 hPa (~12,000m) Tropopause Outflow</span>
              <span className="text-blue-400 font-tech font-bold">-54°C | 42 m/s Cirrus Anvil</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-[#050b16] border border-slate-800">
              <span className="text-slate-300 font-bold">500 hPa (~5,500m) Mid-Troposphere Steering</span>
              <span className="text-cyan-400 font-tech font-bold">-6°C | 22 m/s Steering Flow</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-[#050b16] border border-slate-800">
              <span className="text-slate-300 font-bold">700 hPa (~3,000m) Free Tropospheric Moisture</span>
              <span className="text-emerald-400 font-tech font-bold">11°C | 16 m/s Tropical Inflow</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-[#050b16] border border-slate-800">
              <span className="text-slate-300 font-bold">850 hPa (~1,500m) Low-Level Jet & Convergence</span>
              <span className="text-amber-400 font-tech font-bold">19°C | 18 m/s Moisture Advection</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-[#050b16] border border-slate-800">
              <span className="text-slate-300 font-bold">1000 hPa (Surface Boundary Layer)</span>
              <span className="text-slate-100 font-tech font-bold">{atmosphere.temperatureC}°C | 78% RH Sea-Breeze</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
