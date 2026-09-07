import React, { useEffect } from 'react';
import {
  Clock,
  FastForward,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react';

interface FutureEarthTimelineProps {
  tOffsetMin: number;
  onChangeTime: (t: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  playbackSpeed: number; // 0.5, 1, 2
  onChangeSpeed: (speed: number) => void;
  onReset: () => void;
}

const TIMELINE_STEPS = [
  { t: -120, label: 'T-120m', type: 'HISTORICAL' },
  { t: -60, label: 'T-60m', type: 'HISTORICAL' },
  { t: -30, label: 'T-30m', type: 'HISTORICAL' },
  { t: 0, label: 'NOW', type: 'OBSERVED' },
  { t: 15, label: '+15m', type: 'NOWCAST' },
  { t: 30, label: '+30m', type: 'NOWCAST' },
  { t: 60, label: '+60m', type: 'NOWCAST' },
  { t: 90, label: '+90m', type: 'NOWCAST' },
  { t: 120, label: '+120m', type: 'FORECAST' },
  { t: 180, label: '+180m', type: 'FORECAST' },
  { t: 240, label: '+240m', type: 'FORECAST' },
];

export const FutureEarthTimeline: React.FC<FutureEarthTimelineProps> = ({
  tOffsetMin,
  onChangeTime,
  isPlaying,
  onTogglePlay,
  playbackSpeed,
  onChangeSpeed,
  onReset,
}) => {
  // Automated playback loop
  useEffect(() => {
    if (!isPlaying) return;
    const intervalTime = Math.round(750 / playbackSpeed);
    const timer = setInterval(() => {
      onChangeTime(tOffsetMin >= 240 ? -120 : tOffsetMin + 15);
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, tOffsetMin, onChangeTime]);

  const formatOffsetDisplay = (offset: number) => {
    if (offset === 0) return 'NOW (Real-Time Synchronized)';
    if (offset < 0) return `T${offset} min (Radar Doppler History)`;
    const hours = Math.floor(offset / 60);
    const mins = offset % 60;
    if (hours === 0) return `+${mins} min (Hyper-Local AI Nowcast)`;
    return `+${hours}h ${mins > 0 ? `${mins}m` : ''} (Digital Twin Projection)`;
  };

  return (
    <div className="bg-[#070e1c]/92 backdrop-blur-xl border border-cyan-500/30 rounded-2xl px-4 py-3 shadow-[0_-10px_30px_rgba(0,0,0,0.6)] font-mono-code select-none">
      {/* Top row: Status, Active Horizon, Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-cyan-300 font-tech font-bold text-sm tracking-wider">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>FUTURE EARTH DIGITAL TWIN</span>
          </div>

          <div
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide ${
              tOffsetMin === 0
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : tOffsetMin < 0
                ? 'bg-slate-700/40 text-slate-300 border border-slate-600'
                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
            }`}
          >
            {formatOffsetDisplay(tOffsetMin)}
          </div>
        </div>

        {/* Playback Button Group */}
        <div className="flex items-center gap-2">
          {/* Play/Pause Button */}
          <button
            id="timeline-play-pause-btn"
            onClick={onTogglePlay}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
              isPlaying
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 hover:bg-cyan-500/30'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
          </button>

          {/* Reset Button */}
          <button
            id="timeline-reset-btn"
            onClick={onReset}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-slate-400 bg-slate-800/60 border border-slate-700 hover:text-white transition-colors"
            title="Reset to NOW (0 min)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>NOW</span>
          </button>

          {/* Speed Selector (0.5x, 1x, 2x) */}
          <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-[11px]">
            {[0.5, 1, 2].map((speed) => (
              <button
                key={speed}
                onClick={() => onChangeSpeed(speed)}
                className={`px-2 py-0.5 rounded ${
                  playbackSpeed === speed
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Interactive Slider Bar */}
      <div className="pt-3 pb-1">
        <div className="relative flex items-center">
          <input
            id="future-earth-slider"
            type="range"
            min="-120"
            max="240"
            step="5"
            value={tOffsetMin}
            onChange={(e) => onChangeTime(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-gradient-to-r from-slate-700 via-emerald-600 via-33% via-amber-500 to-cyan-500 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* Step Markers */}
        <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 px-1">
          {TIMELINE_STEPS.map((step) => {
            const isSelected = Math.abs(tOffsetMin - step.t) <= 10;
            return (
              <button
                key={step.t}
                onClick={() => onChangeTime(step.t)}
                className={`transition-colors flex flex-col items-center group ${
                  isSelected ? 'text-cyan-300 font-bold scale-110' : 'hover:text-white'
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full mb-1 ${
                    step.t === 0
                      ? 'bg-emerald-400 ring-2 ring-emerald-400/30'
                      : isSelected
                      ? 'bg-cyan-400'
                      : 'bg-slate-600'
                  }`}
                />
                <span>{step.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
