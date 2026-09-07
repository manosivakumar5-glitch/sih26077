import React, { useEffect, useState } from 'react';
import {
  Award,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize2,
  Pause,
  Play,
  Sparkles,
  Zap,
} from 'lucide-react';

interface PresentationModeOverlayProps {
  isActive: boolean;
  onToggle: () => void;
  onTriggerStep: (stepNumber: number) => void;
}

interface DemoStep {
  step: number;
  title: string;
  actionSummary: string;
  narrative: string;
}

const SIH_DEMO_STEPS: DemoStep[] = [
  {
    step: 1,
    title: '1. Hyper-Local Location Selection',
    actionSummary: 'Fly to Chennai / Velachery Catchment',
    narrative: 'Initiating digital twin centering on high-density coastal urban basin with sub-district ward boundaries.',
  },
  {
    step: 2,
    title: '2. Start Monitoring & Telemetry Ingest',
    actionSummary: 'Synchronize Live Sensor Feeds',
    narrative: 'Binding Doppler Weather Radar VCP-12, INSAT-3DS infrared, surface AWS mesonet, and lightning detectors.',
  },
  {
    step: 3,
    title: '3. Baseline Atmospheric Sounding',
    actionSummary: 'Examine Initial Boundary State',
    narrative: 'Boundary layer shows coastal moisture pooling (TPW 58mm) and CAPE 2600 J/kg with eroding convective inhibition.',
  },
  {
    step: 4,
    title: '4. Enter Future Earth Digital Twin',
    actionSummary: 'Activate 4-Hour Predictive Horizon',
    narrative: 'Launching temporal time machine. All atmospheric variables, radar echoes, and wind fields dynamically evolve.',
  },
  {
    step: 5,
    title: '5. Timeline Scrubbing to T+30m',
    actionSummary: 'Advance Convective Initiation Phase',
    narrative: 'Convective cell triggers over Bay of Bengal coastal convergence zone; radar reflectivity rapidly ascends to 42 dBZ.',
  },
  {
    step: 6,
    title: '6. Radar Echo Intensification (T+60m)',
    actionSummary: 'Severe Cell Core Reaches 58 dBZ',
    narrative: 'Deep dual-pol hail column and torrential downdraft develop; wind gusts surge to 68 km/h.',
  },
  {
    step: 7,
    title: '7. Storm DNA Deep Diagnostics',
    actionSummary: 'Inspect Convective Updraft Physics',
    narrative: 'Examining storm cell lifecycle, 0-6km bulk shear (16 m/s), cloud-top temperature plunge (-68°C), and echo history.',
  },
  {
    step: 8,
    title: '8. Neuro-Symbolic "Why-Now" Evidence',
    actionSummary: 'Deconstruct Model Attributions',
    narrative: 'Transparent, interpretable physics: isolating radar growth rate, satellite cooling, and thermodynamic moisture triggers.',
  },
  {
    step: 9,
    title: '9. Multi-Trajectory Probabilistic Futures',
    actionSummary: 'Ensemble Scenario Dispersion',
    narrative: 'Displaying branching probabilistic futures (Scenario A 55%, Scenario B 30%, Scenario C 15%) and model consensus (74%).',
  },
  {
    step: 10,
    title: '10. Hydrological Runoff & Flood Inundation',
    actionSummary: 'Rain → Runoff → Flood Pipeline',
    narrative: 'Rainfall accumulation of 95mm combined with low-lying urban catchment elevations produces critical runoff potential.',
  },
  {
    step: 11,
    title: '11. Lightning Discharge Acceleration',
    actionSummary: 'Total Lightning Jump Warning',
    narrative: 'VLF/LF detection network registers 5x jump to 48 flashes/min, triggering early severe weather warning before surface rain arrives.',
  },
  {
    step: 12,
    title: '12. Impact-First Warning Generation',
    actionSummary: 'Lead-Time Optimized Advisory',
    narrative: 'Decision-support prototype generates targeted impact bulletin with a 52-minute lead time ahead of maximum inundation.',
  },
  {
    step: 13,
    title: '13. AI Safe Mode & Out-Of-Distribution',
    actionSummary: 'Scientific Robustness Guardrails',
    narrative: 'Demonstrating how the system detects anomalous atmospheric covariance and dynamically fallbacks to physics baselines.',
  },
  {
    step: 14,
    title: '14. Scientific Forecast Verification',
    actionSummary: 'CSI, POD, FAR, Brier Skill Scores',
    narrative: 'Verifying historical nowcasting performance with a Critical Success Index (CSI) of 0.742 and 88.4% Probability of Detection.',
  },
  {
    step: 15,
    title: '15. Adaptive Local Memory & Bias Learning',
    actionSummary: 'Site-Specific Microclimate Tuning',
    narrative: 'Online calibration matrix stores district-specific sea-breeze convergence biases, closing the loop on continuous self-learning.',
  },
];

export const PresentationModeOverlay: React.FC<PresentationModeOverlayProps> = ({
  isActive,
  onToggle,
  onTriggerStep,
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  // Auto-play loop for presenter demo
  useEffect(() => {
    if (!isAutoPlaying || !isActive) return;
    const timer = setInterval(() => {
      setCurrentStepIdx((prev) => {
        const next = prev >= SIH_DEMO_STEPS.length - 1 ? 0 : prev + 1;
        onTriggerStep(SIH_DEMO_STEPS[next].step);
        return next;
      });
    }, 7000);

    return () => clearInterval(timer);
  }, [isAutoPlaying, isActive, onTriggerStep]);

  if (!isActive) return null;

  const currentStep = SIH_DEMO_STEPS[currentStepIdx];

  const handleNext = () => {
    const nextIdx = Math.min(SIH_DEMO_STEPS.length - 1, currentStepIdx + 1);
    setCurrentStepIdx(nextIdx);
    onTriggerStep(SIH_DEMO_STEPS[nextIdx].step);
  };

  const handlePrev = () => {
    const prevIdx = Math.max(0, currentStepIdx - 1);
    setCurrentStepIdx(prevIdx);
    onTriggerStep(SIH_DEMO_STEPS[prevIdx].step);
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-4xl px-4 pointer-events-none select-none font-mono-code">
      <div className="pointer-events-auto bg-[#060c18]/95 border-2 border-cyan-400 rounded-2xl p-4 shadow-[0_0_40px_rgba(6,182,212,0.4)] backdrop-blur-2xl text-xs space-y-2.5 animate-in slide-in-from-top-4 duration-300">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-2 border-b border-cyan-500/30">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span className="text-cyan-300 font-tech font-bold text-sm tracking-wider uppercase">
              CLIMORA EXECUTIVE BRIEFING • SYSTEM WALKTHROUGH
            </span>
            <span className="bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded text-[10px] font-bold border border-cyan-500/30">
              STEP {currentStepIdx + 1} OF 15
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="presentation-autoplay-btn"
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold border transition-colors ${
                isAutoPlaying
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              {isAutoPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>{isAutoPlaying ? 'PAUSE WALKTHROUGH' : 'AUTO-TOUR'}</span>
            </button>

            <button
              id="exit-presentation-mode-btn"
              onClick={onToggle}
              className="flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold bg-red-950/60 text-red-300 border border-red-500/40 hover:bg-red-900/80 transition-colors"
            >
              <Minimize2 className="w-3 h-3" />
              <span>EXIT PRESENTATION</span>
            </button>
          </div>
        </div>

        {/* Current Step Content */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-bold text-sm font-tech">{currentStep.title}</span>
              <span className="text-cyan-300 text-[11px] font-semibold">({currentStep.actionSummary})</span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">{currentStep.narrative}</p>
          </div>

          {/* Stepper Navigation */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              id="presentation-prev-btn"
              onClick={handlePrev}
              disabled={currentStepIdx === 0}
              className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 disabled:opacity-30 hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              id="presentation-next-btn"
              onClick={handleNext}
              disabled={currentStepIdx === SIH_DEMO_STEPS.length - 1}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-500 text-slate-950 font-bold disabled:opacity-30 hover:bg-cyan-400 transition-colors"
            >
              <span>NEXT STEP</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
