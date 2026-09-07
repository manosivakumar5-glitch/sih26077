import React, { useState } from 'react';
import {
  AtmosphericState,
  HourlyForecast,
  LocationInfo,
  ScenarioPreset,
  SeverityLevel,
} from '../../types/weather';
import {
  WeatherCondition,
  TimeOfDay,
  WeatherSceneState,
  getWeatherConditionIcon,
} from '../../services/weatherSceneEngine';
import { LOCATIONS } from '../../data/locations';
import {
  AlertTriangle,
  ChevronDown,
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  Compass,
  Droplets,
  Eye,
  Gauge,
  MapPin,
  Moon,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Sun,
  Sunrise,
  Sunset,
  Thermometer,
  Wind,
  Zap,
} from 'lucide-react';

interface WeatherHeroCardProps {
  location: LocationInfo;
  onSelectLocation: (loc: LocationInfo) => void;
  sceneState: WeatherSceneState;
  atmosphere: AtmosphericState;
  hourlyForecasts: HourlyForecast[];
  tOffsetMin: number;
  onSelectTimeOffset: (offset: number) => void;
  activeScenario: ScenarioPreset;
  onSelectScenario: (scen: ScenarioPreset) => void;
  onSelectConditionOverride?: (cond: WeatherCondition | null) => void;
  onSelectTimeOfDayOverride?: (tod: TimeOfDay | null) => void;
  conditionOverride: WeatherCondition | null;
  timeOfDayOverride: TimeOfDay | null;
  onToggleAdvancedDrawer: () => void;
  isAdvancedDrawerOpen: boolean;
}

export const WeatherHeroCard: React.FC<WeatherHeroCardProps> = ({
  location,
  onSelectLocation,
  sceneState,
  atmosphere,
  hourlyForecasts,
  tOffsetMin,
  onSelectTimeOffset,
  activeScenario,
  onSelectScenario,
  onSelectConditionOverride,
  onSelectTimeOfDayOverride,
  conditionOverride,
  timeOfDayOverride,
  onToggleAdvancedDrawer,
  isAdvancedDrawerOpen,
}) => {
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showQuickSettings, setShowQuickSettings] = useState(false);

  const filteredLocations = LOCATIONS.filter(
    (l) =>
      l.locality.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Extract next 4 hours
  // Index 0 is NOW, and we pick steps around +60m, +120m, +180m, +240m
  const previewHours = [
    { label: 'NOW', offset: 0 },
    { label: '+1H', offset: 60 },
    { label: '+2H', offset: 120 },
    { label: '+3H', offset: 180 },
    { label: '+4H', offset: 240 },
  ].map((target) => {
    // Find closest forecast
    const found = hourlyForecasts.find((h) => Math.abs(h.timeOffsetMin - target.offset) < 25) || hourlyForecasts[0];
    
    // Determine condition icon
    let icon = '☀️';
    if (found.precipitationMmh > 30 || found.lightningPotentialPct > 40) {
      icon = '⛈️';
    } else if (found.precipitationMmh > 0.5) {
      icon = '🌧️';
    } else if (found.rainProbabilityPct > 45) {
      icon = '☁️';
    } else if (found.rainProbabilityPct > 20) {
      icon = '🌤️';
    } else {
      icon = sceneState.timeOfDay === 'NIGHT' ? '🌙' : '☀️';
    }

    return {
      label: target.label,
      offset: target.offset,
      tempC: found.tempC,
      icon,
      rainProb: found.rainProbabilityPct,
      condition: found.condition,
    };
  });

  // Severity badge style
  const getHazardBadge = (status: SeverityLevel) => {
    switch (status) {
      case 'EXTREME':
        return {
          bg: 'bg-purple-900/60 border-purple-500 text-purple-200',
          dot: 'bg-purple-400',
          text: 'EXTREME ALERT',
          desc: 'Life-safety warning. Seek immediate shelter.',
        };
      case 'SEVERE':
        return {
          bg: 'bg-rose-900/60 border-rose-500 text-rose-200',
          dot: 'bg-rose-400 animate-pulse',
          text: 'WARNING',
          desc: 'Severe weather active in your sector.',
        };
      case 'WARNING':
        return {
          bg: 'bg-red-900/60 border-red-500 text-red-200',
          dot: 'bg-red-400',
          text: 'WARNING',
          desc: 'Convective storm warning in effect.',
        };
      case 'WATCH':
        return {
          bg: 'bg-amber-900/60 border-amber-500 text-amber-200',
          dot: 'bg-amber-400',
          text: 'WATCH',
          desc: 'Convective initiation being monitored.',
        };
      case 'ADVISORY':
        return {
          bg: 'bg-orange-900/60 border-orange-500 text-orange-200',
          dot: 'bg-orange-400',
          text: 'ADVISORY',
          desc: 'Weather advisory for wind/rain.',
        };
      default:
        return {
          bg: 'bg-emerald-900/60 border-emerald-500 text-emerald-200',
          dot: 'bg-emerald-400',
          text: 'ALL CLEAR',
          desc: 'No severe weather hazards in your area.',
        };
    }
  };

  const hazard = getHazardBadge(atmosphere.hazardLevel);

  // Big weather visual icon
  const renderWeatherIcon = () => {
    switch (sceneState.condition) {
      case 'SUNNY':
        return sceneState.timeOfDay === 'NIGHT' ? (
          <Moon className="w-12 h-12 text-blue-200 drop-shadow-[0_0_15px_rgba(191,219,254,0.6)]" />
        ) : (
          <Sun className="w-12 h-12 text-amber-300 animate-spin-slow drop-shadow-[0_0_20px_rgba(252,211,77,0.7)]" />
        );
      case 'PARTLY_CLOUDY':
        return sceneState.timeOfDay === 'NIGHT' ? (
          <div className="relative">
            <Moon className="w-10 h-10 text-blue-200" />
            <Cloud className="w-8 h-8 text-slate-300 absolute -bottom-1 -right-2" />
          </div>
        ) : (
          <div className="relative">
            <Sun className="w-10 h-10 text-amber-300" />
            <Cloud className="w-8 h-8 text-white absolute -bottom-1 -right-2 drop-shadow-md" />
          </div>
        );
      case 'CLOUDY':
        return <Cloud className="w-12 h-12 text-slate-200 drop-shadow-md" />;
      case 'RAIN':
        return <CloudRain className="w-12 h-12 text-cyan-300 animate-bounce drop-shadow-[0_0_15px_rgba(103,232,249,0.5)]" />;
      case 'THUNDERSTORM':
        return <CloudLightning className="w-12 h-12 text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.8)]" />;
      case 'FOG':
        return <CloudFog className="w-12 h-12 text-slate-300 drop-shadow-md" />;
    }
  };

  return (
    <div className="relative z-30 w-full px-3 py-2 sm:px-4 sm:py-3 font-mono-code select-none">
      {/* Translucent Glassmorphic Weather Command Container */}
      <div className="bg-slate-950/75 border border-white/20 rounded-2xl p-3 sm:p-4 shadow-2xl backdrop-blur-xl text-slate-100 flex flex-col gap-3">
        
        {/* ROW 1: Location Bar + Severe Weather Status Pill + Quick Scene Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-white/10">
          
          {/* 1. LOCATION (e.g. Chennai, Tamil Nadu) with instant switcher */}
          <div className="relative flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-white/10 text-cyan-400 border border-white/15">
              <MapPin className="w-4 h-4" />
            </div>
            
            <button
              id="location-switcher-btn"
              onClick={() => setShowLocationDropdown(!showLocationDropdown)}
              className="flex items-center gap-2 hover:bg-white/10 px-2.5 py-1 rounded-xl transition text-left"
            >
              <div>
                <div className="text-xs text-slate-400 font-medium">LOCATION</div>
                <div className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-1.5">
                  <span>{location.locality}, {location.district}</span>
                  <ChevronDown className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
            </button>

            {/* Location Dropdown Modal */}
            {showLocationDropdown && (
              <div className="absolute top-12 left-0 z-50 w-72 sm:w-80 bg-slate-900 border border-cyan-500/40 rounded-xl shadow-2xl p-3 backdrop-blur-2xl">
                <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-800/80 rounded-lg mb-2 text-xs border border-white/10">
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search city or district..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent text-white outline-none w-full text-xs"
                    autoFocus
                  />
                </div>

                <div className="max-h-60 overflow-y-auto space-y-1 scrollbar-thin">
                  {filteredLocations.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => {
                        onSelectLocation(loc);
                        setShowLocationDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition flex items-center justify-between ${
                        loc.id === location.id
                          ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/50'
                          : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-white">{loc.locality}</div>
                        <div className="text-[11px] text-slate-400">{loc.district}, {loc.state}</div>
                      </div>
                      <span className="text-[10px] text-cyan-400/80 font-mono">{loc.radarStationCode}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 4. SEVERE WEATHER STATUS (🟢 ALL CLEAR / 🟡 WATCH / 🟠 ADVISORY / 🔴 WARNING) */}
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-bold text-xs shadow-lg tracking-wider ${hazard.bg}`}
              title={hazard.desc}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${hazard.dot}`} />
              <span>{hazard.text}</span>
            </div>

            {/* Quick Scene / Time of Day Switcher Button */}
            <button
              id="toggle-quick-scenes-btn"
              onClick={() => setShowQuickSettings(!showQuickSettings)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                showQuickSettings || conditionOverride || timeOfDayOverride
                  ? 'bg-cyan-500/25 text-cyan-300 border-cyan-400'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 border-white/15'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>SCENE CONTROLS</span>
            </button>

            {/* Advanced Storm Intelligence Toggle */}
            <button
              id="toggle-advanced-drawer-btn"
              onClick={onToggleAdvancedDrawer}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                isAdvancedDrawerOpen
                  ? 'bg-indigo-600/30 text-indigo-300 border-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.3)]'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 border-white/15'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isAdvancedDrawerOpen ? 'HIDE ADVANCED' : 'ADVANCED METEOROLOGY'}</span>
            </button>
          </div>
        </div>

        {/* Optional Quick Scene Override Bar (Sunny, Partly Cloudy, Cloudy, Rain, Storm, Fog + Sunrise, Day, Sunset, Night) */}
        {showQuickSettings && (
          <div className="p-3 bg-slate-900/90 rounded-xl border border-cyan-500/30 text-xs space-y-2.5 animate-fadeIn">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-cyan-400 font-bold uppercase tracking-wider text-[11px]">
                LIVE SCENE SIMULATION CONTROLS
              </span>
              {(conditionOverride || timeOfDayOverride) && (
                <button
                  onClick={() => {
                    onSelectConditionOverride?.(null);
                    onSelectTimeOfDayOverride?.(null);
                  }}
                  className="text-[10px] text-amber-400 hover:underline"
                >
                  Reset to Natural Simulation
                </button>
              )}
            </div>

            {/* Condition buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-400 text-[11px] mr-1">Condition:</span>
              {[
                { cond: 'SUNNY', label: '☀️ Sunny' },
                { cond: 'PARTLY_CLOUDY', label: '🌤️ Partly Cloudy' },
                { cond: 'CLOUDY', label: '☁️ Cloudy' },
                { cond: 'RAIN', label: '🌧️ Rain' },
                { cond: 'THUNDERSTORM', label: '⛈️ Thunderstorm' },
                { cond: 'FOG', label: '🌫️ Fog' },
              ].map(({ cond, label }) => (
                <button
                  key={cond}
                  onClick={() => onSelectConditionOverride?.(cond as WeatherCondition)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                    sceneState.condition === cond && conditionOverride === cond
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-white/10'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Time of Day buttons */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-white/5">
              <span className="text-slate-400 text-[11px] mr-1">Time of Day:</span>
              {[
                { tod: 'SUNRISE', label: '🌅 Sunrise' },
                { tod: 'DAY', label: '☀️ Daytime' },
                { tod: 'SUNSET', label: '🌇 Sunset' },
                { tod: 'NIGHT', label: '🌙 Night' },
              ].map(({ tod, label }) => (
                <button
                  key={tod}
                  onClick={() => onSelectTimeOfDayOverride?.(tod as TimeOfDay)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                    sceneState.timeOfDay === tod && timeOfDayOverride === tod
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-white/10'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ROW 2: Primary Weather Overview + Visual Metrics + Next 4 Hours */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-center">
          
          {/* 2. CURRENT WEATHER (Big Icon + 32°C + Feels like 35°C + Description) */}
          <div className="lg:col-span-5 flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/10">
            {/* Visual Icon */}
            <div className="shrink-0 p-2 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center">
              {renderWeatherIcon()}
            </div>

            {/* Temperature & Description */}
            <div className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {Math.round(atmosphere.temperatureC)}°C
                </span>
                <span className="text-xs sm:text-sm text-slate-300">
                  Feels like <span className="font-bold text-white">{Math.round(atmosphere.feelsLikeC)}°C</span>
                </span>
              </div>

              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs sm:text-sm font-bold text-cyan-300 uppercase tracking-wide">
                  {sceneState.condition.replace('_', ' ')}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-xs text-slate-400 capitalize">
                  {sceneState.timeOfDay.toLowerCase()}
                </span>
              </div>

              <p className="text-xs text-slate-300 mt-1 line-clamp-1 font-sans">
                "{sceneState.description || 'Current atmospheric conditions normal'}"
              </p>
            </div>
          </div>

          {/* 3. VISUAL WEATHER STATUS (Humidity, Wind, UV, AQI) - Direct & Clear */}
          <div className="lg:col-span-3 grid grid-cols-2 gap-2">
            {/* Humidity */}
            <div className="bg-white/5 p-2 rounded-xl border border-white/10 flex items-center gap-2">
              <Droplets className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400 font-medium">HUMIDITY</div>
                <div className="text-sm font-extrabold text-white">{atmosphere.humidityPct}%</div>
              </div>
            </div>

            {/* Wind */}
            <div className="bg-white/5 p-2 rounded-xl border border-white/10 flex items-center gap-2">
              <Wind className="w-4 h-4 text-teal-400 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400 font-medium">WIND</div>
                <div className="text-sm font-extrabold text-white">{atmosphere.windSpeedKmh} km/h</div>
              </div>
            </div>

            {/* UV Index */}
            <div className="bg-white/5 p-2 rounded-xl border border-white/10 flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400 font-medium">UV INDEX</div>
                <div className="text-sm font-extrabold text-white">{atmosphere.uvIndex}</div>
              </div>
            </div>

            {/* AQI */}
            <div className="bg-white/5 p-2 rounded-xl border border-white/10 flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400 font-medium">AQI</div>
                <div className="text-sm font-extrabold text-white">{atmosphere.aqi}</div>
              </div>
            </div>
          </div>

          {/* 5. NEXT 4 HOURS (FUTURE WEATHER PREVIEW) */}
          <div className="lg:col-span-4 bg-white/5 p-2.5 rounded-xl border border-white/10 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-300 tracking-wider">NEXT 4 HOURS</span>
              <span className="text-[10px] text-cyan-400">Click hour to scrub</span>
            </div>

            <div className="grid grid-cols-5 gap-1.5 text-center">
              {previewHours.map((h, i) => {
                const isActive = Math.abs(tOffsetMin - h.offset) < 25;
                return (
                  <button
                    key={h.label}
                    onClick={() => onSelectTimeOffset(h.offset)}
                    className={`p-1.5 rounded-lg border transition flex flex-col items-center justify-between ${
                      isActive
                        ? 'bg-cyan-500/30 border-cyan-400 text-white shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                        : 'bg-black/25 hover:bg-white/10 border-white/10 text-slate-300'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-slate-400">{h.label}</span>
                    <span className="text-base my-0.5">{h.icon}</span>
                    <span className="text-xs font-bold text-white">{Math.round(h.tempC)}°</span>
                    {h.rainProb > 20 && (
                      <span className="text-[9px] text-cyan-300 font-medium">{h.rainProb}%</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
