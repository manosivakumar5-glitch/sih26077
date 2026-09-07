import React from 'react';
import {
  AtmosphericState,
  FloodRiskAssessment,
  LightningIntelligence,
  LocationInfo,
  WarningNotice,
} from '../../types/weather';
import {
  AlertCircle,
  AlertTriangle,
  Building,
  CheckCircle2,
  CloudRain,
  Radio,
  ShieldAlert,
  ShieldCheck,
  Waves,
  Zap,
  Clock,
  Compass,
  Wind,
} from 'lucide-react';

interface ImpactViewProps {
  location: LocationInfo;
  floodRisk: FloodRiskAssessment;
  lightning: LightningIntelligence;
  warning: WarningNotice;
  atmosphere?: AtmosphericState;
}

export const ImpactView: React.FC<ImpactViewProps> = ({
  location,
  floodRisk,
  lightning,
  warning,
  atmosphere,
}) => {
  // Safe defaults
  const catchments = floodRisk?.affectedCatchments ?? [];
  const impacts = warning?.potentialImpacts ?? [
    'Localized waterlogging in low-lying corridors.',
    'Surface wind gusts causing minor foliage branches to drop.',
    'Intense lightning discharges in active convective cores.',
  ];
  const actions = warning?.recommendedActions ?? [
    'Seek sturdy indoor shelter away from windows.',
    'Avoid parking or driving through flooded causeways and underpasses.',
    'Follow official emergency management bulletins.',
  ];
  const severity = warning?.severity ?? 'ADVISORY';
  const isSevere = severity === 'WARNING' || severity === 'EMERGENCY';

  return (
    <div className="relative w-full h-full flex flex-col font-mono-code select-none overflow-y-auto p-4 sm:p-6 bg-slate-950/70 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>URBAN MULTI-HAZARD IMPACT & EMERGENCY DECISION MATRIX</span>
            </div>
            <h1 className="text-xl font-extrabold text-white mt-1">
              Hazard Assessment: {location.locality}, {location.district}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1.5 rounded-xl font-bold text-xs border uppercase tracking-wider ${
                isSevere
                  ? 'bg-red-500/20 text-red-300 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse'
                  : severity === 'WATCH'
                  ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}
            >
              STATUS: {severity}
            </span>
            <span className="text-[10px] px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300">
              LEAD TIME: {warning?.leadTimeMinutes ?? 45}m
            </span>
          </div>
        </div>

        {/* Warning Banner */}
        <div
          className={`border rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start gap-4 ${
            isSevere
              ? 'bg-red-950/40 border-red-500/50 text-red-200'
              : 'bg-slate-900/80 border-white/10 text-slate-200'
          }`}
        >
          <ShieldAlert className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-white text-base">
                {warning?.headline || `Severe Weather Threat for ${location.locality}`}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40 font-bold">
                PROBABILITY {warning?.probabilityPct ?? 75}% ({warning?.confidence ?? 'HIGH'} CONFIDENCE)
              </span>
            </div>

            <p className="text-xs leading-relaxed opacity-90 font-sans">
              Affected Zone: <strong>{warning?.affectedArea || `${location.locality}, ${location.district}`}</strong>. Threat window: T+{warning?.timeWindowStartMin ?? 15}m to T+{warning?.timeWindowEndMin ?? 105}m.
            </p>

            {/* Actions & Impacts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="bg-slate-950/60 p-3 rounded-xl border border-white/10">
                <span className="text-rose-400 font-bold text-[11px] uppercase tracking-wide block mb-1.5">
                  ANTICIPATED URBAN IMPACTS
                </span>
                <ul className="space-y-1 text-slate-300 text-[11px]">
                  {impacts.map((imp, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-rose-400 mt-0.5">•</span>
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-white/10">
                <span className="text-emerald-400 font-bold text-[11px] uppercase tracking-wide block mb-1.5">
                  RECOMMENDED MITIGATION ACTIONS
                </span>
                <ul className="space-y-1 text-slate-300 text-[11px]">
                  {actions.map((act, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-400 mt-0.5">•</span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Flood Catchment Inundation & Lightning Threat Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Flood Inundation Section */}
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-300 flex items-center gap-2">
                <Waves className="w-4 h-4 text-blue-400" />
                <span>URBAN HYDROLOGY & DRAINAGE INUNDATION</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
                {floodRisk?.overallRisk ?? 'MODERATE'} RISK
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px]">DRAINAGE SATURATION</span>
                <div className="text-lg font-bold text-cyan-300 mt-0.5">
                  {floodRisk?.drainageSaturationPct ?? 65}%
                </div>
              </div>
              <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px]">RUNOFF SUSCEPTIBILITY</span>
                <div className="text-lg font-bold text-amber-300 mt-0.5">
                  {floodRisk?.runoffSusceptibilityPct ?? 50}%
                </div>
              </div>
              <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px]">ACCUMULATED RAIN</span>
                <div className="text-lg font-bold text-white mt-0.5">
                  {floodRisk?.accumulatedRainfallMm ?? 35} mm
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase">
                MONITORED BASINS & CATCHMENTS
              </span>
              <div className="space-y-1.5">
                {catchments.length > 0 ? (
                  catchments.map((catchment, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-white">{catchment.name}</div>
                        <div className="text-[10px] text-slate-400">
                          Trend: <span className="text-amber-400 font-semibold">{catchment.waterLevelTrend}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-blue-300 font-bold text-sm">
                          ~{catchment.inundationDepthEstCm} cm depth
                        </div>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                            catchment.riskLevel === 'VERY HIGH'
                              ? 'bg-rose-500/20 text-rose-300'
                              : catchment.riskLevel === 'HIGH'
                              ? 'bg-orange-500/20 text-orange-300'
                              : 'bg-cyan-500/20 text-cyan-300'
                          }`}
                        >
                          {catchment.riskLevel}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-400 p-3 bg-slate-950/50 rounded-xl">
                    No critical inundation predicted in regional urban drainage corridors.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Lightning Threat Section */}
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-yellow-300 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span>TOTAL LIGHTNING THREAT & ILLN SENSORS</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 font-bold">
                {lightning?.activityLevel ?? 'ACTIVE'} ACTIVITY
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
                <span className="text-slate-400 text-[10px]">FLASH RATE</span>
                <div className="text-xl font-bold text-yellow-300 font-tech mt-1">
                  {lightning?.strikeRatePerMin ?? 18} / min
                </div>
                <span className="text-[10px] text-slate-500">
                  Trend: {lightning?.trend ?? 'ACCELERATING'}
                </span>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
                <span className="text-slate-400 text-[10px]">SAFETY RADIUS</span>
                <div className="text-xl font-bold text-rose-400 font-tech mt-1">
                  {lightning?.safetyRadiusKm ?? 8.5} km
                </div>
                <span className="text-[10px] text-slate-500">
                  Charge: ~{lightning?.chargeSeparationEstKvM ?? 120} kV/m
                </span>
              </div>
            </div>

            <div className="bg-yellow-950/30 border border-yellow-500/30 rounded-xl p-3.5 text-xs text-yellow-200/90 font-sans space-y-1.5">
              <div className="font-bold text-white flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-yellow-400" />
                <span>Standard 30-30 Lightning Safety Protocol</span>
              </div>
              <p className="text-[11px] leading-relaxed text-yellow-200/80">
                When lightning flash occurs within {lightning?.safetyRadiusKm ?? 8} km, suspend all outdoor sports and construction work immediately. Remain inside enclosed structures until at least 30 minutes after the last detected strike.
              </p>
            </div>

            {/* Critical Infrastructure Exposure */}
            <div className="pt-2 border-t border-slate-800 space-y-2 text-xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase">
                CRITICAL INFRASTRUCTURE EXPOSURE STATUS
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">Metro Underpasses</span>
                  <span className="text-amber-400 font-semibold">Pumps Active</span>
                </div>
                <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">Electrical Grid</span>
                  <span className="text-emerald-400 font-semibold">Protected</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
