/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { SensorReading } from '../types/telemetry';

interface MetricCardProps {
  id: string;
  name: string;
  shortCode: string;
  reading: SensorReading;
  accentColor?: string; // e.g. '#06b6d4', '#14b8a6', '#8b5cf6'
  onSelect?: () => void;
  isSelected?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  id,
  name,
  shortCode,
  reading,
  accentColor = '#06b6d4',
  onSelect,
  isSelected = false,
}) => {
  const isPositiveDelta = reading.delta > 0;
  const isZeroDelta = reading.delta === 0;

  // Mini Sparkline Generator (6 deterministic historical points based on min, max, delta, value)
  const v = reading.value;
  const min = reading.min24h;
  const max = reading.max24h;
  const span = Math.max(0.1, max - min);
  
  // Normalized 5 points
  const points = [
    (reading.historicalAvg - min) / span,
    (v - reading.delta * 1.5 - min) / span,
    (v - reading.delta * 0.8 - min) / span,
    (v - reading.delta * 0.3 - min) / span,
    (v - min) / span,
  ].map(p => Math.min(1, Math.max(0, p)));

  // Map to SVG coordinates: 60 width, 22 height (y inverted)
  const sparklineCoords = points.map((p, idx) => {
    const x = (idx / (points.length - 1)) * 60;
    const y = 20 - p * 16;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  return (
    <div
      onClick={onSelect}
      className={`rounded-lg p-3.5 transition-all duration-200 flex flex-col justify-between cursor-pointer select-none ${
        isSelected
          ? 'glass-panel-l2 ring-1 ring-[#06b6d4]/50'
          : 'glass-panel-l1 hover:border-[rgba(6,182,212,0.35)] hover:bg-[#1e293b]/50'
      }`}
    >
      {/* Card Header: Identifier & Real-time Status Pip */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <span className="text-[11px] font-mono font-semibold text-[#f8fafc] bg-[rgba(148,163,184,0.1)] px-1.5 py-0.5 rounded">
            {shortCode}
          </span>
          <span className="text-xs font-medium text-[#94a3b8] truncate" title={name}>
            {name}
          </span>
        </div>

        {/* Real-time status pip with subtle concentric expanding pulse animation */}
        <div className="relative flex items-center justify-center w-3 h-3 shrink-0">
          <span
            className="absolute w-2.5 h-2.5 rounded-full animate-radar-pulse opacity-75"
            style={{ backgroundColor: accentColor }}
          />
          <span
            className="w-1.5 h-1.5 rounded-full z-10"
            style={{ backgroundColor: accentColor }}
          />
        </div>
      </div>

      {/* Main Metric Value + Secondary Unit Definition */}
      <div className="flex items-baseline justify-between gap-2 my-1">
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold font-mono text-[#f8fafc] tabular-nums tracking-tight">
            {typeof reading.value === 'number' && Number.isInteger(reading.value)
              ? reading.value
              : reading.value.toFixed(1)}
          </span>
          <span className="text-[11px] font-mono text-[#64748b] uppercase">
            {reading.unit}
          </span>
        </div>

        {/* Mini Sparkline */}
        <div className="w-[60px] h-[22px] shrink-0">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 60 22">
            <polyline
              fill="none"
              stroke={accentColor}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={sparklineCoords}
            />
          </svg>
        </div>
      </div>

      {/* Footer / Delta flux vector & 24h baseline */}
      <div className="flex items-center justify-between pt-2 mt-1 border-t border-[rgba(148,163,184,0.08)] text-[11px] font-mono">
        <div className="flex items-center gap-0.5">
          {isZeroDelta ? (
            <span className="text-[#64748b] flex items-center gap-0.5">
              <Minus className="w-3 h-3" /> 0.0
            </span>
          ) : isPositiveDelta ? (
            <span className="text-[#f43f5e] flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" /> +{Math.abs(reading.delta).toFixed(1)}
            </span>
          ) : (
            <span className="text-[#14b8a6] flex items-center gap-0.5">
              <ArrowDownRight className="w-3 h-3" /> -{Math.abs(reading.delta).toFixed(1)}
            </span>
          )}
          <span className="text-[#64748b] text-[10px] ml-0.5">1h Δ</span>
        </div>

        <div className="text-[#64748b] text-[10px]">
          avg <span className="text-[#94a3b8] tabular-nums">{reading.historicalAvg}</span>
        </div>
      </div>
    </div>
  );
};
