/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StationTelemetry, HardwareSensor } from '../types/telemetry';
import { Cpu, CheckCircle2, AlertTriangle, RefreshCw, Sliders, ShieldCheck, Play, Terminal } from 'lucide-react';

interface StationDiagnosticsProps {
  station: StationTelemetry;
  onUpdateSensorCalibration: (sensorId: string, zeroOffset: number, spanFactor: number) => void;
}

export const StationDiagnostics: React.FC<StationDiagnosticsProps> = ({
  station,
  onUpdateSensorCalibration,
}) => {
  const [selectedSensorId, setSelectedSensorId] = useState<string>(
    station.hardwarePayload[0]?.id || ''
  );

  const [testInProgress, setTestInProgress] = useState(false);
  const [testStep, setTestStep] = useState(0);
  const [testLogs, setTestLogs] = useState<string[]>([
    `[${station.lastSyncTimestamp}] System booted with RTOS v4.18.2 kernel.`,
    `[${station.lastSyncTimestamp}] Hardware watchdog active. All optical benches locked.`,
  ]);

  const activeSensor = station.hardwarePayload.find(s => s.id === selectedSensorId) || station.hardwarePayload[0];

  // Radar / Spider Chart Math
  const axes = station.calibrationAxes;
  const radarCenter = 120;
  const radarRadius = 85;
  const totalAxes = axes.length;

  const getCoordinatesForAxis = (index: number, valueRatio: number) => {
    const angle = (Math.PI * 2 / totalAxes) * index - Math.PI / 2;
    const r = radarRadius * Math.min(1, Math.max(0, valueRatio));
    const x = radarCenter + r * Math.cos(angle);
    const y = radarCenter + r * Math.sin(angle);
    return { x, y };
  };

  // Baseline polygon
  const baselinePoints = axes.map((a, i) => {
    const { x, y } = getCoordinatesForAxis(i, a.baseline / 100);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  // Current field state polygon
  const currentPoints = axes.map((a, i) => {
    const { x, y } = getCoordinatesForAxis(i, a.current / 100);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  // Diagnostic Self-Test Runner
  const runSelfTest = () => {
    if (testInProgress) return;
    setTestInProgress(true);
    setTestStep(1);
    const now = new Date().toLocaleTimeString();

    setTestLogs(prev => [
      `[${now}] === INITIATING AUTOMATED OPTICAL & BIOSENSOR DIAGNOSTIC RUN ===`,
      `[${now}] Step 1/5: Laser diode emission test on ${activeSensor.name}...`,
      ...prev,
    ]);

    setTimeout(() => {
      setTestStep(2);
      setTestLogs(prev => [
        `[${new Date().toLocaleTimeString()}] Step 2/5: Optical cavity clean. Laser flux 98.4% nominal.`,
        `[${new Date().toLocaleTimeString()}] Thermal shroud PID loop locked within ±0.012°C.`,
        ...prev,
      ]);
    }, 1200);

    setTimeout(() => {
      setTestStep(3);
      setTestLogs(prev => [
        `[${new Date().toLocaleTimeString()}] Step 3/5: Running zero-air baseline scrub purge...`,
        `[${new Date().toLocaleTimeString()}] Zero-offset verified at ${activeSensor.zeroOffset} with SNR ${activeSensor.snrDb} dB.`,
        ...prev,
      ]);
    }, 2400);

    setTimeout(() => {
      setTestStep(4);
      setTestLogs(prev => [
        `[${new Date().toLocaleTimeString()}] Step 4/5: Impulse aerosol dynamic response (t90 = 1.8s pass).`,
        ...prev,
      ]);
    }, 3600);

    setTimeout(() => {
      setTestStep(5);
      setTestInProgress(false);
      setTestLogs(prev => [
        `[${new Date().toLocaleTimeString()}] Step 5/5: CALIBRATION PASS. System calibration certificate renewed.`,
        ...prev,
      ]);
    }, 4800);
  };

  return (
    <div className="space-y-4">
      {/* Station Hardware Banner */}
      <div className="glass-panel-l1 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-mono uppercase text-[#64748b] tracking-wider">
            Station Hardware Bus · {station.code}
          </span>
          <h2 className="text-lg font-bold font-display text-[#f8fafc]">
            Sensor Diagnostics & Spectral Calibration
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={runSelfTest}
            disabled={testInProgress}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer border ${
              testInProgress
                ? 'bg-[rgba(245,158,11,0.15)] text-[#f59e0b] border-[#f59e0b]/40 cursor-not-allowed'
                : 'bg-[rgba(6,182,212,0.15)] text-[#4cd7f6] border-[#06b6d4] hover:bg-[#06b6d4] hover:text-[#0b0f19] shadow-[0_0_12px_rgba(6,182,212,0.25)]'
            }`}
          >
            {testInProgress ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Running Test ({testStep}/5)...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Diagnostic Self-Test</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main 2-Column Split: Sensor Payload Selector + Calibration Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column (5 cols): Hardware Payload Selector Array */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-mono uppercase text-[#64748b] tracking-wider block">
            Integrated Biosensor Transducers ({station.hardwarePayload.length})
          </span>

          <div className="space-y-2">
            {station.hardwarePayload.map(sensor => {
              const isSelected = sensor.id === activeSensor.id;
              const isGood = sensor.healthPercent >= 90;

              return (
                <div
                  key={sensor.id}
                  onClick={() => setSelectedSensorId(sensor.id)}
                  className={`p-3.5 rounded-lg transition-all duration-150 cursor-pointer border ${
                    isSelected
                      ? 'glass-panel-l2 border-[rgba(6,182,212,0.5)] ring-1 ring-[#06b6d4]/40'
                      : 'glass-panel-l1 hover:border-[rgba(148,163,184,0.25)]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <div className="text-xs font-bold font-display text-[#f8fafc]">
                        {sensor.name}
                      </div>
                      <div className="text-[11px] font-mono text-[#64748b]">
                        SN: {sensor.serialNumber}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#111827] border border-[rgba(148,163,184,0.15)]">
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: isGood ? '#10b981' : '#f59e0b' }}
                      />
                      <span className="text-[#dfe2f1]">{sensor.healthPercent}%</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-[#94a3b8] mb-2 font-mono">
                    {sensor.technology}
                  </div>

                  {/* Health Bar */}
                  <div className="w-full h-1.5 bg-[#0b0f19] rounded-full overflow-hidden border border-[rgba(148,163,184,0.1)]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${sensor.healthPercent}%`,
                        backgroundColor: isGood ? '#10b981' : '#f59e0b',
                      }}
                    />
                  </div>

                  {/* Sensor Quick Telemetry */}
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#64748b] mt-2 pt-2 border-t border-[rgba(148,163,184,0.08)]">
                    <span>SNR: <strong className="text-[#dfe2f1] font-semibold">{sensor.snrDb} dB</strong></span>
                    <span>Runtime: <strong className="text-[#dfe2f1] font-semibold">{sensor.runtimeHours} hrs</strong></span>
                    <span>Cal: <strong className="text-[#dfe2f1] font-semibold">{sensor.lastZeroCalibration}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (7 cols): Calibration Spider Radar & Stepper Controls */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Active Sensor Calibration Adjuster */}
          <div className="glass-panel-l1 rounded-lg p-5">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[rgba(148,163,184,0.1)]">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#64748b] tracking-wider">
                  Active Calibration Channel
                </span>
                <h3 className="text-base font-bold font-display text-[#f8fafc]">
                  {activeSensor.name}
                </h3>
              </div>

              <span className="text-xs font-mono text-[#4cd7f6] bg-[rgba(6,182,212,0.12)] px-2.5 py-1 rounded border border-[#06b6d4]/30">
                {activeSensor.wavelengthOrPotential || '650 nm'}
              </span>
            </div>

            {/* Stepper Adjustment Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Zero-Point Offset Stepper */}
              <div className="bg-[#0b0f19]/70 p-3.5 rounded-lg border border-[rgba(148,163,184,0.15)] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono font-medium text-[#f8fafc]">
                      Zero-Point Offset
                    </span>
                    <span className="text-[10px] font-mono text-[#64748b]">Δ Zero Air</span>
                  </div>
                  <p className="text-[11px] text-[#94a3b8] mb-3">
                    Atmospheric optical baseline drift compensation.
                  </p>
                </div>

                <div className="flex items-center justify-between bg-[#111827] rounded border border-[rgba(148,163,184,0.2)] p-1">
                  <button
                    onClick={() => onUpdateSensorCalibration(activeSensor.id, Number((activeSensor.zeroOffset - 0.01).toFixed(2)), activeSensor.spanFactor)}
                    className="w-7 h-7 rounded flex items-center justify-center font-mono text-base font-bold text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#1e293b] cursor-pointer"
                  >
                    -
                  </button>

                  <span className="text-sm font-mono font-bold text-[#4cd7f6] tabular-nums">
                    {activeSensor.zeroOffset > 0 ? `+${activeSensor.zeroOffset.toFixed(2)}` : activeSensor.zeroOffset.toFixed(2)}
                  </span>

                  <button
                    onClick={() => onUpdateSensorCalibration(activeSensor.id, Number((activeSensor.zeroOffset + 0.01).toFixed(2)), activeSensor.spanFactor)}
                    className="w-7 h-7 rounded flex items-center justify-center font-mono text-base font-bold text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#1e293b] cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Span Calibration Factor Stepper */}
              <div className="bg-[#0b0f19]/70 p-3.5 rounded-lg border border-[rgba(148,163,184,0.15)] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono font-medium text-[#f8fafc]">
                      Span Calibration Factor
                    </span>
                    <span className="text-[10px] font-mono text-[#64748b]">Sensitivity Multiplier</span>
                  </div>
                  <p className="text-[11px] text-[#94a3b8] mb-3">
                    Slope scaling factor aligned with gravimetric reference.
                  </p>
                </div>

                <div className="flex items-center justify-between bg-[#111827] rounded border border-[rgba(148,163,184,0.2)] p-1">
                  <button
                    onClick={() => onUpdateSensorCalibration(activeSensor.id, activeSensor.zeroOffset, Number((activeSensor.spanFactor - 0.002).toFixed(3)))}
                    className="w-7 h-7 rounded flex items-center justify-center font-mono text-base font-bold text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#1e293b] cursor-pointer"
                  >
                    -
                  </button>

                  <span className="text-sm font-mono font-bold text-[#14b8a6] tabular-nums">
                    {activeSensor.spanFactor.toFixed(3)}x
                  </span>

                  <button
                    onClick={() => onUpdateSensorCalibration(activeSensor.id, activeSensor.zeroOffset, Number((activeSensor.spanFactor + 0.002).toFixed(3)))}
                    className="w-7 h-7 rounded flex items-center justify-center font-mono text-base font-bold text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#1e293b] cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Sensor Drift Spider / Radar Chart */}
          <div className="glass-panel-l1 rounded-lg p-5">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#64748b] tracking-wider">
                  Spectral Integrity Profile
                </span>
                <h4 className="text-sm font-bold font-display text-[#f8fafc]">
                  6-Axis Calibration Radar: Factory vs Field Drift
                </h4>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 text-[11px] font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full border border-dashed border-[#8b5cf6]" />
                  <span className="text-[#64748b]">Factory (100)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4]" />
                  <span className="text-[#4cd7f6] font-semibold">Current Field</span>
                </div>
              </div>
            </div>

            {/* Radar SVG Diagram */}
            <div className="flex items-center justify-center py-2">
              <svg className="w-64 h-64 overflow-visible" viewBox="0 0 240 240">
                {/* Polygonal concentric concentric grid rings (25%, 50%, 75%, 100%) */}
                {[0.25, 0.5, 0.75, 1.0].map(frac => {
                  const ringPoints = axes.map((_, i) => {
                    const { x, y } = getCoordinatesForAxis(i, frac);
                    return `${x.toFixed(1)},${y.toFixed(1)}`;
                  }).join(' ');

                  return (
                    <polygon
                      key={frac}
                      points={ringPoints}
                      fill="none"
                      stroke="rgba(148, 163, 184, 0.12)"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Spoke axis lines */}
                {axes.map((_, i) => {
                  const { x, y } = getCoordinatesForAxis(i, 1.0);
                  return (
                    <line
                      key={i}
                      x1={radarCenter}
                      y1={radarCenter}
                      x2={x}
                      y2={y}
                      stroke="rgba(148, 163, 184, 0.18)"
                      strokeWidth="1"
                      strokeDasharray="2 3"
                    />
                  );
                })}

                {/* Factory Baseline Polygon (Dashed Purple) */}
                <polygon
                  points={baselinePoints}
                  fill="rgba(139, 92, 246, 0.08)"
                  stroke="#8b5cf6"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                />

                {/* Current Field Polygon (Solid Cyan Glow) */}
                <polygon
                  points={currentPoints}
                  fill="rgba(6, 182, 212, 0.22)"
                  stroke="#06b6d4"
                  strokeWidth="1.8"
                  style={{
                    filter: 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.5))'
                  }}
                />

                {/* Vertex labels */}
                {axes.map((a, i) => {
                  const { x, y } = getCoordinatesForAxis(i, 1.22);
                  const isLeft = x < radarCenter - 10;
                  const isRight = x > radarCenter + 10;

                  return (
                    <text
                      key={i}
                      x={x}
                      y={y}
                      textAnchor={isLeft ? 'end' : isRight ? 'start' : 'middle'}
                      dominantBaseline="central"
                      className="text-[9px] font-mono fill-[#94a3b8] font-medium"
                    >
                      {a.axis} ({a.current}%)
                    </text>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Diagnostic Console Terminal */}
          <div className="glass-panel-l1 rounded-lg p-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[rgba(148,163,184,0.1)] text-[#64748b]">
              <div className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-[#06b6d4]" />
                <span className="uppercase text-[10px]">Real-time Hardware Diagnostic Telemetry</span>
              </div>
              <span className="text-[10px] text-[#10b981]">ONLINE // READY</span>
            </div>

            <div className="space-y-1 max-h-28 overflow-y-auto pr-1 text-[11px] scrollbar-none">
              {testLogs.map((log, idx) => (
                <div key={idx} className={idx === 0 ? 'text-[#4cd7f6]' : 'text-[#94a3b8]'}>
                  {log}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
