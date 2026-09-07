import React from 'react';
import { DataHealthSource } from '../../types/weather';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Radio,
  RefreshCw,
  ShieldCheck,
  Wifi,
  X,
} from 'lucide-react';

interface DataHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
  sources: DataHealthSource[];
}

export const DataHealthModal: React.FC<DataHealthModalProps> = ({ isOpen, onClose, sources }) => {
  if (!isOpen) return null;

  const hasMissingOrDelayed = sources.some((s) => s.status === 'DELAYED' || s.status === 'MISSING' || s.status === 'PARTIAL');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 select-none font-mono-code text-xs">
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-[#060c18] border border-cyan-500/40 rounded-3xl p-5 shadow-2xl overflow-y-auto flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-tech font-bold text-xs uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>OBSERVATION BLIND-SPOT DETECTOR & SENSOR HEALTH</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide mt-0.5">
              Ingest Telemetry & Feed Quality
            </h2>
            <div className="text-[11px] text-slate-400">
              Real-Time Satellite, Doppler Radar, Mesonet AWS, and Lightning Detection Feeds
            </div>
          </div>

          <button
            id="close-data-health-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Blind-spot Banner */}
        {hasMissingOrDelayed && (
          <div className="bg-amber-950/30 border border-amber-500/40 rounded-2xl p-3.5 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="text-[11px] text-amber-200">
              <span className="font-bold text-amber-300">OBSERVATION LATENCY DETECTED: </span>
              Certain surface automatic weather stations exhibit partial reporting delays. Forecast confidence interval automatically calibrated to account for observation uncertainty.
            </div>
          </div>
        )}

        {/* Source Ingest List */}
        <div className="space-y-2">
          {sources.map((src, idx) => (
            <div
              key={idx}
              className="bg-[#091428]/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      src.status === 'FRESH'
                        ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]'
                        : src.status === 'PARTIAL'
                        ? 'bg-amber-400'
                        : 'bg-red-400'
                    }`}
                  />
                  <span className="font-bold text-slate-100 text-xs">{src.name}</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  {src.type} • Ingest Latency: {src.latencySec}s
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="text-[9px] text-slate-500 uppercase">UPDATE FREQUENCY</div>
                  <div className="text-[10px] text-cyan-300 font-bold">{src.lastUpdate}</div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    src.status === 'FRESH'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : src.status === 'PARTIAL'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-red-500/20 text-red-300 border border-red-500/30'
                  }`}
                >
                  ● {src.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Ingestion Architecture Notice */}
        <div className="bg-[#050b16] border border-slate-800 rounded-xl p-3 text-[11px] text-slate-400 leading-relaxed">
          <span className="text-cyan-400 font-bold">SOURCE ARCHITECTURE: </span>
          STORM-MIND multi-stream ingestion pipelines are actively connected to meteorological Doppler radar stations, geostationary earth-observation feeds, and automated weather telemetry networks with continuous latency verification.
        </div>
      </div>
    </div>
  );
};
