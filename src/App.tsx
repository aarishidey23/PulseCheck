/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  INITIAL_STATIONS,
  INITIAL_ALERTS,
  INITIAL_ALERT_RULES,
  REGULATORY_STANDARDS,
  generateStationTimeSeries,
} from './data/mockStations';
import { StationTelemetry, AlertNotification, ThresholdRule } from './types/telemetry';
import { Header } from './components/Header';
import { StationOverview } from './components/StationOverview';
import { AqiDial } from './components/AqiDial';
import { MetricCard } from './components/MetricCard';
import { TimeSeriesChart, MetricChannelKey } from './components/TimeSeriesChart';
import { GeospatialRadar } from './components/GeospatialRadar';
import { StationDiagnostics } from './components/StationDiagnostics';
import { RegulatoryStandards } from './components/RegulatoryStandards';
import { DataLaboratory } from './components/DataLaboratory';
import { PythonAnalyticsView } from './components/PythonAnalyticsView';
import { SimulateEventModal } from './components/SimulateEventModal';
import { Compass, Wind, Thermometer, Droplets, Gauge, Shield, Cpu } from 'lucide-react';

export default function App() {
  const [stations, setStations] = useState<StationTelemetry[]>(INITIAL_STATIONS);
  const [selectedStationId, setSelectedStationId] = useState<string>('station-alpha');
  const [activeScreen, setActiveScreen] = useState<'telemetry' | 'geospatial' | 'diagnostics' | 'regulatory' | 'data-lab' | 'python-analytics'>('telemetry');
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [selectedMetricKey, setSelectedMetricKey] = useState<MetricChannelKey>('pm25');
  const [selectedTimeWindow, setSelectedTimeWindow] = useState<'1H' | '6H' | '24H' | '7D' | '30D'>('24H');
  const [alerts, setAlerts] = useState<AlertNotification[]>(INITIAL_ALERTS);
  const [alertRules, setAlertRules] = useState<ThresholdRule[]>(INITIAL_ALERT_RULES);
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);

  // Current selected station object
  const currentStation = useMemo(() => {
    return stations.find(s => s.id === selectedStationId) || stations[0];
  }, [stations, selectedStationId]);

  // Window hours mapping
  const windowHours = useMemo(() => {
    switch (selectedTimeWindow) {
      case '1H': return 1;
      case '6H': return 6;
      case '24H': return 24;
      case '7D': return 168;
      case '30D': return 720;
      default: return 24;
    }
  }, [selectedTimeWindow]);

  // Time-series samples for current station & window
  const [timeSeriesSamples, setTimeSeriesSamples] = useState(() =>
    generateStationTimeSeries(currentStation, 24)
  );

  // Regenerate time series when station or time window changes
  useEffect(() => {
    setTimeSeriesSamples(generateStationTimeSeries(currentStation, windowHours));
  }, [currentStation.id, windowHours]);

  // Real-time live streaming simulated tick
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(() => {
      setStations(prevStations =>
        prevStations.map(st => {
          // Add subtle microscopic noise to sensor readings
          const noise = (Math.random() - 0.49) * 0.4;
          const pmNoise = (Math.random() - 0.48) * 0.2;
          const co2Noise = (Math.random() - 0.5) * 1.0;

          const newPm25 = Math.max(0.4, Number((st.metrics.pm25.value + pmNoise).toFixed(1)));
          const newPm10 = Math.max(1.0, Number((st.metrics.pm10.value + pmNoise * 1.5).toFixed(1)));
          const newCo2 = Math.max(380, Number((st.metrics.co2.value + co2Noise).toFixed(1)));
          const newO3 = Math.max(5, Number((st.metrics.o3.value + noise * 0.5).toFixed(1)));
          const newVoc = Math.max(4, Math.round(st.metrics.vocIndex.value + noise));

          return {
            ...st,
            lastSyncTimestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
            metrics: {
              ...st.metrics,
              pm25: { ...st.metrics.pm25, value: newPm25 },
              pm10: { ...st.metrics.pm10, value: newPm10 },
              co2: { ...st.metrics.co2, value: newCo2 },
              o3: { ...st.metrics.o3, value: newO3 },
              vocIndex: { ...st.metrics.vocIndex, value: newVoc },
            },
          };
        })
      );
    }, 2800);

    return () => clearInterval(interval);
  }, [isLiveStreaming]);

  // Calibration update handler
  const handleUpdateCalibration = (sensorId: string, zeroOffset: number, spanFactor: number) => {
    setStations(prev =>
      prev.map(st => {
        if (st.id !== currentStation.id) return st;
        return {
          ...st,
          hardwarePayload: st.hardwarePayload.map(s => {
            if (s.id !== sensorId) return s;
            return {
              ...s,
              zeroOffset,
              spanFactor,
              lastZeroCalibration: new Date().toISOString().substring(0, 10),
            };
          }),
        };
      })
    );
  };

  // Alert actions
  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts(prev =>
      prev.map(a => (a.id === alertId ? { ...a, acknowledged: true } : a))
    );
  };

  const handleResolveAlert = (alertId: string) => {
    setAlerts(prev =>
      prev.map(a => (a.id === alertId ? { ...a, resolved: true, acknowledged: true } : a))
    );
  };

  const handleAddRule = (rule: ThresholdRule) => {
    setAlertRules(prev => [rule, ...prev]);
  };

  const handleDeleteRule = (ruleId: string) => {
    setAlertRules(prev => prev.filter(r => r.id !== ruleId));
  };

  const handleSimulateExceedance = (rule: ThresholdRule) => {
    const newAlert: AlertNotification = {
      id: `alt-${Date.now()}`,
      stationId: currentStation.id,
      stationName: currentStation.name,
      severity: rule.severity,
      metric: rule.metric,
      metricLabel: rule.label,
      value: Number((rule.threshold * 1.25).toFixed(1)),
      threshold: rule.threshold,
      unit: rule.unit,
      timestamp: 'Just now (Telemetry Trip)',
      acknowledged: false,
      resolved: false,
      recommendedAction: `Automatic exceedance guard tripped. Verify local exhaust flow and inspect ${rule.metric.toUpperCase()} sensor calibration.`,
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  // Environmental Scenario Simulator
  const handleApplyScenario = (scenario: 'wildfire' | 'inversion' | 'dust' | 'ozone' | 'reset') => {
    setStations(prev =>
      prev.map(st => {
        if (st.id !== currentStation.id && scenario !== 'reset') return st;

        if (scenario === 'wildfire') {
          return {
            ...st,
            aqi: 165,
            state: 'alert',
            dominantPollutant: 'Wildfire Organic Carbon & Black Carbon PM2.5',
            metrics: {
              ...st.metrics,
              pm25: { ...st.metrics.pm25, value: 118.4, delta: +82.0 },
              pm10: { ...st.metrics.pm10, value: 142.8, delta: +94.0 },
              co: { ...st.metrics.co, value: 2.8, delta: +1.8 },
              vocIndex: { ...st.metrics.vocIndex, value: 240, delta: +160 },
            },
          };
        } else if (scenario === 'inversion') {
          return {
            ...st,
            aqi: 88,
            state: 'elevated',
            dominantPollutant: 'Trapped Combustion NO2 & Secondary Aerosols',
            metrics: {
              ...st.metrics,
              no2: { ...st.metrics.no2, value: 54.2, delta: +28.0 },
              vocIndex: { ...st.metrics.vocIndex, value: 210, delta: +120 },
              pm25: { ...st.metrics.pm25, value: 34.6, delta: +18.0 },
            },
          };
        } else if (scenario === 'dust') {
          return {
            ...st,
            aqi: 95,
            state: 'elevated',
            dominantPollutant: 'Long-Range Mineral Crustal Dust (Coarse PM10)',
            metrics: {
              ...st.metrics,
              pm10: { ...st.metrics.pm10, value: 186.0, delta: +140.0 },
              pm25: { ...st.metrics.pm25, value: 32.0, delta: +18.0 },
              solarRadiation: { ...st.metrics.solarRadiation, value: 210, delta: -220 },
            },
          };
        } else if (scenario === 'ozone') {
          return {
            ...st,
            aqi: 210,
            state: 'alert',
            dominantPollutant: 'Stratospheric Tropopause Ozone Folding Event',
            metrics: {
              ...st.metrics,
              o3: { ...st.metrics.o3, value: 72.8, delta: +36.0 },
            },
          };
        } else {
          // Reset to initial baseline
          const initialMatch = INITIAL_STATIONS.find(i => i.id === st.id) || st;
          return { ...initialMatch };
        }
      })
    );

    // Also inject an alert if hazardous scenario
    if (scenario === 'wildfire') {
      const alert: AlertNotification = {
        id: `alt-wf-${Date.now()}`,
        stationId: currentStation.id,
        stationName: currentStation.name,
        severity: 'unhealthy',
        metric: 'pm25',
        metricLabel: 'Wildfire Aerosol Influx (PM2.5)',
        value: 118.4,
        threshold: 35.0,
        unit: 'µg/m³',
        timestamp: 'Just now (Macro Dispersion)',
        acknowledged: false,
        resolved: false,
        recommendedAction: 'Wildfire plume confirmed by satellite lidar. Advise sensitive populace to shelter indoors and engage HEPA scrubbers.',
      };
      setAlerts(prev => [alert, ...prev]);
    }
  };

  const unacknowledgedAlertsCount = alerts.filter(a => !a.acknowledged).length;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-[#dfe2f1] flex flex-col font-sans selection:bg-[#06b6d4]/30 selection:text-[#4cd7f6]">
      
      {/* Top Bar Contract (Single Brand Wordmark, 5 Single-Line Nav Links, 1 Primary Action) */}
      <Header
        activeScreen={activeScreen}
        onNavigate={setActiveScreen}
        isLiveStreaming={isLiveStreaming}
        onToggleLiveStream={() => setIsLiveStreaming(v => !v)}
        onOpenSimulateModal={() => setIsSimulateModalOpen(true)}
        unacknowledgedAlertsCount={unacknowledgedAlertsCount}
      />

      {/* Main Workspace Stage */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 lg:px-8 py-5 space-y-5">
        
        {/* Horizontal Station Switcher & Hardware State Bar */}
        <StationOverview
          stations={stations}
          selectedStation={currentStation}
          onSelectStation={setSelectedStationId}
        />

        {/* SCREEN 1: Live Telemetry Grid & Operations Center */}
        {activeScreen === 'telemetry' && (
          <div className="space-y-5">
            
            {/* Top Row: Composite AQI Dial + Key Particulate & Chemical Gas Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
              
              {/* Dial Column (4 cols on desktop) */}
              <div className="lg:col-span-4 h-full">
                <AqiDial
                  aqi={currentStation.aqi}
                  dominantPollutant={currentStation.dominantPollutant}
                />
              </div>

              {/* 8 Telemetry Cards (8 cols on desktop - 4x2 grid) */}
              <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <MetricCard
                  id="pm25"
                  shortCode="PM2.5"
                  name="Fine Aerosols"
                  reading={currentStation.metrics.pm25}
                  accentColor="#06b6d4"
                  isSelected={selectedMetricKey === 'pm25'}
                  onSelect={() => setSelectedMetricKey('pm25')}
                />
                <MetricCard
                  id="pm10"
                  shortCode="PM10"
                  name="Coarse Dust"
                  reading={currentStation.metrics.pm10}
                  accentColor="#14b8a6"
                  isSelected={selectedMetricKey === 'pm10'}
                  onSelect={() => setSelectedMetricKey('pm10')}
                />
                <MetricCard
                  id="pm1"
                  shortCode="PM1.0"
                  name="Sub-Micron"
                  reading={currentStation.metrics.pm1}
                  accentColor="#38bdf8"
                  isSelected={false}
                />
                <MetricCard
                  id="co2"
                  shortCode="CO2"
                  name="Carbon Dioxide"
                  reading={currentStation.metrics.co2}
                  accentColor="#38bdf8"
                  isSelected={selectedMetricKey === 'co2'}
                  onSelect={() => setSelectedMetricKey('co2')}
                />
                <MetricCard
                  id="o3"
                  shortCode="O3"
                  name="Tropospheric Ozone"
                  reading={currentStation.metrics.o3}
                  accentColor="#8b5cf6"
                  isSelected={selectedMetricKey === 'o3'}
                  onSelect={() => setSelectedMetricKey('o3')}
                />
                <MetricCard
                  id="no2"
                  shortCode="NO2"
                  name="Nitrogen Dioxide"
                  reading={currentStation.metrics.no2}
                  accentColor="#f59e0b"
                  isSelected={selectedMetricKey === 'no2'}
                  onSelect={() => setSelectedMetricKey('no2')}
                />
                <MetricCard
                  id="vocIndex"
                  shortCode="VOC"
                  name="Volatile Organics"
                  reading={currentStation.metrics.vocIndex}
                  accentColor="#ec4899"
                  isSelected={selectedMetricKey === 'vocIndex'}
                  onSelect={() => setSelectedMetricKey('vocIndex')}
                />
                <MetricCard
                  id="co"
                  shortCode="CO"
                  name="Carbon Monoxide"
                  reading={currentStation.metrics.co}
                  accentColor="#64748b"
                  isSelected={false}
                />
              </div>
            </div>

            {/* Time-Series Dynamic Visualization Component */}
            <TimeSeriesChart
              data={timeSeriesSamples}
              selectedChannel={selectedMetricKey}
              onSelectChannel={setSelectedMetricKey}
              selectedWindow={selectedTimeWindow}
              onSelectWindow={setSelectedTimeWindow}
            />

            {/* Meteorological Ambient Station Strip */}
            <div className="glass-panel-l1 rounded-lg p-4">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-[rgba(148,163,184,0.1)]">
                <span className="text-[10px] font-mono uppercase text-[#64748b] tracking-wider">
                  Coupled Meteorological & Micro-Climate Vector Matrix
                </span>
                <span className="text-[11px] font-mono text-[#94a3b8]">
                  Surface Boundary Layer Physics
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-mono">
                <div className="bg-[#111827]/70 p-3 rounded border border-[rgba(148,163,184,0.08)] flex items-center gap-3">
                  <Thermometer className="w-4 h-4 text-[#f97316]" />
                  <div>
                    <span className="text-[10px] text-[#64748b] uppercase block">Ambient Temp</span>
                    <span className="text-base font-bold text-[#f8fafc] tabular-nums">
                      {currentStation.metrics.temperature.value}°C
                    </span>
                  </div>
                </div>

                <div className="bg-[#111827]/70 p-3 rounded border border-[rgba(148,163,184,0.08)] flex items-center gap-3">
                  <Droplets className="w-4 h-4 text-[#06b6d4]" />
                  <div>
                    <span className="text-[10px] text-[#64748b] uppercase block">Rel Humidity</span>
                    <span className="text-base font-bold text-[#f8fafc] tabular-nums">
                      {currentStation.metrics.relativeHumidity.value}%
                    </span>
                  </div>
                </div>

                <div className="bg-[#111827]/70 p-3 rounded border border-[rgba(148,163,184,0.08)] flex items-center gap-3">
                  <Gauge className="w-4 h-4 text-[#38bdf8]" />
                  <div>
                    <span className="text-[10px] text-[#64748b] uppercase block">Baro Pressure</span>
                    <span className="text-base font-bold text-[#f8fafc] tabular-nums">
                      {currentStation.metrics.barometricPressure.value} hPa
                    </span>
                  </div>
                </div>

                <div className="bg-[#111827]/70 p-3 rounded border border-[rgba(148,163,184,0.08)] flex items-center gap-3">
                  <Droplets className="w-4 h-4 text-[#8b5cf6]" />
                  <div>
                    <span className="text-[10px] text-[#64748b] uppercase block">Dew Point</span>
                    <span className="text-base font-bold text-[#f8fafc] tabular-nums">
                      {currentStation.metrics.dewPoint.value}°C
                    </span>
                  </div>
                </div>

                <div className="bg-[#111827]/70 p-3 rounded border border-[rgba(148,163,184,0.08)] flex items-center gap-3">
                  <Wind className="w-4 h-4 text-[#14b8a6]" />
                  <div>
                    <span className="text-[10px] text-[#64748b] uppercase block">Wind Vector</span>
                    <span className="text-base font-bold text-[#f8fafc] tabular-nums">
                      {currentStation.metrics.windSpeed.value} m/s ({currentStation.metrics.windDirectionDeg}°)
                    </span>
                  </div>
                </div>

                <div className="bg-[#111827]/70 p-3 rounded border border-[rgba(148,163,184,0.08)] flex items-center gap-3">
                  <Compass className="w-4 h-4 text-[#f59e0b]" />
                  <div>
                    <span className="text-[10px] text-[#64748b] uppercase block">Solar Flux</span>
                    <span className="text-base font-bold text-[#f8fafc] tabular-nums">
                      {currentStation.metrics.solarRadiation.value} W/m²
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* SCREEN 2: Geospatial Radar & Atmospheric Dispersion Map */}
        {activeScreen === 'geospatial' && (
          <GeospatialRadar
            stations={stations}
            selectedStation={currentStation}
            onSelectStation={setSelectedStationId}
          />
        )}

        {/* SCREEN 3: Station Diagnostics & Sensor Calibration */}
        {activeScreen === 'diagnostics' && (
          <StationDiagnostics
            station={currentStation}
            onUpdateSensorCalibration={handleUpdateCalibration}
          />
        )}

        {/* SCREEN 4: Regulatory Standards & Alert Policy Engine */}
        {activeScreen === 'regulatory' && (
          <RegulatoryStandards
            station={currentStation}
            standards={REGULATORY_STANDARDS}
            alerts={alerts}
            alertRules={alertRules}
            onAcknowledgeAlert={handleAcknowledgeAlert}
            onResolveAlert={handleResolveAlert}
            onAddRule={handleAddRule}
            onDeleteRule={handleDeleteRule}
            onSimulateExceedance={handleSimulateExceedance}
          />
        )}

        {/* SCREEN 5: Historical Data Laboratory & Query Export */}
        {activeScreen === 'data-lab' && (
          <DataLaboratory
            stations={stations}
            selectedStation={currentStation}
            samples={timeSeriesSamples}
            onSwitchToPython={() => setActiveScreen('python-analytics')}
          />
        )}

        {/* SCREEN 6: Dedicated Python Analytics Engine (Pandas & NumPy) */}
        {activeScreen === 'python-analytics' && (
          <PythonAnalyticsView
            currentStation={currentStation}
            samples={timeSeriesSamples}
          />
        )}

      </main>

      {/* Atmospheric Scenario Simulation Modal */}
      <SimulateEventModal
        isOpen={isSimulateModalOpen}
        onClose={() => setIsSimulateModalOpen(false)}
        onApplyScenario={handleApplyScenario}
      />

      {/* Global Footer (Quiet Scientific Attribution) */}
      <footer className="w-full border-t border-[rgba(148,163,184,0.1)] py-4 px-4 lg:px-8 mt-auto bg-[#0b0f19] text-xs font-mono text-[#64748b]">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span>PulseCheck Environmental Intelligence</span>
            <span>·</span>
            <span>WMO / GAW Global Atmosphere Watch Reference Platform</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>ISO 17025 Calibration Certified</span>
            <span>·</span>
            <span>UTC Clock Synchronized</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
