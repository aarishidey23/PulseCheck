/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { StationTelemetry, TimeSeriesSample } from '../types/telemetry';
import { Download, Search, Filter, Database, FileSpreadsheet, ChevronLeft, ChevronRight } from 'lucide-react';

interface DataLaboratoryProps {
  stations: StationTelemetry[];
  selectedStation: StationTelemetry;
  samples: TimeSeriesSample[];
  onSwitchToPython?: () => void;
}

export const DataLaboratory: React.FC<DataLaboratoryProps> = ({
  stations,
  selectedStation,
  samples,
  onSwitchToPython,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStationId, setFilterStationId] = useState<string>(selectedStation.id);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Filtered samples
  const filteredSamples = useMemo(() => {
    return samples.filter(item => {
      const matchSearch =
        item.timeLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.isoTime.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSearch;
    });
  }, [samples, searchQuery]);

  const totalPages = Math.ceil(filteredSamples.length / itemsPerPage);
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSamples.slice(start, start + itemsPerPage);
  }, [filteredSamples, currentPage]);

  // Statistical distribution calculations on PM2.5 & CO2
  const stats = useMemo(() => {
    if (samples.length === 0) return { meanPm25: 0, p95Pm25: 0, minPm25: 0, maxPm25: 0, meanCo2: 0 };
    const pm25Arr = samples.map(s => s.pm25).sort((a, b) => a - b);
    const co2Arr = samples.map(s => s.co2);
    
    const meanPm25 = pm25Arr.reduce((a, b) => a + b, 0) / pm25Arr.length;
    const p95Index = Math.floor(pm25Arr.length * 0.95);
    const p95Pm25 = pm25Arr[p95Index] || pm25Arr[pm25Arr.length - 1];
    const minPm25 = pm25Arr[0];
    const maxPm25 = pm25Arr[pm25Arr.length - 1];
    const meanCo2 = co2Arr.reduce((a, b) => a + b, 0) / co2Arr.length;

    return {
      meanPm25: Number(meanPm25.toFixed(2)),
      p95Pm25: Number(p95Pm25.toFixed(2)),
      minPm25: Number(minPm25.toFixed(2)),
      maxPm25: Number(maxPm25.toFixed(2)),
      meanCo2: Number(meanCo2.toFixed(1)),
    };
  }, [samples]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Timestamp_UTC',
      'Local_Time',
      'Station_Code',
      'Station_Name',
      'PM2.5_ug_m3',
      'PM10_ug_m3',
      'PM1.0_ug_m3',
      'CO2_ppm',
      'O3_ppb',
      'NO2_ppb',
      'VOC_Index',
      'Temperature_C',
      'Rel_Humidity_pct',
      'Baro_Pressure_hPa'
    ];

    const rows = filteredSamples.map(s => [
      s.isoTime,
      `"${s.timeLabel}"`,
      selectedStation.code,
      `"${selectedStation.name}"`,
      s.pm25,
      s.pm10,
      s.pm1,
      s.co2,
      s.o3,
      s.no2,
      s.vocIndex,
      s.temperature,
      s.humidity,
      s.pressure
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `pulsecheck-telemetry-${selectedStation.code}-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export JSON
  const handleExportJSON = () => {
    const payload = {
      platform: 'PulseCheck Environmental Intelligence',
      exportedAt: new Date().toISOString(),
      station: {
        code: selectedStation.code,
        name: selectedStation.name,
        coordinates: selectedStation.coordinates,
        elevationMeters: selectedStation.elevationMeters,
      },
      summaryStatistics: stats,
      telemetrySamples: filteredSamples,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `pulsecheck-dataset-${selectedStation.code}-${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Export Bar */}
      <div className="glass-panel-l1 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-mono uppercase text-[#64748b] tracking-wider">
            Data Laboratory · Query Engine & Telemetry Ledger
          </span>
          <h2 className="text-lg font-bold font-display text-[#f8fafc]">
            Historical Multi-Channel Atmospheric Dataset
          </h2>
        </div>

        {/* Primary Download & Python CTAs */}
        <div className="flex flex-wrap items-center gap-2">
          {onSwitchToPython && (
            <button
              onClick={onSwitchToPython}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-[#10b981] bg-[rgba(16,185,129,0.12)] border border-[#10b981]/40 hover:bg-[#10b981] hover:text-[#0b0f19] transition-all cursor-pointer shadow-[0_0_10px_rgba(16,185,129,0.2)]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
              <span>Analyze in Python (FastAPI)</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-[#4cd7f6] bg-[rgba(6,182,212,0.15)] border border-[#06b6d4] hover:bg-[#06b6d4] hover:text-[#0b0f19] transition-all cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.25)]"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-[#f8fafc] bg-[rgba(30,41,59,0.6)] border border-[rgba(148,163,184,0.2)] hover:border-[rgba(148,163,184,0.4)] transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Statistical Distribution KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="glass-panel-l1 rounded-lg p-3">
          <span className="text-[10px] font-mono uppercase text-[#64748b] block">Arithmetic Mean (PM2.5)</span>
          <span className="text-xl font-bold font-mono text-[#f8fafc] tabular-nums">{stats.meanPm25}</span>
          <span className="text-[10px] font-mono text-[#64748b] ml-1">µg/m³</span>
        </div>

        <div className="glass-panel-l1 rounded-lg p-3">
          <span className="text-[10px] font-mono uppercase text-[#64748b] block">95th Percentile (P95)</span>
          <span className="text-xl font-bold font-mono text-[#4cd7f6] tabular-nums">{stats.p95Pm25}</span>
          <span className="text-[10px] font-mono text-[#64748b] ml-1">µg/m³</span>
        </div>

        <div className="glass-panel-l1 rounded-lg p-3">
          <span className="text-[10px] font-mono uppercase text-[#64748b] block">Minimum Observed</span>
          <span className="text-xl font-bold font-mono text-[#10b981] tabular-nums">{stats.minPm25}</span>
          <span className="text-[10px] font-mono text-[#64748b] ml-1">µg/m³</span>
        </div>

        <div className="glass-panel-l1 rounded-lg p-3">
          <span className="text-[10px] font-mono uppercase text-[#64748b] block">Maximum Peak Vector</span>
          <span className="text-xl font-bold font-mono text-[#f43f5e] tabular-nums">{stats.maxPm25}</span>
          <span className="text-[10px] font-mono text-[#64748b] ml-1">µg/m³</span>
        </div>

        <div className="glass-panel-l1 rounded-lg p-3 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-mono uppercase text-[#64748b] block">Mean CO2 Baseline</span>
          <span className="text-xl font-bold font-mono text-[#38bdf8] tabular-nums">{stats.meanCo2}</span>
          <span className="text-[10px] font-mono text-[#64748b] ml-1">ppm</span>
        </div>
      </div>

      {/* Query Bar & Data Table */}
      <div className="glass-panel-l1 rounded-lg p-5 space-y-4">
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
            <input
              type="text"
              placeholder="Search timestamp or record..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#0b0f19] border border-[rgba(148,163,184,0.2)] rounded-lg pl-9 pr-3 py-1.5 text-[#f8fafc] focus:border-[#06b6d4] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-[#64748b] text-[11px]">
              Showing {currentItems.length} of {filteredSamples.length} telemetry records
            </span>
          </div>
        </div>

        {/* High-Density Data Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-[rgba(148,163,184,0.15)] text-[#64748b] uppercase text-[10px] bg-[#111827]/60">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3 text-right">PM2.5 (µg/m³)</th>
                <th className="py-2.5 px-3 text-right">PM10 (µg/m³)</th>
                <th className="py-2.5 px-3 text-right">PM1.0 (µg/m³)</th>
                <th className="py-2.5 px-3 text-right">CO2 (ppm)</th>
                <th className="py-2.5 px-3 text-right">O3 (ppb)</th>
                <th className="py-2.5 px-3 text-right">NO2 (ppb)</th>
                <th className="py-2.5 px-3 text-right">VOC (pts)</th>
                <th className="py-2.5 px-3 text-right">Temp (°C)</th>
                <th className="py-2.5 px-3 text-right">Humidity (%)</th>
                <th className="py-2.5 px-3 text-right">Pressure (hPa)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(148,163,184,0.08)]">
              {currentItems.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#1e293b]/50 transition-colors">
                  <td className="py-2 px-3 text-[#dfe2f1] whitespace-nowrap">
                    {row.timeLabel}
                  </td>
                  <td className="py-2 px-3 text-right text-[#4cd7f6] font-semibold tabular-nums">
                    {row.pm25.toFixed(1)}
                  </td>
                  <td className="py-2 px-3 text-right text-[#14b8a6] tabular-nums">
                    {row.pm10.toFixed(1)}
                  </td>
                  <td className="py-2 px-3 text-right text-[#94a3b8] tabular-nums">
                    {row.pm1.toFixed(1)}
                  </td>
                  <td className="py-2 px-3 text-right text-[#38bdf8] tabular-nums">
                    {row.co2.toFixed(1)}
                  </td>
                  <td className="py-2 px-3 text-right text-[#8b5cf6] tabular-nums">
                    {row.o3.toFixed(1)}
                  </td>
                  <td className="py-2 px-3 text-right text-[#f59e0b] tabular-nums">
                    {row.no2.toFixed(1)}
                  </td>
                  <td className="py-2 px-3 text-right text-[#ec4899] tabular-nums">
                    {row.vocIndex}
                  </td>
                  <td className="py-2 px-3 text-right text-[#f8fafc] tabular-nums">
                    {row.temperature.toFixed(1)}
                  </td>
                  <td className="py-2 px-3 text-right text-[#94a3b8] tabular-nums">
                    {row.humidity.toFixed(1)}
                  </td>
                  <td className="py-2 px-3 text-right text-[#64748b] tabular-nums">
                    {row.pressure.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-[rgba(148,163,184,0.1)] text-xs font-mono text-[#94a3b8]">
          <div>
            Page <span className="text-[#f8fafc] font-bold">{currentPage}</span> of {Math.max(1, totalPages)}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1.5 rounded bg-[#111827] border border-[rgba(148,163,184,0.15)] text-[#dfe2f1] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#1e293b] cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded bg-[#111827] border border-[rgba(148,163,184,0.15)] text-[#dfe2f1] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#1e293b] cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
