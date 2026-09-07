import React, { useState } from 'react';
import {
  AtmosphericState,
  DailyForecast,
  HourlyForecast,
  LocationInfo,
  ProbabilisticScenario,
} from '../../types/weather';
import {
  Calendar,
  CloudRain,
  Compass,
  Droplets,
  Sparkles,
  Sun,
  Thermometer,
  TrendingUp,
  Wind,
  Zap,
  Waves,
} from 'lucide-react';

interface ForecastViewProps {
  location: LocationInfo;
  atmosphere: AtmosphericState;
  hourlyForecasts: HourlyForecast[];
  dailyForecasts: DailyForecast[];
  scenarios: ProbabilisticScenario[];
}

export const ForecastView: React.FC<ForecastViewProps> = ({
  location,
  atmosphere,
  hourlyForecasts = [],
  dailyForecasts = [],
  scenarios = [],
}) => {
  const [activeTab, setActiveTab] = useState<'HOURLY' | 'DAILY' | 'SCENARIOS'>('HOURLY');

  return (
    <div className="relative w-full h-full flex flex-col font-mono-code select-none overflow-y-auto p-4 sm:p-6 bg-slate-950/60 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto w-full space-y-5">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
              <TrendingUp className="w-4 h-4" />
              <span>NUMERICAL METEOROLOGICAL FORECAST & PROBABILITY ENVELOPES</span>
            </div>
            <h1 className="text-xl font-extrabold text-white mt-1">
              Forecast for {location.locality}, {location.district}
            </h1>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-white/10">
            {(['HOURLY', 'DAILY', 'SCENARIOS'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border cursor-pointer ${
                  activeTab === tab
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                {tab === 'HOURLY' ? '24-Hour Timeline' : tab === 'DAILY' ? '7-Day Extended' : 'Ensemble Scenarios'}
              </button>
            ))}
          </div>
        </div>

        {/* 1. Hourly Timeline Tab */}
        {activeTab === 'HOURLY' && (
          <div className="space-y-4">
            <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">
                  HIGH-RESOLUTION NOWCAST & TIMELINE CARDS
                </span>
                <span className="text-[10px] text-cyan-400 font-semibold">
                  SURFACE RESOLUTION: 1.2 KM
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
                {(hourlyForecasts.length > 0 ? hourlyForecasts.slice(0, 14) : []).map((hf, i) => (
                  <div
                    key={hf.timeOffsetMin}
                    className="bg-slate-950/70 border border-slate-800 hover:border-cyan-500/40 transition rounded-xl p-3 flex flex-col items-center text-center gap-1.5"
                  >
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {hf.timeLabel}
                    </span>
                    <span className="text-xl">
                      {hf.rainProbabilityPct > 60
                        ? '⛈️'
                        : hf.rainProbabilityPct > 30
                        ? '🌧️'
                        : hf.precipitationMmh > 0
                        ? '🌦️'
                        : '⛅'}
                    </span>
                    <span className="text-sm font-bold text-white">{hf.tempC}°C</span>
                    <div className="text-[10px] text-cyan-400 font-semibold flex items-center gap-1">
                      <CloudRain className="w-3 h-3" />
                      <span>{hf.rainProbabilityPct}%</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {hf.precipitationMmh > 0 ? `${hf.precipitationMmh} mm/h` : '0 mm'}
                    </div>
                    <div className="text-[9px] text-slate-500 pt-1 border-t border-slate-800/80 w-full flex justify-between">
                      <span>{hf.windSpeedKmh}kph</span>
                      <span className="text-amber-400">{hf.radarReflectivityDbz}dBZ</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Atmospheric Boundary Conditions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4">
                <span className="text-slate-400 text-[11px] font-bold">ATMOSPHERIC MOISTURE</span>
                <div className="text-2xl font-bold text-cyan-300 font-tech mt-1">
                  {atmosphere?.humidityPct ?? 78}%
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Dew point {atmosphere?.dewPointC ?? 26}°C • Precipitable Water {atmosphere?.tpwMm ?? 58}mm
                </div>
              </div>

              <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4">
                <span className="text-slate-400 text-[11px] font-bold">BAROMETRIC PRESSURE</span>
                <div className="text-2xl font-bold text-indigo-300 font-tech mt-1">
                  {atmosphere?.pressureHpa ?? 1008} hPa
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Trend: -2.1 hPa / 3h (Active convective deepening)
                </div>
              </div>

              <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4">
                <span className="text-slate-400 text-[11px] font-bold">SURFACE WIND VELOCITY</span>
                <div className="text-2xl font-bold text-teal-300 font-tech mt-1">
                  {atmosphere?.windSpeedKmh ?? 18} km/h
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Heading {atmosphere?.windDirectionDeg ?? 140}° • Shear {atmosphere?.windShearMs ?? 14} m/s
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. 7-Day Extended Forecast Tab */}
        {activeTab === 'DAILY' && (
          <div className="space-y-3">
            {(dailyForecasts.length > 0 ? dailyForecasts : []).map((df, idx) => (
              <div
                key={idx}
                className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3 w-40">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="font-bold text-white text-sm">{df.dayLabel}</div>
                    <div className="text-[10px] text-slate-400">{df.dateStr}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">
                    {df.condition.includes('Thunderstorm') || df.condition.includes('Squall')
                      ? '⛈️'
                      : df.condition.includes('Rain') || df.condition.includes('Shower')
                      ? '🌧️'
                      : df.condition.includes('Cloud')
                      ? '⛅'
                      : '☀️'}
                  </span>
                  <div>
                    <span className="text-slate-200 font-semibold">{df.condition}</span>
                    <div className="text-[10px] text-slate-400">
                      Accumulation: ~{df.precipitationMm} mm
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-white font-bold text-base">{df.maxTempC}°</span>
                  <span className="text-slate-500 font-semibold">{df.minTempC}°</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-cyan-400 font-bold">
                    <CloudRain className="w-3.5 h-3.5" />
                    <span>{df.precipitationProbabilityPct}%</span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      df.severeRisk === 'WARNING' || df.severeRisk === 'EMERGENCY'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : df.severeRisk === 'WATCH'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {df.severeRisk}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3. Ensemble Scenarios Tab */}
        {activeTab === 'SCENARIOS' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(scenarios.length > 0 ? scenarios : []).map((sc) => (
              <div
                key={sc.id}
                className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white text-sm">{sc.name}</span>
                    <span className="px-2.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold">
                      {sc.probabilityPct}% Chance
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-2.5 leading-relaxed font-sans">
                    {sc.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 text-xs space-y-1.5 text-slate-400">
                  <div className="flex justify-between">
                    <span>Peak Rainfall Rate:</span>
                    <strong className="text-white">{sc.peakRainfallMmh} mm/h</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Peak Reflectivity:</span>
                    <strong className="text-amber-400">{sc.peakReflectivityDbz} dBZ</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Track Velocity:</span>
                    <strong className="text-white">{sc.trackSpeedKmh} km/h @ {sc.trackHeadingDeg}°</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Ensemble Confidence:</span>
                    <strong className="text-emerald-400">{sc.confidence}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
