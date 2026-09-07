/**
 * STORM-MIND: Self-Learning Probabilistic Weather Digital Twin
 * SIH26077 — AI-Driven Hyper-Local Early Warning System for Severe Weather Nowcasting
 * Dynamic Weather Environment & Multi-Page Navigation Architecture
 */

import React, { useEffect, useMemo, useState } from 'react';
import { DEFAULT_LOCATION } from './data/locations';
import {
  LocationInfo,
  MapLayerState,
  ScenarioPreset,
  StormCell,
} from './types/weather';
import {
  DEFAULT_COUNTERFACTUALS,
  simulateAtmosphericEnvironment,
} from './services/weatherSimulation';
import {
  WeatherCondition,
  TimeOfDay,
  WeatherSceneState,
  determineWeatherCondition,
  determineTimeOfDay,
  getWeatherSummaryPhrase,
} from './services/weatherSceneEngine';

import { LivingWeatherBackground } from './components/visualization/LivingWeatherBackground';
import { AppNavBar, StormMindPage } from './components/navigation/AppNavBar';
import { OverviewView } from './components/views/OverviewView';
import { WeatherHeroCard } from './components/dashboard/WeatherHeroCard';
import { MeteorologicalMap } from './components/map/MeteorologicalMap';
import { LayerController } from './components/map/LayerController';
import { FutureEarthTimeline } from './components/timeline/FutureEarthTimeline';
import { OverviewPanel } from './components/dashboard/OverviewPanel';

import { LiveRadarView } from './components/views/LiveRadarView';
import { SatelliteView } from './components/views/SatelliteView';
import { ForecastView } from './components/views/ForecastView';
import { AiAnalysisView } from './components/views/AiAnalysisView';
import { ImpactView } from './components/views/ImpactView';

import { StormDnaModal } from './components/storm/StormDnaModal';
import { WhyNowPanel } from './components/explainability/WhyNowPanel';
import { ProbabilisticFuturesPanel } from './components/scenarios/ProbabilisticFuturesPanel';
import { AtmosphericStatePanel } from './components/atmosphere/AtmosphericStatePanel';
import { FloodImpactPanel } from './components/impact/FloodImpactPanel';
import { LightningIntelligencePanel } from './components/impact/LightningIntelligencePanel';
import { VerificationPanel } from './components/verification/VerificationPanel';
import { DataHealthModal } from './components/system/DataHealthModal';
import { EverydayWeatherDrawer } from './components/dashboard/EverydayWeatherDrawer';
import { PresentationModeOverlay } from './components/presentation/PresentationModeOverlay';

import { PanelRightClose, SlidersHorizontal, Sparkles } from 'lucide-react';

const INITIAL_LAYERS: MapLayerState = {
  clouds: true,
  radar: true,
  rain: true,
  wind: true,
  lightning: true,
  stormCells: true,
  floodRisk: true,
  warningZones: true,
  terrain3d: false,
  opacity: {
    radar: 0.85,
    clouds: 0.65,
    flood: 0.75,
    wind: 0.6,
  },
};

export default function App() {
  // 4. Multi-Page Navigation State (Overview, Live Radar, Satellite, Forecast, AI Analysis, Impact)
  const [currentPage, setCurrentPage] = useState<StormMindPage>('OVERVIEW');

  // 2. Reliable Storm Cell DNA Profiler State
  const [selectedStormCell, setSelectedStormCell] = useState<StormCell | null>(null);

  // Automatically close any storm modal when switching pages
  useEffect(() => {
    setSelectedStormCell(null);
  }, [currentPage]);

  // Core Meteorological State
  const [location, setLocation] = useState<LocationInfo>(DEFAULT_LOCATION);
  const [scenario, setScenario] = useState<ScenarioPreset>('SEVERE_THUNDERSTORM');
  const [intensity, setIntensity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME'>('HIGH');
  const [tOffsetMin, setToffsetMin] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [is3d, setIs3d] = useState<boolean>(false);
  const [mapLayers, setMapLayers] = useState<MapLayerState>(INITIAL_LAYERS);
  const [counterfactuals, setCounterfactuals] = useState(DEFAULT_COUNTERFACTUALS);

  // Manual Scene Overrides
  const [conditionOverride, setConditionOverride] = useState<WeatherCondition | null>(null);
  const [timeOfDayOverride, setTimeOfDayOverride] = useState<TimeOfDay | null>(null);

  // Secondary Diagnostic Panels
  type SecondaryModalType =
    | null
    | 'WHY_NOW'
    | 'FUTURES'
    | 'ATMOSPHERE'
    | 'FLOOD'
    | 'LIGHTNING'
    | 'VERIFICATION'
    | 'HEALTH'
    | 'EVERYDAY';
  const [activeSecondaryModal, setActiveSecondaryModal] = useState<SecondaryModalType>(null);
  const [activeScenarioId, setActiveScenarioId] = useState<string>('scen-a');
  const [isAdvancedDrawerOpen, setIsAdvancedDrawerOpen] = useState<boolean>(false);
  const [presentationMode, setPresentationMode] = useState<boolean>(false);

  // Numerical intensity multiplier
  const intensityMultiplier =
    intensity === 'EXTREME'
      ? 1.6
      : intensity === 'HIGH'
      ? 1.3
      : intensity === 'MEDIUM'
      ? 1.0
      : 0.7;

  // Run physical atmospheric simulation
  const simulation = useMemo(() => {
    return simulateAtmosphericEnvironment(
      location,
      scenario,
      intensityMultiplier,
      tOffsetMin,
      counterfactuals
    );
  }, [location, scenario, intensityMultiplier, tOffsetMin, counterfactuals]);

  // Synthesize Dynamic Weather Scene State from physics + user timeline
  const sceneState = useMemo((): WeatherSceneState => {
    const atmo = simulation.atmosphericState;
    const primary = simulation.primaryStormCell;

    const naturalCondition = determineWeatherCondition(
      atmo.rainfallRateMmh,
      atmo.cloudCoverPct,
      atmo.visibilityKm,
      primary ? primary.lightningFlashesPerMin : 0,
      scenario
    );
    const naturalTimeOfDay = determineTimeOfDay(tOffsetMin);

    const activeCondition = conditionOverride || naturalCondition;
    const activeTimeOfDay = timeOfDayOverride || naturalTimeOfDay;

    let adjustedRainIntensity = atmo.rainfallRateMmh;
    let adjustedCloudCover = atmo.cloudCoverPct;
    let adjustedLightningPotential = primary ? primary.lightningFlashesPerMin * 2 : 0;
    let adjustedVisibility = atmo.visibilityKm;

    if (conditionOverride === 'SUNNY') {
      adjustedRainIntensity = 0;
      adjustedCloudCover = 15;
      adjustedLightningPotential = 0;
      adjustedVisibility = 12;
    } else if (conditionOverride === 'PARTLY_CLOUDY') {
      adjustedRainIntensity = 0;
      adjustedCloudCover = 40;
      adjustedLightningPotential = 0;
      adjustedVisibility = 10;
    } else if (conditionOverride === 'CLOUDY') {
      adjustedRainIntensity = 0;
      adjustedCloudCover = 85;
      adjustedLightningPotential = 0;
      adjustedVisibility = 8;
    } else if (conditionOverride === 'RAIN') {
      adjustedRainIntensity = Math.max(12, atmo.rainfallRateMmh || 18);
      adjustedCloudCover = 92;
      adjustedLightningPotential = 15;
      adjustedVisibility = 4.5;
    } else if (conditionOverride === 'THUNDERSTORM') {
      adjustedRainIntensity = Math.max(45, atmo.rainfallRateMmh || 55);
      adjustedCloudCover = 98;
      adjustedLightningPotential = 85;
      adjustedVisibility = 2.0;
    } else if (conditionOverride === 'FOG') {
      adjustedRainIntensity = 0;
      adjustedCloudCover = 75;
      adjustedLightningPotential = 0;
      adjustedVisibility = 1.2;
    }

    const description = getWeatherSummaryPhrase(
      activeCondition,
      atmo.temperatureC,
      atmo.windSpeedKmh,
      adjustedRainIntensity
    );

    let hazardStatus: WeatherSceneState['hazardStatus'] = 'ALL_CLEAR';
    if (atmo.hazardLevel === 'EXTREME') hazardStatus = 'EXTREME';
    else if (atmo.hazardLevel === 'SEVERE' || atmo.hazardLevel === 'WARNING') hazardStatus = 'WARNING';
    else if (atmo.hazardLevel === 'WATCH') hazardStatus = 'WATCH';
    else if (atmo.hazardLevel === 'ADVISORY') hazardStatus = 'ADVISORY';

    return {
      condition: activeCondition,
      temperature: atmo.temperatureC,
      cloudCover: adjustedCloudCover,
      rainProbability: atmo.rainProbabilityPct,
      rainIntensity: adjustedRainIntensity,
      windSpeed: atmo.windSpeedKmh,
      windDirection: atmo.windDirectionDeg,
      lightningPotential: adjustedLightningPotential,
      visibility: adjustedVisibility,
      timeOfDay: activeTimeOfDay,
      stormIntensity: primary ? primary.maxReflectivityDbz / 70 : 0.1,
      description,
      hazardStatus,
    };
  }, [simulation, scenario, tOffsetMin, conditionOverride, timeOfDayOverride]);

  // Handlers
  const handleOpenStormCell = (storm: StormCell) => {
    // Opens profiler without altering the current page/view route
    setSelectedStormCell(storm);
  };

  const handleCloseStormCell = () => {
    // Closes profiler and returns user directly to whatever page they were on
    setSelectedStormCell(null);
  };

  const handleResetLayers = () => {
    setMapLayers(INITIAL_LAYERS);
  };

  const handleResetTimeline = () => {
    setToffsetMin(0);
    setIsPlaying(false);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col font-mono-code select-none text-slate-100 bg-slate-950">
      
      {/* Living Atmospheric WeatherSceneEngine (GPU Canvas) */}
      <LivingWeatherBackground
        sceneState={sceneState}
        windEnabled={mapLayers.wind}
        rainEnabled={mapLayers.rain}
        cloudsEnabled={mapLayers.clouds}
        lightningEnabled={mapLayers.lightning}
      />

      {/* Main Top App Navigation Bar (Overview, Live Radar, Satellite, Forecast, AI Analysis, Impact) */}
      <AppNavBar
        currentPage={currentPage}
        onSelectPage={setCurrentPage}
        activeStormCount={simulation.stormCells.length}
        hasSevereAlert={simulation.warning.level === 'WARNING'}
        presentationMode={presentationMode}
        onTogglePresentationMode={() => setPresentationMode(!presentationMode)}
      />

      {/* Presentation Mode Stepper Overlay */}
      <PresentationModeOverlay
        isActive={presentationMode}
        onToggle={() => setPresentationMode(false)}
        onTriggerStep={(step) => {
          if (step === 1) {
            setCurrentPage('OVERVIEW');
            setLocation(DEFAULT_LOCATION);
            setToffsetMin(0);
          } else if (step === 2) {
            setCurrentPage('RADAR');
          } else if (step === 3) {
            setActiveSecondaryModal('ATMOSPHERE');
          } else if (step === 4) {
            setCurrentPage('SATELLITE');
          } else if (step === 6) {
            setToffsetMin(60);
          } else if (step === 7) {
            handleOpenStormCell(simulation.primaryStormCell);
          } else if (step === 8) {
            setCurrentPage('AI_ANALYSIS');
          } else if (step === 10) {
            setCurrentPage('IMPACT');
          }
        }}
      />

      {/* Main Application Page View Body */}
      <main
        className={`relative flex-1 w-full z-10 ${
          currentPage === 'RADAR' || currentPage === 'SATELLITE'
            ? 'h-[calc(100vh-57px)] min-h-[500px] flex flex-col overflow-hidden'
            : 'min-h-[calc(100vh-57px)] flex flex-col'
        }`}
      >
        {/* PAGE 1: OVERVIEW (Scrollable Command Center) */}
        {currentPage === 'OVERVIEW' && (
          <OverviewView
            location={location}
            onSelectLocation={(loc) => {
              setLocation(loc);
              handleResetTimeline();
            }}
            sceneState={sceneState}
            atmosphere={simulation.atmosphericState}
            hourlyForecasts={simulation.hourlyForecasts}
            tOffsetMin={tOffsetMin}
            onSelectTimeOffset={setToffsetMin}
            activeScenario={scenario}
            onSelectScenario={(scen) => {
              setScenario(scen);
              handleResetTimeline();
            }}
            conditionOverride={conditionOverride}
            timeOfDayOverride={timeOfDayOverride}
            onSelectConditionOverride={setConditionOverride}
            onSelectTimeOfDayOverride={setTimeOfDayOverride}
            mapLayers={mapLayers}
            onChangeMapLayers={setMapLayers}
            onResetMapLayers={handleResetLayers}
            stormCells={simulation.stormCells}
            primaryStorm={simulation.primaryStormCell}
            selectedStormCell={selectedStormCell}
            onSelectStormCell={handleOpenStormCell}
            floodRisk={simulation.floodRisk}
            lightning={simulation.lightning}
            warning={simulation.warning}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            playbackSpeed={playbackSpeed}
            onChangePlaybackSpeed={setPlaybackSpeed}
            onResetTimeline={handleResetTimeline}
            is3d={is3d}
            onToggle3d={() => setIs3d(!is3d)}
            onOpenStormDna={() => handleOpenStormCell(simulation.primaryStormCell)}
            onOpenWhyNow={() => setActiveSecondaryModal('WHY_NOW')}
            onOpenEverydayWeather={() => setActiveSecondaryModal('EVERYDAY')}
            onOpenDataHealth={() => setActiveSecondaryModal('HEALTH')}
            onOpenAtmosphere={() => setActiveSecondaryModal('ATMOSPHERE')}
            onOpenFutures={() => setActiveSecondaryModal('FUTURES')}
            onOpenFlood={() => setActiveSecondaryModal('FLOOD')}
            onOpenLightning={() => setActiveSecondaryModal('LIGHTNING')}
            onOpenVerification={() => setActiveSecondaryModal('VERIFICATION')}
          />
        )}

        {/* PAGE 2: LIVE RADAR */}
        {currentPage === 'RADAR' && (
          <LiveRadarView
            location={location}
            onSelectLocation={(loc) => {
              setLocation(loc);
              handleResetTimeline();
            }}
            layers={mapLayers}
            onChangeLayers={setMapLayers}
            stormCells={simulation.stormCells}
            selectedStorm={selectedStormCell}
            onSelectStorm={handleOpenStormCell}
            floodRisk={simulation.floodRisk}
            lightning={simulation.lightning}
            warning={simulation.warning}
            tOffsetMin={tOffsetMin}
            onChangeTOffsetMin={setToffsetMin}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            playbackSpeed={playbackSpeed}
            onChangePlaybackSpeed={setPlaybackSpeed}
            is3d={is3d}
            onToggle3d={() => setIs3d(!is3d)}
            onNavigateToOverview={() => setCurrentPage('OVERVIEW')}
          />
        )}

        {/* PAGE 3: SATELLITE */}
        {currentPage === 'SATELLITE' && (
          <SatelliteView
            location={location}
            onSelectLocation={(loc) => {
              setLocation(loc);
              handleResetTimeline();
            }}
            layers={mapLayers}
            onChangeLayers={setMapLayers}
            atmosphere={simulation.atmosphericState}
            floodRisk={simulation.floodRisk}
            lightning={simulation.lightning}
            warning={simulation.warning}
            tOffsetMin={tOffsetMin}
            onChangeTOffsetMin={setToffsetMin}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            playbackSpeed={playbackSpeed}
            onChangePlaybackSpeed={setPlaybackSpeed}
            is3d={is3d}
            onToggle3d={() => setIs3d(!is3d)}
            onNavigateToOverview={() => setCurrentPage('OVERVIEW')}
          />
        )}

        {/* PAGE 4: FORECAST */}
        {currentPage === 'FORECAST' && (
          <ForecastView
            location={location}
            atmosphere={simulation.atmosphericState}
            hourlyForecasts={simulation.hourlyForecasts}
            dailyForecasts={simulation.dailyForecasts}
            scenarios={simulation.probabilisticScenarios}
          />
        )}

        {/* PAGE 5: AI ANALYSIS */}
        {currentPage === 'AI_ANALYSIS' && (
          <AiAnalysisView
            location={location}
            atmosphere={simulation.atmosphericState}
            storm={simulation.primaryStormCell}
            evidence={simulation.whyNowEvidence}
            counterfactuals={counterfactuals}
            onUpdateCounterfactuals={setCounterfactuals}
            verification={simulation.verificationMetrics}
            onOpenStormDna={() => handleOpenStormCell(simulation.primaryStormCell)}
          />
        )}

        {/* PAGE 6: IMPACT */}
        {currentPage === 'IMPACT' && (
          <ImpactView
            location={location}
            floodRisk={simulation.floodRisk}
            lightning={simulation.lightning}
            warning={simulation.warning}
            atmosphere={simulation.atmosphericState}
          />
        )}
      </main>

      {/* 2 & 3. STRICT CONDITIONAL RENDERING OF CONVECTIVE CELL DNA PROFILER */}
      {/* When selectedStormCell is null, NO modal, NO backdrop, NO blocker is rendered! */}
      {selectedStormCell && (
        <StormDnaModal
          storm={selectedStormCell}
          onClose={handleCloseStormCell}
        />
      )}

      {/* Secondary Deep Modals */}
      <WhyNowPanel
        isOpen={activeSecondaryModal === 'WHY_NOW'}
        onClose={() => setActiveSecondaryModal(null)}
        evidence={simulation.whyNowEvidence}
        atmosphere={simulation.atmosphericState}
        storm={simulation.primaryStormCell}
        counterfactuals={counterfactuals}
        onUpdateCounterfactuals={setCounterfactuals}
      />

      <ProbabilisticFuturesPanel
        isOpen={activeSecondaryModal === 'FUTURES'}
        onClose={() => setActiveSecondaryModal(null)}
        scenarios={simulation.probabilisticScenarios}
        activeScenarioId={activeScenarioId}
        onSelectScenario={setActiveScenarioId}
      />

      <AtmosphericStatePanel
        isOpen={activeSecondaryModal === 'ATMOSPHERE'}
        onClose={() => setActiveSecondaryModal(null)}
        atmosphere={simulation.atmosphericState}
        location={location}
      />

      <FloodImpactPanel
        isOpen={activeSecondaryModal === 'FLOOD'}
        onClose={() => setActiveSecondaryModal(null)}
        floodRisk={simulation.floodRisk}
        location={location}
      />

      <LightningIntelligencePanel
        isOpen={activeSecondaryModal === 'LIGHTNING'}
        onClose={() => setActiveSecondaryModal(null)}
        lightning={simulation.lightning}
        storm={simulation.primaryStormCell}
        location={location}
      />

      <VerificationPanel
        isOpen={activeSecondaryModal === 'VERIFICATION'}
        onClose={() => setActiveSecondaryModal(null)}
        metrics={simulation.verificationMetrics}
        location={location}
      />

      <DataHealthModal
        isOpen={activeSecondaryModal === 'HEALTH'}
        onClose={() => setActiveSecondaryModal(null)}
        sources={simulation.dataHealthSources}
      />

      <EverydayWeatherDrawer
        isOpen={activeSecondaryModal === 'EVERYDAY'}
        onClose={() => setActiveSecondaryModal(null)}
        location={location}
        atmosphere={simulation.atmosphericState}
        hourlyForecasts={simulation.hourlyForecasts}
        dailyForecasts={simulation.dailyForecasts}
      />
    </div>
  );
}
