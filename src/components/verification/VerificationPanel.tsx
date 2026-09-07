import React from 'react';
import { LocationInfo, VerificationMetrics } from '../../types/weather';
import {
  Award,
  BarChart2,
  CheckCircle,
  Database,
  Layers,
  Sparkles,
  TrendingUp,
  X,
} from 'lucide-react';

interface VerificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: VerificationMetrics;
  location: LocationInfo;
}

export const VerificationPanel: React.FC<VerificationPanelProps> = ({
  isOpen,
  onClose,
  metrics,
  location,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 select-none font-mono-code text-xs">
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-[#060c18] border border-cyan-500/40 rounded-3xl p-5 shadow-2xl overflow-y-auto flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-tech font-bold text-xs uppercase tracking-widest">
              <Award className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>SCIENTIFIC NOWCAST VERIFICATION & LOCAL MEMORY</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide mt-0.5">
              Forecast Skill Scores & Calibration Metrics
            </h2>
            <div className="text-[11px] text-slate-400">
              District: {location.district} • Contingency Matrix Statistics • Operational Benchmark Metrics
            </div>
          </div>

          <button
            id="close-verification-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Verification Skill Scores */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
            <span>NOWCAST SKILL SCORES (CONTINGENCY TABLE DERIVATIVES)</span>
            <span className="text-cyan-400 text-[10px]">OPERATIONAL BENCHMARK</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-[#081122] border border-slate-800 rounded-xl p-3">
              <span className="text-slate-400 text-[10px]">CSI (Threat Score)</span>
              <div className="text-xl font-bold text-emerald-400 font-tech mt-0.5">
                {metrics.criticalSuccessIndex.toFixed(3)}
              </div>
              <span className="text-[10px] text-slate-500">Critical Success Index</span>
            </div>

            <div className="bg-[#081122] border border-slate-800 rounded-xl p-3">
              <span className="text-slate-400 text-[10px]">POD (Recall / Hit Rate)</span>
              <div className="text-xl font-bold text-cyan-300 font-tech mt-0.5">
                {(metrics.probabilityOfDetection * 100).toFixed(1)}%
              </div>
              <span className="text-[10px] text-slate-500">Detection Probability</span>
            </div>

            <div className="bg-[#081122] border border-slate-800 rounded-xl p-3">
              <span className="text-slate-400 text-[10px]">FAR (False Alarm Ratio)</span>
              <div className="text-xl font-bold text-amber-400 font-tech mt-0.5">
                {(metrics.falseAlarmRatio * 100).toFixed(1)}%
              </div>
              <span className="text-[10px] text-slate-500">Low False Warning Rate</span>
            </div>

            <div className="bg-[#081122] border border-slate-800 rounded-xl p-3">
              <span className="text-slate-400 text-[10px]">BRIER SCORE</span>
              <div className="text-xl font-bold text-slate-200 font-tech mt-0.5">
                {metrics.brierScore.toFixed(3)}
              </div>
              <span className="text-[10px] text-slate-500">Probabilistic Accuracy</span>
            </div>

            <div className="bg-[#081122] border border-slate-800 rounded-xl p-3">
              <span className="text-slate-400 text-[10px]">CRPS SCORE</span>
              <div className="text-xl font-bold text-indigo-300 font-tech mt-0.5">
                {metrics.crpsScore.toFixed(2)}
              </div>
              <span className="text-[10px] text-slate-500">Continuous Ranked Prob</span>
            </div>

            <div className="bg-[#081122] border border-slate-800 rounded-xl p-3">
              <span className="text-slate-400 text-[10px]">TEMP MAE</span>
              <div className="text-xl font-bold text-slate-200 font-tech mt-0.5">
                ±{metrics.meanAbsoluteErrorTempC}°C
              </div>
              <span className="text-[10px] text-slate-500">Mean Absolute Error</span>
            </div>

            <div className="bg-[#081122] border border-slate-800 rounded-xl p-3">
              <span className="text-slate-400 text-[10px]">PRECIP RMSE</span>
              <div className="text-xl font-bold text-cyan-300 font-tech mt-0.5">
                {metrics.rootMeanSquareErrorRainfallMmh} mm/h
              </div>
              <span className="text-[10px] text-slate-500">Root Mean Square Error</span>
            </div>

            <div className="bg-[#081122] border border-slate-800 rounded-xl p-3">
              <span className="text-slate-400 text-[10px]">MEAN LEAD TIME</span>
              <div className="text-xl font-bold text-emerald-400 font-tech mt-0.5">
                {metrics.meanLeadTimeMinutes} min
              </div>
              <span className="text-[10px] text-slate-500">Pre-Convective Warning</span>
            </div>
          </div>
        </div>

        {/* Section 32: Adaptive Local Memory & Bias Correction */}
        <div className="bg-[#091428]/80 border border-cyan-500/30 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-200">
            <div className="flex items-center gap-2 text-cyan-400">
              <Database className="w-4 h-4" />
              <span>ADAPTIVE LOCAL MEMORY & SITE-SPECIFIC BIAS CORRECTION</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold">ONLINE CALIBRATION MATRIX</span>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            STORM-MIND maintains site-specific historical contingency logs. When localized topography or microclimates (such as coastal sea-breeze fronts) exhibit systematic deviations, the local calibration factor automatically adjusts raw neural outputs.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] pt-1">
            <div className="bg-[#050b16] border border-slate-800 rounded-lg p-2.5">
              <span className="text-slate-400 text-[10px]">TARGET LOCALITY</span>
              <div className="font-bold text-slate-200 mt-0.5">{metrics.localBiasCorrection.district}</div>
              <span className="text-[10px] text-slate-500">Season: {metrics.localBiasCorrection.season}</span>
            </div>

            <div className="bg-[#050b16] border border-slate-800 rounded-lg p-2.5">
              <span className="text-slate-400 text-[10px]">RECORDED RAINFALL BIAS</span>
              <div className="font-bold text-amber-400 mt-0.5">
                +{metrics.localBiasCorrection.rainfallBiasPct}% Over-Prediction
              </div>
              <span className="text-[10px] text-slate-500">Wind Direction Bias: {metrics.localBiasCorrection.windDirectionBiasDeg}°</span>
            </div>

            <div className="bg-[#050b16] border border-slate-800 rounded-lg p-2.5">
              <span className="text-slate-400 text-[10px]">APPLIED CALIBRATION FACTOR</span>
              <div className="font-bold text-emerald-400 text-sm mt-0.5">
                {metrics.localBiasCorrection.calibrationFactor}x Weighting
              </div>
              <span className="text-[10px] text-slate-500">Active in Nowcast Engine</span>
            </div>
          </div>
        </div>

        {/* Verification Note */}
        <div className="bg-[#050b16] border border-slate-800 rounded-xl p-3 text-[11px] text-slate-400 leading-relaxed">
          <span className="text-cyan-400 font-bold">SCIENTIFIC METROLOGY: </span>
          All verification skill scores are computed in real time against high-resolution Doppler reflectivity volumes and calibrated dual-polarimetric rainfall estimations.
        </div>
      </div>
    </div>
  );
};
