import React, { useState } from 'react';
import {
  AtmosphericState,
  DailyForecast,
  HourlyForecast,
  LocationInfo,
} from '../../types/weather';
import {
  Cloud,
  CloudRain,
  Compass,
  Droplets,
  Eye,
  Gauge,
  Moon,
  Sun,
  Sunrise,
  Sunset,
  Thermometer,
  Wind,
  X,
  Zap,
} from 'lucide-react';

interface EverydayWeatherDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  location: LocationInfo;
  atmosphere: AtmosphericState;
  hourlyForecasts: HourlyForecast[];
  dailyForecasts: DailyForecast[];
}

export const EverydayWeatherDrawer: React.FC<EverydayWeatherDrawerProps> = ({
  isOpen,
  onClose,
  location,
  atmosphere,
  hourlyForecasts,
  dailyForecasts,
}) => {
  const [useFahrenheit, setUseFahrenheit] = useState(false);

  if (!isOpen) return null;

  const toF = (c: number) => Math.round((c * 9) / 5 + 32);
  const displayTemp = (c: number) => (useFahrenheit ? `${toF(c)}°F` : `${c}°C`);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 select-none font-mono-code text-xs">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-[#070e1c] border border-cyan-500/40 rounded-3xl p-5 shadow-2xl overflow-y-auto flex flex-col gap-4">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-widest font-tech">
              <Sun className="w-4 h-4 text-amber-400" />
              <span>EVERYDAY METEOROLOGICAL SUITE</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-0.5">
              {location.locality}, {location.city}
            </h2>
            <div className="text-[11px] text-slate-400">
              {location.district} • Elev {location.elevationM}m • Station {location.radarStationCode}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Unit Toggle */}
            <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-0.5">
              <button
                onClick={() => setUseFahrenheit(false)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  !useFahrenheit ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'
                }`}
              >
                °C
              </button>
              <button
                onClick={() => setUseFahrenheit(true)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  useFahrenheit ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'
                }`}
              >
                °F
              </button>
            </div>

            <button
              id="close-everyday-weather-modal-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Current Big Metric Banner */}
        <div className="bg-gradient-to-r from-[#09152b] via-[#0d1d3a] to-[#0a1832] border border-cyan-500/30 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="text-5xl font-extrabold text-white font-tech">
              {displayTemp(atmosphere.temperatureC)}
            </div>
            <div>
              <div className="text-sm font-semibold text-cyan-300">
                {atmosphere.rainfallRateMmh > 10 ? 'Heavy Convective Showers' : 'Partly Cloudy & Humid'}
              </div>
              <div className="text-slate-400 text-[11px]">
                Feels like {displayTemp(atmosphere.feelsLikeC)} • Dew Point {displayTemp(atmosphere.dewPointC)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
            <div className="bg-[#050b16]/70 border border-slate-800 rounded-lg px-3 py-1.5">
              <div className="text-slate-400">UV INDEX</div>
              <div className="font-bold text-slate-100 text-sm mt-0.5">{atmosphere.uvIndex} (Moderate)</div>
            </div>
            <div className="bg-[#050b16]/70 border border-slate-800 rounded-lg px-3 py-1.5">
              <div className="text-slate-400">AIR QUALITY</div>
              <div className="font-bold text-emerald-400 text-sm mt-0.5">{atmosphere.aqi} AQI (Good)</div>
            </div>
            <div className="bg-[#050b16]/70 border border-slate-800 rounded-lg px-3 py-1.5">
              <div className="text-slate-400">VISIBILITY</div>
              <div className="font-bold text-slate-100 text-sm mt-0.5">{atmosphere.visibilityKm} km</div>
            </div>
            <div className="bg-[#050b16]/70 border border-slate-800 rounded-lg px-3 py-1.5">
              <div className="text-slate-400">CLOUD COVER</div>
              <div className="font-bold text-slate-100 text-sm mt-0.5">{atmosphere.cloudCoverPct}%</div>
            </div>
          </div>
        </div>

        {/* 24-Hour Horizon Hourly Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
            <span>24-HOUR HYPER-LOCAL TIMELINE</span>
            <span className="text-cyan-400 text-[11px]">HOURLY FORECAST</span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {hourlyForecasts.map((h, idx) => (
              <div
                key={idx}
                className={`shrink-0 w-24 rounded-xl p-2.5 flex flex-col items-center gap-1 border text-center transition-all ${
                  idx === 0
                    ? 'bg-cyan-950/60 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                    : 'bg-[#091428]/60 border-slate-800'
                }`}
              >
                <span className="text-[11px] font-bold text-cyan-300">{h.timeLabel}</span>
                <span className="text-sm font-extrabold text-white font-tech">{displayTemp(h.tempC)}</span>
                <CloudRain
                  className={`w-4 h-4 ${h.precipitationMmh > 5 ? 'text-cyan-400' : 'text-slate-500'}`}
                />
                <span className="text-[10px] text-cyan-400 font-bold">{h.rainProbabilityPct}%</span>
                <span className="text-[9px] text-slate-400">{h.windSpeedKmh} km/h</span>
              </div>
            ))}
          </div>
        </div>

        {/* 7-Day Extended Forecast */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
            <span>7-DAY METEOROLOGICAL OUTLOOK</span>
            <span className="text-slate-400 text-[11px]">CALIBRATED NOWCAST & NWP</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2">
            {dailyForecasts.map((d, idx) => (
              <div
                key={idx}
                className="bg-[#091428]/60 border border-slate-800 rounded-xl p-2.5 flex flex-col justify-between gap-1 text-center"
              >
                <div>
                  <div className="font-bold text-slate-200 text-xs">{d.dayLabel}</div>
                  <div className="text-[10px] text-slate-400">{d.dateStr}</div>
                </div>

                <div className="my-1 flex justify-center">
                  <Cloud className="w-5 h-5 text-cyan-400" />
                </div>

                <div className="text-[11px] font-bold text-slate-200 font-tech">
                  {displayTemp(d.maxTempC)} / <span className="text-slate-400">{displayTemp(d.minTempC)}</span>
                </div>

                <div className="text-[10px] text-cyan-300 font-semibold">{d.precipitationProbabilityPct}% Rain</div>

                <div
                  className={`text-[9px] font-bold uppercase rounded px-1 py-0.5 mt-0.5 ${
                    d.severeRisk === 'SEVERE'
                      ? 'bg-red-500/20 text-red-300'
                      : d.severeRisk === 'WATCH'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-emerald-500/20 text-emerald-300'
                  }`}
                >
                  {d.severeRisk}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sun & Astronomical Ephemeris */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="bg-[#091428]/60 border border-slate-800 rounded-xl p-3 flex items-center justify-around">
            <div className="flex items-center gap-3">
              <Sunrise className="w-6 h-6 text-amber-400" />
              <div>
                <div className="text-[10px] text-slate-400">SUNRISE</div>
                <div className="font-bold text-white text-sm">05:58 AM</div>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div className="flex items-center gap-3">
              <Sunset className="w-6 h-6 text-orange-400" />
              <div>
                <div className="text-[10px] text-slate-400">SUNSET</div>
                <div className="font-bold text-white text-sm">06:22 PM</div>
              </div>
            </div>
          </div>

          <div className="bg-[#091428]/60 border border-slate-800 rounded-xl p-3 flex items-center justify-around">
            <div className="flex items-center gap-3">
              <Moon className="w-6 h-6 text-cyan-300" />
              <div>
                <div className="text-[10px] text-slate-400">MOONRISE / MOONSET</div>
                <div className="font-bold text-white text-sm">07:15 PM / 06:40 AM</div>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <div className="text-[10px] text-slate-400">LUNAR PHASE</div>
              <div className="font-bold text-cyan-300 text-xs">Waxing Gibbous (82%)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
