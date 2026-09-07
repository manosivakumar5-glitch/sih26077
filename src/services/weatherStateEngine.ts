import { AtmosphericState, StormCell, VisualizationParams } from '../types/weather';

/**
 * Bridges raw physical meteorological variables into high-performance visual parameters
 * for GPU canvas rendering, particle dynamics, and shader simulations.
 */
export function calculateVisualizationParams(
  atmosphere: AtmosphericState,
  primaryStorm?: StormCell
): VisualizationParams {
  const rainRate = atmosphere.rainfallRateMmh;
  const windSpeed = atmosphere.windSpeedKmh;
  const windDir = atmosphere.windDirectionDeg;
  const cloudCover = atmosphere.cloudCoverPct;
  const stormIntensity = primaryStorm ? primaryStorm.maxReflectivityDbz / 70 : 0.1;
  const lightningFlashes = primaryStorm ? primaryStorm.lightningFlashesPerMin : 0;

  // Rain Particle Parameters
  // Particle density: scales from 0 up to 1200 particles
  let rainDensity = 0;
  if (rainRate > 0.5) {
    rainDensity = Math.min(1200, Math.floor(60 + rainRate * 12));
  }

  // Rain fall speed (pixels per frame)
  const rainSpeed = Math.min(28, Math.max(8, 12 + rainRate * 0.18 + windSpeed * 0.1));

  // Trajectory angle based on wind direction
  // If wind is coming from 90° (East), rain is pushed West (towards 270°)
  // Angle deviation from vertical (0° = straight down)
  const rainAngleDeg = Math.sin((windDir * Math.PI) / 180) * Math.min(38, windSpeed * 0.55);

  // Cloud Layer Parameters
  const cloudOpacity = Math.min(0.92, Math.max(0.2, (cloudCover / 100) * 0.85));
  const cloudSpeed = Math.min(1.8, Math.max(0.15, (windSpeed / 50) * 0.8));

  // Cloud coloring based on convective storm presence
  let cloudColor = 'rgba(20, 28, 48, 0.4)';
  if (stormIntensity > 0.6) {
    // Menacing greenish-black supercell tone
    cloudColor = 'rgba(10, 16, 26, 0.85)';
  } else if (stormIntensity > 0.3) {
    cloudColor = 'rgba(16, 24, 40, 0.65)';
  }

  // Wind streamline speed
  const windParticleSpeed = Math.min(3.5, Math.max(0.4, (windSpeed / 30) * 1.2));

  // Lightning flash trigger interval (ms)
  // If high lightning rate, interval is 1200ms - 4000ms, otherwise null/rare
  let lightningFrequencyMs = 0;
  if (lightningFlashes > 30) {
    lightningFrequencyMs = 1800;
  } else if (lightningFlashes > 10) {
    lightningFrequencyMs = 4500;
  } else if (lightningFlashes > 2) {
    lightningFrequencyMs = 9000;
  }

  // Atmospheric haze and mist from heavy rain
  const atmosphericHaze = Math.min(0.75, (rainRate / 90) * 0.65 + (atmosphere.humidityPct > 85 ? 0.15 : 0));

  return {
    rainDensity,
    rainSpeed,
    rainAngleDeg,
    cloudOpacity,
    cloudSpeed,
    cloudColor,
    windParticleSpeed,
    lightningFrequencyMs,
    atmosphericHaze,
    radarVisualIntensity: stormIntensity,
    stormVisualIntensity: Math.min(1.0, stormIntensity * 1.2),
  };
}
