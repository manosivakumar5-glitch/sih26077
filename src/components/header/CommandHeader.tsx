import React, { useState } from 'react';
import { LocationInfo, ScenarioPreset } from '../../types/weather';
import { LOCATIONS } from '../../data/locations';
import {
  Activity,
  AlertTriangle,
  Award,
  CloudRain,
  Compass,
  Database,
  Eye,
  Layers,
  MapPin,
  Maximize,
  Play,
  Radio,
  Search,
  Settings,
  ShieldAlert,
  Sparkles,
  Waves,
  Zap,
} from 'lucide-react';

interface CommandHeaderProps {
  currentLocation: LocationInfo;
  onSelectLocation: (loc: LocationInfo) => void;
  activeScenario: ScenarioPreset;
  onSelectScenario: (scen: ScenarioPreset) => void;
  scenarioIntensity: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  onChangeIntensity: (val: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME') => void;
  isMonitoring: boolean;
  onToggleMonitoring: () => void;
  presentationMode: boolean;
  onTogglePresentationMode: () => void;
  onOpenView: (view: 'FUTURE' | 'DNA' | 'WHY_NOW' | 'FUTURES' | 'ATMOSPHERE' | 'FLOOD' | 'LIGHTNING' | 'VERIFICATION' | 'HEALTH' | 'EVERYDAY') => void;
}

export const CommandHeader: React.FC<CommandHeaderProps> = ({
  currentLocation,
  onSelectLocation,
  activeScenario,
  onSelectScenario,
  scenarioIntensity,
  onChangeIntensity,
  isMonitoring,
  onToggleMonitoring,
  presentationMode,
  onTogglePresentationMode,
  onOpenView,
}) => {
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLocations = LOCATIONS.filter(
    (l) =>
      l.locality.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <header className="relative z-30 bg-[#060c18]/95 border-b border-cyan-500/25 px-4 py-2.5 backdrop-blur-xl font-mono-code text-xs select-none">
      {/* Top Banner: Operational Telemetry & System Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800/80 text-[10px]">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
            OPERATIONAL NOWCASTING ACTIVE
          </span>
          <span className="text-slate-300 hidden sm:inline font-semibold">
            CLIMORA STORM-MIND • Severe Convective Weather Early Warning System
          </span>
        </div>

        <div className="flex items-center gap-3 text-slate-400">
          <span className="text-cyan-400">DWR DOPPLER RADAR NETWORK SYNCHRONIZED</span>
          <span>•</span>
          <span>THERMODYNAMIC EQUILIBRIUM COUPLING</span>
        </div>
      </div>

      {/* Main Command Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        {/* Logo & Product Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-slate-950 font-black shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <Sparkles className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold text-white font-tech tracking-wider">
                  STORM-MIND
                </span>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-500/30">
                  v2.6
                </span>
              </div>
              <div className="text-[10px] text-slate-400 tracking-tight hidden md:block">
                Probabilistic Neuro-Symbolic Weather Digital Twin
              </div>
            </div>
          </div>
        </div>

        {/* Location Selector Dropdown */}
        <div className="relative">
          <button
            id="location-selector-btn"
            onClick={() => setShowLocationDropdown(!showLocationDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#091325] border border-cyan-500/40 text-slate-200 hover:border-cyan-400 transition-colors shadow-md"
          >
            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="font-bold text-xs text-white truncate max-w-[200px]">
              {currentLocation.locality}
            </span>
            <span className="text-slate-500 text-[10px]">({currentLocation.district})</span>
          </button>

          {showLocationDropdown && (
            <div className="absolute top-full left-0 mt-1.5 w-80 bg-[#070e1c] border border-cyan-500/40 rounded-2xl p-2.5 shadow-2xl backdrop-blur-2xl z-50 space-y-2">
              <div className="flex items-center gap-1.5 bg-[#050b16] border border-slate-800 rounded-lg px-2 py-1">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search locality or district..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-xs text-slate-100 placeholder-slate-500 outline-none w-full"
                />
              </div>

              <div className="max-h-60 overflow-y-auto space-y-1 scrollbar-thin">
                {filteredLocations.map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => {
                      onSelectLocation(loc);
                      setShowLocationDropdown(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg transition-colors flex flex-col ${
                      loc.id === currentLocation.id
                        ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/30'
                        : 'hover:bg-slate-800/60 text-slate-300'
                    }`}
                  >
                    <span className="font-bold text-xs text-white">{loc.locality}</span>
                    <span className="text-[10px] text-slate-400">
                      {loc.district}, {loc.state} • Elev {loc.elevationM}m
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Scenario Controls & Intensity */}
        <div className="flex items-center gap-2">
          {/* Scenario Selector */}
          <select
            id="simulation-scenario-select"
            value={activeScenario}
            onChange={(e) => onSelectScenario(e.target.value as ScenarioPreset)}
            className="bg-[#091325] border border-slate-700 text-slate-200 rounded-xl px-2.5 py-1.5 text-xs outline-none focus:border-cyan-400 cursor-pointer"
          >
            <option value="SEVERE_THUNDERSTORM">Scenario: Severe Thunderstorm</option>
            <option value="MONSOON_CLOUDBURST">Scenario: Monsoon Cloudburst</option>
            <option value="COASTAL_SQUALL">Scenario: Coastal Squall</option>
            <option value="FLASH_FLOOD">Scenario: Flash Flood Emergency</option>
            <option value="NORMAL_WEATHER">Scenario: Normal Fair Weather</option>
          </select>

          {/* Intensity Toggle */}
          <div className="hidden lg:flex items-center bg-[#091325] border border-slate-700 rounded-xl p-0.5 text-[10px]">
            {(['LOW', 'MEDIUM', 'HIGH', 'EXTREME'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => onChangeIntensity(lvl)}
                className={`px-2 py-1 rounded-lg font-bold transition-all ${
                  scenarioIntensity === lvl
                    ? lvl === 'EXTREME'
                      ? 'bg-purple-600 text-white'
                      : lvl === 'HIGH'
                      ? 'bg-red-600 text-white'
                      : lvl === 'MEDIUM'
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-cyan-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Start / Stop Monitoring Button */}
          <button
            id="start-monitoring-toggle-btn"
            onClick={onToggleMonitoring}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all border shadow-lg ${
              isMonitoring
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_12px_rgba(52,211,153,0.3)]'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isMonitoring ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'
              }`}
            />
            <span>{isMonitoring ? 'MONITORING ACTIVE' : 'START MONITORING'}</span>
          </button>

          {/* Presentation Mode Button */}
          <button
            id="toggle-presentation-mode-btn"
            onClick={onTogglePresentationMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all border ${
              presentationMode
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                : 'bg-indigo-950/40 text-indigo-300 border-indigo-500/40 hover:bg-indigo-900/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PRESENTATION MODE</span>
          </button>
        </div>
      </div>

      {/* Horizontal Command Navigation Links */}
      <nav className="flex items-center gap-1 pt-2.5 overflow-x-auto scrollbar-none text-[11px]">
        <button
          id="nav-btn-future-earth"
          onClick={() => onOpenView('FUTURE')}
          className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 shrink-0"
        >
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>Future Earth</span>
        </button>

        <button
          id="nav-btn-storm-dna"
          onClick={() => onOpenView('DNA')}
          className="px-2.5 py-1 rounded-lg hover:bg-slate-800/80 text-slate-300 flex items-center gap-1.5 shrink-0"
        >
          <Zap className="w-3 h-3 text-amber-400" />
          <span>Storm DNA</span>
        </button>

        <button
          id="nav-btn-why-now"
          onClick={() => onOpenView('WHY_NOW')}
          className="px-2.5 py-1 rounded-lg hover:bg-slate-800/80 text-slate-300 flex items-center gap-1.5 shrink-0"
        >
          <Activity className="w-3 h-3 text-cyan-400" />
          <span>Why-Now Explainability</span>
        </button>

        <button
          id="nav-btn-scenarios"
          onClick={() => onOpenView('FUTURES')}
          className="px-2.5 py-1 rounded-lg hover:bg-slate-800/80 text-slate-300 flex items-center gap-1.5 shrink-0"
        >
          <span>Probabilistic Futures</span>
        </button>

        <button
          id="nav-btn-atmosphere"
          onClick={() => onOpenView('ATMOSPHERE')}
          className="px-2.5 py-1 rounded-lg hover:bg-slate-800/80 text-slate-300 flex items-center gap-1.5 shrink-0"
        >
          <span>Atmosphere (CAPE/CIN)</span>
        </button>

        <button
          id="nav-btn-flood"
          onClick={() => onOpenView('FLOOD')}
          className="px-2.5 py-1 rounded-lg hover:bg-slate-800/80 text-slate-300 flex items-center gap-1.5 shrink-0"
        >
          <Waves className="w-3 h-3 text-blue-400" />
          <span>Flood Impact</span>
        </button>

        <button
          id="nav-btn-lightning"
          onClick={() => onOpenView('LIGHTNING')}
          className="px-2.5 py-1 rounded-lg hover:bg-slate-800/80 text-slate-300 flex items-center gap-1.5 shrink-0"
        >
          <Zap className="w-3 h-3 text-yellow-400" />
          <span>Lightning</span>
        </button>

        <button
          id="nav-btn-verification"
          onClick={() => onOpenView('VERIFICATION')}
          className="px-2.5 py-1 rounded-lg hover:bg-slate-800/80 text-slate-300 flex items-center gap-1.5 shrink-0"
        >
          <Award className="w-3 h-3 text-emerald-400" />
          <span>Verification & Memory</span>
        </button>

        <button
          id="nav-btn-everyday"
          onClick={() => onOpenView('EVERYDAY')}
          className="px-2.5 py-1 rounded-lg hover:bg-slate-800/80 text-slate-300 flex items-center gap-1.5 shrink-0 ml-auto"
        >
          <span>Everyday Weather</span>
        </button>
      </nav>
    </header>
  );
};
