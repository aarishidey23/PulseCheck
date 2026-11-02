/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, AlertCircle, Flame, Skull } from 'lucide-react';

interface AqiDialProps {
  aqi: number;
  dominantPollutant: string;
  min24h?: number;
  max24h?: number;
}

export const AqiDial: React.FC<AqiDialProps> = ({
  aqi,
  dominantPollutant,
  min24h = Math.max(1, Math.round(aqi * 0.7)),
  max24h = Math.round(aqi * 1.35),
}) => {
  // Determine AQI category, color and description based on specification
  let categoryLabel = 'Optimal / Nominal';
  let categoryColor = '#10b981'; // Emerald
  let categoryBg = 'rgba(16, 185, 129, 0.12)';
  let advisoryText = 'Air quality is satisfactory and poses negligible respiratory hazard.';
  let IconComponent = ShieldCheck;

  if (aqi <= 50) {
    categoryLabel = 'Optimal / Nominal';
    categoryColor = '#10b981';
    categoryBg = 'rgba(16, 185, 129, 0.12)';
    advisoryText = 'Air quality is within WHO baseline limits. Safe for prolonged outdoor exertion.';
    IconComponent = ShieldCheck;
  } else if (aqi <= 100) {
    categoryLabel = 'Caution / Elevated';
    categoryColor = '#f59e0b';
    categoryBg = 'rgba(245, 158, 11, 0.12)';
    advisoryText = 'Acceptable quality for general populace; sensitive individuals may experience mild irritation.';
    IconComponent = AlertCircle;
  } else if (aqi <= 200) {
    categoryLabel = 'Unhealthy / High Vector';
    categoryColor = '#f43f5e';
    categoryBg = 'rgba(244, 63, 94, 0.12)';
    advisoryText = 'Elevated particulate or oxidant loading. High-risk groups should avoid outdoor activity.';
    IconComponent = Flame;
  } else {
    categoryLabel = 'Hazardous / Severe';
    categoryColor = '#a855f7';
    categoryBg = 'rgba(168, 85, 247, 0.12)';
    advisoryText = 'Emergency atmospheric toxicity alert. Immediate mitigation and indoor filtration required.';
    IconComponent = Skull;
  }

  // Radial Arc geometry (Radius = 78, Center = (100, 100))
  // Arc angle spans 240 degrees (from 150 deg to 390 deg)
  const radius = 72;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  // We use 240 deg of the circle = (240 / 360) * circumference
  const arcLength = (240 / 360) * circumference;
  
  // Normalize AQI up to 300 scale
  const normalizedValue = Math.min(Math.max(aqi, 0), 300);
  const valueRatio = normalizedValue / 300;
  const filledLength = valueRatio * arcLength;
  const strokeDashoffset = arcLength - filledLength;

  return (
    <div className="glass-panel-l1 rounded-lg p-5 flex flex-col justify-between relative overflow-hidden h-full">
      {/* Background radial ambiance */}
      <div 
        className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-20 -mr-16 -mt-16 transition-colors duration-700"
        style={{ backgroundColor: categoryColor }}
      />

      {/* Header */}
      <div className="flex items-center justify-between z-10">
        <div>
          <span className="text-xs uppercase font-mono tracking-wider text-[#94a3b8]">
            Composite Index
          </span>
          <h2 className="text-lg font-bold font-display text-[#f8fafc]">
            Air Quality Index (AQI)
          </h2>
        </div>
        
        {/* Category Chip according to specification */}
        <div 
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-colors border"
          style={{ 
            backgroundColor: categoryBg, 
            color: categoryColor,
            borderColor: `${categoryColor}40` 
          }}
        >
          <span 
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: categoryColor }}
          />
          <span>{categoryLabel}</span>
        </div>
      </div>

      {/* Radial Gauge Display */}
      <div className="flex flex-col items-center justify-center my-3 relative z-10">
        <div className="relative w-48 h-44 flex items-center justify-center">
          <svg className="w-48 h-48 -rotate-[210deg] transform" viewBox="0 0 200 200">
            {/* Background Arc Track */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="transparent"
              stroke="rgba(148, 163, 184, 0.15)"
              strokeWidth={strokeWidth}
              strokeDasharray={`${arcLength} ${circumference}`}
              strokeLinecap="round"
            />
            {/* Value Arc Track */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="transparent"
              stroke={categoryColor}
              strokeWidth={strokeWidth}
              strokeDasharray={`${arcLength} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
              style={{
                filter: `drop-shadow(0 0 8px ${categoryColor}80)`
              }}
            />
          </svg>

          {/* Centered Readout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center mt-2 text-center pointer-events-none">
            <span className="text-4xl lg:text-5xl font-mono font-bold tracking-tight text-[#f8fafc] tabular-nums">
              {aqi}
            </span>
            <span className="text-[11px] font-mono uppercase text-[#64748b] tracking-wider mt-0.5">
              Scalar AQI (US EPA)
            </span>
          </div>
        </div>

        {/* Min / Max Range Strip */}
        <div className="flex items-center justify-between w-full max-w-[240px] px-2 text-xs font-mono text-[#94a3b8]">
          <div className="flex items-center gap-1">
            <span className="text-[#64748b]">24h Min:</span>
            <span className="text-[#f8fafc] tabular-nums font-semibold">{min24h}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[#64748b]">24h Max:</span>
            <span className="text-[#f8fafc] tabular-nums font-semibold">{max24h}</span>
          </div>
        </div>
      </div>

      {/* Advisory & Primary Driver */}
      <div className="pt-3 border-t border-[rgba(148,163,184,0.1)] z-10 space-y-1.5">
        <div className="flex items-center gap-2 text-xs text-[#94a3b8]">
          <IconComponent className="w-3.5 h-3.5 shrink-0" style={{ color: categoryColor }} />
          <span className="line-clamp-1">{advisoryText}</span>
        </div>
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[#64748b]">Primary Carrier:</span>
          <span className="text-[#4cd7f6] font-medium">{dominantPollutant}</span>
        </div>
      </div>
    </div>
  );
};
