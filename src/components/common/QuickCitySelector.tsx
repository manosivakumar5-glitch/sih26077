import React, { useState } from 'react';
import { LocationInfo } from '../../types/weather';
import { LOCATIONS } from '../../data/locations';
import { ChevronDown, MapPin, Search, X } from 'lucide-react';

interface QuickCitySelectorProps {
  currentLocation: LocationInfo;
  onSelectLocation: (location: LocationInfo) => void;
}

export const QuickCitySelector: React.FC<QuickCitySelectorProps> = ({
  currentLocation,
  onSelectLocation,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLocations = LOCATIONS.filter((loc) => {
    const q = searchQuery.toLowerCase();
    return (
      loc.name.toLowerCase().includes(q) ||
      loc.locality.toLowerCase().includes(q) ||
      loc.state.toLowerCase().includes(q) ||
      loc.radarStationCode.toLowerCase().includes(q)
    );
  });

  return (
    <div className="relative">
      <button
        type="button"
        id="quick-city-selector-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/90 border border-white/20 hover:border-cyan-400 text-xs font-semibold text-white transition-all cursor-pointer shadow-sm hover:shadow-[0_0_12px_rgba(6,182,212,0.3)]"
      >
        <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        <span className="truncate max-w-[130px] sm:max-w-[180px]">
          {currentLocation.locality}, {currentLocation.state}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 max-h-96 bg-[#070f20]/95 border border-cyan-500/40 rounded-2xl shadow-2xl backdrop-blur-2xl z-50 flex flex-col overflow-hidden animate-in fade-in-0 zoom-in-95">
          {/* Header & Search */}
          <div className="p-3 border-b border-white/10 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
              <span>SWITCH RADAR STATION / REGION</span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 70+ stations & cities..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950/80 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                autoFocus
              />
            </div>
          </div>

          {/* City List */}
          <div className="overflow-y-auto p-2 space-y-1 max-h-64 scrollbar-thin">
            {filteredLocations.map((loc) => {
              const isSelected = loc.id === currentLocation.id;
              return (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => {
                    onSelectLocation(loc);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white border border-transparent'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-white">{loc.locality}</div>
                    <div className="text-[10px] text-slate-400">
                      {loc.district}, {loc.state}
                    </div>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 font-mono">
                    {loc.radarStationCode}
                  </span>
                </button>
              );
            })}
            {filteredLocations.length === 0 && (
              <div className="text-center py-6 text-xs text-slate-500">
                No matching stations found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
