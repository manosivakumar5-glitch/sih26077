/**
 * STORM-MIND: Self-Learning Probabilistic Weather Digital Twin
 * Premium Meteorological Operations Command Center — Overview View
 */

import React, { useState, useRef } from 'react';
import {
  AtmosphericState,
  FloodRiskAssessment,
  HourlyForecast,
  LightningIntelligence,
  LocationInfo,
  MapLayerState,
  ScenarioPreset,
  SeverityLevel,
  StormCell,
  WarningNotice,
} from '../../types/weather';
import {
  WeatherCondition,
  TimeOfDay,
  WeatherSceneState,
} from '../../services/weatherSceneEngine';
import { LOCATIONS } from '../../data/locations';
import { MeteorologicalMap } from '../map/MeteorologicalMap';
import { FutureEarthTimeline } from '../timeline/FutureEarthTimeline';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  Compass,
  Database,
  Droplets,
  Eye,
  Gauge,
  Globe,
  Layers,
  MapPin,
  Moon,
  Radio,
  Search,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Sunrise,
  Sunset,
  Thermometer,
  Waves,
  Wind,
  Zap,
} from 'lucide-react';

interface OverviewViewProps {
  location: LocationInfo;
  onSelectLocation: (loc: LocationInfo) => void;
  sceneState: WeatherSceneState;
  atmosphere: AtmosphericState;
  hourlyForecasts: HourlyForecast[];
  tOffsetMin: number;
  onSelectTimeOffset: (offset: number) => void;
  activeScenario: ScenarioPreset;
  onSelectScenario: (scen: ScenarioPreset) => void;
  conditionOverride: WeatherCondition | null;
  timeOfDayOverride: TimeOfDay | null;
  onSelectConditionOverride: (cond: WeatherCondition | null) => void;
  onSelectTimeOfDayOverride: (tod: TimeOfDay | null) => void;
  mapLayers: MapLayerState;
  onChangeMapLayers: (layers: MapLayerState) => void;
  onResetMapLayers: () => void;
  stormCells: StormCell[];
  primaryStorm?: StormCell;
  selectedStormCell: StormCell | null;
  onSelectStormCell: (cell: StormCell) => void;
  floodRisk: FloodRiskAssessment;
  lightning: LightningIntelligence;
  warning: WarningNotice;
  isPlaying: boolean;
  onTogglePlay: () => void;
  playbackSpeed: number;
  onChangePlaybackSpeed: (speed: number) => void;
  onResetTimeline: () => void;
  is3d: boolean;
  onToggle3d: () => void;
  // Modal launchers
  onOpenStormDna: () => void;
  onOpenWhyNow: () => void;
  onOpenEverydayWeather: () => void;
  onOpenDataHealth: () => void;
  onOpenAtmosphere: () => void;
  onOpenFutures: () => void;
  onOpenFlood: () => void;
  onOpenLightning: () => void;
  onOpenVerification: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  location,
  onSelectLocation,
  sceneState,
  atmosphere,
  hourlyForecasts,
  tOffsetMin,
  onSelectTimeOffset,
  activeScenario,
  onSelectScenario,
  conditionOverride,
  timeOfDayOverride,
  onSelectConditionOverride,
  onSelectTimeOfDayOverride,
  mapLayers,
  onChangeMapLayers,
  onResetMapLayers,
  stormCells,
  primaryStorm,
  selectedStormCell,
  onSelectStormCell,
  floodRisk,
  lightning,
  warning,
  isPlaying,
  onTogglePlay,
  playbackSpeed,
  onChangePlaybackSpeed,
  onResetTimeline,
  is3d,
  onToggle3d,
  onOpenStormDna,
  onOpenWhyNow,
  onOpenEverydayWeather,
  onOpenDataHealth,
  onOpenAtmosphere,
  onOpenFutures,
  onOpenFlood,
  onOpenLightning,
  onOpenVerification,
}) => {
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSceneControls, setShowSceneControls] = useState(false);
  const [expandedInsight, setExpandedInsight] = useState<string | null>('storm_dna');
  const [collapsedPanels, setCollapsedPanels] = useState<Record<string, boolean>>({});

  const togglePanelCollapse = (panelKey: string) => {
    setCollapsedPanels((prev) => ({ ...prev, [panelKey]: !prev[panelKey] }));
  };

  const toggleAllPanels = (collapse: boolean) => {
    setCollapsedPanels({
      dna: collapse,
      whynow: collapse,
      sounding: collapse,
      flood: collapse,
      lightning: collapse,
      verification: collapse,
    });
  };

  const advancedSectionRef = useRef<HTMLDivElement | null>(null);

  const filteredLocations = LOCATIONS.filter(
    (l) =>
      l.locality.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleLayer = (key: keyof Omit<MapLayerState, 'opacity'>) => {
    onChangeMapLayers({
      ...mapLayers,
      [key]: !mapLayers[key],
    });
  };

  const scrollToAdvanced = () => {
    if (advancedSectionRef.current) {
      advancedSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Severity formatting
  const getHazardBadge = (status: SeverityLevel) => {
    switch (status) {
      case 'EXTREME':
        return {
          bg: 'bg-purple-950/80 border-purple-500/80 text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.4)]',
          dot: 'bg-purple-400 animate-ping',
          text: 'EXTREME ALERT',
          desc: 'Life-safety warning. Intense convective activity.',
        };
      case 'SEVERE':
        return {
          bg: 'bg-rose-950/80 border-rose-500/80 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.4)]',
          dot: 'bg-rose-400 animate-pulse',
          text: 'SEVERE WARNING',
          desc: 'Severe convective storm in progress.',
        };
      case 'WARNING':
        return {
          bg: 'bg-red-950/80 border-red-500/80 text-red-200 shadow-[0_0_20px_rgba(239,68,68,0.4)]',
          dot: 'bg-red-400 animate-pulse',
          text: 'WARNING',
          desc: 'High-reflectivity convective cells detected.',
        };
      case 'WATCH':
        return {
          bg: 'bg-amber-950/80 border-amber-500/80 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.3)]',
          dot: 'bg-amber-400',
          text: 'WATCH',
          desc: 'Convective storm initiation being monitored.',
        };
      case 'ADVISORY':
        return {
          bg: 'bg-orange-950/80 border-orange-500/80 text-orange-200 shadow-[0_0_15px_rgba(249,115,22,0.3)]',
          dot: 'bg-orange-400',
          text: 'ADVISORY',
          desc: 'Advisory for gusty winds and heavy rainfall.',
        };
      default:
        return {
          bg: 'bg-emerald-950/80 border-emerald-500/80 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.3)]',
          dot: 'bg-emerald-400',
          text: 'ALL CLEAR',
          desc: 'No severe weather hazards detected.',
        };
    }
  };

  const hazard = getHazardBadge(atmosphere.hazardLevel);

  // Weather Icon Component
  const renderWeatherIcon = () => {
    switch (sceneState.condition) {
      case 'SUNNY':
        return sceneState.timeOfDay === 'NIGHT' ? (
          <Moon className="w-16 h-16 text-blue-200 drop-shadow-[0_0_20px_rgba(191,219,254,0.6)]" />
        ) : (
          <Sun className="w-16 h-16 text-amber-300 drop-shadow-[0_0_25px_rgba(252,211,77,0.7)]" />
        );
      case 'PARTLY_CLOUDY':
        return sceneState.timeOfDay === 'NIGHT' ? (
          <div className="relative">
            <Moon className="w-14 h-14 text-blue-200" />
            <Cloud className="w-10 h-10 text-slate-300 absolute -bottom-1 -right-2" />
          </div>
        ) : (
          <div className="relative">
            <Sun className="w-14 h-14 text-amber-300" />
            <Cloud className="w-10 h-10 text-white absolute -bottom-1 -right-2 drop-shadow-md" />
          </div>
        );
      case 'CLOUDY':
        return <Cloud className="w-16 h-16 text-slate-200 drop-shadow-md" />;
      case 'RAIN':
        return <CloudRain className="w-16 h-16 text-cyan-300 drop-shadow-[0_0_20px_rgba(103,232,249,0.6)]" />;
      case 'THUNDERSTORM':
        return <CloudLightning className="w-16 h-16 text-amber-400 drop-shadow-[0_0_25px_rgba(251,191,36,0.8)]" />;
      case 'FOG':
        return <CloudFog className="w-16 h-16 text-slate-300 drop-shadow-md" />;
      default:
        return <Cloud className="w-16 h-16 text-cyan-300" />;
    }
  };

  // 6-step preview forecast (NOW, +1H, +2H, +3H, +4H, +5H, +6H)
  const previewHours = [
    { label: 'NOW', offset: 0 },
    { label: '+1H', offset: 60 },
    { label: '+2H', offset: 120 },
    { label: '+3H', offset: 180 },
    { label: '+4H', offset: 240 },
    { label: '+5H', offset: 300 },
    { label: '+6H', offset: 360 },
  ].map((target) => {
    const found =
      hourlyForecasts.find((h) => Math.abs(h.timeOffsetMin - target.offset) < 30) ||
      hourlyForecasts[0] || {
        timeOffsetMin: target.offset,
        tempC: atmosphere.temperatureC,
        precipitationMmh: 0,
        rainProbabilityPct: 10,
        condition: sceneState.condition,
      };

    let icon = '☀️';
    if (found.precipitationMmh > 30 || found.condition === 'THUNDERSTORM') {
      icon = '⛈️';
    } else if (found.precipitationMmh > 0.5 || found.condition === 'RAIN') {
      icon = '🌧️';
    } else if (found.rainProbabilityPct > 45 || found.condition === 'CLOUDY') {
      icon = '☁️';
    } else if (found.rainProbabilityPct > 20 || found.condition === 'PARTLY_CLOUDY') {
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
      precipMmh: found.precipitationMmh,
      condition: found.condition,
    };
  });

  const layerItems: {
    key: keyof Omit<MapLayerState, 'opacity'>;
    label: string;
    icon: string;
    activeStyle: string;
  }[] = [
    { key: 'clouds', label: 'Clouds', icon: '☁', activeStyle: 'bg-sky-500 text-slate-950 border-sky-400 font-bold' },
    { key: 'rain', label: 'Rain', icon: '🌧', activeStyle: 'bg-blue-500 text-white border-blue-400 font-bold' },
    { key: 'wind', label: 'Wind', icon: '🌬', activeStyle: 'bg-teal-500 text-slate-950 border-teal-400 font-bold' },
    { key: 'radar', label: 'Radar', icon: '📡', activeStyle: 'bg-amber-500 text-slate-950 border-amber-400 font-bold' },
    { key: 'lightning', label: 'Lightning', icon: '⚡', activeStyle: 'bg-yellow-400 text-slate-950 border-yellow-300 font-bold' },
    { key: 'stormCells', label: 'Storms', icon: '⛈', activeStyle: 'bg-rose-500 text-white border-rose-400 font-bold' },
    { key: 'floodRisk', label: 'Flood', icon: '🌊', activeStyle: 'bg-indigo-500 text-white border-indigo-400 font-bold' },
  ];

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 sm:space-y-8 font-mono-code text-slate-100">
      
      {/* ========================================================================= */}
      {/* 1. LOCATION + STATUS SECTION                                             */}
      {/* ========================================================================= */}
      <section
        id="overview-location-section"
        className="bg-slate-950/75 border border-white/15 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl transition-all"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Location Information */}
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 shrink-0 mt-1 sm:mt-0">
              <MapPin className="w-5 h-5" />
            </div>

            <div className="relative">
              <div className="text-[11px] text-slate-400 font-semibold tracking-wider uppercase">
                CURRENT OBSERVATION SECTOR
              </div>

              <button
                id="overview-location-dropdown-btn"
                type="button"
                onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                className="group flex items-center gap-2 text-left hover:bg-white/5 py-1 px-2 -ml-2 rounded-xl transition cursor-pointer"
                title="Click to change location"
              >
                <div>
                  <div className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                    <span>{location.locality}</span>
                    <span className="text-xs font-medium text-cyan-300 px-2 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-500/30">
                      {location.radarStationCode}
                    </span>
                    <ChevronDown className="w-4 h-4 text-cyan-400 group-hover:translate-y-0.5 transition-transform" />
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    ({location.district} Urban Catchment), {location.state} • {location.lat.toFixed(4)}°N, {location.lng.toFixed(4)}°E • Elev: {location.elevationM}m
                  </div>
                </div>
              </button>

              {/* Location Switcher Modal */}
              {showLocationDropdown && (
                <div className="absolute top-full left-0 z-50 mt-2 w-80 sm:w-96 bg-slate-900/95 border border-cyan-500/40 rounded-2xl shadow-2xl p-3.5 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/80 rounded-xl mb-2.5 text-xs border border-white/10">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search city, district or station..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent text-white outline-none w-full text-xs font-mono-code"
                      autoFocus
                    />
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-1.5 scrollbar-thin pr-1">
                    {filteredLocations.map((loc) => (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => {
                          onSelectLocation(loc);
                          setShowLocationDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs transition flex items-center justify-between cursor-pointer ${
                          loc.id === location.id
                            ? 'bg-cyan-600/30 text-cyan-200 border border-cyan-500/60 font-bold'
                            : 'hover:bg-slate-800/80 text-slate-300'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-white text-sm">{loc.locality}</div>
                          <div className="text-[11px] text-slate-400">{loc.district}, {loc.state}</div>
                        </div>
                        <span className="text-[10px] text-cyan-400 bg-cyan-950/60 px-2 py-1 rounded border border-cyan-500/30">
                          {loc.radarStationCode}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status Badge & Primary Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Severe Alert Status Pill */}
            <div
              className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl border text-xs font-extrabold tracking-wider ${hazard.bg}`}
              title={hazard.desc}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${hazard.dot}`} />
              <span>{hazard.text}</span>
            </div>

            {/* Live Scene Controls Button */}
            <button
              id="overview-scene-controls-toggle"
              type="button"
              onClick={() => setShowSceneControls(!showSceneControls)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                showSceneControls || conditionOverride || timeOfDayOverride
                  ? 'bg-cyan-500/30 text-cyan-200 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 border-white/15'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>SCENE CONTROLS</span>
            </button>

            {/* Jump to Advanced Meteorology */}
            <button
              id="overview-jump-advanced-btn"
              type="button"
              onClick={scrollToAdvanced}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600/20 hover:bg-indigo-600/35 text-indigo-200 border border-indigo-500/40 transition-all cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(99,102,241,0.3)]"
            >
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              <span>ADVANCED METEOROLOGY</span>
            </button>
          </div>
        </div>

        {/* Expandable Live Scene Simulation Overrides Bar */}
        {showSceneControls && (
          <div className="mt-4 p-4 bg-slate-900/90 rounded-xl border border-cyan-500/30 text-xs space-y-3 animate-in fade-in duration-200">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/10">
              <span className="text-cyan-400 font-bold uppercase tracking-wider text-[11px]">
                ATMOSPHERIC VISUAL ENVIRONMENT OVERRIDES
              </span>
              {(conditionOverride || timeOfDayOverride) && (
                <button
                  type="button"
                  onClick={() => {
                    onSelectConditionOverride(null);
                    onSelectTimeOfDayOverride(null);
                  }}
                  className="text-[11px] text-amber-300 hover:text-amber-200 underline cursor-pointer"
                >
                  Reset to Natural Simulation
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-400 text-xs font-semibold mr-1">Condition:</span>
              {[
                { cond: 'THUNDERSTORM', label: '⛈️ Thunderstorm' },
                { cond: 'RAIN', label: '🌧️ Heavy Rain' },
                { cond: 'CLOUDY', label: '☁️ Overcast' },
                { cond: 'PARTLY_CLOUDY', label: '🌤️ Partly Cloudy' },
                { cond: 'SUNNY', label: '☀️ Clear/Sunny' },
                { cond: 'FOG', label: '🌫️ Dense Fog' },
              ].map(({ cond, label }) => (
                <button
                  key={cond}
                  type="button"
                  onClick={() => onSelectConditionOverride(cond as WeatherCondition)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                    sceneState.condition === cond && conditionOverride === cond
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-extrabold shadow-md'
                      : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 border-white/10'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
              <span className="text-slate-400 text-xs font-semibold mr-1">Time of Day:</span>
              {[
                { tod: 'DAY', label: '☀️ Daytime' },
                { tod: 'NIGHT', label: '🌙 Night' },
                { tod: 'SUNSET', label: '🌇 Sunset' },
                { tod: 'SUNRISE', label: '🌅 Sunrise' },
              ].map(({ tod, label }) => (
                <button
                  key={tod}
                  type="button"
                  onClick={() => onSelectTimeOfDayOverride(tod as TimeOfDay)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                    sceneState.timeOfDay === tod && timeOfDayOverride === tod
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-md'
                      : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 border-white/10'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 2 & 3. CURRENT WEATHER HERO + KEY WEATHER METRICS (Balanced 2-Column Grid) */}
      {/* ========================================================================= */}
      <section
        id="overview-current-weather-hero-section"
        className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch"
      >
        {/* LEFT COLUMN: Current Weather Hero Card */}
        <div className="lg:col-span-6 bg-slate-950/80 border border-cyan-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 font-bold tracking-wider text-cyan-400">
                <Radio className="w-4 h-4 text-cyan-400" />
                <span>REAL-TIME NOWCAST OBSERVATION</span>
              </div>
              <span className="text-[11px] text-slate-400 capitalize">
                {sceneState.timeOfDay.toLowerCase()} • {location.radarStationCode} Uplink
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-6 mt-5">
              {/* Animated Weather Graphic */}
              <div className="shrink-0 p-4 rounded-3xl bg-white/5 border border-white/15 flex items-center justify-center shadow-inner">
                {renderWeatherIcon()}
              </div>

              {/* Temperature & Conditions */}
              <div>
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl sm:text-6xl font-black text-white tracking-tight">
                    {Math.round(atmosphere.temperatureC)}°C
                  </span>
                  <span className="text-sm sm:text-base text-slate-300 font-medium">
                    Feels like <span className="font-extrabold text-white text-lg">{Math.round(atmosphere.feelsLikeC)}°C</span>
                  </span>
                </div>

                <div className="flex items-center gap-2.5 mt-2">
                  <span className="text-sm sm:text-base font-extrabold text-cyan-300 uppercase tracking-wide">
                    {sceneState.condition.replace('_', ' ')}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-xs text-slate-300 bg-white/10 px-2 py-0.5 rounded-full">
                    Dew Point: {Math.round(atmosphere.dewPointC ?? 26)}°C
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-200 mt-3 font-sans leading-relaxed border-l-2 border-cyan-400 pl-3">
                  "{sceneState.description || 'Severe convective storm with active lightning & 70 km/h wind gusts'}"
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 mt-6 border-t border-white/10 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
              <Zap className="w-3.5 h-3.5" />
              <span>Convective cell growth: +12 dBZ/h</span>
            </div>
            <button
              type="button"
              onClick={onOpenEverydayWeather}
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition cursor-pointer font-bold"
            >
              <span>7-Day Synoptic</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Key Weather Metrics (Grid) */}
        <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* 1. Humidity */}
          <div className="bg-slate-950/80 border border-white/15 rounded-2xl p-4 shadow-xl backdrop-blur-xl flex flex-col justify-between hover:border-cyan-500/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">HUMIDITY</span>
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Droplets className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-black text-white">{atmosphere.humidityPct}%</div>
              <div className="text-[11px] text-slate-400 mt-1">
                {atmosphere.humidityPct > 80 ? 'Heavy moisture saturation' : 'Moderate ambient humidity'}
              </div>
            </div>
          </div>

          {/* 2. Wind */}
          <div className="bg-slate-950/80 border border-white/15 rounded-2xl p-4 shadow-xl backdrop-blur-xl flex flex-col justify-between hover:border-teal-500/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">WIND VELOCITY</span>
              <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                <Wind className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-black text-white">{atmosphere.windSpeedKmh} km/h</div>
              <div className="text-[11px] text-teal-300 mt-1 flex items-center gap-1 font-semibold">
                <Compass className="w-3.5 h-3.5" />
                <span>Bearing {atmosphere.windDirectionDeg}° • Gusts to 85 km/h</span>
              </div>
            </div>
          </div>

          {/* 3. UV Index */}
          <div className="bg-slate-950/80 border border-white/15 rounded-2xl p-4 shadow-xl backdrop-blur-xl flex flex-col justify-between hover:border-amber-500/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">UV INDEX</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Sun className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-black text-white">{atmosphere.uvIndex}</div>
              <div className="text-[11px] text-slate-400 mt-1">
                {atmosphere.uvIndex <= 2 ? 'Low exposure risk (attenuated by storm)' : 'Moderate UV level'}
              </div>
            </div>
          </div>

          {/* 4. Air Quality Index (AQI) */}
          <div className="bg-slate-950/80 border border-white/15 rounded-2xl p-4 shadow-xl backdrop-blur-xl flex flex-col justify-between hover:border-emerald-500/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">AIR QUALITY (AQI)</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">{atmosphere.aqi}</div>
              <div className="text-[11px] text-slate-400 mt-1">
                Good • Rain scouring PM2.5 particulates
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. SHORT-TERM FORECAST (NEXT 4+ HOURS STRIP)                              */}
      {/* ========================================================================= */}
      <section
        id="overview-short-term-forecast-section"
        className="bg-slate-950/75 border border-white/15 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-slate-200">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>HOURLY SHORT-TERM NOWCAST PREVIEW</span>
          </div>
          <span className="text-[11px] text-cyan-300 font-medium">
            Click any step to synchronize Digital Twin timeline
          </span>
        </div>

        {/* Forecast Strip: horizontal scroll on tiny screens, spacious grid on desktop */}
        <div className="mt-4 overflow-x-auto scrollbar-thin pb-1">
          <div className="grid grid-cols-7 gap-3 min-w-[650px]">
            {previewHours.map((h) => {
              const isActive = Math.abs(tOffsetMin - h.offset) < 25;
              return (
                <button
                  key={h.label}
                  type="button"
                  onClick={() => onSelectTimeOffset(h.offset)}
                  className={`p-3 rounded-xl border transition-all flex flex-col items-center justify-between gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-cyan-500/25 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] scale-105 font-bold'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-400">{h.label}</span>
                  <span className="text-2xl my-1">{h.icon}</span>
                  <span className="text-sm sm:text-base font-extrabold text-white">
                    {Math.round(h.tempC)}°C
                  </span>
                  
                  <div className="w-full pt-1 border-t border-white/10 flex flex-col items-center">
                    <span className="text-[10px] text-cyan-300 font-bold">
                      {h.rainProb}% Rain
                    </span>
                    {h.precipMmh > 0 && (
                      <span className="text-[9px] text-slate-400">
                        {h.precipMmh.toFixed(1)} mm/h
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. LIVE WEATHER MAP + PREMIUM LAYER CONTROLS (520px-620px Dedicated Box) */}
      {/* ========================================================================= */}
      <section id="overview-map-section" className="space-y-3">
        {/* Map Header + Action Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-1">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-cyan-400 uppercase">
              <Radio className="w-4 h-4 animate-pulse" />
              <span>LIVE WEATHER MAP & DOPPLER NOWCASTING</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">
              High-Resolution Interactive Meteorological Canvas
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* 3D Pitch Switcher */}
            <button
              id="overview-map-3d-btn"
              type="button"
              onClick={onToggle3d}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                is3d
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'bg-slate-900 text-slate-300 border-white/15 hover:bg-slate-800'
              }`}
            >
              <Compass className={`w-3.5 h-3.5 ${is3d ? 'rotate-45 text-cyan-400' : ''} transition-transform`} />
              <span>{is3d ? '3D PITCH' : '2D FLAT'}</span>
            </button>

            {/* Logical Secondary Action: Advanced Radar & Storm Intel */}
            <button
              id="overview-open-advanced-intel-btn"
              type="button"
              onClick={scrollToAdvanced}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 shadow-lg backdrop-blur-xl transition cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
              <span>ADVANCED RADAR & STORM INTEL</span>
            </button>
          </div>
        </div>

        {/* Dedicated Clean Map Layer Controls Toolbar (Above Map) */}
        <div className="bg-slate-950/85 border border-white/15 rounded-2xl p-3 shadow-xl backdrop-blur-xl flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-slate-300 tracking-wider">LAYER CONTROLS:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {layerItems.map((item) => {
              const isActive = !!mapLayers[item.key];
              return (
                <button
                  key={item.key}
                  id={`map-layer-pill-${item.key}`}
                  type="button"
                  onClick={() => toggleLayer(item.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    isActive
                      ? item.activeStyle
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                  }`}
                  title={`Toggle ${item.label} layer`}
                >
                  <span className="text-sm">{item.icon}</span>
                  <span>{item.label}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-black ${
                      isActive ? 'bg-black/20 text-current' : 'text-slate-500'
                    }`}
                  >
                    {isActive ? 'ON' : 'OFF'}
                  </span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={onResetMapLayers}
              className="text-[11px] text-slate-400 hover:text-white px-2 py-1 underline transition cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Dedicated Map Container (550px - 620px height, does not collapse!) */}
        <div className="relative w-full h-[520px] lg:h-[620px] min-h-[480px] rounded-2xl overflow-hidden border border-cyan-500/30 shadow-2xl bg-slate-950">
          <MeteorologicalMap
            location={location}
            layers={mapLayers}
            stormCells={stormCells}
            selectedStorm={selectedStormCell}
            onSelectStorm={onSelectStormCell}
            floodRisk={floodRisk}
            lightning={lightning}
            warning={warning}
            tOffsetMin={tOffsetMin}
            is3d={is3d}
            onToggle3d={onToggle3d}
            hideWarningBanner={true}
          />
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. ACTIVE THREAT / WARNING SECTION (Dedicated, Not Covering Map)          */}
      {/* ========================================================================= */}
      {warning && (
        <section
          id="overview-warning-section"
          className={`border rounded-2xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden transition-all ${
            warning.severity === 'WARNING' || warning.severity === 'EMERGENCY'
              ? 'bg-rose-950/70 border-rose-500/60 text-rose-100'
              : warning.severity === 'WATCH'
              ? 'bg-amber-950/70 border-amber-500/60 text-amber-100'
              : 'bg-slate-950/75 border-cyan-500/30 text-slate-200'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 shrink-0 mt-1">
                <AlertOctagon className="w-6 h-6 animate-pulse" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-500 text-slate-950">
                    {warning.severity} IN EFFECT
                  </span>
                  <span className="text-xs text-slate-300">
                    Sector: <span className="font-bold text-white">{warning.affectedArea || `${location.locality}, ${location.district}`}</span>
                  </span>
                </div>

                <h2 className="text-lg sm:text-xl font-extrabold text-white mt-1.5">
                  {warning.headline || 'Extreme Threat Window: Severe Convective Thunderstorm'}
                </h2>

                <p className="text-xs sm:text-sm text-slate-300 font-sans mt-1.5 max-w-3xl leading-relaxed">
                  High-reflectivity radar echoes (&gt;55 dBZ) and strong updraft vertical velocities indicate localized downburst winds (up to 85 km/h), rapid lightning flash rate intensification, and high urban runoff pooling.
                </p>
              </div>
            </div>

            {/* Badges Column */}
            <div className="flex flex-row md:flex-col items-center md:items-end gap-2 shrink-0">
              <div className="bg-black/40 border border-white/15 px-3 py-1.5 rounded-xl text-center">
                <div className="text-[10px] text-slate-400 font-medium">THREAT WINDOW</div>
                <div className="text-xs sm:text-sm font-extrabold text-amber-300">
                  T+{warning.timeWindowStartMin ?? 15}m → T+{warning.timeWindowEndMin ?? 105}m
                </div>
              </div>

              <div className="bg-black/40 border border-white/15 px-3 py-1.5 rounded-xl text-center">
                <div className="text-[10px] text-slate-400 font-medium">LEAD TIME & CONFIDENCE</div>
                <div className="text-xs sm:text-sm font-extrabold text-emerald-300">
                  {warning.leadTimeMinutes ?? 45}m • {warning.confidence || 'HIGH'}
                </div>
              </div>
            </div>
          </div>

          {/* Action Points */}
          <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-black/30 p-3 rounded-xl border border-white/10">
              <div className="font-bold text-white mb-1.5 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Primary Hazard Threats</span>
              </div>
              <ul className="space-y-1 text-slate-300 font-sans text-[11px]">
                <li>• Flash flooding in South Urban Velachery corridors (&gt;35mm in 45 min).</li>
                <li>• Cloud-to-ground lightning density within 4.5 km of residential zones.</li>
                <li>• Microburst wind gusts capable of dislodging weak branches and hoardings.</li>
              </ul>
            </div>

            <div className="bg-black/30 p-3 rounded-xl border border-white/10">
              <div className="font-bold text-white mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Civil Defense Action Protocol</span>
              </div>
              <ul className="space-y-1 text-slate-300 font-sans text-[11px]">
                <li>• Remain indoors away from open electrical lines and window panes.</li>
                <li>• Avoid low-lying underpasses and subterranean transit paths.</li>
                <li>• Monitor real-time radar sweeps and civic emergency broadcast alerts.</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 7. FUTURE EARTH DIGITAL TWIN TIMELINE (Dedicated Spacious Section)       */}
      {/* ========================================================================= */}
      <section id="overview-digital-twin-timeline-section" className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-cyan-400">
            <Sparkles className="w-4 h-4" />
            <span>4D SPATIO-TEMPORAL DIGITAL TWIN SIMULATION</span>
          </div>
          <span className="text-[11px] text-slate-400">
            From Doppler Historical Archive to +4h High-Res AI Nowcast
          </span>
        </div>

        <FutureEarthTimeline
          tOffsetMin={tOffsetMin}
          onChangeTime={onSelectTimeOffset}
          isPlaying={isPlaying}
          onTogglePlay={onTogglePlay}
          playbackSpeed={playbackSpeed}
          onChangeSpeed={onChangePlaybackSpeed}
          onReset={onResetTimeline}
        />
      </section>

      {/* ========================================================================= */}
      {/* 8. AI & ADVANCED METEOROLOGY INSIGHTS (Comprehensive Grid & Deep Dive)   */}
      {/* ========================================================================= */}
      <section
        ref={advancedSectionRef}
        id="overview-advanced-meteorology-section"
        className="space-y-4 pt-4 border-t border-white/10"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-indigo-400 uppercase">
              <Zap className="w-4 h-4" />
              <span>ADVANCED METEOROLOGICAL INTELLIGENCE & PHYSICS ENGINE</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">
              Deep Atmospheric Diagnostics & Causal Inference
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleAllPanels(false)}
              className="text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              Expand All
            </button>
            <button
              type="button"
              onClick={() => toggleAllPanels(true)}
              className="text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              Collapse All
            </button>
            <span className="text-xs text-slate-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl hidden sm:inline-block">
              CLIMORA Multi-Sensor Earth Observation
            </span>
          </div>
        </div>

        {/* Diagnostic Panels Grid with Collapsible Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Panel 1: Radar Doppler & Storm Cell DNA */}
          <div className="bg-slate-950/80 border border-cyan-500/30 rounded-2xl p-4 shadow-xl backdrop-blur-xl flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>STORM CELL DNA PROFILER</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 font-bold">
                    {primaryStorm?.lifecycle || 'MATURE'}
                  </span>
                  <button
                    type="button"
                    onClick={() => togglePanelCollapse('dna')}
                    className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
                    title={collapsedPanels['dna'] ? 'Expand panel' : 'Collapse panel'}
                  >
                    {collapsedPanels['dna'] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {!collapsedPanels['dna'] && (
                <div className="mt-3 space-y-2 text-xs animate-in fade-in duration-200">
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-slate-400">Centroid / Name:</span>
                    <span className="font-bold text-white">{primaryStorm?.name || 'Cell Alpha-1'}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-slate-400">Peak Reflectivity:</span>
                    <span className="font-bold text-amber-400">{primaryStorm?.maxReflectivityDbz || 58} dBZ</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-slate-400">Vertical Echo Top:</span>
                    <span className="font-bold text-cyan-300">{primaryStorm?.echoTopKm || 14.2} km</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-slate-400">Lightning Strike Rate:</span>
                    <span className="font-bold text-yellow-300">{primaryStorm?.lightningFlashesPerMin || 32} /min</span>
                  </div>
                </div>
              )}
            </div>

            {!collapsedPanels['dna'] && (
              <button
                id="overview-inspect-dna-btn"
                type="button"
                onClick={onOpenStormDna}
                className="w-full bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-500/50 text-cyan-200 font-bold py-2 px-3 rounded-xl transition flex items-center justify-between text-xs cursor-pointer shadow-sm mt-3"
              >
                <span>OPEN CELL DNA & VERTICAL SLICES</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Panel 2: Neuro-Symbolic "Why-Now" Explainability */}
          <div className="bg-slate-950/80 border border-indigo-500/30 rounded-2xl p-4 shadow-xl backdrop-blur-xl flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  <span>NEURO-SYMBOLIC EXPLAINABILITY</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30 font-bold">
                    Shapley + Logic
                  </span>
                  <button
                    type="button"
                    onClick={() => togglePanelCollapse('whynow')}
                    className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
                    title={collapsedPanels['whynow'] ? 'Expand panel' : 'Collapse panel'}
                  >
                    {collapsedPanels['whynow'] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {!collapsedPanels['whynow'] && (
                <div className="animate-in fade-in duration-200">
                  <p className="text-xs text-slate-300 font-sans mt-3 leading-relaxed">
                    Atmospheric instability is intensifying rapidly driven by boundary layer moisture convergence (TPW {atmosphere.tpwMm}mm) and high CAPE ({atmosphere.capeJkg} J/kg) interacting with coastal sea-breeze shear.
                  </p>

                  <div className="mt-3 space-y-1.5 text-[11px]">
                    <div className="flex justify-between text-slate-400">
                      <span>CAPE Instability Weight</span>
                      <span className="font-bold text-amber-300">42% (Primary Driver)</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: '42%' }} />
                    </div>

                    <div className="flex justify-between text-slate-400 mt-1">
                      <span>Radar Echo Gradient Growth</span>
                      <span className="font-bold text-cyan-300">31%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-400 rounded-full" style={{ width: '31%' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {!collapsedPanels['whynow'] && (
              <button
                id="overview-open-why-now-btn"
                type="button"
                onClick={onOpenWhyNow}
                className="w-full bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-500/50 text-indigo-200 font-bold py-2 px-3 rounded-xl transition flex items-center justify-between text-xs cursor-pointer shadow-sm mt-3"
              >
                <span>VIEW CAUSAL ATTRIBUTION HUB</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Panel 3: Atmospheric Sounding & Thermodynamics */}
          <div className="bg-slate-950/80 border border-cyan-500/30 rounded-2xl p-4 shadow-xl backdrop-blur-xl flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                  <Thermometer className="w-4 h-4 text-cyan-400" />
                  <span>ATMOSPHERIC SOUNDING & CAPE</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-mono">
                    DWR + ECMWF
                  </span>
                  <button
                    type="button"
                    onClick={() => togglePanelCollapse('sounding')}
                    className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
                    title={collapsedPanels['sounding'] ? 'Expand panel' : 'Collapse panel'}
                  >
                    {collapsedPanels['sounding'] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {!collapsedPanels['sounding'] && (
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs animate-in fade-in duration-200">
                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-white/5">
                    <div className="text-[10px] text-slate-400">SBCAPE</div>
                    <div className="text-base font-extrabold text-amber-400 mt-0.5">{atmosphere.capeJkg} J/kg</div>
                    <div className="text-[10px] text-slate-400">{atmosphere.stabilityIndex}</div>
                  </div>

                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-white/5">
                    <div className="text-[10px] text-slate-400">CIN (Barrier)</div>
                    <div className="text-base font-extrabold text-emerald-400 mt-0.5">{atmosphere.cinJkg} J/kg</div>
                    <div className="text-[10px] text-slate-400">Cap Barrier Broken</div>
                  </div>

                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-white/5">
                    <div className="text-[10px] text-slate-400">Precipitable Water</div>
                    <div className="text-base font-extrabold text-cyan-300 mt-0.5">{atmosphere.tpwMm} mm</div>
                    <div className="text-[10px] text-slate-400">High Atmospheric Water</div>
                  </div>

                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-white/5">
                    <div className="text-[10px] text-slate-400">0-6km Wind Shear</div>
                    <div className="text-base font-extrabold text-teal-300 mt-0.5">{atmosphere.windShearMs} m/s</div>
                    <div className="text-[10px] text-slate-400">Deep Layer Shear</div>
                  </div>
                </div>
              )}
            </div>

            {!collapsedPanels['sounding'] && (
              <button
                id="overview-open-atmosphere-btn"
                type="button"
                onClick={onOpenAtmosphere}
                className="w-full bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-500/50 text-cyan-200 font-bold py-2 px-3 rounded-xl transition flex items-center justify-between text-xs cursor-pointer shadow-sm mt-3"
              >
                <span>VIEW SKEW-T SOUNDING & HODOGRAPH</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Panel 4: Urban Flood Catchment Inundation */}
          <div className="bg-slate-950/80 border border-blue-500/30 rounded-2xl p-4 shadow-xl backdrop-blur-xl flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-300 font-bold text-xs">
                  <Waves className="w-4 h-4 text-blue-400" />
                  <span>URBAN FLOOD CATCHMENT RISK</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${
                    floodRisk.overallRisk === 'CRITICAL'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}>
                    {floodRisk.overallRisk} RISK
                  </span>
                  <button
                    type="button"
                    onClick={() => togglePanelCollapse('flood')}
                    className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
                    title={collapsedPanels['flood'] ? 'Expand panel' : 'Collapse panel'}
                  >
                    {collapsedPanels['flood'] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {!collapsedPanels['flood'] && (
                <div className="mt-3 space-y-2 text-xs animate-in fade-in duration-200">
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-slate-400">Catchment:</span>
                    <span className="font-bold text-white">Velachery South Basin</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-slate-400">Runoff Susceptibility:</span>
                    <span className="font-bold text-amber-400">{floodRisk.runoffSusceptibilityPct}%</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-slate-400">Drainage Capacity Saturated:</span>
                    <span className="font-bold text-rose-400">{floodRisk.drainageSaturationPct}%</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-slate-400">Peak Runoff Arrival:</span>
                    <span className="font-bold text-cyan-300">T+35 min</span>
                  </div>
                </div>
              )}
            </div>

            {!collapsedPanels['flood'] && (
              <button
                id="overview-open-flood-btn"
                type="button"
                onClick={onOpenFlood}
                className="w-full bg-blue-950/50 hover:bg-blue-900/60 border border-blue-500/50 text-blue-200 font-bold py-2 px-3 rounded-xl transition flex items-center justify-between text-xs cursor-pointer shadow-sm mt-3"
              >
                <span>EXPAND FLOOD INUNDATION MODEL</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Panel 5: Total Lightning Intelligence */}
          <div className="bg-slate-950/80 border border-yellow-500/30 rounded-2xl p-4 shadow-xl backdrop-blur-xl flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-yellow-300 font-bold text-xs">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span>TOTAL LIGHTNING INTEL (CG + IC)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded border border-yellow-500/30 font-bold">
                    {lightning.activityLevel}
                  </span>
                  <button
                    type="button"
                    onClick={() => togglePanelCollapse('lightning')}
                    className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
                    title={collapsedPanels['lightning'] ? 'Expand panel' : 'Collapse panel'}
                  >
                    {collapsedPanels['lightning'] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {!collapsedPanels['lightning'] && (
                <div className="mt-3 space-y-2 text-xs animate-in fade-in duration-200">
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-slate-400">Strike Discharge Rate:</span>
                    <span className="font-bold text-yellow-300 text-sm">{lightning.strikeRatePerMin} /min</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-slate-400">Activity Trend:</span>
                    <span className="font-bold text-amber-400">{lightning.trend}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-slate-400">30-30 Safety Perimeter:</span>
                    <span className="font-bold text-cyan-300">{lightning.safetyRadiusKm} km</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-slate-400">Last Discharge:</span>
                    <span className="font-bold text-slate-200">{lightning.lastDetectionSecAgo}s ago</span>
                  </div>
                </div>
              )}
            </div>

            {!collapsedPanels['lightning'] && (
              <button
                id="overview-open-lightning-btn"
                type="button"
                onClick={onOpenLightning}
                className="w-full bg-yellow-950/50 hover:bg-yellow-900/60 border border-yellow-500/50 text-yellow-200 font-bold py-2 px-3 rounded-xl transition flex items-center justify-between text-xs cursor-pointer shadow-sm mt-3"
              >
                <span>INSPECT TOTAL LIGHTNING ARRAY</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Panel 6: Verification & Skill Scorecard */}
          <div className="bg-slate-950/80 border border-emerald-500/30 rounded-2xl p-4 shadow-xl backdrop-blur-xl flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  <span>MODEL VERIFICATION & SKILL</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                    Brier Score: 0.08
                  </span>
                  <button
                    type="button"
                    onClick={() => togglePanelCollapse('verification')}
                    className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
                    title={collapsedPanels['verification'] ? 'Expand panel' : 'Collapse panel'}
                  >
                    {collapsedPanels['verification'] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {!collapsedPanels['verification'] && (
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs animate-in fade-in duration-200">
                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-white/5">
                    <div className="text-[10px] text-slate-400">Critical Success (CSI)</div>
                    <div className="text-base font-extrabold text-emerald-400 mt-0.5">0.88</div>
                    <div className="text-[10px] text-slate-400">Exceeds NWP baseline</div>
                  </div>

                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-white/5">
                    <div className="text-[10px] text-slate-400">Prob of Detection (POD)</div>
                    <div className="text-base font-extrabold text-cyan-300 mt-0.5">0.92</div>
                    <div className="text-[10px] text-slate-400">High Sensitivity</div>
                  </div>

                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-white/5">
                    <div className="text-[10px] text-slate-400">False Alarm Ratio (FAR)</div>
                    <div className="text-base font-extrabold text-amber-400 mt-0.5">0.11</div>
                    <div className="text-[10px] text-slate-400">Low False Positives</div>
                  </div>

                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-white/5">
                    <div className="text-[10px] text-slate-400">Lead Time Advantage</div>
                    <div className="text-base font-extrabold text-teal-300 mt-0.5">+45 min</div>
                    <div className="text-[10px] text-slate-400">Ahead of Conventional</div>
                  </div>
                </div>
              )}
            </div>

            {!collapsedPanels['verification'] && (
              <button
                id="overview-open-verification-btn"
                type="button"
                onClick={onOpenVerification}
                className="w-full bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/50 text-emerald-200 font-bold py-2 px-3 rounded-xl transition flex items-center justify-between text-xs cursor-pointer shadow-sm mt-3"
              >
                <span>AUDIT HISTORICAL SKILL SCORECARD</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. ADDITIONAL INTELLIGENCE / QUICK ACCESS LAUNCHERS                       */}
      {/* ========================================================================= */}
      <section
        id="overview-additional-intelligence-section"
        className="bg-slate-950/75 border border-white/15 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl"
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs">
          <div className="flex items-center gap-2 text-cyan-400 font-bold tracking-wider">
            <Globe className="w-4 h-4" />
            <span>ADDITIONAL SPECIALIZED METEOROLOGICAL MODULES</span>
          </div>
          <span className="text-[11px] text-slate-400">Instant Full-Screen Modals</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          <button
            id="quick-launch-futures"
            type="button"
            onClick={onOpenFutures}
            className="p-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-slate-700/80 hover:border-cyan-500/50 text-slate-200 flex items-center justify-between transition group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/15 text-cyan-400 group-hover:scale-110 transition-transform">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="font-bold text-white text-xs">Ensemble Scenarios</div>
                <div className="text-[11px] text-slate-400">Probabilistic Model A / B / C</div>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-300 transition-colors" />
          </button>

          <button
            id="quick-launch-health"
            type="button"
            onClick={onOpenDataHealth}
            className="p-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-slate-700/80 hover:border-emerald-500/50 text-slate-200 flex items-center justify-between transition group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="font-bold text-white text-xs">Sensor Health Network</div>
                <div className="text-[11px] text-slate-400">6 IMD & INSAT Uplinks Online</div>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-300 transition-colors" />
          </button>

          <button
            id="quick-launch-everyday"
            type="button"
            onClick={onOpenEverydayWeather}
            className="p-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-slate-700/80 hover:border-amber-500/50 text-slate-200 flex items-center justify-between transition group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/15 text-amber-400 group-hover:scale-110 transition-transform">
                <Thermometer className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="font-bold text-white text-xs">Extended Synoptic Outlook</div>
                <div className="text-[11px] text-slate-400">7-Day Meteorological Outlook</div>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-300 transition-colors" />
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. FOOTER / SYSTEM STATUS                                                */}
      {/* ========================================================================= */}
      <footer
        id="overview-system-status-footer"
        className="pt-6 pb-12 border-t border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs text-slate-400"
      >
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <div className="font-bold text-slate-200">
              CLIMORA STORM-MIND • OPERATIONAL DIGITAL TWIN PLATFORM
            </div>
            <div className="text-[11px] text-slate-400">
              National Severe Weather Probabilistic Nowcasting System • v3.4.2
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
          <span>DWR S-Band (2.8 GHz) CHN: Online</span>
          <span>•</span>
          <span>INSAT-3DR Geostationary: Calibrated</span>
          <span>•</span>
          <span>Latency: 142ms</span>
          <span>•</span>
          <span>Refresh: 60s Interval</span>
        </div>
      </footer>

    </div>
  );
};
