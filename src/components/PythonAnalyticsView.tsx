/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { StationTelemetry, TimeSeriesSample } from '../types/telemetry';
import {
  FileCode,
  CheckCircle2,
  AlertCircle,
  Play,
  Upload,
  ExternalLink,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Layers,
  Sparkles,
  BarChart3,
  Sliders,
  Database
} from 'lucide-react';

interface PythonAnalyticsViewProps {
  currentStation: StationTelemetry;
  samples: TimeSeriesSample[];
}

interface PythonHealth {
  status: string;
  python_version: string;
  fastapi_version: string;
  pandas_version: string;
  numpy_version: string;
}

interface AnalyticsResult {
  status: string;
  engine: string;
  dataset_name: string;
  analyzed_metric: string;
  unit: string;
  cleaning_report: {
    initial_rows: number;
    cleaned_rows: number;
    missing_values_imputed: number;
    duplicate_rows_dropped: number;
    imputation_strategy: string;
    columns_processed: string[];
  };
  descriptive_stats: {
    count: number;
    mean: number;
    std_dev: number;
    variance: number;
    min: number;
    max: number;
    range: number;
    skewness: number;
    kurtosis: number;
  };
  percentile_analysis: {
    p10: number;
    p25_q1: number;
    p50_median: number;
    p75_q3: number;
    p90: number;
    p95: number;
    p99: number;
    iqr: number;
    lower_outlier_bound: number;
    upper_outlier_bound: number;
  };
  outliers_detected_count: number;
  outliers_sample: Array<{
    index: number;
    timestamp: string;
    value: number;
    z_score: number;
    deviation_from_median: number;
    detection_method: string;
  }>;
  rolling_series: Array<{
    timestamp: string;
    raw_value: number;
    rolling_mean: number;
    rolling_std: number;
    rolling_min: number;
    rolling_max: number;
  }>;
  trend_analysis: {
    slope_per_hour: number;
    intercept: number;
    r_squared: number;
    trend_direction: string;
    annualized_trend_pct: number;
    interpretation: string;
  };
  forecast_12h: Array<{
    step: number;
    time_label: string;
    forecast_value: number;
    lower_confidence_95: number;
    upper_confidence_95: number;
  }>;
  execution_time_ms: number;
}

export const PythonAnalyticsView: React.FC<PythonAnalyticsViewProps> = ({
  currentStation,
  samples,
}) => {
  const [health, setHealth] = useState<PythonHealth | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'station' | 'reference' | 'upload'>('station');
  const [selectedMetric, setSelectedMetric] = useState<string>('pm25');
  const [rollingWindow, setRollingWindow] = useState<number>(6);
  const [forecastSteps, setForecastSteps] = useState<number>(12);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [analyticsResult, setAnalyticsResult] = useState<AnalyticsResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check Python FastAPI backend health on mount
  const checkBackendHealth = async () => {
    setHealthLoading(true);
    try {
      const res = await fetch('/api/python/health');
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
        setErrorMsg(null);
      } else {
        setHealth(null);
      }
    } catch (err) {
      console.warn('Backend not responding yet:', err);
      setHealth(null);
    } finally {
      setHealthLoading(false);
    }
  };

  useEffect(() => {
    checkBackendHealth();
    const interval = setInterval(checkBackendHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  // Run initial analysis automatically once health is verified
  useEffect(() => {
    if (health && !analyticsResult && !isLoading) {
      executeAnalysis();
    }
  }, [health]);

  // Execute Pandas & NumPy pipeline
  const executeAnalysis = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      let res: Response;

      if (dataSource === 'station') {
        // Send current station samples as JSON batch
        const payload = {
          station_code: currentStation.code,
          station_name: currentStation.name,
          metric: selectedMetric,
          rolling_window: rollingWindow,
          forecast_steps: forecastSteps,
          records: samples,
        };

        res = await fetch('/api/python/analyze/telemetry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else if (dataSource === 'reference') {
        // Query the EPA AQS benchmark dataset
        const params = new URLSearchParams({
          metric: selectedMetric,
          rolling_window: rollingWindow.toString(),
          forecast_steps: forecastSteps.toString(),
        });

        res = await fetch(`/api/python/analyze/reference?${params.toString()}`, {
          method: 'POST',
        });
      } else {
        // Upload user CSV
        if (!uploadedFile) {
          throw new Error('Please choose a CSV file to upload.');
        }

        const formData = new FormData();
        formData.append('file', uploadedFile);
        formData.append('metric', selectedMetric);
        formData.append('rolling_window', rollingWindow.toString());
        formData.append('forecast_steps', forecastSteps.toString());

        res = await fetch('/api/python/analyze/upload', {
          method: 'POST',
          body: formData,
        });
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Server returned code ${res.status}`);
      }

      const data: AnalyticsResult = await res.json();
      setAnalyticsResult(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Analysis failed. Verify Python backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Python Backend Diagnostic Status Ribbon */}
      <div className="glass-panel-l1 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-[rgba(6,182,212,0.3)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[rgba(6,182,212,0.15)] border border-[#06b6d4]/40 flex items-center justify-center text-[#4cd7f6]">
            <FileCode className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold font-display text-[#f8fafc]">
                Python Data Science Engine
              </h3>
              {health ? (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                  FastAPI Operational
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
                  Connecting...
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#94a3b8] mt-1">
              <span>Python {health ? health.python_version : '3.10'}</span>
              <span>·</span>
              <span>Pandas {health ? health.pandas_version : '2.3'}</span>
              <span>·</span>
              <span>NumPy {health ? health.numpy_version : '2.2'}</span>
              <span>·</span>
              <span>FastAPI {health ? health.fastapi_version : '0.162'}</span>
            </div>
          </div>
        </div>

        {/* Action Links */}
        <div className="flex items-center gap-2">
          <a
            href="/api/python/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-[#4cd7f6] bg-[rgba(6,182,212,0.12)] border border-[rgba(6,182,212,0.3)] hover:bg-[rgba(6,182,212,0.2)] transition-colors whitespace-nowrap cursor-pointer"
          >
            <span>Swagger API Docs</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            onClick={checkBackendHealth}
            className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#1e293b] border border-[rgba(148,163,184,0.15)] cursor-pointer"
            title="Refresh backend status"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${healthLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Control Panel: Data Source, Parameter Steppers & Trigger */}
      <div className="glass-panel-l1 rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[rgba(148,163,184,0.1)]">
          <div>
            <span className="text-[10px] font-mono uppercase text-[#64748b] tracking-wider">
              CSE Analytical Pipeline Configuration
            </span>
            <h4 className="text-base font-bold font-display text-[#f8fafc]">
              Select Dataset & Statistical Hyperparameters
            </h4>
          </div>

          <button
            onClick={executeAnalysis}
            disabled={isLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              isLoading
                ? 'bg-[rgba(6,182,212,0.2)] text-[#4cd7f6] border border-[#06b6d4]/40 cursor-wait'
                : 'bg-[#06b6d4] text-[#0b0f19] hover:bg-[#4cd7f6] shadow-[0_0_16px_rgba(6,182,212,0.35)]'
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Processing in Python...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Pandas & NumPy Pipeline</span>
              </>
            )}
          </button>
        </div>

        {/* Data Source Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
          <button
            onClick={() => setDataSource('station')}
            className={`p-3 rounded-lg text-left border transition-all cursor-pointer ${
              dataSource === 'station'
                ? 'glass-panel-l2 border-[#06b6d4]/50 ring-1 ring-[#06b6d4]/30'
                : 'bg-[#111827]/60 border-[rgba(148,163,184,0.1)] hover:border-[rgba(148,163,184,0.25)]'
            }`}
          >
            <div className="font-semibold text-[#f8fafc] mb-1 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-[#06b6d4]" />
              <span>Current Station Telemetry</span>
            </div>
            <p className="text-[11px] text-[#94a3b8] line-clamp-2">
              Streams active observations from {currentStation.name} into Pandas DataFrame.
            </p>
          </button>

          <button
            onClick={() => setDataSource('reference')}
            className={`p-3 rounded-lg text-left border transition-all cursor-pointer ${
              dataSource === 'reference'
                ? 'glass-panel-l2 border-[#06b6d4]/50 ring-1 ring-[#06b6d4]/30'
                : 'bg-[#111827]/60 border-[rgba(148,163,184,0.1)] hover:border-[rgba(148,163,184,0.25)]'
            }`}
          >
            <div className="font-semibold text-[#f8fafc] mb-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#14b8a6]" />
              <span>EPA AQS Reference Benchmark</span>
            </div>
            <p className="text-[11px] text-[#94a3b8] line-clamp-2">
              96 hours of real-world multi-pollutant data from US EPA Air Quality System.
            </p>
          </button>

          <button
            onClick={() => {
              setDataSource('upload');
              fileInputRef.current?.click();
            }}
            className={`p-3 rounded-lg text-left border transition-all cursor-pointer ${
              dataSource === 'upload'
                ? 'glass-panel-l2 border-[#06b6d4]/50 ring-1 ring-[#06b6d4]/30'
                : 'bg-[#111827]/60 border-[rgba(148,163,184,0.1)] hover:border-[rgba(148,163,184,0.25)]'
            }`}
          >
            <div className="font-semibold text-[#f8fafc] mb-1 flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-[#8b5cf6]" />
              <span>Upload External CSV</span>
            </div>
            <p className="text-[11px] text-[#94a3b8] truncate">
              {uploadedFile ? uploadedFile.name : 'Ingest custom sensor CSV for Pandas parsing.'}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  setUploadedFile(e.target.files[0]);
                  setDataSource('upload');
                }
              }}
            />
          </button>
        </div>

        {/* Hyperparameter Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs font-mono">
          <div>
            <label className="text-[#94a3b8] block mb-1">Target Analytical Column</label>
            <select
              value={selectedMetric}
              onChange={e => setSelectedMetric(e.target.value)}
              className="w-full bg-[#0b0f19] border border-[rgba(148,163,184,0.2)] rounded px-2.5 py-1.5 text-[#f8fafc] focus:border-[#06b6d4] focus:outline-none"
            >
              <option value="pm25">PM2.5 (Fine Particulates)</option>
              <option value="pm10">PM10 (Coarse Particulates)</option>
              <option value="co2">CO2 (Carbon Dioxide)</option>
              <option value="o3">O3 (Tropospheric Ozone)</option>
              <option value="no2">NO2 (Nitrogen Dioxide)</option>
              <option value="vocIndex">VOC (Volatile Organics)</option>
              <option value="temperature">Temperature (°C)</option>
            </select>
          </div>

          <div>
            <label className="text-[#94a3b8] block mb-1">
              Rolling Moving Window: <strong className="text-[#4cd7f6]">{rollingWindow} hours</strong>
            </label>
            <input
              type="range"
              min={2}
              max={24}
              value={rollingWindow}
              onChange={e => setRollingWindow(Number(e.target.value))}
              className="w-full accent-[#06b6d4] cursor-pointer"
            />
          </div>

          <div>
            <label className="text-[#94a3b8] block mb-1">
              Forecast Horizon: <strong className="text-[#14b8a6]">{forecastSteps} steps ahead</strong>
            </label>
            <input
              type="range"
              min={4}
              max={24}
              value={forecastSteps}
              onChange={e => setForecastSteps(Number(e.target.value))}
              className="w-full accent-[#14b8a6] cursor-pointer"
            />
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded bg-[#f43f5e]/15 border border-[#f43f5e]/30 text-xs font-mono text-[#f43f5e] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Analytics Results Stage */}
      {analyticsResult && (
        <div className="space-y-5">
          
          {/* Cleaning Report Banner */}
          <div className="glass-panel-l1 rounded-lg p-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
              <span className="text-[#f8fafc] font-semibold">
                Pandas Data Cleaning Passed:
              </span>
              <span className="text-[#94a3b8]">
                {analyticsResult.cleaning_report.cleaned_rows} rows analyzed
              </span>
              <span className="text-[#64748b]">·</span>
              <span className="text-[#94a3b8]">
                {analyticsResult.cleaning_report.missing_values_imputed} null values imputed
              </span>
              <span className="text-[#64748b]">·</span>
              <span className="text-[#94a3b8]">
                {analyticsResult.cleaning_report.duplicate_rows_dropped} duplicates dropped
              </span>
            </div>

            <div className="text-[11px] text-[#64748b]">
              Engine Latency: <strong className="text-[#4cd7f6]">{analyticsResult.execution_time_ms} ms</strong>
            </div>
          </div>

          {/* Section 1: NumPy Statistical Moments & Descriptive Analysis */}
          <div>
            <h4 className="text-xs font-mono uppercase text-[#64748b] tracking-wider mb-2">
              NumPy Statistical Moments (Sample Statistics)
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-mono">
              <div className="glass-panel-l1 rounded-lg p-3">
                <span className="text-[10px] text-[#64748b] uppercase block">Mean (μ)</span>
                <span className="text-xl font-bold text-[#f8fafc] tabular-nums">
                  {analyticsResult.descriptive_stats.mean}
                </span>
                <span className="text-[10px] text-[#64748b] ml-1">{analyticsResult.unit}</span>
              </div>

              <div className="glass-panel-l1 rounded-lg p-3">
                <span className="text-[10px] text-[#64748b] uppercase block">Std Dev (σ)</span>
                <span className="text-xl font-bold text-[#4cd7f6] tabular-nums">
                  {analyticsResult.descriptive_stats.std_dev}
                </span>
                <span className="text-[10px] text-[#64748b] ml-1">{analyticsResult.unit}</span>
              </div>

              <div className="glass-panel-l1 rounded-lg p-3">
                <span className="text-[10px] text-[#64748b] uppercase block">Variance (σ²)</span>
                <span className="text-xl font-bold text-[#38bdf8] tabular-nums">
                  {analyticsResult.descriptive_stats.variance}
                </span>
              </div>

              <div className="glass-panel-l1 rounded-lg p-3">
                <span className="text-[10px] text-[#64748b] uppercase block">Skewness (S)</span>
                <span className="text-xl font-bold text-[#f59e0b] tabular-nums">
                  {analyticsResult.descriptive_stats.skewness}
                </span>
              </div>

              <div className="glass-panel-l1 rounded-lg p-3">
                <span className="text-[10px] text-[#64748b] uppercase block">Kurtosis (K)</span>
                <span className="text-xl font-bold text-[#ec4899] tabular-nums">
                  {analyticsResult.descriptive_stats.kurtosis}
                </span>
              </div>

              <div className="glass-panel-l1 rounded-lg p-3">
                <span className="text-[10px] text-[#64748b] uppercase block">Range (Δ)</span>
                <span className="text-xl font-bold text-[#10b981] tabular-nums">
                  {analyticsResult.descriptive_stats.range}
                </span>
                <span className="text-[10px] text-[#64748b] ml-1">{analyticsResult.unit}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Percentile Analysis & IQR Outlier Thresholds */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Percentile Distribution (7 cols) */}
            <div className="lg:col-span-7 glass-panel-l1 rounded-lg p-5">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-[rgba(148,163,184,0.1)]">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#64748b] tracking-wider">
                    Cumulative Distribution Function
                  </span>
                  <h5 className="text-sm font-bold font-display text-[#f8fafc]">
                    Pandas Percentile Breakdown
                  </h5>
                </div>

                <span className="text-xs font-mono text-[#4cd7f6]">
                  IQR = {analyticsResult.percentile_analysis.iqr} {analyticsResult.unit}
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="bg-[#111827]/70 p-2.5 rounded border border-[rgba(148,163,184,0.08)]">
                  <span className="text-[10px] text-[#64748b] block">P10 (10th)</span>
                  <span className="text-sm font-bold text-[#dfe2f1] tabular-nums">{analyticsResult.percentile_analysis.p10}</span>
                </div>
                <div className="bg-[#111827]/70 p-2.5 rounded border border-[rgba(148,163,184,0.08)]">
                  <span className="text-[10px] text-[#64748b] block">P25 (Q1)</span>
                  <span className="text-sm font-bold text-[#dfe2f1] tabular-nums">{analyticsResult.percentile_analysis.p25_q1}</span>
                </div>
                <div className="bg-[#111827]/70 p-2.5 rounded border border-[rgba(148,163,184,0.08)]">
                  <span className="text-[10px] text-[#4cd7f6] block font-semibold">P50 (Median)</span>
                  <span className="text-sm font-bold text-[#4cd7f6] tabular-nums">{analyticsResult.percentile_analysis.p50_median}</span>
                </div>
                <div className="bg-[#111827]/70 p-2.5 rounded border border-[rgba(148,163,184,0.08)]">
                  <span className="text-[10px] text-[#64748b] block">P75 (Q3)</span>
                  <span className="text-sm font-bold text-[#dfe2f1] tabular-nums">{analyticsResult.percentile_analysis.p75_q3}</span>
                </div>
                <div className="bg-[#111827]/70 p-2.5 rounded border border-[rgba(148,163,184,0.08)]">
                  <span className="text-[10px] text-[#64748b] block">P90 (90th)</span>
                  <span className="text-sm font-bold text-[#dfe2f1] tabular-nums">{analyticsResult.percentile_analysis.p90}</span>
                </div>
                <div className="bg-[#111827]/70 p-2.5 rounded border border-[rgba(148,163,184,0.08)]">
                  <span className="text-[10px] text-[#f59e0b] block font-semibold">P95 (Regulatory)</span>
                  <span className="text-sm font-bold text-[#f59e0b] tabular-nums">{analyticsResult.percentile_analysis.p95}</span>
                </div>
                <div className="bg-[#111827]/70 p-2.5 rounded border border-[rgba(148,163,184,0.08)]">
                  <span className="text-[10px] text-[#f43f5e] block font-semibold">P99 (Extreme)</span>
                  <span className="text-sm font-bold text-[#f43f5e] tabular-nums">{analyticsResult.percentile_analysis.p99}</span>
                </div>
                <div className="bg-[#111827]/70 p-2.5 rounded border border-[rgba(148,163,184,0.08)]">
                  <span className="text-[10px] text-[#64748b] block">Upper Outlier Bound</span>
                  <span className="text-sm font-bold text-[#f43f5e] tabular-nums">{analyticsResult.percentile_analysis.upper_outlier_bound}</span>
                </div>
              </div>
            </div>

            {/* Outlier Detection Summary (5 cols) */}
            <div className="lg:col-span-5 glass-panel-l1 rounded-lg p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-[rgba(148,163,184,0.1)]">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#64748b] tracking-wider">
                      Anomaly Invariant Audit
                    </span>
                    <h5 className="text-sm font-bold font-display text-[#f8fafc]">
                      IQR & Z-Score Outliers ({analyticsResult.outliers_detected_count})
                    </h5>
                  </div>

                  <span className={`text-xs font-mono px-2 py-0.5 rounded font-bold ${
                    analyticsResult.outliers_detected_count > 0
                      ? 'bg-[#f43f5e]/15 text-[#f43f5e] border border-[#f43f5e]/30'
                      : 'bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30'
                  }`}>
                    {analyticsResult.outliers_detected_count > 0 ? 'Anomalies Flagged' : 'Clean / Nominal'}
                  </span>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1 scrollbar-none text-xs font-mono">
                  {analyticsResult.outliers_sample.length === 0 ? (
                    <div className="p-4 text-center text-[#64748b]">
                      No anomalous outliers detected within 1.5×IQR or 2.5σ bounds.
                    </div>
                  ) : (
                    analyticsResult.outliers_sample.map((out, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded bg-[#0b0f19] border border-[rgba(148,163,184,0.1)] flex items-center justify-between"
                      >
                        <div>
                          <span className="text-[#f8fafc] font-bold">{out.timestamp}</span>
                          <span className="text-[10px] text-[#64748b] block">{out.detection_method}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[#f43f5e] font-bold tabular-nums">{out.value} {analyticsResult.unit}</span>
                          <span className="text-[10px] text-[#64748b] block tabular-nums">z = {out.z_score}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="text-[10px] font-mono text-[#64748b] pt-2 border-t border-[rgba(148,163,184,0.08)]">
                Formula: $Outlier \iff x &gt; Q_3 + 1.5 \times IQR \lor |z| \ge 2.5$
              </div>
            </div>

          </div>

          {/* Section 3: Linear Regression Trend & 12-Hour Statistical Forecast */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Trend Regression (5 cols) */}
            <div className="lg:col-span-5 glass-panel-l1 rounded-lg p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-[rgba(148,163,184,0.1)]">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#64748b] tracking-wider">
                      Ordinary Least Squares (OLS)
                    </span>
                    <h5 className="text-sm font-bold font-display text-[#f8fafc]">
                      Linear Trend Regression
                    </h5>
                  </div>

                  <span className="text-xs font-mono font-bold text-[#4cd7f6] bg-[rgba(6,182,212,0.12)] px-2 py-0.5 rounded border border-[#06b6d4]/30">
                    R² = {analyticsResult.trend_analysis.r_squared}
                  </span>
                </div>

                <div className="space-y-3 text-xs font-mono">
                  <div className="p-3 rounded bg-[#0b0f19]/70 border border-[rgba(148,163,184,0.1)]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[#64748b]">Slope (Rate of Change):</span>
                      <span className={`font-bold tabular-nums ${
                        analyticsResult.trend_analysis.slope_per_hour > 0 ? 'text-[#f43f5e]' : 'text-[#10b981]'
                      }`}>
                        {analyticsResult.trend_analysis.slope_per_hour > 0 ? '+' : ''}
                        {analyticsResult.trend_analysis.slope_per_hour} {analyticsResult.unit}/hr
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#64748b]">Regression Intercept:</span>
                      <span className="text-[#dfe2f1] tabular-nums font-semibold">
                        {analyticsResult.trend_analysis.intercept}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded bg-[#111827]/80 border border-[rgba(148,163,184,0.12)] text-[#dfe2f1]">
                    <span className="text-[10px] text-[#64748b] uppercase block mb-1">Empirical Interpretation</span>
                    <p className="text-[11px] leading-relaxed">
                      {analyticsResult.trend_analysis.interpretation}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-[10px] font-mono text-[#64748b] pt-2 border-t border-[rgba(148,163,184,0.08)]">
                Computed via NumPy <code className="text-[#4cd7f6]">np.polyfit(x, y, 1)</code>
              </div>
            </div>

            {/* 12-Hour Forecast Table & Confidence Interval (7 cols) */}
            <div className="lg:col-span-7 glass-panel-l1 rounded-lg p-5">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-[rgba(148,163,184,0.1)]">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#64748b] tracking-wider">
                    Double Exponential Smoothing
                  </span>
                  <h5 className="text-sm font-bold font-display text-[#f8fafc]">
                    12-Hour Lookahead Forecast (95% CI)
                  </h5>
                </div>

                <span className="text-xs font-mono text-[#14b8a6]">
                  Holt's Linear Model
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono border-collapse">
                  <thead>
                    <tr className="border-b border-[rgba(148,163,184,0.15)] text-[#64748b] uppercase text-[10px]">
                      <th className="py-2 px-3">Horizon</th>
                      <th className="py-2 px-3 text-right">Predicted ({analyticsResult.unit})</th>
                      <th className="py-2 px-3 text-right">95% Lower Bound</th>
                      <th className="py-2 px-3 text-right">95% Upper Bound</th>
                      <th className="py-2 px-3">Confidence Margin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(148,163,184,0.08)]">
                    {analyticsResult.forecast_12h.slice(0, 6).map((fc, i) => (
                      <tr key={i} className="hover:bg-[#1e293b]/40">
                        <td className="py-2 px-3 text-[#f8fafc] font-semibold">{fc.time_label}</td>
                        <td className="py-2 px-3 text-right text-[#4cd7f6] font-bold tabular-nums">
                          {fc.forecast_value}
                        </td>
                        <td className="py-2 px-3 text-right text-[#94a3b8] tabular-nums">
                          {fc.lower_confidence_95}
                        </td>
                        <td className="py-2 px-3 text-right text-[#f59e0b] tabular-nums">
                          {fc.upper_confidence_95}
                        </td>
                        <td className="py-2 px-3 text-[10px] text-[#64748b]">
                          ±{(fc.upper_confidence_95 - fc.forecast_value).toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="text-[10px] font-mono text-[#64748b] pt-3 mt-1 border-t border-[rgba(148,163,184,0.08)]">
                {"Forecasting equations: Level L_t = α·Y_t + (1-α)(L_{t-1} + b_{t-1}), Trend b_t = β(L_t - L_{t-1}) + (1-β)b_{t-1}."}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
