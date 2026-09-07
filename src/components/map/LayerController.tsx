import React from 'react';
import { MapLayerState } from '../../types/weather';
import {
  Cloud,
  CloudLightning,
  CloudRain,
  Radio,
  Sparkles,
  Waves,
  Wind,
  Zap,
} from 'lucide-react';

interface LayerControllerProps {
  layers: MapLayerState;
  onChange: (newLayers: MapLayerState) => void;
  onReset: () => void;
}

export const LayerController: React.FC<LayerControllerProps> = ({ layers, onChange, onReset }) => {
  const toggleLayer = (key: keyof Omit<MapLayerState, 'opacity'>) => {
    onChange({
      ...layers,
      [key]: !layers[key],
    });
  };

  const layerItems: {
    key: keyof Omit<MapLayerState, 'opacity'>;
    label: string;
    icon: string;
    activeColor: string;
  }[] = [
    { key: 'clouds', label: 'Clouds', icon: '☁', activeColor: 'bg-sky-500/25 border-sky-400 text-sky-200 shadow-[0_0_10px_rgba(56,189,248,0.3)]' },
    { key: 'rain', label: 'Rain', icon: '🌧', activeColor: 'bg-blue-500/25 border-blue-400 text-blue-200 shadow-[0_0_10px_rgba(59,130,246,0.3)]' },
    { key: 'wind', label: 'Wind', icon: '🌬', activeColor: 'bg-teal-500/25 border-teal-400 text-teal-200 shadow-[0_0_10px_rgba(20,184,166,0.3)]' },
    { key: 'radar', label: 'Radar', icon: '📡', activeColor: 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.3)]' },
    { key: 'lightning', label: 'Lightning', icon: '⚡', activeColor: 'bg-yellow-500/25 border-yellow-400 text-yellow-200 shadow-[0_0_10px_rgba(234,179,8,0.3)]' },
    { key: 'stormCells', label: 'Storms', icon: '⛈', activeColor: 'bg-rose-500/25 border-rose-400 text-rose-200 shadow-[0_0_10px_rgba(244,63,94,0.3)]' },
    { key: 'floodRisk', label: 'Flood', icon: '🌊', activeColor: 'bg-indigo-500/25 border-indigo-400 text-indigo-200 shadow-[0_0_10px_rgba(99,102,241,0.3)]' },
  ];

  return (
    <div className="absolute top-4 left-4 z-20 font-mono-code select-none max-w-[calc(100vw-32px)] overflow-x-auto scrollbar-none">
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-950/80 border border-white/20 shadow-2xl backdrop-blur-xl">
        <span className="text-[10px] font-bold text-cyan-400 px-2 uppercase tracking-wider hidden sm:inline">
          LAYERS
        </span>

        {layerItems.map((item) => {
          const isActive = !!layers[item.key];
          return (
            <button
              key={item.key}
              id={`toggle-layer-${item.key}`}
              onClick={() => toggleLayer(item.key)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                isActive
                  ? item.activeColor
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200'
              }`}
              title={`Toggle ${item.label} layer`}
            >
              <span className="text-sm">{item.icon}</span>
              <span className="hidden md:inline">{item.label}</span>
              <span
                className={`text-[9px] px-1 py-0.2 rounded font-bold uppercase ${
                  isActive ? 'bg-white/20 text-white' : 'text-slate-500'
                }`}
              >
                {isActive ? 'ON' : 'OFF'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
