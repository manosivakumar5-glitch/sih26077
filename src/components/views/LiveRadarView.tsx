import React, { useState, useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import {
  FloodRiskAssessment,
  LightningIntelligence,
  LocationInfo,
  MapLayerState,
  StormCell,
  WarningNotice,
} from '../../types/weather';
import { MeteorologicalMap } from '../map/MeteorologicalMap';
import { WeatherRadarCanvas } from '../map/WeatherRadarCanvas';
import { LayerController } from '../map/LayerController';
import { QuickCitySelector } from '../common/QuickCitySelector';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Compass,
  Eye,
  FastForward,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Radio,
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react';

interface LiveRadarViewProps {
  location: LocationInfo;
  onSelectLocation?: (location: LocationInfo) => void;
  layers: MapLayerState;
  onChangeLayers: (layers: MapLayerState) => void;
  stormCells: StormCell[];
  selectedStorm: StormCell | null;
  onSelectStorm: (storm: StormCell) => void;
  floodRisk: FloodRiskAssessment;
  lightning: LightningIntelligence;
  warning: WarningNotice;
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

export const LiveRadarView: React.FC<LiveRadarViewProps> = ({
  location,
  onSelectLocation,
  layers,
  onChangeLayers,
  stormCells,
  selectedStorm,
  onSelectStorm,
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
  const [radarMode, setRadarMode] = useState<'REFLECTIVITY' | 'VELOCITY' | 'ECHO_TOPS' | 'VIL'>('REFLECTIVITY');
  const [showSweep, setShowSweep] = useState(true);
  const [showRangeRings, setShowRangeRings] = useState(true);
  const [isTelemetryCollapsed, setIsTelemetryCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Local timeline loop if parent doesn't provide it
  const [localOffset, setLocalOffset] = useState(tOffsetMin);
  const effectiveOffset = onChangeTOffsetMin ? tOffsetMin : localOffset;

  const handleSetOffset = (val: number) => {
    if (onChangeTOffsetMin) onChangeTOffsetMin(val);
    else setLocalOffset(val);
  };

  // Fullscreen toggle
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

  const timelineSteps = [
    { label: '-30m', offset: -30 },
    { label: '-15m', offset: -15 },
    { label: 'NOW', offset: 0 },
    { label: '+15m', offset: 15 },
    { label: '+30m', offset: 30 },
    { label: '+45m', offset: 45 },
    { label: '+60m', offset: 60 },
  ];

  return (
    <div
      ref={containerRef}
      className={`relative w-full flex flex-col font-mono-code select-none overflow-hidden bg-slate-950 ${
        isFullscreen ? 'fixed inset-0 z-50 h-screen' : 'h-full flex-1 min-h-[500px]'
      }`}
    >
      {/* 1. TOP COMMAND BAR */}
      <header className="relative z-30 flex flex-wrap items-center justify-between gap-2.5 px-4 py-2 bg-slate-950/90 border-b border-cyan-500/30 backdrop-blur-2xl text-xs shadow-lg">
        {/* Left: Brand & Navigation */}
        <div className="flex items-center gap-2.5">
          {onNavigateToOverview && (
            <button
              type="button"
              id="radar-back-to-overview-btn"
              onClick={onNavigateToOverview}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 hover:text-white transition cursor-pointer"
              title="Return to Command Center Overview"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">OVERVIEW</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold text-white text-sm tracking-wider">CLIMORA</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold tracking-normal">
                LIVE RADAR
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

          <span className="hidden lg:inline-flex text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
            STATION {location.radarStationCode} • S-BAND 2.8 GHz
          </span>
        </div>

        {/* Center: Radar Modes */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-white/15">
          {(
            [
              { id: 'REFLECTIVITY', label: 'REFLECTIVITY (dBZ)' },
              { id: 'VELOCITY', label: 'VELOCITY (DOPPLER)' },
              { id: 'ECHO_TOPS', label: 'ECHO TOPS' },
              { id: 'VIL', label: 'VIL DENSITY' },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              type="button"
              id={`radar-mode-${m.id.toLowerCase()}`}
              onClick={() => setRadarMode(m.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition border cursor-pointer ${
                radarMode === m.id
                  ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-bold shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                  : 'bg-transparent border-transparent text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Right: Map Enhancements & Fullscreen */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowSweep(!showSweep)}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
              showSweep
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-white/5 text-slate-400 border-white/10'
            }`}
            title="Toggle Rotating Doppler Radar Sweep"
          >
            SWEEP {showSweep ? 'ON' : 'OFF'}
          </button>

          <button
            type="button"
            onClick={() => setShowRangeRings(!showRangeRings)}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer hidden md:inline-flex ${
              showRangeRings
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-white/5 text-slate-400 border-white/10'
            }`}
            title="Toggle Range Rings (25km, 50km, 100km, 150km)"
          >
            RINGS {showRangeRings ? 'ON' : 'OFF'}
          </button>

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
            id="radar-fullscreen-toggle-btn"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 hover:text-white transition cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen Viewport'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* 2. MAP & RADAR CANVAS VIEWPORT */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        {/* Base MapLibre Cartographic Map */}
        <MeteorologicalMap
          location={location}
          layers={{ ...layers, radar: true }}
          stormCells={stormCells ?? []}
          selectedStorm={selectedStorm}
          onSelectStorm={(storm) => {
            if (storm) onSelectStorm(storm);
          }}
          floodRisk={floodRisk}
          lightning={lightning}
          warning={warning}
          tOffsetMin={effectiveOffset}
          is3d={is3d}
          onToggle3d={onToggle3d ?? (() => {})}
          baseMapStyle="DARK"
          onMapReady={(map) => setMapInstance(map)}
        />

        {/* Real-Time Doppler Weather Radar Canvas Overlay */}
        <WeatherRadarCanvas
          map={mapInstance}
          location={location}
          stormCells={stormCells ?? []}
          tOffsetMin={effectiveOffset}
          isPlaying={isPlaying}
          radarMode={radarMode}
          showSweep={showSweep}
          showRangeRings={showRangeRings}
          onSelectStorm={onSelectStorm}
        />

        {/* Left Side: Floating Layer Controller */}
        <div className="absolute top-4 left-4 z-20">
          <LayerController
            layers={layers}
            onChange={onChangeLayers}
            onReset={() => {}}
          />
        </div>

        {/* Right Side: Floating Collapsible Telemetry & Convective DNA Panel */}
        <div className="absolute top-4 right-4 z-20 transition-all duration-300">
          {isTelemetryCollapsed ? (
            <button
              type="button"
              id="expand-radar-telemetry-btn"
              onClick={() => setIsTelemetryCollapsed(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-950/90 border border-cyan-500/40 text-cyan-300 shadow-2xl backdrop-blur-xl text-xs font-bold hover:bg-slate-900 transition cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{stormCells.length} CELLS • MAX 68 dBZ</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          ) : (
            <div className="w-80 bg-[#070f20]/95 border border-white/20 rounded-2xl p-3.5 shadow-2xl backdrop-blur-2xl flex flex-col gap-2.5 max-h-[calc(100vh-220px)] overflow-y-auto scrollbar-thin">
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-bold text-amber-300">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>DETECTED STORM CELLS ({stormCells.length})</span>
                </div>
                <button
                  type="button"
                  id="collapse-radar-telemetry-btn"
                  onClick={() => setIsTelemetryCollapsed(true)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
                  title="Collapse Panel for 100% Clear Map"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
              </div>

              {/* Storm Cells List */}
              <div className="space-y-2">
                {stormCells.map((cell) => (
                  <div
                    key={cell.id}
                    className="bg-slate-900/90 border border-slate-700/80 hover:border-amber-500/60 rounded-xl p-2.5 transition flex flex-col gap-2 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-bold text-white text-xs">{cell.name}</span>
                        <div className="text-[10px] text-slate-400">
                          {cell.speedKmh} km/h • Heading {cell.directionDeg}°
                        </div>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold font-mono">
                        {cell.maxReflectivityDbz} dBZ
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-300">
                      <div className="bg-slate-950/70 p-1.5 rounded">
                        <span className="text-slate-500">STAGE: </span>
                        <span className="font-semibold text-amber-300">{cell.lifecycle}</span>
                      </div>
                      <div className="bg-slate-950/70 p-1.5 rounded">
                        <span className="text-slate-500">LIGHTNING: </span>
                        <span className="font-semibold text-yellow-300">{cell.lightningFlashesPerMin}/min</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      id={`open-radar-dna-${cell.id}`}
                      onClick={() => onSelectStorm(cell)}
                      className="w-full py-1 px-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-[11px] font-bold transition flex items-center justify-between cursor-pointer"
                    >
                      <span>INSPECT CELL DNA</span>
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Reflectivity Scale Legend */}
              <div className="pt-2 border-t border-white/10 text-[10px] space-y-1">
                <div className="flex items-center justify-between text-slate-300 font-bold">
                  <span>METEOROLOGICAL COLOR SCALE</span>
                  <span className="text-cyan-400 font-mono">dBZ</span>
                </div>
                <div className="h-3 w-full rounded bg-gradient-to-r from-sky-400 via-emerald-400 via-yellow-400 via-orange-500 via-rose-500 to-purple-600" />
                <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                  <span>10 Light</span>
                  <span>30 Mod</span>
                  <span>45 Heavy</span>
                  <span>65+ Extreme</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. BOTTOM FLOATING RADAR TIMELINE SCRUBBER */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 w-[calc(100%-2rem)] max-w-3xl">
          <div className="bg-[#070f20]/95 border border-cyan-500/35 rounded-2xl p-3 shadow-2xl backdrop-blur-2xl flex flex-col gap-2.5">
            {/* Upper Timeline Row: Play / Pause, Steps, Speed */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              {/* Play / Pause & Timestamp */}
              <div className="flex items-center gap-2">
                {onTogglePlay && (
                  <button
                    type="button"
                    id="radar-play-pause-btn"
                    onClick={onTogglePlay}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer shadow-md ${
                      isPlaying
                        ? 'bg-amber-500 text-slate-950 border border-amber-400'
                        : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 border border-cyan-300'
                    }`}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isPlaying ? 'PAUSE' : 'PLAY LOOP'}</span>
                  </button>
                )}

                <div className="px-2.5 py-1 rounded-xl bg-slate-900 border border-white/10 text-xs">
                  <span className="text-slate-400">OFFSET: </span>
                  <span className={`font-bold font-mono ${effectiveOffset === 0 ? 'text-emerald-400' : effectiveOffset > 0 ? 'text-cyan-300' : 'text-amber-300'}`}>
                    {effectiveOffset === 0 ? 'NOW (T+0)' : effectiveOffset > 0 ? `+${effectiveOffset}m FORECAST` : `${effectiveOffset}m ARCHIVE`}
                  </span>
                </div>
              </div>

              {/* Step Buttons (-30m to +60m) */}
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                {timelineSteps.map((step) => {
                  const isActive = effectiveOffset === step.offset;
                  return (
                    <button
                      key={step.offset}
                      type="button"
                      id={`radar-timeline-step-${step.offset}`}
                      onClick={() => handleSetOffset(step.offset)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                        isActive
                          ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-bold shadow-[0_0_10px_rgba(6,182,212,0.4)]'
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
                          ? 'bg-cyan-500 text-slate-950'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Continuous Scrubber Track */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-slate-400 font-mono">-30m</span>
              <input
                type="range"
                min={-30}
                max={60}
                step={5}
                value={effectiveOffset}
                onChange={(e) => handleSetOffset(Number(e.target.value))}
                className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <span className="text-[10px] text-slate-400 font-mono">+60m</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
