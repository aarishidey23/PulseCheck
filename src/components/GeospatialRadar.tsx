/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { StationTelemetry } from '../types/telemetry';
import { Layers, Wind, Eye, ZoomIn, ZoomOut, RotateCcw, Compass, MapPin, Activity, ShieldCheck, AlertTriangle } from 'lucide-react';

interface GeospatialRadarProps {
  stations: StationTelemetry[];
  selectedStation: StationTelemetry;
  onSelectStation: (stationId: string) => void;
}

export const GeospatialRadar: React.FC<GeospatialRadarProps> = ({
  stations,
  selectedStation,
  onSelectStation,
}) => {
  const [activeLayers, setActiveLayers] = useState({
    particulates: true,
    windVectors: true,
    sensorMesh: true,
    inversionBoundary: false,
  });

  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [simTick, setSimTick] = useState(0);

  // Animated tick for wind flow particles
  useEffect(() => {
    const interval = setInterval(() => {
      setSimTick(t => (t + 1) % 100);
    }, 80);
    return () => clearInterval(interval);
  }, []);

  // Map world projection coordinates to SVG viewBox (1000 x 500 Equirectangular)
  const mapWidth = 1000;
  const mapHeight = 500;

  const projectCoords = (lat: number, lng: number) => {
    const x = ((lng + 180) / 360) * mapWidth;
    const y = ((90 - lat) / 180) * mapHeight;
    return { x, y };
  };

  // Convert stations to projected coordinates
  const stationPins = stations.map(st => {
    const { x, y } = projectCoords(st.coordinates.lat, st.coordinates.lng);
    return { ...st, x, y };
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const getAqiColor = (aqi: number) => {
    if (aqi <= 50) return '#10b981';
    if (aqi <= 100) return '#f59e0b';
    if (aqi <= 200) return '#f43f5e';
    return '#a855f7';
  };

  // SVG continent path definitions (Clean stylized technical outlines)
  // Major atmospheric continents & islands stylized for dark telemetry
  const continentOutlines = [
    // North America
    "M 120,60 L 220,50 L 280,70 L 310,120 L 290,180 L 240,210 L 220,250 L 250,280 L 220,290 L 190,260 L 150,220 L 120,180 L 90,140 Z",
    // South America
    "M 230,280 L 280,290 L 330,330 L 310,400 L 270,470 L 240,430 L 230,360 L 210,320 Z",
    // Europe
    "M 470,80 L 530,75 L 560,110 L 530,150 L 480,165 L 450,140 L 460,100 Z",
    // Africa
    "M 460,175 L 540,170 L 580,230 L 560,320 L 520,380 L 470,360 L 450,270 L 440,210 Z",
    // Asia
    "M 550,70 L 670,60 L 800,80 L 850,140 L 820,210 L 750,240 L 680,260 L 620,220 L 560,160 Z",
    // Australia & Oceania
    "M 780,330 L 850,330 L 880,380 L 840,430 L 770,410 L 760,360 Z",
  ];

  return (
    <div className="space-y-4">
      {/* Top Map Toolbar: Layer toggles & Viewport controls */}
      <div className="glass-panel-l1 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        {/* Layer Switches */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[#64748b] uppercase text-[10px] tracking-wider mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-[#06b6d4]" />
            Telemetry Layers:
          </span>

          <button
            onClick={() => setActiveLayers(prev => ({ ...prev, particulates: !prev.particulates }))}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer border ${
              activeLayers.particulates
                ? 'bg-[rgba(6,182,212,0.15)] text-[#4cd7f6] border-[#06b6d4]/40 font-semibold'
                : 'text-[#64748b] bg-transparent border-[rgba(148,163,184,0.1)] hover:text-[#dfe2f1]'
            }`}
          >
            Particulate Heatmap
          </button>

          <button
            onClick={() => setActiveLayers(prev => ({ ...prev, windVectors: !prev.windVectors }))}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer border ${
              activeLayers.windVectors
                ? 'bg-[rgba(20,184,166,0.15)] text-[#14b8a6] border-[#14b8a6]/40 font-semibold'
                : 'text-[#64748b] bg-transparent border-[rgba(148,163,184,0.1)] hover:text-[#dfe2f1]'
            }`}
          >
            Wind Streamlines
          </button>

          <button
            onClick={() => setActiveLayers(prev => ({ ...prev, sensorMesh: !prev.sensorMesh }))}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer border ${
              activeLayers.sensorMesh
                ? 'bg-[rgba(139,92,246,0.15)] text-[#8b5cf6] border-[#8b5cf6]/40 font-semibold'
                : 'text-[#64748b] bg-transparent border-[rgba(148,163,184,0.1)] hover:text-[#dfe2f1]'
            }`}
          >
            Sensor Mesh Interlink
          </button>

          <button
            onClick={() => setActiveLayers(prev => ({ ...prev, inversionBoundary: !prev.inversionBoundary }))}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer border ${
              activeLayers.inversionBoundary
                ? 'bg-[rgba(245,158,11,0.15)] text-[#f59e0b] border-[#f59e0b]/40 font-semibold'
                : 'text-[#64748b] bg-transparent border-[rgba(148,163,184,0.1)] hover:text-[#dfe2f1]'
            }`}
          >
            Inversion Boundary
          </button>
        </div>

        {/* Zoom & Viewport Controls */}
        <div className="flex items-center gap-1.5 ml-auto">
          <button
            onClick={() => setZoomLevel(z => Math.min(2.5, z + 0.25))}
            className="p-1.5 rounded bg-[#1e293b]/70 hover:bg-[#1e293b] text-[#dfe2f1] border border-[rgba(148,163,184,0.15)] cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setZoomLevel(z => Math.max(0.8, z - 0.25))}
            className="p-1.5 rounded bg-[#1e293b]/70 hover:bg-[#1e293b] text-[#dfe2f1] border border-[rgba(148,163,184,0.15)] cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={resetView}
            className="p-1.5 rounded bg-[#1e293b]/70 hover:bg-[#1e293b] text-[#dfe2f1] border border-[rgba(148,163,184,0.15)] cursor-pointer"
            title="Reset View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <span className="text-[10px] text-[#64748b] tabular-nums pl-1">
            {Math.round(zoomLevel * 100)}%
          </span>
        </div>
      </div>

      {/* Main Map Viewport & Station Inspector Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Vector Atmospheric Radar Canvas */}
        <div
          className="lg:col-span-8 glass-panel-l1 rounded-lg overflow-hidden relative min-h-[440px] lg:min-h-[560px] cursor-grab active:cursor-grabbing border border-[rgba(148,163,184,0.12)] bg-[#070a12]"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Compass Rose HUD */}
          <div className="absolute top-4 left-4 z-20 pointer-events-none flex items-center gap-2 bg-[#0b0f19]/80 backdrop-blur px-2.5 py-1.5 rounded border border-[rgba(148,163,184,0.15)] text-xs font-mono text-[#94a3b8]">
            <Compass className="w-4 h-4 text-[#06b6d4] animate-spin-slow" />
            <span>GEO-RADAR // EQUIRECTANGULAR WGS84</span>
          </div>

          {/* Coordinate Crosshairs HUD in bottom corner */}
          <div className="absolute bottom-4 left-4 z-20 pointer-events-none text-[11px] font-mono text-[#64748b] bg-[#0b0f19]/80 backdrop-blur px-2.5 py-1.5 rounded border border-[rgba(148,163,184,0.15)] space-y-0.5">
            <div>TARGET LAT: <span className="text-[#dfe2f1] tabular-nums">{selectedStation.coordinates.lat.toFixed(4)}°</span></div>
            <div>TARGET LNG: <span className="text-[#dfe2f1] tabular-nums">{selectedStation.coordinates.lng.toFixed(4)}°</span></div>
            <div>ATMOS FLUX: <span className="text-[#10b981]">LAMINAR FLOW</span></div>
          </div>

          <svg
            className="w-full h-full min-h-[440px] lg:min-h-[560px]"
            viewBox={`0 0 ${mapWidth} ${mapHeight}`}
            preserveAspectRatio="xMidYMid slice"
            style={{
              transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
              transition: isDragging ? 'none' : 'transform 0.2s ease-out',
            }}
          >
            <defs>
              {/* Radial gradient blooms for particulate dispersion heatmaps */}
              {stationPins.map(st => {
                const color = getAqiColor(st.aqi);
                return (
                  <radialGradient key={`bloom-${st.id}`} id={`bloom-${st.id}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={color} stopOpacity="0.45" />
                    <stop offset="50%" stopColor={color} stopOpacity="0.18" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                  </radialGradient>
                );
              })}

              {/* Grid pattern */}
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(148,163,184,0.06)" strokeWidth="0.8" />
              </pattern>
            </defs>

            {/* Coordinate Grid Background */}
            <rect width={mapWidth} height={mapHeight} fill="url(#grid)" />

            {/* Latitude / Longitude Parallels */}
            <line x1="0" y1="125" x2={mapWidth} y2="125" stroke="rgba(148,163,184,0.08)" strokeDasharray="2 4" />
            <line x1="0" y1="250" x2={mapWidth} y2="250" stroke="rgba(6,182,212,0.2)" strokeDasharray="3 3" />
            <line x1="0" y1="375" x2={mapWidth} y2="375" stroke="rgba(148,163,184,0.08)" strokeDasharray="2 4" />
            <line x1="250" y1="0" x2="250" y2={mapHeight} stroke="rgba(148,163,184,0.08)" strokeDasharray="2 4" />
            <line x1="500" y1="0" x2="500" y2={mapHeight} stroke="rgba(6,182,212,0.2)" strokeDasharray="3 3" />
            <line x1="750" y1="0" x2="750" y2={mapHeight} stroke="rgba(148,163,184,0.08)" strokeDasharray="2 4" />

            {/* Stylized Continents Outlines */}
            {continentOutlines.map((d, i) => (
              <path
                key={i}
                d={d}
                fill="rgba(17, 24, 39, 0.45)"
                stroke="rgba(148, 163, 184, 0.22)"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            ))}

            {/* Wind Vector Streamlines (Layer 2) */}
            {activeLayers.windVectors && (
              <g opacity="0.6">
                {[
                  { startX: 100, y: 140, len: 180, speed: 1.2 },
                  { startX: 280, y: 160, len: 140, speed: 0.9 },
                  { startX: 420, y: 110, len: 160, speed: 1.1 },
                  { startX: 620, y: 130, len: 200, speed: 1.3 },
                  { startX: 180, y: 320, len: 150, speed: 0.8 },
                  { startX: 520, y: 300, len: 170, speed: 1.0 },
                  { startX: 740, y: 280, len: 160, speed: 1.1 },
                ].map((stream, idx) => {
                  const offset = ((simTick * stream.speed * 4) % stream.len);
                  return (
                    <g key={idx}>
                      <line
                        x1={stream.startX}
                        y1={stream.y}
                        x2={stream.startX + stream.len}
                        y2={stream.y}
                        stroke="rgba(20, 184, 166, 0.2)"
                        strokeWidth="1"
                        strokeDasharray="4 8"
                      />
                      <circle
                        cx={stream.startX + offset}
                        cy={stream.y}
                        r="1.8"
                        fill="#14b8a6"
                        opacity="0.8"
                      />
                    </g>
                  );
                })}
              </g>
            )}

            {/* Sensor Mesh Interlink Lines */}
            {activeLayers.sensorMesh && (
              <g stroke="rgba(139, 92, 246, 0.25)" strokeWidth="1" strokeDasharray="3 5">
                <line x1={stationPins[0].x} y1={stationPins[0].y} x2={stationPins[4].x} y2={stationPins[4].y} />
                <line x1={stationPins[0].x} y1={stationPins[0].y} x2={stationPins[1].x} y2={stationPins[1].y} />
                <line x1={stationPins[1].x} y1={stationPins[1].y} x2={stationPins[2].x} y2={stationPins[2].y} />
                <line x1={stationPins[2].x} y1={stationPins[2].y} x2={stationPins[3].x} y2={stationPins[3].y} />
                <line x1={stationPins[3].x} y1={stationPins[3].y} x2={stationPins[0].x} y2={stationPins[0].y} />
              </g>
            )}

            {/* Particulate Heatmap Blooms */}
            {activeLayers.particulates && (
              <g>
                {stationPins.map(st => {
                  const radius = Math.max(35, st.aqi * 1.2);
                  return (
                    <circle
                      key={`bloom-circle-${st.id}`}
                      cx={st.x}
                      cy={st.y}
                      r={radius}
                      fill={`url(#bloom-${st.id})`}
                      pointerEvents="none"
                    />
                  );
                })}
              </g>
            )}

            {/* Station Nodes & Radar Pulse Pips */}
            {stationPins.map(st => {
              const isSelected = st.id === selectedStation.id;
              const color = getAqiColor(st.aqi);

              return (
                <g
                  key={`pin-${st.id}`}
                  className="cursor-pointer group"
                  onClick={() => onSelectStation(st.id)}
                >
                  {/* Concentric expanding pulse wave */}
                  <circle
                    cx={st.x}
                    cy={st.y}
                    r={isSelected ? 18 : 12}
                    fill="none"
                    stroke={color}
                    strokeWidth="1.5"
                    className="animate-radar-pulse opacity-75"
                  />

                  {/* Core Station Dot */}
                  <circle
                    cx={st.x}
                    cy={st.y}
                    r={isSelected ? 6 : 4.5}
                    fill={color}
                    stroke="#0b0f19"
                    strokeWidth="2"
                    style={{
                      filter: `drop-shadow(0 0 8px ${color})`
                    }}
                  />

                  {/* Station Label Callout */}
                  <g transform={`translate(${st.x + 10}, ${st.y - 10})`}>
                    <rect
                      x="0"
                      y="-12"
                      width="90"
                      height="20"
                      rx="4"
                      fill="rgba(11, 15, 25, 0.9)"
                      stroke={isSelected ? '#06b6d4' : 'rgba(148, 163, 184, 0.25)'}
                      strokeWidth={isSelected ? '1.5' : '1'}
                    />
                    <text
                      x="6"
                      y="2"
                      fill="#f8fafc"
                      fontSize="9"
                      fontFamily="JetBrains Mono"
                      fontWeight="bold"
                    >
                      {st.code} · AQI {st.aqi}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Station Inspector Panel (Layer 2 Raised Panel) */}
        <div className="lg:col-span-4 glass-panel-l2 rounded-lg p-5 flex flex-col justify-between space-y-4">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(148,163,184,0.12)]">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#64748b] tracking-wider">
                  Station Inspector
                </span>
                <h3 className="text-base font-bold font-display text-[#f8fafc]">
                  {selectedStation.name}
                </h3>
              </div>
              
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[rgba(6,182,212,0.15)] text-[#4cd7f6] border border-[#06b6d4]/40 font-semibold">
                {selectedStation.code}
              </span>
            </div>

            {/* Coordinates & Physical Profile */}
            <div className="grid grid-cols-2 gap-2 my-3 text-xs font-mono">
              <div className="bg-[#111827]/70 p-2.5 rounded border border-[rgba(148,163,184,0.1)]">
                <span className="text-[#64748b] text-[10px] uppercase block">Latitude</span>
                <span className="text-[#f8fafc] font-semibold tabular-nums">
                  {selectedStation.coordinates.lat.toFixed(4)}° N
                </span>
              </div>
              <div className="bg-[#111827]/70 p-2.5 rounded border border-[rgba(148,163,184,0.1)]">
                <span className="text-[#64748b] text-[10px] uppercase block">Longitude</span>
                <span className="text-[#f8fafc] font-semibold tabular-nums">
                  {Math.abs(selectedStation.coordinates.lng).toFixed(4)}° {selectedStation.coordinates.lng >= 0 ? 'E' : 'W'}
                </span>
              </div>
              <div className="bg-[#111827]/70 p-2.5 rounded border border-[rgba(148,163,184,0.1)]">
                <span className="text-[#64748b] text-[10px] uppercase block">Altitude (MSL)</span>
                <span className="text-[#f8fafc] font-semibold tabular-nums">
                  {selectedStation.elevationMeters} meters
                </span>
              </div>
              <div className="bg-[#111827]/70 p-2.5 rounded border border-[rgba(148,163,184,0.1)]">
                <span className="text-[#64748b] text-[10px] uppercase block">Composite AQI</span>
                <span
                  className="font-bold tabular-nums"
                  style={{ color: getAqiColor(selectedStation.aqi) }}
                >
                  {selectedStation.aqi} / 500
                </span>
              </div>
            </div>

            {/* Real-time Atmospheric Reading Array */}
            <div className="space-y-2 mt-4">
              <span className="text-[10px] font-mono uppercase text-[#64748b] tracking-wider block">
                Localized Micro-Telemetry Readouts
              </span>

              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex items-center justify-between p-2 rounded bg-[#0b0f19]/60 border border-[rgba(148,163,184,0.08)]">
                  <span className="text-[#94a3b8]">PM2.5 (Fine Particles)</span>
                  <span className="text-[#4cd7f6] font-semibold tabular-nums">
                    {selectedStation.metrics.pm25.value} {selectedStation.metrics.pm25.unit}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-[#0b0f19]/60 border border-[rgba(148,163,184,0.08)]">
                  <span className="text-[#94a3b8]">CO2 (Carbon Dioxide)</span>
                  <span className="text-[#38bdf8] font-semibold tabular-nums">
                    {selectedStation.metrics.co2.value} {selectedStation.metrics.co2.unit}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-[#0b0f19]/60 border border-[rgba(148,163,184,0.08)]">
                  <span className="text-[#94a3b8]">O3 (Tropospheric Ozone)</span>
                  <span className="text-[#8b5cf6] font-semibold tabular-nums">
                    {selectedStation.metrics.o3.value} {selectedStation.metrics.o3.unit}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-[#0b0f19]/60 border border-[rgba(148,163,184,0.08)]">
                  <span className="text-[#94a3b8]">Ambient Temp & Wind</span>
                  <span className="text-[#f8fafc] font-semibold tabular-nums">
                    {selectedStation.metrics.temperature.value}°C · {selectedStation.metrics.windSpeed.value} m/s
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-3 border-t border-[rgba(148,163,184,0.1)] space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#64748b]">
              <span>Telemetry Downlink:</span>
              <span className="text-[#10b981] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                Synchronized
              </span>
            </div>

            <div className="text-[11px] font-mono text-[#94a3b8] bg-[#0b0f19]/80 p-2 rounded border border-[rgba(148,163,184,0.1)]">
              <span className="text-[#64748b]">Dominant Carrier: </span>
              <span className="text-[#f8fafc] font-medium">{selectedStation.dominantPollutant}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
