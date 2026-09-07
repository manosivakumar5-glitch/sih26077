import React, { useState, useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import {
  AtmosphericState,
  FloodRiskAssessment,
  LightningIntelligence,
  LocationInfo,
  MapLayerState,
  WarningNotice,
} from '../../types/weather';
import { MeteorologicalMap } from '../map/MeteorologicalMap';
import { SatelliteCloudCanvas } from '../map/SatelliteCloudCanvas';
import { LayerController } from '../map/LayerController';
import { QuickCitySelector } from '../common/QuickCitySelector';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Globe,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Thermometer,
  Wind,
} from 'lucide-react';

interface SatelliteViewProps {
  location: LocationInfo;
  onSelectLocation?: (location: LocationInfo) => void;
  layers: MapLayerState;
  onChangeLayers: (layers: MapLayerState) => void;
  atmosphere?: AtmosphericState;
  floodRisk?: FloodRiskAssessment;
  lightning?: LightningIntelligence;
  warning?: WarningNotice;
  tOffsetMin: number;
  onChangeTOffsetMin?: (offset: number) => void;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  playbackSpeed?: number;
  onChangePlaybackSpeed?: (speed: number) => void;
  is3d?: boolean;
  onToggle3d?: () => void;
  onNavigateToOverview?: () => void;
}

export const SatelliteView: React.FC<SatelliteViewProps> = ({
  location,
  onSelectLocation,
  layers,
  onChangeLayers,
  atmosphere,
  floodRisk,
  lightning,
  warning,
  tOffsetMin,
  onChangeTOffsetMin,
  isPlaying = false,
  onTogglePlay,
  playbackSpeed = 1,
  onChangePlaybackSpeed,
  is3d = false,
  onToggle3d,
  onNavigateToOverview,
}) => {
  const [mapInstance, setMapInstance] = useState<maplibregl.Map | null>(null);
  const [channel, setChannel] = useState<'VIS' | 'IR' | 'WV' | 'GEOCOLOR'>('VIS');
  const [isTelemetryCollapsed, setIsTelemetryCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Local timeline offset fallback
  const [localOffset, setLocalOffset] = useState(tOffsetMin);
  const effectiveOffset = onChangeTOffsetMin ? tOffsetMin : localOffset;

  const handleSetOffset = (val: number) => {
    if (onChangeTOffsetMin) onChangeTOffsetMin(val);
    else setLocalOffset(val);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {
        setIsFullscreen(!isFullscreen);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const satelliteTimelineSteps = [
    { label: '-60m', offset: -60 },
    { label: '-45m', offset: -45 },
    { label: '-30m', offset: -30 },
    { label: '-15m', offset: -15 },
    { label: 'NOW', offset: 0 },
    { label: '+15m', offset: 15 },
    { label: '+30m', offset: 30 },
  ];

  const cloudTopTemp = atmosphere?.cloudTopTempC ?? -68.4;
  const cloudCover = atmosphere?.cloudCoverPct ?? 82;

  // Safe defaults
  const safeFloodRisk: FloodRiskAssessment = floodRisk ?? {
    overallRisk: 'LOW',
    accumulatedRainfallMm: 0,
    runoffSusceptibilityPct: 15,
    lowLyingVulnerabilityPct: 20,
    drainageSaturationPct: 25,
    affectedCatchments: [],
  };

  const safeLightning: LightningIntelligence = lightning ?? {
    activityLevel: 'MINIMAL',
    strikeRatePerMin: 0,
    trend: 'STABLE',
    chargeSeparationEstKvM: 20,
    safetyRadiusKm: 5,
    lastDetectionSecAgo: 300,
    highDensityZones: [],
  };

  const safeWarning: WarningNotice = warning ?? {
    id: 'WARN-SAT-DEFAULT',
    hazardType: 'Satellite Convective Tracking',
    severity: 'ADVISORY',
    headline: `INSAT-3DR Multispectral Monitoring: ${location.locality}`,
    affectedArea: `${location.locality}, ${location.district}`,
    timeWindowStartMin: 0,
    timeWindowEndMin: 180,
    potentialImpacts: ['High cloud-top cooling observed in coastal corridor.'],
    recommendedActions: ['Monitor regional radar and satellite updates.'],
    probabilityPct: 40,
    confidence: 'HIGH',
    uncertaintyNote: 'Derived from 15-minute sector scan telemetry.',
    reasons: ['Deep convective cloud tops below -65°C detected.'],
    leadTimeMinutes: 60,
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full flex flex-col font-mono-code select-none overflow-hidden bg-slate-950 ${
        isFullscreen ? 'fixed inset-0 z-50 h-screen' : 'h-full flex-1 min-h-[500px]'
      }`}
    >
      {/* 1. TOP COMMAND BAR */}
      <header className="relative z-30 flex flex-wrap items-center justify-between gap-2.5 px-4 py-2 bg-slate-950/90 border-b border-sky-500/30 backdrop-blur-2xl text-xs shadow-lg">
        {/* Left: Brand & Navigation */}
        <div className="flex items-center gap-2.5">
          {onNavigateToOverview && (
            <button
              type="button"
              id="sat-back-to-overview-btn"
              onClick={onNavigateToOverview}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 hover:text-white transition cursor-pointer"
              title="Return to Command Center Overview"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">OVERVIEW</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-sky-400 animate-spin-slow" />
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold text-white text-sm tracking-wider">CLIMORA</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold tracking-normal">
                SATELLITE EARTH
              </span>
            </div>
          </div>

          {/* Quick City Selector Dropdown */}
          {onSelectLocation && (
            <QuickCitySelector
              currentLocation={location}
              onSelectLocation={onSelectLocation}
            />
          )}

          <span className="hidden lg:inline-flex text-[10px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 font-mono">
            INSAT-3DR / 3DS (74°E) • L1B CALIBRATED
          </span>
        </div>

        {/* Center: Multispectral Channels */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-white/15">
          {[
            { id: 'VIS', label: '1. VISIBLE (0.65µm)' },
            { id: 'IR', label: '2. INFRARED (10.8µm)' },
            { id: 'WV', label: '3. WATER VAPOR (6.2µm)' },
            { id: 'GEOCOLOR', label: '4. GEOCOLOR TRUE' },
          ].map((ch) => (
            <button
              key={ch.id}
              type="button"
              id={`sat-channel-${ch.id.toLowerCase()}`}
              onClick={() => setChannel(ch.id as any)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition border cursor-pointer ${
                channel === ch.id
                  ? 'bg-sky-500 text-slate-950 border-sky-300 font-bold shadow-[0_0_10px_rgba(14,165,233,0.4)]'
                  : 'bg-transparent border-transparent text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {ch.label}
            </button>
          ))}
        </div>

        {/* Right: Enhancements & Fullscreen */}
        <div className="flex items-center gap-1.5">
          {onToggle3d && (
            <button
              type="button"
              onClick={onToggle3d}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                is3d
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:text-white'
              }`}
            >
              {is3d ? '3D' : '2D'}
            </button>
          )}

          <button
            type="button"
            id="sat-fullscreen-toggle-btn"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 hover:text-white transition cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen Viewport'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* 2. SATELLITE EARTH MAP & CLOUD VIEWPORT */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        {/* High-Resolution Satellite Basemap */}
        <MeteorologicalMap
          location={location}
          layers={{ ...layers, clouds: true, radar: false }}
          stormCells={[]}
          selectedStorm={null}
          onSelectStorm={() => {}}
          floodRisk={safeFloodRisk}
          lightning={safeLightning}
          warning={safeWarning}
          tOffsetMin={effectiveOffset}
          is3d={is3d}
          onToggle3d={onToggle3d ?? (() => {})}
          baseMapStyle="SATELLITE"
          onMapReady={(map) => setMapInstance(map)}
        />

        {/* Animated Multispectral Cloud Deck Canvas Overlay */}
        <SatelliteCloudCanvas
          map={mapInstance}
          location={location}
          channel={channel}
          tOffsetMin={effectiveOffset}
          atmosphere={atmosphere}
        />

        {/* Left Side: Floating Layer Controller */}
        <div className="absolute top-4 left-4 z-20">
          <LayerController
            layers={layers}
            onChange={onChangeLayers}
            onReset={() => {}}
          />
        </div>

        {/* Right Side: Floating Collapsible Satellite Telemetry Panel */}
        <div className="absolute top-4 right-4 z-20 transition-all duration-300">
          {isTelemetryCollapsed ? (
            <button
              type="button"
              id="expand-sat-telemetry-btn"
              onClick={() => setIsTelemetryCollapsed(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-950/90 border border-sky-500/40 text-sky-300 shadow-2xl backdrop-blur-xl text-xs font-bold hover:bg-slate-900 transition cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              <span>INSAT-3DR • {cloudTopTemp.toFixed(1)}°C TOP</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          ) : (
            <div className="w-80 bg-[#070f20]/95 border border-white/20 rounded-2xl p-3.5 shadow-2xl backdrop-blur-2xl flex flex-col gap-2.5 max-h-[calc(100vh-220px)] overflow-y-auto scrollbar-thin text-xs">
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-bold text-sky-300">
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-sky-400" />
                  <span>INSAT-3DR MULTISPECTRAL</span>
                </div>
                <button
                  type="button"
                  id="collapse-sat-telemetry-btn"
                  onClick={() => setIsTelemetryCollapsed(true)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
                  title="Collapse Panel for 100% Clear Map"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
              </div>

              {/* Channel Summary */}
              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px]">ACTIVE MULTISPECTRAL BAND</span>
                <div className="font-bold text-white mt-0.5">
                  {channel === 'VIS'
                    ? 'VIS (Visible 0.65 µm High-Albedo Optical)'
                    : channel === 'IR'
                    ? 'TIR-1 (Thermal IR 10.8 µm Brightness Temp)'
                    : channel === 'WV'
                    ? 'MIR-WV (Water Vapor 6.2 µm Troposphere)'
                    : 'RGB Natural Multispectral Color Composite'}
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px]">CLOUD TOP TEMP</span>
                  <div className="font-bold text-cyan-300 text-sm mt-0.5">
                    {cloudTopTemp.toFixed(1)}°C
                  </div>
                  <div className="text-[9px] text-rose-400 mt-0.5">Deep convective cooling</div>
                </div>
                <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px]">CLOUD COVERAGE</span>
                  <div className="font-bold text-slate-200 text-sm mt-0.5">
                    {cloudCover}%
                  </div>
                  <div className="text-[9px] text-emerald-400 mt-0.5">Overcast boundary</div>
                </div>
              </div>

              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[10px]">CONVECTIVE EQUILIBRIUM LEVEL</span>
                  <span className="font-bold text-amber-300 text-xs">14,800 m</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Overshooting cumulonimbus cloud top penetrating tropopause layer.
                </div>
              </div>

              {/* Color Enhancement Legend */}
              <div className="pt-2 border-t border-white/10 space-y-1 text-[10px]">
                <div className="flex justify-between text-slate-400 font-bold">
                  <span>
                    {channel === 'IR'
                      ? 'BRIGHTNESS TEMPERATURE'
                      : channel === 'WV'
                      ? 'MOISTURE FLUX EDDY'
                      : 'ALBEDO REFLECTANCE'}
                  </span>
                  <span className="font-mono text-sky-400">{channel}</span>
                </div>
                <div
                  className={`h-3 w-full rounded ${
                    channel === 'IR'
                      ? 'bg-gradient-to-r from-red-600 via-yellow-400 via-cyan-400 via-blue-600 to-indigo-900'
                      : channel === 'WV'
                      ? 'bg-gradient-to-r from-slate-800 via-sky-600 to-teal-300'
                      : 'bg-gradient-to-r from-slate-900 via-slate-400 to-white'
                  }`}
                />
                <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                  {channel === 'IR' ? (
                    <>
                      <span>+30°C</span>
                      <span>0°C</span>
                      <span>-40°C</span>
                      <span>-75°C (Extreme)</span>
                    </>
                  ) : channel === 'WV' ? (
                    <>
                      <span>Dry Air</span>
                      <span>Mid Vapor</span>
                      <span>Deep Eddy</span>
                    </>
                  ) : (
                    <>
                      <span>0% Dark Ground</span>
                      <span>50% Mid Cloud</span>
                      <span>100% Anvil Albedo</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. BOTTOM FLOATING SATELLITE TIMELINE SCRUBBER */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 w-[calc(100%-2rem)] max-w-3xl">
          <div className="bg-[#070f20]/95 border border-sky-500/35 rounded-2xl p-3 shadow-2xl backdrop-blur-2xl flex flex-col gap-2.5">
            {/* Upper Timeline Row: Play / Pause, Steps, Speed */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {onTogglePlay && (
                  <button
                    type="button"
                    id="sat-play-pause-btn"
                    onClick={onTogglePlay}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer shadow-md ${
                      isPlaying
                        ? 'bg-amber-500 text-slate-950 border border-amber-400'
                        : 'bg-sky-500 hover:bg-sky-400 text-slate-950 border border-sky-300'
                    }`}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isPlaying ? 'PAUSE' : 'PLAY LOOP'}</span>
                  </button>
                )}

                <div className="px-2.5 py-1 rounded-xl bg-slate-900 border border-white/10 text-xs">
                  <span className="text-slate-400">FRAME: </span>
                  <span className={`font-bold font-mono ${effectiveOffset === 0 ? 'text-emerald-400' : effectiveOffset > 0 ? 'text-sky-300' : 'text-amber-300'}`}>
                    {effectiveOffset === 0 ? 'LIVE RAPID SCAN (T+0)' : effectiveOffset > 0 ? `+${effectiveOffset}m ADVANCE` : `${effectiveOffset}m ARCHIVE`}
                  </span>
                </div>
              </div>

              {/* Step Buttons */}
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                {satelliteTimelineSteps.map((step) => {
                  const isActive = effectiveOffset === step.offset;
                  return (
                    <button
                      key={step.offset}
                      type="button"
                      id={`sat-timeline-step-${step.offset}`}
                      onClick={() => handleSetOffset(step.offset)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                        isActive
                          ? 'bg-sky-500 text-slate-950 border-sky-300 font-bold shadow-[0_0_10px_rgba(14,165,233,0.4)]'
                          : 'bg-slate-900/80 border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {step.label}
                    </button>
                  );
                })}
              </div>

              {/* Speed Controls */}
              {onChangePlaybackSpeed && (
                <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-xl border border-white/10 text-[10px]">
                  {[0.5, 1, 2].map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => onChangePlaybackSpeed(spd)}
                      className={`px-2 py-0.5 rounded-lg font-bold transition cursor-pointer ${
                        playbackSpeed === spd
                          ? 'bg-sky-500 text-slate-950'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Scrubber Track */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-slate-400 font-mono">-60m</span>
              <input
                type="range"
                min={-60}
                max={30}
                step={5}
                value={effectiveOffset}
                onChange={(e) => handleSetOffset(Number(e.target.value))}
                className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
              <span className="text-[10px] text-slate-400 font-mono">+30m</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
