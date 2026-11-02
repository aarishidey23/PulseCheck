/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StationTelemetry, AlertNotification, ThresholdRule, RegulatoryStandard } from '../types/telemetry';
import { ShieldAlert, CheckCircle2, AlertTriangle, Bell, Plus, Trash2, Zap } from 'lucide-react';

interface RegulatoryStandardsProps {
  station: StationTelemetry;
  standards: RegulatoryStandard[];
  alerts: AlertNotification[];
  alertRules: ThresholdRule[];
  onAcknowledgeAlert: (alertId: string) => void;
  onResolveAlert: (alertId: string) => void;
  onAddRule: (rule: ThresholdRule) => void;
  onDeleteRule: (ruleId: string) => void;
  onSimulateExceedance: (rule: ThresholdRule) => void;
}

export const RegulatoryStandards: React.FC<RegulatoryStandardsProps> = ({
  station,
  standards,
  alerts,
  alertRules,
  onAcknowledgeAlert,
  onResolveAlert,
  onAddRule,
  onDeleteRule,
  onSimulateExceedance,
}) => {
  // New rule form state
  const [newMetric, setNewMetric] = useState<keyof StationTelemetry['metrics']>('pm25');
  const [newLabel, setNewLabel] = useState('');
  const [newThreshold, setNewThreshold] = useState<number>(30);
  const [newDuration, setNewDuration] = useState<number>(15);
  const [newSeverity, setNewSeverity] = useState<'caution' | 'unhealthy' | 'hazardous'>('unhealthy');
  const [isAddingRule, setIsAddingRule] = useState(false);

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    const metricUnits: Record<string, string> = {
      pm25: 'µg/m³',
      pm10: 'µg/m³',
      co2: 'ppm',
      o3: 'ppb',
      no2: 'ppb',
      vocIndex: 'pts',
    };

    const rule: ThresholdRule = {
      id: `rule-${Date.now()}`,
      metric: newMetric,
      label: newLabel || `${newMetric.toUpperCase()} Threshold Guard`,
      operator: '>',
      threshold: Number(newThreshold),
      unit: metricUnits[newMetric] || 'µg/m³',
      durationMinutes: Number(newDuration),
      severity: newSeverity,
      enabled: true,
      stationScope: 'all',
    };

    onAddRule(rule);
    setIsAddingRule(false);
    setNewLabel('');
  };

  const getMetricCurrentValue = (pollutant: string): number => {
    if (pollutant.includes('PM2.5')) return station.metrics.pm25.value;
    if (pollutant.includes('PM10')) return station.metrics.pm10.value;
    if (pollutant.includes('Ozone')) return station.metrics.o3.value;
    if (pollutant.includes('Nitrogen')) return station.metrics.no2.value;
    if (pollutant.includes('Sulfur')) return station.metrics.so2.value;
    if (pollutant.includes('Carbon Monoxide')) return station.metrics.co.value;
    return 0;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel-l1 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-mono uppercase text-[#64748b] tracking-wider">
            Regulatory Compliance Console · EPA NAAQS & WHO 2021
          </span>
          <h2 className="text-lg font-bold font-display text-[#f8fafc]">
            Air Quality Standards & Real-time Alert Engine
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddingRule(!isAddingRule)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-[#4cd7f6] bg-[rgba(6,182,212,0.15)] border border-[#06b6d4] hover:bg-[#06b6d4] hover:text-[#0b0f19] transition-all cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.25)]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Alert Rule</span>
          </button>
        </div>
      </div>

      {/* New Rule Modal / Drawer Form */}
      {isAddingRule && (
        <form onSubmit={handleCreateRule} className="glass-panel-l2 rounded-lg p-5 space-y-4 border border-[rgba(6,182,212,0.4)]">
          <div className="flex items-center justify-between pb-2 border-b border-[rgba(148,163,184,0.1)]">
            <h4 className="text-sm font-bold font-display text-[#f8fafc]">
              Configure Environmental Threshold Rule
            </h4>
            <button
              type="button"
              onClick={() => setIsAddingRule(false)}
              className="text-xs text-[#94a3b8] hover:text-[#f8fafc]"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <label className="text-[#94a3b8] block mb-1">Target Pollutant</label>
              <select
                value={newMetric}
                onChange={e => setNewMetric(e.target.value as keyof StationTelemetry['metrics'])}
                className="w-full bg-[#0b0f19] border border-[rgba(148,163,184,0.2)] rounded px-2.5 py-1.5 text-[#f8fafc] focus:border-[#06b6d4] focus:outline-none"
              >
                <option value="pm25">PM2.5 (Fine Particulates)</option>
                <option value="pm10">PM10 (Coarse Particulates)</option>
                <option value="co2">CO2 (Carbon Dioxide)</option>
                <option value="o3">O3 (Tropospheric Ozone)</option>
                <option value="no2">NO2 (Nitrogen Dioxide)</option>
                <option value="vocIndex">VOC (Volatile Organics)</option>
              </select>
            </div>

            <div>
              <label className="text-[#94a3b8] block mb-1">Threshold Trigger</label>
              <input
                type="number"
                step="any"
                value={newThreshold}
                onChange={e => setNewThreshold(Number(e.target.value))}
                className="w-full bg-[#0b0f19] border border-[rgba(148,163,184,0.2)] rounded px-2.5 py-1.5 text-[#f8fafc] focus:border-[#06b6d4] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-[#94a3b8] block mb-1">Sustain Window (Minutes)</label>
              <input
                type="number"
                value={newDuration}
                onChange={e => setNewDuration(Number(e.target.value))}
                className="w-full bg-[#0b0f19] border border-[rgba(148,163,184,0.2)] rounded px-2.5 py-1.5 text-[#f8fafc] focus:border-[#06b6d4] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-[#94a3b8] block mb-1">Severity Tier</label>
              <select
                value={newSeverity}
                onChange={e => setNewSeverity(e.target.value as 'caution' | 'unhealthy' | 'hazardous')}
                className="w-full bg-[#0b0f19] border border-[rgba(148,163,184,0.2)] rounded px-2.5 py-1.5 text-[#f8fafc] focus:border-[#06b6d4] focus:outline-none"
              >
                <option value="caution">Caution (Amber)</option>
                <option value="unhealthy">Unhealthy (Rose)</option>
                <option value="hazardous">Hazardous (Violet)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#06b6d4] text-[#0b0f19] font-bold text-xs rounded hover:bg-[#4cd7f6] transition-colors cursor-pointer"
            >
              Arm Guard Rule
            </button>
          </div>
        </form>
      )}

      {/* Regulatory Standards Compliance Matrix */}
      <div className="glass-panel-l1 rounded-lg p-5">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[rgba(148,163,184,0.1)]">
          <div>
            <span className="text-[10px] font-mono uppercase text-[#64748b] tracking-wider">
              Benchmarking against National & International Frameworks
            </span>
            <h3 className="text-base font-bold font-display text-[#f8fafc]">
              Regulatory Limits vs {station.name} Readouts
            </h3>
          </div>
          
          <span className="text-xs font-mono text-[#94a3b8]">
            Updated Daily (24-Hour Cycle)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-[rgba(148,163,184,0.15)] text-[#64748b] uppercase text-[10px]">
                <th className="py-2.5 px-3">Pollutant Parameter</th>
                <th className="py-2.5 px-3">Avg Period</th>
                <th className="py-2.5 px-3 text-right">Current Value</th>
                <th className="py-2.5 px-3 text-right">WHO Guideline</th>
                <th className="py-2.5 px-3 text-right">US EPA NAAQS</th>
                <th className="py-2.5 px-3">Safety Margin</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(148,163,184,0.08)]">
              {standards.map((std, i) => {
                const current = getMetricCurrentValue(std.pollutant);
                const whoRatio = current / std.whoGuideline;
                const epaRatio = current / std.epaStandard;
                
                let statusLabel = 'COMPLIANT';
                let statusColor = '#10b981';
                let statusBg = 'rgba(16, 185, 129, 0.12)';

                if (whoRatio > 1.0 || epaRatio > 0.8) {
                  statusLabel = 'WARNING';
                  statusColor = '#f59e0b';
                  statusBg = 'rgba(245, 158, 11, 0.12)';
                }
                if (epaRatio > 1.0) {
                  statusLabel = 'EXCEEDED';
                  statusColor = '#f43f5e';
                  statusBg = 'rgba(244, 63, 94, 0.12)';
                }

                // Progress ratio capped at 100%
                const barRatio = Math.min(100, Math.round((current / std.epaStandard) * 100));

                return (
                  <tr key={i} className="hover:bg-[#1e293b]/40 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-[#f8fafc]">{std.pollutant}</div>
                      <div className="text-[10px] text-[#64748b] line-clamp-1">{std.healthImpact}</div>
                    </td>
                    <td className="py-3 px-3 text-[#94a3b8] whitespace-nowrap">
                      {std.averagingPeriod}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-[#f8fafc] tabular-nums whitespace-nowrap">
                      {current.toFixed(1)} <span className="text-[10px] text-[#64748b]">{std.unit}</span>
                    </td>
                    <td className="py-3 px-3 text-right text-[#94a3b8] tabular-nums whitespace-nowrap">
                      {std.whoGuideline.toFixed(1)} {std.unit}
                    </td>
                    <td className="py-3 px-3 text-right text-[#94a3b8] tabular-nums whitespace-nowrap">
                      {std.epaStandard.toFixed(1)} {std.unit}
                    </td>
                    <td className="py-3 px-3 min-w-[140px]">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-[#0b0f19] h-2 rounded-full overflow-hidden border border-[rgba(148,163,184,0.1)]">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${barRatio}%`,
                              backgroundColor: statusColor,
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-[#64748b] w-8 text-right tabular-nums">
                          {barRatio}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border"
                        style={{
                          backgroundColor: statusBg,
                          color: statusColor,
                          borderColor: `${statusColor}40`,
                        }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusColor }} />
                        {statusLabel}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Alerts Feed & Policy Rules Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Active Alerts List (7 cols) */}
        <div className="lg:col-span-7 glass-panel-l1 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[rgba(148,163,184,0.1)]">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#f59e0b]" />
                <h4 className="text-sm font-bold font-display text-[#f8fafc]">
                  Active Telemetry Incidents ({alerts.filter(a => !a.resolved).length})
                </h4>
              </div>
              <span className="text-[11px] font-mono text-[#64748b]">
                Real-Time Dispatch Feed
              </span>
            </div>

            <div className="space-y-3">
              {alerts.length === 0 ? (
                <div className="p-6 text-center text-xs font-mono text-[#64748b]">
                  No active environmental alerts. All sensors operating within safe regulatory limits.
                </div>
              ) : (
                alerts.map(alert => {
                  let badgeColor = '#f59e0b';
                  if (alert.severity === 'unhealthy') badgeColor = '#f43f5e';
                  if (alert.severity === 'hazardous') badgeColor = '#a855f7';

                  return (
                    <div
                      key={alert.id}
                      className={`p-3.5 rounded-lg border transition-all ${
                        alert.resolved
                          ? 'bg-[#111827]/40 border-[rgba(148,163,184,0.08)] opacity-60'
                          : 'bg-[#171b26]/90 border-[rgba(148,163,184,0.2)]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border"
                            style={{
                              backgroundColor: `${badgeColor}1f`,
                              color: badgeColor,
                              borderColor: `${badgeColor}40`,
                            }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: badgeColor }} />
                            {alert.severity}
                          </span>
                          <span className="text-xs font-bold font-display text-[#f8fafc]">
                            {alert.metricLabel} Exceedance
                          </span>
                        </div>

                        <span className="text-[10px] font-mono text-[#64748b]">
                          {alert.timestamp}
                        </span>
                      </div>

                      <div className="text-xs text-[#dfe2f1] font-mono mb-2">
                        Observed <strong className="text-[#f43f5e]">{alert.value} {alert.unit}</strong> (Regulatory ceiling: {alert.threshold} {alert.unit}) at <span className="text-[#4cd7f6]">{alert.stationName}</span>.
                      </div>

                      <div className="text-[11px] text-[#94a3b8] mb-3">
                        <span className="text-[#64748b] font-mono">Action: </span>
                        {alert.recommendedAction}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[rgba(148,163,184,0.08)]">
                        <div className="text-[10px] font-mono text-[#64748b]">
                          {alert.acknowledged ? 'Acknowledged by operator' : 'Awaiting acknowledgment'}
                        </div>

                        <div className="flex items-center gap-2">
                          {!alert.acknowledged && (
                            <button
                              onClick={() => onAcknowledgeAlert(alert.id)}
                              className="px-2.5 py-1 text-[11px] font-mono text-[#4cd7f6] hover:bg-[#1e293b] rounded transition-colors cursor-pointer"
                            >
                              Acknowledge
                            </button>
                          )}
                          {!alert.resolved && (
                            <button
                              onClick={() => onResolveAlert(alert.id)}
                              className="px-2.5 py-1 text-[11px] font-mono text-[#10b981] bg-[rgba(16,185,129,0.12)] hover:bg-[rgba(16,185,129,0.2)] border border-[#10b981]/30 rounded transition-colors cursor-pointer"
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Policy Threshold Rule Guard List (5 cols) */}
        <div className="lg:col-span-5 glass-panel-l1 rounded-lg p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[rgba(148,163,184,0.1)]">
              <h4 className="text-sm font-bold font-display text-[#f8fafc]">
                Automated Guard Rules ({alertRules.length})
              </h4>
              <span className="text-[11px] font-mono text-[#64748b]">Continuous Audit</span>
            </div>

            <div className="space-y-2">
              {alertRules.map(rule => (
                <div
                  key={rule.id}
                  className="p-3 rounded-lg bg-[#0b0f19]/80 border border-[rgba(148,163,184,0.12)] flex items-center justify-between gap-3 text-xs font-mono"
                >
                  <div className="overflow-hidden">
                    <div className="font-semibold text-[#f8fafc] truncate">{rule.label}</div>
                    <div className="text-[11px] text-[#64748b] mt-0.5">
                      Trigger: {rule.metric.toUpperCase()} {rule.operator} {rule.threshold} {rule.unit} for &gt;{rule.durationMinutes}m
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onSimulateExceedance(rule)}
                      title="Test Trigger Rule Now"
                      className="p-1.5 rounded bg-[rgba(6,182,212,0.15)] text-[#4cd7f6] hover:bg-[#06b6d4] hover:text-[#0b0f19] transition-colors cursor-pointer border border-[#06b6d4]/40"
                    >
                      <Zap className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteRule(rule.id)}
                      title="Remove rule"
                      className="p-1.5 rounded text-[#94a3b8] hover:text-[#f43f5e] hover:bg-[#1e293b] transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[11px] text-[#64748b] font-mono pt-3 border-t border-[rgba(148,163,184,0.1)]">
            Click <Zap className="w-3 h-3 inline text-[#06b6d4]" /> to test an exceedance condition and simulate dispatch into the live incident feed.
          </div>
        </div>

      </div>
    </div>
  );
};
