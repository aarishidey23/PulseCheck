/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { StationTelemetry } from '../types/telemetry';
import { MapPin, BatteryCharging, Sun, Wifi, Compass, Layers } from 'lucide-react';

interface StationOverviewProps {
  stations: StationTelemetry[];
  selectedStation: StationTelemetry;
  onSelectStation: (stationId: string) => void;
  onQuickInspectCoordinates?: () => void;
}

export const StationOverview: React.FC<StationOverviewProps> = ({
  stations,
  selectedStation,
  onSelectStation,
  onQuickInspectCoordinates,
}) => {
  return (
    <div className="space-y-4">
      {/* Horizontal Station Switcher Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {stations.map(st => {
          const isSelected = st.id === selectedStation.id;
          let dotColor = '#10b981';
          if (st.aqi > 100) dotColor = '#f43f5e';
          else if (st.aqi > 50) dotColor = '#f59e0b';

          return (
            <button
              key={st.id}
              onClick={() => onSelectStation(st.id)}
              className={`flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs font-mono transition-all duration-150 cursor-pointer whitespace-nowrap border ${
                isSelected
                  ? 'glass-panel-l2 text-[#f8fafc] border-[rgba(6,182,212,0.5)] shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                  : 'glass-panel-l1 text-[#94a3b8] hover:text-[#f8fafc] hover:border-[rgba(148,163,184,0.25)]'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: dotColor }}
              />
              <span className="font-semibold">{st.code}</span>
              <span className="text-[#64748b]">|</span>
              <span className="truncate max-w-[130px] sm:max-w-none">{st.name}</span>
              <span className="ml-1 text-[11px] text-[#4cd7f6] bg-[rgba(6,182,212,0.12)] px-1.5 py-0.2 rounded tabular-nums">
                AQI {st.aqi}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Station Operational Telemetry Bar */}
      <div className="glass-panel-l1 rounded-lg p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Geographic & Atmospheric Identity */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 lg:gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#4cd7f6] bg-[rgba(6,182,212,0.15)] px-2 py-0.5 rounded border border-[#06b6d4]/30">
                {selectedStation.code}
              </span>
              <h1 className="text-lg lg:text-xl font-bold font-display text-[#f8fafc]">
                {selectedStation.name}
              </h1>
            </div>
            
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#94a3b8] mt-1.5 font-mono">
              <span className="flex items-center gap-1 text-[#dfe2f1]">
                <MapPin className="w-3.5 h-3.5 text-[#06b6d4]" />
                {selectedStation.locationName}, {selectedStation.country}
              </span>
              <span className="text-[#64748b]">·</span>
              <span className="text-[#94a3b8]">
                {selectedStation.coordinates.lat.toFixed(4)}°N, {Math.abs(selectedStation.coordinates.lng).toFixed(4)}°{selectedStation.coordinates.lng >= 0 ? 'E' : 'W'}
              </span>
              <span className="text-[#64748b]">·</span>
              <span className="text-[#94a3b8]">
                Alt: {selectedStation.elevationMeters}m MSL
              </span>
            </div>
          </div>
        </div>

        {/* Biosensor Diagnostics & Hardware Uptime Ribbon */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-mono pt-3 lg:pt-0 border-t lg:border-t-0 border-[rgba(148,163,184,0.1)]">
          {/* Battery */}
          <div className="flex items-center gap-2" title="Photovoltaic-buffered battery reserve">
            <BatteryCharging className="w-4 h-4 text-[#10b981]" />
            <div>
              <div className="text-[10px] text-[#64748b] uppercase">Power Cell</div>
              <div className="text-[#f8fafc] font-semibold tabular-nums">{selectedStation.batteryPercent}%</div>
            </div>
          </div>

          {/* Solar Flux */}
          <div className="flex items-center gap-2" title="Real-time solar panel irradiance generation">
            <Sun className="w-4 h-4 text-[#f59e0b]" />
            <div>
              <div className="text-[10px] text-[#64748b] uppercase">Solar Input</div>
              <div className="text-[#f8fafc] font-semibold tabular-nums">{selectedStation.solarInputWatts}W</div>
            </div>
          </div>

          {/* Transmission SNR */}
          <div className="flex items-center gap-2" title="Satellite/Cellular telemetry downlink SNR">
            <Wifi className="w-4 h-4 text-[#06b6d4]" />
            <div>
              <div className="text-[10px] text-[#64748b] uppercase">Uplink SNR</div>
              <div className="text-[#f8fafc] font-semibold tabular-nums">{selectedStation.signalStrengthDbm} dBm</div>
            </div>
          </div>

          {/* Hardware Uptime */}
          <div className="flex items-center gap-2" title="Station telemetry MTBF availability">
            <Layers className="w-4 h-4 text-[#8b5cf6]" />
            <div>
              <div className="text-[10px] text-[#64748b] uppercase">Uptime</div>
              <div className="text-[#f8fafc] font-semibold tabular-nums">{selectedStation.uptimePercent}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
