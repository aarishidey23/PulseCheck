/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AqiCategory = 'good' | 'moderate' | 'unhealthy-sensitive' | 'unhealthy' | 'hazardous';

export type StationOperationalState = 'nominal' | 'elevated' | 'maintenance' | 'alert';

export interface SensorReading {
  value: number;
  unit: string;
  delta: number; // change in last hour
  historicalAvg: number;
  min24h: number;
  max24h: number;
  status: 'nominal' | 'caution' | 'alert';
}

export interface HardwareSensor {
  id: string;
  name: string;
  technology: string; // e.g. "Optical Particle Counter (OPC)", "NDIR Dual Wavelength", "Photoionization (PID)"
  serialNumber: string;
  status: 'nominal' | 'calibrating' | 'drift-detected' | 'service-due';
  healthPercent: number;
  snrDb: number;
  zeroOffset: number;
  spanFactor: number;
  runtimeHours: number;
  lastZeroCalibration: string;
  wavelengthOrPotential?: string;
}

export interface CalibrationAxis {
  axis: string;
  baseline: number; // 0 - 100 benchmark
  current: number;  // 0 - 100 field metric
  unit: string;
}

export interface StationTelemetry {
  id: string;
  code: string;
  name: string;
  locationName: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  elevationMeters: number;
  state: StationOperationalState;
  aqi: number;
  dominantPollutant: string;
  lastSyncTimestamp: string;
  batteryPercent: number;
  solarInputWatts: number;
  uptimePercent: number;
  signalStrengthDbm: number;
  firmwareVersion: string;
  
  // Metrics
  metrics: {
    pm25: SensorReading;
    pm10: SensorReading;
    pm1: SensorReading;
    co2: SensorReading;
    no2: SensorReading;
    o3: SensorReading;
    so2: SensorReading;
    co: SensorReading;
    vocIndex: SensorReading;
    temperature: SensorReading;
    relativeHumidity: SensorReading;
    barometricPressure: SensorReading;
    dewPoint: SensorReading;
    windSpeed: SensorReading;
    windDirectionDeg: number;
    solarRadiation: SensorReading;
  };

  hardwarePayload: HardwareSensor[];
  calibrationAxes: CalibrationAxis[];
}

export interface TimeSeriesSample {
  timestamp: number;
  isoTime: string;
  timeLabel: string;
  pm25: number;
  pm10: number;
  pm1: number;
  co2: number;
  o3: number;
  no2: number;
  vocIndex: number;
  temperature: number;
  humidity: number;
  pressure: number;
}

export interface AlertNotification {
  id: string;
  stationId: string;
  stationName: string;
  severity: 'nominal' | 'caution' | 'unhealthy' | 'hazardous';
  metric: string;
  metricLabel: string;
  value: number;
  threshold: number;
  unit: string;
  timestamp: string;
  acknowledged: boolean;
  resolved: boolean;
  recommendedAction: string;
}

export interface ThresholdRule {
  id: string;
  metric: keyof StationTelemetry['metrics'];
  label: string;
  operator: '>' | '<';
  threshold: number;
  unit: string;
  durationMinutes: number;
  severity: 'caution' | 'unhealthy' | 'hazardous';
  enabled: boolean;
  stationScope: 'all' | string;
}

export interface RegulatoryStandard {
  pollutant: string;
  averagingPeriod: string;
  epaStandard: number;
  whoGuideline: number;
  unit: string;
  category: 'Particulates' | 'Combustion Gases' | 'Photochemical Oxidants';
  healthImpact: string;
}
