import {
  AtmosphericState,
  DataHealthSource,
  DailyForecast,
  FloodRiskAssessment,
  HourlyForecast,
  LightningIntelligence,
  LocationInfo,
  ProbabilisticScenario,
  ScenarioPreset,
  SeverityLevel,
  StormCell,
  VerificationMetrics,
  WarningNotice,
  WhyNowEvidence,
} from '../types/weather';

export interface CounterfactualOverrides {
  moistureDeltaPct: number; // e.g. -20 to +20
  capeMultiplier: number; // e.g. 0.5 to 1.5
  shearMultiplier: number; // e.g. 0.5 to 1.5
  suppressConvection: boolean;
}

export const DEFAULT_COUNTERFACTUALS: CounterfactualOverrides = {
  moistureDeltaPct: 0,
  capeMultiplier: 1.0,
  shearMultiplier: 1.0,
  suppressConvection: false,
};

/**
 * Deterministic mathematical sigmoid and bell curve helpers
 */
function gaussian(x: number, mean: number, sigma: number): number {
  return Math.exp(-Math.pow(x - mean, 2) / (2 * Math.pow(sigma, 2)));
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

/**
 * Central simulation function returning fully correlated physical atmospheric states
 */
export function simulateAtmosphericEnvironment(
  location: LocationInfo,
  scenario: ScenarioPreset,
  intensityMultiplier: number, // 0.7 for LOW, 1.0 for MEDIUM, 1.3 for HIGH, 1.6 for EXTREME
  tOffsetMin: number, // -120 to +240 (0 = NOW)
  counterfactuals: CounterfactualOverrides = DEFAULT_COUNTERFACTUALS
) {
  // Convective phase progression along timeline
  // t = 0 (NOW) is typically developing/intensifying for severe thunderstorm
  const stormPeakTime = scenario === 'MONSOON_CLOUDBURST' ? 45 : scenario === 'SEVERE_THUNDERSTORM' ? 60 : 75;
  const bellCurve = gaussian(tOffsetMin, stormPeakTime, 70); // Peak around +60min
  const onsetCurve = 1 / (1 + Math.exp(-(tOffsetMin - 15) / 25)); // Growth after +15 min

  // Location-specific climatic adaptation (latitude, altitude, and regional factors)
  const absLat = Math.abs(location.lat);
  const latCooling = Math.max(0, (absLat - 20) * 0.42); // Cooler at higher latitudes (e.g. London, Moscow)
  const elevCooling = (location.elevationM || 10) * 0.0065; // Standard lapse rate 6.5°C/km
  const standardBaroPressure = Math.round(1013.25 * Math.exp(-(location.elevationM || 10) / 8430));

  let baseTemp = Math.round((33.5 - latCooling - elevCooling) * 10) / 10;
  let baseHumidity = absLat > 40 ? 68 : location.elevationM > 1000 ? 58 : 78;
  let basePressure = standardBaroPressure;
  let baseRainRate = 0;
  let baseWindSpeed = 16;
  let baseWindDir = 120; // Default SE inflow
  let baseCape = Math.max(800, 2400 - latCooling * 35);
  let baseCin = 85;
  let baseTpw = Math.max(25, 54 - latCooling * 0.6);
  let baseCloudTopTemp = -25;
  let stormIntensityFactor = 0.5;

  if (scenario === 'SEVERE_THUNDERSTORM') {
    baseTemp = Math.round((baseTemp + 1.5 - onsetCurve * 8) * 10) / 10; // Rain-cooled outflow boundary
    baseHumidity = clamp(baseHumidity + onsetCurve * 22, 40, 98);
    basePressure = standardBaroPressure - 2 - gaussian(tOffsetMin, stormPeakTime, 40) * 8 + (tOffsetMin > stormPeakTime ? 3 : 0); // Pressure dip then bubble
    baseWindSpeed = 18 + bellCurve * 58 * intensityMultiplier; // Gust front up to 75 km/h
    baseWindDir = 240 + Math.sin(tOffsetMin / 30) * 35; // Veering winds
    baseCape = (baseCape + (1 - onsetCurve) * 900 - onsetCurve * 1800) * counterfactuals.capeMultiplier;
    baseCin = Math.max(5, (75 - onsetCurve * 70)); // CIN erodes
    baseTpw = (baseTpw + 4 + onsetCurve * 14 + counterfactuals.moistureDeltaPct * 0.4);
    baseCloudTopTemp = -30 - bellCurve * 42; // Cools down to -72°C
    baseRainRate = bellCurve * 78 * intensityMultiplier;
    stormIntensityFactor = clamp(bellCurve * 1.2 * intensityMultiplier, 0.05, 1.0);
  } else if (scenario === 'MONSOON_CLOUDBURST') {
    baseTemp = Math.round((baseTemp - 5 - onsetCurve * 3) * 10) / 10;
    baseHumidity = 94;
    basePressure = standardBaroPressure - 10 - bellCurve * 10;
    baseWindSpeed = 35 + bellCurve * 45 * intensityMultiplier;
    baseWindDir = 210; // SW monsoon flow
    baseCape = 1800 * counterfactuals.capeMultiplier;
    baseCin = 15;
    baseTpw = (baseTpw + 14 + counterfactuals.moistureDeltaPct * 0.5);
    baseCloudTopTemp = -65 - bellCurve * 15;
    baseRainRate = (20 + bellCurve * 115) * intensityMultiplier; // Extreme rain rate > 100 mm/h
    stormIntensityFactor = clamp(0.6 + bellCurve * 0.45 * intensityMultiplier, 0.2, 1.0);
  } else if (scenario === 'COASTAL_SQUALL') {
    baseTemp = Math.round((baseTemp - 3 - onsetCurve * 4) * 10) / 10;
    baseHumidity = 88;
    basePressure = standardBaroPressure - 6 - bellCurve * 12;
    baseWindSpeed = 42 + bellCurve * 48 * intensityMultiplier; // High sustained squall
    baseWindDir = 95; // Onshore flow
    baseCape = 2100 * counterfactuals.capeMultiplier;
    baseCin = 30;
    baseTpw = (baseTpw + 8 + counterfactuals.moistureDeltaPct * 0.3);
    baseCloudTopTemp = -50 - bellCurve * 20;
    baseRainRate = (12 + bellCurve * 62) * intensityMultiplier;
    stormIntensityFactor = clamp(0.4 + bellCurve * 0.5 * intensityMultiplier, 0.1, 0.95);
  } else if (scenario === 'FLASH_FLOOD') {
    baseTemp = Math.round((baseTemp - 6) * 10) / 10;
    baseHumidity = 96;
    basePressure = standardBaroPressure - 4;
    baseWindSpeed = 22 + bellCurve * 28;
    baseWindDir = 160;
    baseCape = 1600;
    baseCin = 10;
    baseTpw = 65;
    baseCloudTopTemp = -60;
    baseRainRate = (35 + bellCurve * 80) * intensityMultiplier;
    stormIntensityFactor = 0.85;
  } else {
    // NORMAL_WEATHER
    baseTemp = 32.8 + Math.sin(tOffsetMin / 120) * 2;
    baseHumidity = 62 + Math.cos(tOffsetMin / 120) * 8;
    basePressure = 1012;
    baseWindSpeed = 14 + Math.sin(tOffsetMin / 60) * 4;
    baseWindDir = 110;
    baseCape = 800;
    baseCin = 140;
    baseTpw = 38;
    baseCloudTopTemp = -10;
    baseRainRate = 0;
    stormIntensityFactor = 0.05;
  }

  if (counterfactuals.suppressConvection) {
    baseRainRate = 0;
    stormIntensityFactor = 0.05;
    baseCape = 600;
  }

  // Calculate U & V wind vector components
  const rad = (baseWindDir * Math.PI) / 180;
  const speedMs = baseWindSpeed / 3.6;
  const uWindMs = -speedMs * Math.sin(rad);
  const vWindMs = -speedMs * Math.cos(rad);

  // Compute severe hazard level
  let hazardLevel: SeverityLevel = 'NORMAL';
  if (baseRainRate > 70 || baseWindSpeed > 75) {
    hazardLevel = 'EXTREME';
  } else if (baseRainRate > 40 || baseWindSpeed > 55) {
    hazardLevel = 'SEVERE';
  } else if (baseRainRate > 20 || baseWindSpeed > 40) {
    hazardLevel = 'WARNING';
  } else if (baseRainRate > 5 || baseCape > 2200) {
    hazardLevel = 'WATCH';
  } else if (baseRainRate > 0) {
    hazardLevel = 'ADVISORY';
  }

  // Atmospheric state object
  const atmosphericState: AtmosphericState = {
    temperatureC: Number(baseTemp.toFixed(1)),
    feelsLikeC: Number((baseTemp + (baseHumidity > 70 ? (baseHumidity - 70) * 0.15 : 0)).toFixed(1)),
    humidityPct: Math.round(clamp(baseHumidity, 30, 99)),
    dewPointC: Number((baseTemp - (100 - baseHumidity) / 5).toFixed(1)),
    pressureHpa: Number(basePressure.toFixed(1)),
    visibilityKm: Number(clamp(10 - baseRainRate * 0.12, 0.4, 12).toFixed(1)),
    uvIndex: Math.round(clamp(8 - (baseHumidity > 80 ? 5 : 2) - (baseRainRate > 0 ? 3 : 0), 1, 11)),
    aqi: Math.round(clamp(85 - baseRainRate * 0.8, 22, 160)),
    cloudCoverPct: Math.round(clamp(20 + stormIntensityFactor * 78, 15, 100)),
    rainfallRateMmh: Number(baseRainRate.toFixed(1)),
    rainProbabilityPct: Math.round(clamp(stormIntensityFactor * 100, 5, 98)),
    windSpeedKmh: Math.round(baseWindSpeed),
    windDirectionDeg: Math.round((baseWindDir + 360) % 360),
    uWindMs: Number(uWindMs.toFixed(2)),
    vWindMs: Number(vWindMs.toFixed(2)),
    windShearMs: Number((14 + bellCurve * 18 * counterfactuals.shearMultiplier).toFixed(1)),
    capeJkg: Math.round(baseCape),
    cinJkg: Math.round(baseCin),
    tpwMm: Number(baseTpw.toFixed(1)),
    cloudTopTempC: Math.round(baseCloudTopTemp),
    lowLevelConvergence: Number((3.5 + bellCurve * 8.2).toFixed(1)),
    stabilityIndex: baseCape > 2500 ? 'HIGHLY UNSTABLE' : baseCape > 1600 ? 'MODERATELY UNSTABLE' : baseCape > 900 ? 'NEUTRAL' : 'STABLE',
    hazardLevel,
  };

  // Storm Cell Evolution (Moves along velocity vector over time)
  // Distance moved from tOffsetMin = 0 (velocity = ~35 km/h northeast heading ~45 deg)
  const cellHeadingRad = (55 * Math.PI) / 180;
  const kmPerDegreeLat = 111;
  const kmPerDegreeLng = 111 * Math.cos((location.lat * Math.PI) / 180);
  const cellSpeedKmh = 38;
  const distKm = (tOffsetMin * cellSpeedKmh) / 60; // negative for past, positive for future

  const deltaLat = (distKm * Math.cos(cellHeadingRad)) / kmPerDegreeLat;
  const deltaLng = (distKm * Math.sin(cellHeadingRad)) / kmPerDegreeLng;

  // Storm life-cycle progression
  let lifecycle: StormCell['lifecycle'] = 'CLEAR';
  if (scenario !== 'NORMAL_WEATHER') {
    if (tOffsetMin < -40) lifecycle = 'INITIATING';
    else if (tOffsetMin < 10) lifecycle = 'DEVELOPING';
    else if (tOffsetMin < 50) lifecycle = 'INTENSIFYING';
    else if (tOffsetMin < 90) lifecycle = 'MATURE';
    else if (tOffsetMin < 160) lifecycle = 'WEAKENING';
    else lifecycle = 'DISSIPATING';
  }

  const primaryStormCell: StormCell = {
    id: 'STORM-A17',
    name: 'Convective Cell #A17 (Bay Influx)',
    lat: Number((location.lat - 0.08 + deltaLat).toFixed(4)),
    lng: Number((location.lng - 0.06 + deltaLng).toFixed(4)),
    radiusKm: Number((8 + bellCurve * 14 * intensityMultiplier).toFixed(1)),
    directionDeg: 55,
    speedKmh: cellSpeedKmh,
    maxReflectivityDbz: Math.round(clamp(25 + stormIntensityFactor * 42, 18, 68)),
    rainfallRateMmh: Number(baseRainRate.toFixed(1)),
    growthRateDbzHr: Number((tOffsetMin < stormPeakTime ? (8.4 * intensityMultiplier) : -6.2).toFixed(1)),
    lightningFlashesPerMin: Math.round(bellCurve * 48 * intensityMultiplier),
    lightningTrend: tOffsetMin < 40 ? 'ACCELERATING' : tOffsetMin < 80 ? 'STABLE' : 'DECELERATING',
    capeJkg: Math.round(baseCape),
    cinJkg: Math.round(baseCin),
    totalPrecipWaterMm: Number(baseTpw.toFixed(1)),
    windShear06kmMs: Number(atmosphericState.windShearMs.toFixed(1)),
    cloudTopTempC: Math.round(baseCloudTopTemp),
    lifecycle,
    severity: hazardLevel,
    probabilityPct: atmosphericState.rainProbabilityPct,
    confidencePct: Math.round(clamp(88 - Math.abs(tOffsetMin) * 0.18, 45, 92)),
    uncertaintyMarginPct: Math.round(clamp(12 + Math.abs(tOffsetMin) * 0.08, 8, 28)),
    history: [-120, -90, -60, -30, 0].map((t) => {
      const pastDist = (t * cellSpeedKmh) / 60;
      return {
        tOffsetMin: t,
        lat: Number((location.lat - 0.08 + (pastDist * Math.cos(cellHeadingRad)) / kmPerDegreeLat).toFixed(4)),
        lng: Number((location.lng - 0.06 + (pastDist * Math.sin(cellHeadingRad)) / kmPerDegreeLng).toFixed(4)),
        reflectivityDbz: Math.round(clamp(20 + gaussian(t, stormPeakTime, 70) * 40, 15, 65)),
      };
    }),
    forecastTrack: [15, 30, 60, 90, 120, 180, 240].map((t) => {
      const futDist = (t * cellSpeedKmh) / 60;
      return {
        tOffsetMin: t,
        lat: Number((location.lat - 0.08 + (futDist * Math.cos(cellHeadingRad)) / kmPerDegreeLat).toFixed(4)),
        lng: Number((location.lng - 0.06 + (futDist * Math.sin(cellHeadingRad)) / kmPerDegreeLng).toFixed(4)),
        uncertaintyRadiusKm: Number((4 + (t / 60) * 7.5).toFixed(1)),
      };
    }),
  };

  const secondaryStormCell: StormCell = {
    id: 'STORM-B04',
    name: 'Secondary Feeder Band #B04',
    lat: Number((location.lat + 0.14 + deltaLat * 0.85).toFixed(4)),
    lng: Number((location.lng - 0.18 + deltaLng * 0.85).toFixed(4)),
    radiusKm: Number((6 + bellCurve * 8).toFixed(1)),
    directionDeg: 62,
    speedKmh: 32,
    maxReflectivityDbz: Math.round(clamp(20 + stormIntensityFactor * 32, 15, 52)),
    rainfallRateMmh: Number((baseRainRate * 0.55).toFixed(1)),
    growthRateDbzHr: 3.8,
    lightningFlashesPerMin: Math.round(bellCurve * 18),
    lightningTrend: 'STABLE',
    capeJkg: Math.round(baseCape * 0.85),
    cinJkg: Math.round(baseCin * 1.2),
    totalPrecipWaterMm: Number((baseTpw * 0.9).toFixed(1)),
    windShear06kmMs: 14.2,
    cloudTopTempC: Math.round(baseCloudTopTemp + 12),
    lifecycle: tOffsetMin > 100 ? 'WEAKENING' : 'DEVELOPING',
    severity: hazardLevel === 'NORMAL' ? 'NORMAL' : 'WATCH',
    probabilityPct: Math.round(atmosphericState.rainProbabilityPct * 0.75),
    confidencePct: 72,
    uncertaintyMarginPct: 18,
    history: [],
    forecastTrack: [],
  };

  // Why-Now Neuro-Symbolic Evidence
  const whyNowEvidence: WhyNowEvidence[] = [
    {
      factor: 'Doppler Radar Reflectivity Trend',
      type: 'OBSERVED_EVIDENCE',
      observationValue: `${primaryStormCell.maxReflectivityDbz} dBZ Core`,
      deltaValue: primaryStormCell.growthRateDbzHr > 0 ? `+${primaryStormCell.growthRateDbzHr} dBZ/hr` : `${primaryStormCell.growthRateDbzHr} dBZ/hr`,
      riskContributionWeight: 0.32,
      description: 'Rapid vertical development detected across dual-polarization differential reflectivity (ZDR) columns.',
      status: primaryStormCell.maxReflectivityDbz > 45 ? 'CRITICAL' : 'ELEVATED',
    },
    {
      factor: 'Satellite Cloud-Top Temperature',
      type: 'OBSERVED_EVIDENCE',
      observationValue: `${primaryStormCell.cloudTopTempC}°C`,
      deltaValue: '-14°C in last 30m',
      riskContributionWeight: 0.24,
      description: 'Thermal IR brightness plunge indicates vigorous convective updraft punching through tropopause inversion.',
      status: primaryStormCell.cloudTopTempC < -60 ? 'CRITICAL' : 'ELEVATED',
    },
    {
      factor: 'Total Precipitable Water (TPW)',
      type: 'THERMODYNAMIC_TRIGGER',
      observationValue: `${atmosphericState.tpwMm} mm`,
      deltaValue: counterfactuals.moistureDeltaPct !== 0 ? `${counterfactuals.moistureDeltaPct > 0 ? '+' : ''}${counterfactuals.moistureDeltaPct}% CF` : '+6.8 mm flux',
      riskContributionWeight: 0.20,
      description: 'Coastal sea-breeze moisture convergence pool providing continuous fuel for convective cells.',
      status: atmosphericState.tpwMm > 58 ? 'SURGING' : 'STABLE',
    },
    {
      factor: 'Convective Available Potential Energy (CAPE)',
      type: 'THERMODYNAMIC_TRIGGER',
      observationValue: `${atmosphericState.capeJkg} J/kg`,
      deltaValue: `CIN: ${atmosphericState.cinJkg} J/kg`,
      riskContributionWeight: 0.16,
      description: 'Severe boundary layer thermal destabilization with near-zero convective inhibition remaining.',
      status: atmosphericState.capeJkg > 2200 ? 'SURGING' : 'STABLE',
    },
    {
      factor: 'Total Lightning Discharge Acceleration',
      type: 'OBSERVED_EVIDENCE',
      observationValue: `${primaryStormCell.lightningFlashesPerMin} flashes/min`,
      deltaValue: primaryStormCell.lightningTrend === 'ACCELERATING' ? '5.2x Surge' : 'Stable Rate',
      riskContributionWeight: 0.08,
      description: 'Mixed-phase graupel-ice hydrometeor collisions accelerating in strong updraft core.',
      status: primaryStormCell.lightningFlashesPerMin > 25 ? 'CRITICAL' : 'STABLE',
    },
  ];

  // Probabilistic Futures
  const probabilisticScenarios: ProbabilisticScenario[] = [
    {
      id: 'scen-a',
      name: 'Scenario A: East-Northeast Propagation',
      description: 'Cell adheres to steering 700-500 hPa mean wind vector, impacting coastal urban basin within 45-75 min.',
      probabilityPct: scenario === 'NORMAL_WEATHER' ? 12 : 55,
      confidence: 'HIGH',
      peakReflectivityDbz: 56,
      peakRainfallMmh: 68,
      trackHeadingDeg: 55,
      trackSpeedKmh: 38,
    },
    {
      id: 'scen-b',
      name: 'Scenario B: Explosive Multi-Cell Inundation',
      description: 'Back-building feeder band merges, training over low-lying catchment zones with prolonged extreme rainfall.',
      probabilityPct: scenario === 'NORMAL_WEATHER' ? 5 : 30,
      confidence: 'MEDIUM',
      peakReflectivityDbz: 64,
      peakRainfallMmh: 95,
      trackHeadingDeg: 42,
      trackSpeedKmh: 24,
    },
    {
      id: 'scen-c',
      name: 'Scenario C: Convective Dissociation / Shear Collapse',
      description: 'Dry mid-level air entrainment causes premature downdraft choking, weakening the cell before urban landfall.',
      probabilityPct: scenario === 'NORMAL_WEATHER' ? 83 : 15,
      confidence: 'LOW',
      peakReflectivityDbz: 38,
      peakRainfallMmh: 14,
      trackHeadingDeg: 70,
      trackSpeedKmh: 44,
    },
  ];

  // Flood Risk Assessment
  const accumulatedRainMm = Math.round(clamp((baseRainRate * 1.8) + (tOffsetMin > 0 ? (tOffsetMin / 60) * baseRainRate * 0.7 : 12), 2, 195));
  const floodRisk: FloodRiskAssessment = {
    overallRisk: accumulatedRainMm > 110 ? 'VERY HIGH' : accumulatedRainMm > 60 ? 'HIGH' : accumulatedRainMm > 25 ? 'MODERATE' : 'LOW',
    accumulatedRainfallMm: accumulatedRainMm,
    runoffSusceptibilityPct: Math.round(clamp(accumulatedRainMm * 0.65 + (location.elevationM < 10 ? 25 : 5), 10, 96)),
    lowLyingVulnerabilityPct: Math.round(clamp(88 - location.elevationM * 0.8, 20, 95)),
    drainageSaturationPct: Math.round(clamp(accumulatedRainMm * 0.78, 15, 100)),
    affectedCatchments: (location.subDistricts || ['Urban Lowlands', 'Central Drain Basin']).map((sub, idx) => {
      const isLowest = idx === 0 || idx === 2;
      return {
        name: sub,
        waterLevelTrend: accumulatedRainMm > 70 ? 'SURGING' : accumulatedRainMm > 35 ? 'RISING RAPIDLY' : 'STABLE',
        inundationDepthEstCm: Math.round(clamp((accumulatedRainMm / 4.5) * (isLowest ? 1.6 : 0.8), 0, 140)),
        riskLevel: accumulatedRainMm > 90 && isLowest ? 'VERY HIGH' : accumulatedRainMm > 50 ? 'HIGH' : accumulatedRainMm > 20 ? 'MODERATE' : 'LOW',
      };
    }),
  };

  // Lightning Intelligence
  const lightning: LightningIntelligence = {
    activityLevel: primaryStormCell.lightningFlashesPerMin > 35 ? 'VIOLENT' : primaryStormCell.lightningFlashesPerMin > 15 ? 'ACTIVE' : primaryStormCell.lightningFlashesPerMin > 3 ? 'SCATTERED' : 'MINIMAL',
    strikeRatePerMin: primaryStormCell.lightningFlashesPerMin,
    trend: primaryStormCell.lightningTrend,
    chargeSeparationEstKvM: Math.round(clamp(primaryStormCell.maxReflectivityDbz * 2.8, 40, 190)),
    safetyRadiusKm: Number(clamp(primaryStormCell.radiusKm + 6, 4, 25).toFixed(1)),
    lastDetectionSecAgo: Math.round(clamp(60 / (primaryStormCell.lightningFlashesPerMin || 1), 2, 180)),
    highDensityZones: [
      { lat: primaryStormCell.lat, lng: primaryStormCell.lng, radiusKm: 4.5, density: primaryStormCell.lightningFlashesPerMin * 0.6 },
      { lat: primaryStormCell.lat + 0.04, lng: primaryStormCell.lng - 0.03, radiusKm: 3.0, density: primaryStormCell.lightningFlashesPerMin * 0.4 },
    ],
  };

  // Warning Notice
  const warning: WarningNotice = {
    id: `WARN-OP-${location.id}`,
    hazardType: scenario === 'SEVERE_THUNDERSTORM' ? 'Severe Thunderstorm & Flash Inundation' : scenario === 'MONSOON_CLOUDBURST' ? 'Extreme Cloudburst Inundation' : scenario === 'COASTAL_SQUALL' ? 'Gale-Force Coastal Squall' : 'Moderate Convective Activity',
    severity: hazardLevel,
    headline: `OPERATIONAL ADVISORY: ${hazardLevel} Threat Window for ${location.locality}, ${location.district}`,
    affectedArea: `${location.locality}, ${location.district} (${location.state})`,
    timeWindowStartMin: Math.max(0, tOffsetMin + 15),
    timeWindowEndMin: Math.max(45, tOffsetMin + 105),
    potentialImpacts: [
      'Localized waterlogging and storm drain overflow in low-elevation corridors.',
      'Surface wind gusts exceeding 65 km/h with tree branch defoliation risks.',
      'Frequent cloud-to-ground lightning discharges within 12 km radius.',
      'Commuter transport disruptions and reduced visibility below 800 meters.',
    ],
    recommendedActions: [
      'Avoid sheltering under isolated tall trees or temporary metal canopies.',
      'Relocate vehicles parked in known subterranean basements and low causeways.',
      'Clear storm gutters and secure rooftop lightweight objects.',
      'Follow official local emergency disaster management authority bulletins.',
    ],
    probabilityPct: atmosphericState.rainProbabilityPct,
    confidence: primaryStormCell.confidencePct > 75 ? 'HIGH' : primaryStormCell.confidencePct > 55 ? 'MEDIUM' : 'LOW',
    uncertaintyNote: `Ensemble standard deviation: ±${primaryStormCell.uncertaintyMarginPct}%. High-resolution operational nowcasting.`,
    reasons: [
      `Radar echo intensification to ${primaryStormCell.maxReflectivityDbz} dBZ.`,
      `Extreme thermodynamic instability (CAPE: ${atmosphericState.capeJkg} J/kg).`,
      `Low-level boundary moisture flux pooling at ${atmosphericState.tpwMm} mm TPW.`,
    ],
    leadTimeMinutes: Math.max(15, stormPeakTime - tOffsetMin),
  };

  // Hourly Nowcast Array (NOW to +24h)
  const hourlyForecasts: HourlyForecast[] = Array.from({ length: 14 }).map((_, i) => {
    const offsets = [0, 15, 30, 45, 60, 90, 120, 180, 240, 360, 480, 720, 960, 1440];
    const offset = offsets[i];
    const hourVal = Math.floor(offset / 60);
    const minVal = offset % 60;
    const label = offset === 0 ? 'NOW' : hourVal === 0 ? `+${minVal}m` : `+${hourVal}h`;
    const futureBell = gaussian(offset, stormPeakTime, 80);
    const hRainRate = Number((scenario === 'NORMAL_WEATHER' ? 0 : futureBell * 65 * intensityMultiplier).toFixed(1));
    return {
      timeOffsetMin: offset,
      timeLabel: label,
      tempC: Number((baseTemp - (hRainRate > 10 ? 5 : 0) + Math.sin(offset / 300) * 2).toFixed(1)),
      condition: hRainRate > 40 ? 'Severe Thunderstorm' : hRainRate > 10 ? 'Heavy Downpour' : hRainRate > 2 ? 'Scattered Rain' : 'Partly Cloudy',
      rainProbabilityPct: Math.round(clamp(futureBell * 95, 8, 96)),
      precipitationMmh: hRainRate,
      windSpeedKmh: Math.round(16 + futureBell * 42),
      windDirectionDeg: Math.round((baseWindDir + (offset / 10)) % 360),
      radarReflectivityDbz: Math.round(clamp(20 + futureBell * 44, 15, 65)),
      lightningPotentialPct: Math.round(clamp(futureBell * 88, 0, 95)),
      floodPotentialPct: Math.round(clamp((offset > 45 ? 55 : 20) + futureBell * 35, 10, 92)),
    };
  });

  // Daily 7-Day Forecast
  const dailyForecasts: DailyForecast[] = [
    {
      dayLabel: 'Today',
      dateStr: 'Mon 07 Sep',
      maxTempC: 34,
      minTempC: 26,
      condition: scenario === 'NORMAL_WEATHER' ? 'Mostly Sunny' : 'Severe Convective Rain',
      precipitationProbabilityPct: atmosphericState.rainProbabilityPct,
      precipitationMm: accumulatedRainMm,
      severeRisk: hazardLevel,
    },
    {
      dayLabel: 'Tomorrow',
      dateStr: 'Tue 08 Sep',
      maxTempC: 33,
      minTempC: 25,
      condition: 'Scattered Thunderstorms',
      precipitationProbabilityPct: 65,
      precipitationMm: 38,
      severeRisk: 'WATCH',
    },
    {
      dayLabel: 'Wed',
      dateStr: 'Wed 09 Sep',
      maxTempC: 32,
      minTempC: 25,
      condition: 'Monsoon Showers',
      precipitationProbabilityPct: 75,
      precipitationMm: 45,
      severeRisk: 'ADVISORY',
    },
    {
      dayLabel: 'Thu',
      dateStr: 'Thu 10 Sep',
      maxTempC: 34,
      minTempC: 26,
      condition: 'Isolated Showers',
      precipitationProbabilityPct: 35,
      precipitationMm: 12,
      severeRisk: 'NORMAL',
    },
    {
      dayLabel: 'Fri',
      dateStr: 'Fri 11 Sep',
      maxTempC: 35,
      minTempC: 27,
      condition: 'Warm & Humid',
      precipitationProbabilityPct: 20,
      precipitationMm: 2,
      severeRisk: 'NORMAL',
    },
    {
      dayLabel: 'Sat',
      dateStr: 'Sat 12 Sep',
      maxTempC: 34,
      minTempC: 26,
      condition: 'Evening Squall Risk',
      precipitationProbabilityPct: 55,
      precipitationMm: 28,
      severeRisk: 'WATCH',
    },
    {
      dayLabel: 'Sun',
      dateStr: 'Sun 13 Sep',
      maxTempC: 33,
      minTempC: 25,
      condition: 'Passing Clouds',
      precipitationProbabilityPct: 30,
      precipitationMm: 5,
      severeRisk: 'NORMAL',
    },
  ];

  // Ingest Sensor Health Status
  const dataHealthSources: DataHealthSource[] = [
    {
      name: 'INSAT-3DR / 3DS Multi-Spectral Satellite',
      type: 'Thermal IR & Water Vapor Imager',
      status: 'FRESH',
      latencySec: 142,
      lastUpdate: '2.4 min ago (Sector Scan)',
      reliabilityPct: 99.4,
    },
    {
      name: `${location.radarStationCode} Doppler Weather Radar`,
      type: 'Dual-Polarization S/C-Band DWR',
      status: 'FRESH',
      latencySec: 58,
      lastUpdate: '58 sec ago (Volume Scan VCP-12)',
      reliabilityPct: 98.8,
    },
    {
      name: 'IMD AWS & Urban Mesonet Network',
      type: 'Surface Automatic Weather Stations',
      status: 'PARTIAL',
      latencySec: 320,
      lastUpdate: '5.3 min ago (24/28 active)',
      reliabilityPct: 87.5,
    },
    {
      name: 'Indian Lightning Location Network (ILLN)',
      type: 'VLF/LF Total Lightning Sensors',
      status: 'FRESH',
      latencySec: 12,
      lastUpdate: '12 sec ago (Real-time Stream)',
      reliabilityPct: 99.8,
    },
    {
      name: 'NCMRWF Unified Model & IMDAA Reanalysis',
      type: 'High-Res Numerical Weather Prediction',
      status: 'FRESH',
      latencySec: 3600,
      lastUpdate: '00Z Run Synchronized',
      reliabilityPct: 96.2,
    },
    {
      name: 'ISRO CartoDEM / HydroSHEDS Topography',
      type: 'High-Resolution Surface Hydrology',
      status: 'FRESH',
      latencySec: 0,
      lastUpdate: 'Pre-Computed Catchment Mesh',
      reliabilityPct: 100.0,
    },
  ];

  // Verification & Local Calibration Memory Metrics
  const verificationMetrics: VerificationMetrics = {
    criticalSuccessIndex: 0.742,
    probabilityOfDetection: 0.884,
    falseAlarmRatio: 0.168,
    brierScore: 0.124,
    crpsScore: 1.82,
    meanAbsoluteErrorTempC: 0.85,
    rootMeanSquareErrorRainfallMmh: 4.2,
    meanLeadTimeMinutes: 52,
    localBiasCorrection: {
      district: location.district,
      season: 'Southwest / Inter-Monsoon Convective',
      rainfallBiasPct: 6.8,
      windDirectionBiasDeg: -4.2,
      calibrationFactor: 0.94,
    },
  };

  return {
    location,
    tOffsetMin,
    scenario,
    atmosphericState,
    stormCells: scenario === 'NORMAL_WEATHER' ? [] : [primaryStormCell, secondaryStormCell],
    primaryStormCell,
    whyNowEvidence,
    probabilisticScenarios,
    floodRisk,
    lightning,
    warning,
    hourlyForecasts,
    dailyForecasts,
    dataHealthSources,
    verificationMetrics,
  };
}
