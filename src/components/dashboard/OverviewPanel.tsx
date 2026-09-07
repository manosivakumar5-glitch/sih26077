import React from 'react';
import {
  AtmosphericState,
  FloodRiskAssessment,
  LightningIntelligence,
  LocationInfo,
  StormCell,
  WarningNotice,
} from '../../types/weather';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CloudRain,
  Compass,
  Database,
  Droplets,
  Eye,
  Gauge,
  HelpCircle,
  Play,
  Radio,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Thermometer,
  Waves,
  Wind,
  Zap,
} from 'lucide-react';

interface OverviewPanelProps {
  location: LocationInfo;
  atmosphere: AtmosphericState;
  primaryStorm?: StormCell;
  floodRisk: FloodRiskAssessment;
  lightning: LightningIntelligence;
  warning: WarningNotice;
  tOffsetMin: number;
  onOpenStormDna: () => void;
  onOpenWhyNow: () => void;
  onOpenEverydayWeather: () => void;
  onEnterFutureEarth: () => void;
  onOpenDataHealth: () => void;
  onOpenAtmosphere?: () => void;
  onOpenFutures?: () => void;
  onOpenFlood?: () => void;
  onOpenLightning?: () => void;
  onOpenVerification?: () => void;
}

export const OverviewPanel: React.FC<OverviewPanelProps> = ({
  location,
  atmosphere,
  primaryStorm,
  floodRisk,
  lightning,
  warning,
  tOffsetMin,
  onOpenStormDna,
  onOpenWhyNow,
  onOpenEverydayWeather,
  onEnterFutureEarth,
  onOpenDataHealth,
  onOpenAtmosphere,
  onOpenFutures,
  onOpenFlood,
  onOpenLightning,
  onOpenVerification,
}) => {
  return (
    <div className="flex flex-col gap-3 font-mono-code text-xs select-none">
      
      {/* 1. Storm DNA & Active Convective Cell */}
      {primaryStorm && (
        <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-3.5 shadow-xl backdrop-blur-xl space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
              <Zap className="w-3.5 h-3.5" />
              <span>STORM CELL: {primaryStorm.name}</span>
            </div>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
              {primaryStorm.lifecycle}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2">
              <span className="text-slate-400 text-[10px]">RADAR REFLECTIVITY</span>
              <div className="text-amber-400 font-bold text-sm mt-0.5">
                {primaryStorm.maxReflectivityDbz} dBZ
              </div>
              <div className="text-[10px] text-slate-400">
                Growth: {primaryStorm.growthRateDbzHr > 0 ? `+${primaryStorm.growthRateDbzHr}` : primaryStorm.growthRateDbzHr} dBZ/h
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2">
              <span className="text-slate-400 text-[10px]">LIGHTNING STRIKES</span>
              <div className="text-yellow-400 font-bold text-sm mt-0.5">
                {primaryStorm.lightningFlashesPerMin} /min
              </div>
              <div className="text-[10px] text-slate-400">
                Trend: {primaryStorm.lightningTrend}
              </div>
            </div>
          </div>

          <button
            id="open-storm-dna-btn"
            onClick={onOpenStormDna}
            className="w-full bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/40 text-cyan-300 font-medium py-1.5 px-3 rounded-lg transition-colors flex items-center justify-between text-xs"
          >
            <span>INSPECT STORM CELL DNA & VERTICAL CORES</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Neuro-Symbolic "Why-Now" Explainability */}
      <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-3.5 shadow-xl backdrop-blur-xl space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-xs">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>WHY IS RISK CHANGING?</span>
          </div>
          <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/30">
            Neuro-Symbolic
          </span>
        </div>

        <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
          Atmospheric instability surging due to boundary-layer moisture flux (TPW {atmosphere.tpwMm}mm) and CAPE ({atmosphere.capeJkg} J/kg) with rapid dual-pol radar echo growth.
        </p>

        <button
          id="open-why-now-btn"
          onClick={onOpenWhyNow}
          className="w-full bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 py-1.5 px-3 rounded-lg transition-colors flex items-center justify-between text-xs font-semibold"
        >
          <span>EXPLAINABILITY & CAUSAL EVIDENCE</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3. Deep Atmospheric Thermodynamics (CAPE, CIN, TPW, Shear) */}
      <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-3.5 shadow-xl backdrop-blur-xl space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-indigo-300 font-bold text-xs">ATMOSPHERIC SOUNDING & CAPE</span>
          <span className="text-[10px] text-slate-400 font-mono">DWR + ECMWF</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2">
            <span className="text-slate-400 text-[10px]">CAPE (Instability)</span>
            <div className="text-amber-400 font-bold text-sm mt-0.5">{atmosphere.capeJkg} J/kg</div>
            <div className="text-[10px] text-slate-400">{atmosphere.stabilityIndex}</div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2">
            <span className="text-slate-400 text-[10px]">CIN (Inhibition)</span>
            <div className="text-emerald-400 font-bold text-sm mt-0.5">{atmosphere.cinJkg} J/kg</div>
            <div className="text-[10px] text-slate-400">Cap Barrier</div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2">
            <span className="text-slate-400 text-[10px]">TOTAL PRECIP WATER</span>
            <div className="text-cyan-300 font-bold text-sm mt-0.5">{atmosphere.tpwMm} mm</div>
            <div className="text-[10px] text-slate-400">Moisture pool</div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2">
            <span className="text-slate-400 text-[10px]">WIND SHEAR (0-6km)</span>
            <div className="text-teal-300 font-bold text-sm mt-0.5">{atmosphere.windShearMs} m/s</div>
            <div className="text-[10px] text-slate-400">Deep shear</div>
          </div>
        </div>

        {onOpenAtmosphere && (
          <button
            id="open-atmosphere-deep-btn"
            onClick={onOpenAtmosphere}
            className="w-full bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-500/40 text-indigo-300 py-1.5 px-3 rounded-lg transition-colors flex items-center justify-between text-xs"
          >
            <span>VIEW SKEW-T HODOGRAPH & SOUNDING</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 4. Specialized Intelligence Launchers */}
      <div className="grid grid-cols-2 gap-2">
        {onOpenFutures && (
          <button
            id="open-futures-launcher-btn"
            onClick={onOpenFutures}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-2 text-left transition"
          >
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <div className="font-bold text-white text-[11px]">Ensemble Scenarios</div>
              <div className="text-[10px] text-slate-400">A / B / C Models</div>
            </div>
          </button>
        )}

        {onOpenFlood && (
          <button
            id="open-flood-launcher-btn"
            onClick={onOpenFlood}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-2 text-left transition"
          >
            <Waves className="w-4 h-4 text-blue-400 shrink-0" />
            <div>
              <div className="font-bold text-white text-[11px]">Flood Inundation</div>
              <div className="text-[10px] text-slate-400">Risk: {floodRisk.overallRisk}</div>
            </div>
          </button>
        )}

        {onOpenLightning && (
          <button
            id="open-lightning-launcher-btn"
            onClick={onOpenLightning}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-2 text-left transition"
          >
            <Zap className="w-4 h-4 text-yellow-400 shrink-0" />
            <div>
              <div className="font-bold text-white text-[11px]">Total Lightning</div>
              <div className="text-[10px] text-slate-400">{lightning.strikeRatePerMin} strikes/min</div>
            </div>
          </button>
        )}

        {onOpenVerification && (
          <button
            id="open-verification-launcher-btn"
            onClick={onOpenVerification}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-2 text-left transition"
          >
            <BarChart3 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <div className="font-bold text-white text-[11px]">Verification / Bias</div>
              <div className="text-[10px] text-slate-400">CSI / POD Scores</div>
            </div>
          </button>
        )}
      </div>

      {/* 5. Everyday 7-Day Weather & Sensor Data Health */}
      <div className="grid grid-cols-2 gap-2">
        <button
          id="open-everyday-weather-btn"
          onClick={onOpenEverydayWeather}
          className="bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 py-2 px-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 text-[11px] font-medium"
        >
          <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
          <span>7-Day Forecast</span>
        </button>

        <button
          id="open-data-health-btn"
          onClick={onOpenDataHealth}
          className="bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 py-2 px-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 text-[11px] font-medium"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Sensor Health (6)</span>
        </button>
      </div>

    </div>
  );
};
