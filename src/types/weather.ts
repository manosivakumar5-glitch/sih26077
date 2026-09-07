/**
 * STORM-MIND Meteorological Types & Interfaces
 * SIH26077 - AI-Driven Hyper-Local Early Warning System for Severe Weather Nowcasting
 */

export type LifecycleState =
  | 'CLEAR'
  | 'PRE-CONVECTION'
  | 'INITIATING'
  | 'DEVELOPING'
  | 'INTENSIFYING'
  | 'MATURE'
  | 'WEAKENING'
  | 'DISSIPATING';

export type SeverityLevel = 'NORMAL' | 'WATCH' | 'ADVISORY' | 'WARNING' | 'SEVERE' | 'EXTREME';

export type ScenarioPreset =
  | 'SEVERE_THUNDERSTORM'
  | 'MONSOON_CLOUDBURST'
  | 'NORMAL_WEATHER'
  | 'COASTAL_SQUALL'
  | 'FLASH_FLOOD';

export interface LocationInfo {
  id: string;
  country: string;
  state: string;
  district: string;
  city: string;
  locality: string;
  lat: number;
  lng: number;
  elevationM: number;
  radarStationCode: string;
  subDistricts?: string[];
}

export interface StormCell {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radiusKm: number;
  directionDeg: number; // 0-360
  speedKmh: number;
  maxReflectivityDbz: number;
  rainfallRateMmh: number;
  growthRateDbzHr: number;
  lightningFlashesPerMin: number;
  lightningTrend: 'STABLE' | 'ACCELERATING' | 'DECELERATING';
  capeJkg: number;
  cinJkg: number;
  totalPrecipWaterMm: number; // TPW / IWV
  windShear06kmMs: number;
  cloudTopTempC: number;
  lifecycle: LifecycleState;
  severity: SeverityLevel;
  probabilityPct: number;
  confidencePct: number;
  uncertaintyMarginPct: number;
  history: {
    tOffsetMin: number;
    lat: number;
    lng: number;
    reflectivityDbz: number;
  }[];
  forecastTrack: {
    tOffsetMin: number;
    lat: number;
    lng: number;
    uncertaintyRadiusKm: number;
  }[];
}

export interface ProbabilisticScenario {
  id: string;
  name: string;
  description: string;
  probabilityPct: number;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  peakReflectivityDbz: number;
  peakRainfallMmh: number;
  trackHeadingDeg: number;
  trackSpeedKmh: number;
}

export interface WhyNowEvidence {
  factor: string;
  type: 'OBSERVED_EVIDENCE' | 'MODEL_FEATURE' | 'THERMODYNAMIC_TRIGGER';
  observationValue: string;
  deltaValue: string;
  riskContributionWeight: number; // e.g. 0.0 to 1.0
  description: string;
  status: 'SURGING' | 'CRITICAL' | 'ELEVATED' | 'STABLE';
}

export interface HourlyForecast {
  timeOffsetMin: number;
  timeLabel: string;
  tempC: number;
  condition: string;
  rainProbabilityPct: number;
  precipitationMmh: number;
  windSpeedKmh: number;
  windDirectionDeg: number;
  radarReflectivityDbz: number;
  lightningPotentialPct: number;
  floodPotentialPct: number;
}

export interface DailyForecast {
  dayLabel: string;
  dateStr: string;
  maxTempC: number;
  minTempC: number;
  condition: string;
  precipitationProbabilityPct: number;
  precipitationMm: number;
  severeRisk: SeverityLevel;
}

export interface AtmosphericState {
  temperatureC: number;
  feelsLikeC: number;
  humidityPct: number;
  dewPointC: number;
  pressureHpa: number;
  visibilityKm: number;
  uvIndex: number;
  aqi: number;
  cloudCoverPct: number;
  rainfallRateMmh: number;
  rainProbabilityPct: number;
  windSpeedKmh: number;
  windDirectionDeg: number;
  uWindMs: number;
  vWindMs: number;
  windShearMs: number;
  capeJkg: number;
  cinJkg: number;
  tpwMm: number;
  cloudTopTempC: number;
  lowLevelConvergence: number; // 10^-5 s^-1
  stabilityIndex: 'HIGHLY UNSTABLE' | 'MODERATELY UNSTABLE' | 'NEUTRAL' | 'STABLE';
  hazardLevel: SeverityLevel;
}

export interface FloodRiskAssessment {
  overallRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY HIGH';
  accumulatedRainfallMm: number;
  runoffSusceptibilityPct: number;
  lowLyingVulnerabilityPct: number;
  drainageSaturationPct: number;
  affectedCatchments: {
    name: string;
    waterLevelTrend: 'STABLE' | 'RISING RAPIDLY' | 'SURGING';
    inundationDepthEstCm: number;
    riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY HIGH';
  }[];
}

export interface LightningIntelligence {
  activityLevel: 'MINIMAL' | 'SCATTERED' | 'ACTIVE' | 'VIOLENT';
  strikeRatePerMin: number;
  trend: 'STABLE' | 'ACCELERATING' | 'DECELERATING';
  chargeSeparationEstKvM: number;
  safetyRadiusKm: number;
  lastDetectionSecAgo: number;
  highDensityZones: { lat: number; lng: number; radiusKm: number; density: number }[];
}

export interface WarningNotice {
  id: string;
  hazardType: string;
  severity: SeverityLevel;
  headline: string;
  affectedArea: string;
  timeWindowStartMin: number;
  timeWindowEndMin: number;
  potentialImpacts: string[];
  recommendedActions: string[];
  probabilityPct: number;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  uncertaintyNote: string;
  reasons: string[];
  leadTimeMinutes: number;
}

export interface DataHealthSource {
  name: string;
  type: string;
  status: 'FRESH' | 'DELAYED' | 'PARTIAL' | 'MISSING';
  latencySec: number;
  lastUpdate: string;
  reliabilityPct: number;
}

export interface VerificationMetrics {
  criticalSuccessIndex: number; // CSI
  probabilityOfDetection: number; // POD
  falseAlarmRatio: number; // FAR
  brierScore: number;
  crpsScore: number;
  meanAbsoluteErrorTempC: number;
  rootMeanSquareErrorRainfallMmh: number;
  meanLeadTimeMinutes: number;
  localBiasCorrection: {
    district: string;
    season: string;
    rainfallBiasPct: number;
    windDirectionBiasDeg: number;
    calibrationFactor: number;
  };
}

export interface MapLayerState {
  clouds: boolean;
  radar: boolean;
  rain: boolean;
  wind: boolean;
  lightning: boolean;
  stormCells: boolean;
  floodRisk: boolean;
  warningZones: boolean;
  terrain3d: boolean;
  opacity: {
    radar: number;
    clouds: number;
    flood: number;
    wind: number;
  };
}

export interface VisualizationParams {
  rainDensity: number;
  rainSpeed: number;
  rainAngleDeg: number;
  cloudOpacity: number;
  cloudSpeed: number;
  cloudColor: string;
  windParticleSpeed: number;
  lightningFrequencyMs: number;
  atmosphericHaze: number;
  radarVisualIntensity: number;
  stormVisualIntensity: number;
}
