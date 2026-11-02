/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { TimeSeriesSample } from '../types/telemetry';

export type MetricChannelKey = 'pm25' | 'pm10' | 'co2' | 'o3' | 'no2' | 'vocIndex' | 'temperature' | 'humidity';

interface TimeSeriesChartProps {
  data: TimeSeriesSample[];
  selectedChannel: MetricChannelKey;
  onSelectChannel: (channel: MetricChannelKey) => void;
  selectedWindow: '1H' | '6H' | '24H' | '7D' | '30D';
  onSelectWindow: (window: '1H' | '6H' | '24H' | '7D' | '30D') => void;
}

const CHANNELS: { key: MetricChannelKey; label: string; unit: string; color: string }[] = [
  { key: 'pm25', label: 'PM2.5 Fine', unit: 'µg/m³', color: '#06b6d4' },
  { key: 'pm10', label: 'PM10 Coarse', unit: 'µg/m³', color: '#14b8a6' },
  { key: 'co2', label: 'CO2 Carbon', unit: 'ppm', color: '#38bdf8' },
  { key: 'o3', label: 'O3 Ozone', unit: 'ppb', color: '#8b5cf6' },
  { key: 'no2', label: 'NO2 Nitrogen', unit: 'ppb', color: '#f59e0b' },
  { key: 'vocIndex', label: 'VOC Index', unit: 'pts', color: '#ec4899' },
  { key: 'temperature', label: 'Temperature', unit: '°C', color: '#f97316' },
  { key: 'humidity', label: 'Humidity', unit: '% RH', color: '#0ea5e9' },
];

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  data,
  selectedChannel,
  onSelectChannel,
  selectedWindow,
  onSelectWindow,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeChannelConfig = CHANNELS.find(c => c.key === selectedChannel) || CHANNELS[0];
  const accentColor = activeChannelConfig.color;

  // Extract values
  const values = data.map(d => d[selectedChannel]);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = Math.max(0.001, maxValue - minValue);
  // Add 12% padding above and below for breathing room
  const plotMin = Math.max(0, minValue - range * 0.12);
  const plotMax = maxValue + range * 0.12;
  const plotRange = Math.max(0.001, plotMax - plotMin);

  // SVG dimensions
  const width = 800;
  const height = 240;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 35;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  // Compute points
  const points = data.map((d, index) => {
    const x = paddingLeft + (index / Math.max(1, data.length - 1)) * chartW;
    const norm = (d[selectedChannel] - plotMin) / plotRange;
    const y = paddingTop + (1 - norm) * chartH;
    return { x, y, raw: d[selectedChannel], item: d };
  });

  const pathD = points.length > 0
    ? `M ${points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')}`
    : '';

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x.toFixed(1)},${(paddingTop + chartH).toFixed(1)} L ${points[0].x.toFixed(1)},${(paddingTop + chartH).toFixed(1)} Z`
    : '';

  // Handle pointer scrub
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const svgX = (clientX / rect.width) * width;
    
    // Find closest point
    let closestIdx = 0;
    let minDistance = Infinity;
    points.forEach((p, idx) => {
      const dist = Math.abs(p.x - svgX);
      if (dist < minDistance) {
        minDistance = dist;
        closestIdx = idx;
      }
    });

    setHoverIndex(closestIdx);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  const activeHoverPoint = hoverIndex !== null ? points[hoverIndex] : null;

  // Y-axis grid ticks (4 divisions)
  const yTicks = [0, 0.33, 0.66, 1].map(frac => {
    const val = plotMin + frac * plotRange;
    const y = paddingTop + (1 - frac) * chartH;
    return { val, y };
  });

  // X-axis timestamps (5 ticks)
  const xTickIndices = [
    0,
    Math.floor(data.length * 0.25),
    Math.floor(data.length * 0.5),
    Math.floor(data.length * 0.75),
    data.length - 1
  ].filter(idx => idx >= 0 && idx < data.length);

  return (
    <div ref={containerRef} className="glass-panel-l1 rounded-lg p-5 flex flex-col justify-between">
      {/* Top Controls: Channel Tabs + Segmented Time-Window Chassis */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4 pb-3 border-b border-[rgba(148,163,184,0.1)]">
        
        {/* Metric Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0 scrollbar-none">
          {CHANNELS.map(ch => (
            <button
              key={ch.key}
              onClick={() => onSelectChannel(ch.key)}
              className={`px-2.5 py-1 text-xs font-mono rounded transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                selectedChannel === ch.key
                  ? 'bg-[rgba(30,41,59,0.9)] text-[#f8fafc] border border-[rgba(6,182,212,0.4)] shadow-[0_0_8px_rgba(6,182,212,0.15)] font-semibold'
                  : 'text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#1e293b]/50'
              }`}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: ch.color }}
              />
              <span>{ch.label}</span>
            </button>
          ))}
        </div>

        {/* Segmented Time-Window Selector enclosed in contiguous rgba(15,23,42,0.8) chassis */}
        <div className="flex items-center p-0.5 rounded-lg bg-[rgba(15,23,42,0.8)] border border-[rgba(148,163,184,0.15)] shrink-0 self-end lg:self-center">
          {(['1H', '6H', '24H', '7D', '30D'] as const).map(w => (
            <button
              key={w}
              onClick={() => onSelectWindow(w)}
              className={`px-3 py-1 text-xs font-mono rounded transition-all cursor-pointer relative whitespace-nowrap ${
                selectedWindow === w
                  ? 'bg-[#1e293b] text-[#4cd7f6] font-semibold shadow-sm'
                  : 'text-[#94a3b8] hover:text-[#f8fafc]'
              }`}
            >
              {w}
              {selectedWindow === w && (
                <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#06b6d4] rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Chart Stage */}
      <div className="relative w-full overflow-hidden select-none">
        
        {/* Floating Glass Tooltip styled via Layer 3 depth specifications */}
        {activeHoverPoint && (
          <div
            className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-full transition-all duration-75 glass-overlay-l3 px-3 py-2 rounded-lg text-xs font-mono text-[#f8fafc] border border-[rgba(6,182,212,0.45)]"
            style={{
              left: `${(activeHoverPoint.x / width) * 100}%`,
              top: `${Math.max(10, (activeHoverPoint.y / height) * 100 - 4)}%`,
            }}
          >
            <div className="text-[10px] text-[#94a3b8] border-b border-[rgba(148,163,184,0.15)] pb-1 mb-1">
              {activeHoverPoint.item.timeLabel}
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-[#f8fafc] tabular-nums" style={{ color: accentColor }}>
                {typeof activeHoverPoint.raw === 'number' && Number.isInteger(activeHoverPoint.raw)
                  ? activeHoverPoint.raw
                  : activeHoverPoint.raw.toFixed(1)}
              </span>
              <span className="text-[10px] text-[#64748b] uppercase">
                {activeChannelConfig.unit}
              </span>
            </div>
          </div>
        )}

        {/* Dynamic SVG Plot */}
        <svg
          className="w-full h-56 lg:h-64 cursor-crosshair overflow-visible"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            {/* Primary vertical gradient fill descending to transparent */}
            <linearGradient id={`chart-grad-${selectedChannel}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accentColor} stopOpacity="0.32" />
              <stop offset="100%" stopColor={accentColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Gridlines & Y-labels */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={paddingLeft}
                y1={tick.y}
                x2={width - paddingRight}
                y2={tick.y}
                stroke="rgba(148, 163, 184, 0.12)"
                strokeDasharray="3 3"
              />
              <text
                x={paddingLeft - 8}
                y={tick.y + 3}
                textAnchor="end"
                className="text-[10px] fill-[#64748b] font-mono tabular-nums"
              >
                {tick.val >= 100 ? Math.round(tick.val) : tick.val.toFixed(1)}
              </text>
            </g>
          ))}

          {/* Area Fill */}
          {areaD && (
            <path
              d={areaD}
              fill={`url(#chart-grad-${selectedChannel})`}
            />
          )}

          {/* Telemetry Line (1.5px to 2px stroke width) */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke={accentColor}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                filter: `drop-shadow(0 0 6px ${accentColor}60)`
              }}
            />
          )}

          {/* Crosshairs: crisp 1px dashed rules in rgba(148, 163, 184, 0.4) */}
          {activeHoverPoint && (
            <g>
              {/* Vertical Crosshair Line */}
              <line
                x1={activeHoverPoint.x}
                y1={paddingTop}
                x2={activeHoverPoint.x}
                y2={paddingTop + chartH}
                stroke="rgba(148, 163, 184, 0.45)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              {/* Horizontal Crosshair Line */}
              <line
                x1={paddingLeft}
                y1={activeHoverPoint.y}
                x2={width - paddingRight}
                y2={activeHoverPoint.y}
                stroke="rgba(148, 163, 184, 0.45)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              {/* Focal indicator dot */}
              <circle
                cx={activeHoverPoint.x}
                cy={activeHoverPoint.y}
                r="4.5"
                fill={accentColor}
                stroke="#0b0f19"
                strokeWidth="2"
                style={{
                  filter: `drop-shadow(0 0 8px ${accentColor})`
                }}
              />
            </g>
          )}

          {/* X-axis Timestamp labels */}
          {xTickIndices.map((idx, i) => {
            const pt = points[idx];
            if (!pt) return null;
            return (
              <text
                key={i}
                x={pt.x}
                y={height - 8}
                textAnchor={i === 0 ? 'start' : i === xTickIndices.length - 1 ? 'end' : 'middle'}
                className="text-[10px] fill-[#64748b] font-mono tabular-nums"
              >
                {pt.item.timeLabel}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Chart Footer: Telemetry summary & Scalar bounds */}
      <div className="flex items-center justify-between pt-3 mt-2 border-t border-[rgba(148,163,184,0.08)] text-xs font-mono text-[#94a3b8]">
        <div className="flex items-center gap-4">
          <span className="text-[#64748b]">
            Min: <span className="text-[#f8fafc] font-semibold">{minValue.toFixed(1)}</span>
          </span>
          <span className="text-[#64748b]">
            Max: <span className="text-[#f8fafc] font-semibold">{maxValue.toFixed(1)}</span>
          </span>
          <span className="text-[#64748b]">
            Avg: <span className="text-[#f8fafc] font-semibold">{(values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)}</span>
          </span>
        </div>

        <div className="text-[11px] text-[#64748b] flex items-center gap-2">
          <span>Dual-Wavelength Mie Calibration</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
        </div>
      </div>
    </div>
  );
};
