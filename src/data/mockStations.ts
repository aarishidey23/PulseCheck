/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StationTelemetry, TimeSeriesSample, AlertNotification, ThresholdRule, RegulatoryStandard } from '../types/telemetry';

export const INITIAL_STATIONS: StationTelemetry[] = [
  {
    id: 'station-alpha',
    code: 'ST-01-ZRH',
    name: 'Zurich Biosphere Station Alpha',
    locationName: 'Albispass Ridge, Zurich',
    country: 'Switzerland',
    coordinates: { lat: 47.3769, lng: 8.5417 },
    elevationMeters: 792,
    state: 'nominal',
    aqi: 32,
    dominantPollutant: 'PM2.5 (Fine Particulates)',
    lastSyncTimestamp: '2026-11-02 15:18:22 UTC',
    batteryPercent: 98.4,
    solarInputWatts: 46.2,
    uptimePercent: 99.98,
    signalStrengthDbm: -62,
    firmwareVersion: 'v4.18.2-rtos',
    metrics: {
      pm25: { value: 7.8, unit: 'µg/m³', delta: -0.6, historicalAvg: 8.4, min24h: 5.2, max24h: 12.1, status: 'nominal' },
      pm10: { value: 14.2, unit: 'µg/m³', delta: +1.1, historicalAvg: 15.0, min24h: 9.4, max24h: 22.8, status: 'nominal' },
      pm1: { value: 3.4, unit: 'µg/m³', delta: -0.2, historicalAvg: 3.9, min24h: 2.1, max24h: 5.6, status: 'nominal' },
      co2: { value: 418.5, unit: 'ppm', delta: +2.1, historicalAvg: 416.0, min24h: 412.3, max24h: 424.9, status: 'nominal' },
      no2: { value: 12.4, unit: 'ppb', delta: -1.8, historicalAvg: 16.2, min24h: 8.1, max24h: 24.3, status: 'nominal' },
      o3: { value: 29.8, unit: 'ppb', delta: +3.2, historicalAvg: 27.5, min24h: 18.4, max24h: 41.2, status: 'nominal' },
      so2: { value: 1.2, unit: 'ppb', delta: 0.0, historicalAvg: 1.4, min24h: 0.8, max24h: 2.1, status: 'nominal' },
      co: { value: 0.38, unit: 'ppm', delta: -0.02, historicalAvg: 0.42, min24h: 0.28, max24h: 0.55, status: 'nominal' },
      vocIndex: { value: 38, unit: 'pts', delta: -5, historicalAvg: 45, min24h: 22, max24h: 68, status: 'nominal' },
      temperature: { value: 18.6, unit: '°C', delta: +0.8, historicalAvg: 17.2, min24h: 11.4, max24h: 21.0, status: 'nominal' },
      relativeHumidity: { value: 52.4, unit: '%', delta: -2.6, historicalAvg: 58.0, min24h: 44.0, max24h: 74.0, status: 'nominal' },
      barometricPressure: { value: 928.4, unit: 'hPa', delta: +0.4, historicalAvg: 927.8, min24h: 925.1, max24h: 930.2, status: 'nominal' },
      dewPoint: { value: 8.6, unit: '°C', delta: -0.4, historicalAvg: 9.1, min24h: 6.2, max24h: 11.0, status: 'nominal' },
      windSpeed: { value: 3.2, unit: 'm/s', delta: +0.6, historicalAvg: 2.8, min24h: 0.5, max24h: 6.8, status: 'nominal' },
      windDirectionDeg: 245,
      solarRadiation: { value: 482, unit: 'W/m²', delta: +34, historicalAvg: 410, min24h: 0, max24h: 820, status: 'nominal' }
    },
    hardwarePayload: [
      {
        id: 'opc-01',
        name: 'Optical Particle Counter (OPC-N3)',
        technology: 'Dual-Wavelength Mie Scattering Laser (658nm & 405nm)',
        serialNumber: 'ALB-OPC-8921-X',
        status: 'nominal',
        healthPercent: 96.2,
        snrDb: 44.8,
        zeroOffset: 0.04,
        spanFactor: 1.002,
        runtimeHours: 4120,
        lastZeroCalibration: '2026-10-18',
        wavelengthOrPotential: '658 nm / 405 nm'
      },
      {
        id: 'ndir-01',
        name: 'NDIR Dual-Beam CO2 Chamber',
        technology: 'Hermetic Gold-Plated Optical Cavity 4.26µm',
        serialNumber: 'ALB-NDR-3104-C',
        status: 'nominal',
        healthPercent: 98.0,
        snrDb: 52.1,
        zeroOffset: -0.12,
        spanFactor: 0.998,
        runtimeHours: 8740,
        lastZeroCalibration: '2026-10-24',
        wavelengthOrPotential: '4.26 µm reference'
      },
      {
        id: 'pid-01',
        name: 'Photoionization VOC Detector',
        technology: '10.6 eV Krypton Ultraviolet Discharge Ionization',
        serialNumber: 'ALB-PID-5519-V',
        status: 'nominal',
        healthPercent: 91.5,
        snrDb: 39.4,
        zeroOffset: 0.18,
        spanFactor: 1.014,
        runtimeHours: 2310,
        lastZeroCalibration: '2026-09-30',
        wavelengthOrPotential: '10.6 eV UV'
      },
      {
        id: 'ec-01',
        name: 'Micro-Electrochemical Array (NO2/O3)',
        technology: '4-Electrode Solid Polymer Electrolytic Potentiometric',
        serialNumber: 'ALB-ECA-1049-N',
        status: 'nominal',
        healthPercent: 94.0,
        snrDb: 46.2,
        zeroOffset: 0.02,
        spanFactor: 1.001,
        runtimeHours: 5400,
        lastZeroCalibration: '2026-10-12',
        wavelengthOrPotential: '+240 mV bias'
      }
    ],
    calibrationAxes: [
      { axis: 'Linearity', baseline: 98, current: 97, unit: '%' },
      { axis: 'Thermal Stability', baseline: 96, current: 95, unit: '%' },
      { axis: 'Response Time (t90)', baseline: 94, current: 92, unit: '%' },
      { axis: 'Signal-to-Noise', baseline: 95, current: 94, unit: 'dB' },
      { axis: 'Zero Drift Resistance', baseline: 99, current: 96, unit: '%' },
      { axis: 'Span Accuracy', baseline: 97, current: 96, unit: '%' }
    ]
  },
  {
    id: 'station-beta',
    code: 'ST-02-MLO',
    name: 'Mauna Loa Baseline Observatory',
    locationName: 'Mauna Loa Summit, Hawaii',
    country: 'United States',
    coordinates: { lat: 19.5362, lng: -155.5763 },
    elevationMeters: 3397,
    state: 'nominal',
    aqi: 14,
    dominantPollutant: 'Stratospheric Background Ozone',
    lastSyncTimestamp: '2026-11-02 15:18:19 UTC',
    batteryPercent: 99.8,
    solarInputWatts: 88.4,
    uptimePercent: 99.99,
    signalStrengthDbm: -54,
    firmwareVersion: 'v4.18.2-rtos',
    metrics: {
      pm25: { value: 1.4, unit: 'µg/m³', delta: -0.1, historicalAvg: 1.8, min24h: 0.8, max24h: 3.2, status: 'nominal' },
      pm10: { value: 2.8, unit: 'µg/m³', delta: +0.2, historicalAvg: 3.1, min24h: 1.4, max24h: 4.8, status: 'nominal' },
      pm1: { value: 0.6, unit: 'µg/m³', delta: 0.0, historicalAvg: 0.7, min24h: 0.3, max24h: 1.1, status: 'nominal' },
      co2: { value: 422.3, unit: 'ppm', delta: +0.3, historicalAvg: 422.1, min24h: 421.8, max24h: 422.7, status: 'nominal' },
      no2: { value: 0.8, unit: 'ppb', delta: 0.0, historicalAvg: 0.9, min24h: 0.4, max24h: 1.5, status: 'nominal' },
      o3: { value: 34.2, unit: 'ppb', delta: +1.4, historicalAvg: 33.0, min24h: 28.1, max24h: 38.9, status: 'nominal' },
      so2: { value: 0.4, unit: 'ppb', delta: -0.1, historicalAvg: 0.5, min24h: 0.2, max24h: 0.9, status: 'nominal' },
      co: { value: 0.08, unit: 'ppm', delta: 0.0, historicalAvg: 0.09, min24h: 0.06, max24h: 0.12, status: 'nominal' },
      vocIndex: { value: 8, unit: 'pts', delta: -1, historicalAvg: 9, min24h: 4, max24h: 14, status: 'nominal' },
      temperature: { value: 6.4, unit: '°C', delta: +0.4, historicalAvg: 5.8, min24h: 1.2, max24h: 9.8, status: 'nominal' },
      relativeHumidity: { value: 18.2, unit: '%', delta: -1.2, historicalAvg: 22.0, min24h: 12.0, max24h: 36.0, status: 'nominal' },
      barometricPressure: { value: 681.2, unit: 'hPa', delta: -0.2, historicalAvg: 681.5, min24h: 679.8, max24h: 683.0, status: 'nominal' },
      dewPoint: { value: -14.2, unit: '°C', delta: -0.8, historicalAvg: -12.4, min24h: -18.2, max24h: -8.0, status: 'nominal' },
      windSpeed: { value: 5.8, unit: 'm/s', delta: +1.2, historicalAvg: 4.9, min24h: 2.1, max24h: 9.4, status: 'nominal' },
      windDirectionDeg: 110,
      solarRadiation: { value: 940, unit: 'W/m²', delta: +42, historicalAvg: 880, min24h: 0, max24h: 1120, status: 'nominal' }
    },
    hardwarePayload: [
      {
        id: 'opc-02',
        name: 'Optical Particle Counter (Ultra-Clean Class)',
        technology: 'Aerosol Spectrometer (32 Channels 0.25 - 32 µm)',
        serialNumber: 'MLO-OPC-0014-P',
        status: 'nominal',
        healthPercent: 99.1,
        snrDb: 56.4,
        zeroOffset: 0.00,
        spanFactor: 1.000,
        runtimeHours: 9200,
        lastZeroCalibration: '2026-10-30',
        wavelengthOrPotential: '532 nm Diode-Pumped'
      },
      {
        id: 'ndir-02',
        name: 'High-Precision Cavity Ringdown Spectrometer',
        technology: 'CRDS Laser Absorption 1600nm High-Q Optical Resonator',
        serialNumber: 'MLO-CRDS-7740',
        status: 'nominal',
        healthPercent: 99.4,
        snrDb: 64.2,
        zeroOffset: 0.01,
        spanFactor: 1.000,
        runtimeHours: 14200,
        lastZeroCalibration: '2026-11-01',
        wavelengthOrPotential: '1.603 µm DFB'
      }
    ],
    calibrationAxes: [
      { axis: 'Linearity', baseline: 99, current: 99, unit: '%' },
      { axis: 'Thermal Stability', baseline: 98, current: 98, unit: '%' },
      { axis: 'Response Time (t90)', baseline: 96, current: 96, unit: '%' },
      { axis: 'Signal-to-Noise', baseline: 99, current: 98, unit: 'dB' },
      { axis: 'Zero Drift Resistance', baseline: 99, current: 99, unit: '%' },
      { axis: 'Span Accuracy', baseline: 99, current: 99, unit: '%' }
    ]
  },
  {
    id: 'station-gamma',
    code: 'ST-03-PAC',
    name: 'Pacific Marine Buoy #4',
    locationName: 'California Outer Continental Shelf',
    country: 'International Waters',
    coordinates: { lat: 34.0522, lng: -120.7401 },
    elevationMeters: 4,
    state: 'nominal',
    aqi: 44,
    dominantPollutant: 'Sea-Salt Aerosol Coarse PM10',
    lastSyncTimestamp: '2026-11-02 15:17:58 UTC',
    batteryPercent: 94.1,
    solarInputWatts: 62.1,
    uptimePercent: 99.82,
    signalStrengthDbm: -78,
    firmwareVersion: 'v4.18.2-rtos',
    metrics: {
      pm25: { value: 6.2, unit: 'µg/m³', delta: -0.4, historicalAvg: 7.1, min24h: 4.0, max24h: 9.8, status: 'nominal' },
      pm10: { value: 24.8, unit: 'µg/m³', delta: +2.8, historicalAvg: 21.4, min24h: 14.2, max24h: 32.5, status: 'nominal' },
      pm1: { value: 2.1, unit: 'µg/m³', delta: -0.1, historicalAvg: 2.4, min24h: 1.2, max24h: 3.4, status: 'nominal' },
      co2: { value: 416.2, unit: 'ppm', delta: -0.4, historicalAvg: 417.0, min24h: 414.2, max24h: 419.1, status: 'nominal' },
      no2: { value: 3.6, unit: 'ppb', delta: -0.3, historicalAvg: 4.2, min24h: 2.1, max24h: 7.4, status: 'nominal' },
      o3: { value: 38.6, unit: 'ppb', delta: +1.9, historicalAvg: 36.1, min24h: 26.4, max24h: 44.8, status: 'nominal' },
      so2: { value: 1.8, unit: 'ppb', delta: +0.2, historicalAvg: 1.6, min24h: 0.9, max24h: 3.2, status: 'nominal' },
      co: { value: 0.14, unit: 'ppm', delta: 0.0, historicalAvg: 0.16, min24h: 0.10, max24h: 0.22, status: 'nominal' },
      vocIndex: { value: 16, unit: 'pts', delta: +2, historicalAvg: 15, min24h: 8, max24h: 28, status: 'nominal' },
      temperature: { value: 15.2, unit: '°C', delta: +0.2, historicalAvg: 14.8, min24h: 13.6, max24h: 16.8, status: 'nominal' },
      relativeHumidity: { value: 86.4, unit: '%', delta: +3.4, historicalAvg: 82.0, min24h: 76.0, max24h: 94.0, status: 'nominal' },
      barometricPressure: { value: 1014.6, unit: 'hPa', delta: -0.8, historicalAvg: 1015.2, min24h: 1012.0, max24h: 1017.5, status: 'nominal' },
      dewPoint: { value: 12.9, unit: '°C', delta: +0.5, historicalAvg: 12.1, min24h: 10.4, max24h: 14.8, status: 'nominal' },
      windSpeed: { value: 7.4, unit: 'm/s', delta: +1.8, historicalAvg: 6.2, min24h: 3.4, max24h: 12.1, status: 'nominal' },
      windDirectionDeg: 310,
      solarRadiation: { value: 520, unit: 'W/m²', delta: -18, historicalAvg: 480, min24h: 0, max24h: 860, status: 'nominal' }
    },
    hardwarePayload: [
      {
        id: 'opc-03',
        name: 'Hydrophobic Dehumidified OPC Inlet',
        technology: 'Aerosol Heated Nafion Conditioning Tube + 660nm Laser',
        serialNumber: 'PAC-OPC-4402-M',
        status: 'nominal',
        healthPercent: 93.8,
        snrDb: 42.6,
        zeroOffset: 0.08,
        spanFactor: 1.008,
        runtimeHours: 6800,
        lastZeroCalibration: '2026-10-15',
        wavelengthOrPotential: '660 nm'
      }
    ],
    calibrationAxes: [
      { axis: 'Linearity', baseline: 97, current: 95, unit: '%' },
      { axis: 'Thermal Stability', baseline: 95, current: 93, unit: '%' },
      { axis: 'Response Time (t90)', baseline: 92, current: 90, unit: '%' },
      { axis: 'Signal-to-Noise', baseline: 94, current: 91, unit: 'dB' },
      { axis: 'Zero Drift Resistance', baseline: 96, current: 92, unit: '%' },
      { axis: 'Span Accuracy', baseline: 96, current: 94, unit: '%' }
    ]
  },
  {
    id: 'station-delta',
    code: 'ST-04-ATC',
    name: 'Atacama High-Altitude Array',
    locationName: 'Chajnantor Plateau, Antofagasta',
    country: 'Chile',
    coordinates: { lat: -23.8634, lng: -67.7552 },
    elevationMeters: 5050,
    state: 'nominal',
    aqi: 22,
    dominantPollutant: 'Mineral Crust Aerosols',
    lastSyncTimestamp: '2026-11-02 15:18:04 UTC',
    batteryPercent: 97.2,
    solarInputWatts: 96.0,
    uptimePercent: 99.95,
    signalStrengthDbm: -68,
    firmwareVersion: 'v4.18.2-rtos',
    metrics: {
      pm25: { value: 3.8, unit: 'µg/m³', delta: +0.4, historicalAvg: 3.5, min24h: 1.8, max24h: 7.2, status: 'nominal' },
      pm10: { value: 11.4, unit: 'µg/m³', delta: +1.6, historicalAvg: 9.8, min24h: 4.2, max24h: 19.8, status: 'nominal' },
      pm1: { value: 1.1, unit: 'µg/m³', delta: +0.1, historicalAvg: 1.0, min24h: 0.6, max24h: 2.2, status: 'nominal' },
      co2: { value: 417.8, unit: 'ppm', delta: +0.1, historicalAvg: 417.6, min24h: 417.2, max24h: 418.4, status: 'nominal' },
      no2: { value: 0.4, unit: 'ppb', delta: 0.0, historicalAvg: 0.5, min24h: 0.1, max24h: 0.9, status: 'nominal' },
      o3: { value: 46.2, unit: 'ppb', delta: +2.1, historicalAvg: 44.0, min24h: 36.8, max24h: 52.4, status: 'caution' },
      so2: { value: 0.6, unit: 'ppb', delta: 0.0, historicalAvg: 0.6, min24h: 0.2, max24h: 1.1, status: 'nominal' },
      co: { value: 0.06, unit: 'ppm', delta: 0.0, historicalAvg: 0.07, min24h: 0.04, max24h: 0.10, status: 'nominal' },
      vocIndex: { value: 6, unit: 'pts', delta: 0, historicalAvg: 7, min24h: 3, max24h: 12, status: 'nominal' },
      temperature: { value: 2.8, unit: '°C', delta: +1.1, historicalAvg: 1.4, min24h: -6.8, max24h: 7.4, status: 'nominal' },
      relativeHumidity: { value: 10.4, unit: '%', delta: -0.8, historicalAvg: 12.0, min24h: 6.0, max24h: 22.0, status: 'nominal' },
      barometricPressure: { value: 552.4, unit: 'hPa', delta: +0.1, historicalAvg: 552.8, min24h: 551.0, max24h: 554.2, status: 'nominal' },
      dewPoint: { value: -26.4, unit: '°C', delta: -1.2, historicalAvg: -24.8, min24h: -31.0, max24h: -18.2, status: 'nominal' },
      windSpeed: { value: 6.2, unit: 'm/s', delta: +0.8, historicalAvg: 5.4, min24h: 1.8, max24h: 11.2, status: 'nominal' },
      windDirectionDeg: 280,
      solarRadiation: { value: 1180, unit: 'W/m²', delta: +28, historicalAvg: 1120, min24h: 0, max24h: 1350, status: 'nominal' }
    },
    hardwarePayload: [
      {
        id: 'opc-04',
        name: 'High-Altitude Sealed Optical Counter',
        technology: 'Pressurized Optical Particle Chamber with Thermal Shroud',
        serialNumber: 'ATC-OPC-9002',
        status: 'nominal',
        healthPercent: 97.4,
        snrDb: 48.9,
        zeroOffset: 0.01,
        spanFactor: 1.001,
        runtimeHours: 7100,
        lastZeroCalibration: '2026-10-20',
        wavelengthOrPotential: '650 nm Laser'
      }
    ],
    calibrationAxes: [
      { axis: 'Linearity', baseline: 98, current: 97, unit: '%' },
      { axis: 'Thermal Stability', baseline: 97, current: 96, unit: '%' },
      { axis: 'Response Time (t90)', baseline: 95, current: 94, unit: '%' },
      { axis: 'Signal-to-Noise', baseline: 97, current: 96, unit: 'dB' },
      { axis: 'Zero Drift Resistance', baseline: 98, current: 97, unit: '%' },
      { axis: 'Span Accuracy', baseline: 97, current: 96, unit: '%' }
    ]
  },
  {
    id: 'station-epsilon',
    code: 'ST-05-TYO',
    name: 'Tokyo Bay Urban Micro-Station',
    locationName: 'Minato Waterfront, Tokyo',
    country: 'Japan',
    coordinates: { lat: 35.6762, lng: 139.6503 },
    elevationMeters: 28,
    state: 'elevated',
    aqi: 76,
    dominantPollutant: 'NO2 Combustion & Secondary PM2.5',
    lastSyncTimestamp: '2026-11-02 15:18:24 UTC',
    batteryPercent: 100.0,
    solarInputWatts: 34.0,
    uptimePercent: 99.92,
    signalStrengthDbm: -48,
    firmwareVersion: 'v4.18.2-rtos',
    metrics: {
      pm25: { value: 24.6, unit: 'µg/m³', delta: +3.8, historicalAvg: 18.2, min24h: 11.2, max24h: 38.4, status: 'caution' },
      pm10: { value: 44.2, unit: 'µg/m³', delta: +5.4, historicalAvg: 34.0, min24h: 22.0, max24h: 62.0, status: 'caution' },
      pm1: { value: 12.8, unit: 'µg/m³', delta: +2.1, historicalAvg: 8.9, min24h: 5.1, max24h: 19.4, status: 'caution' },
      co2: { value: 462.4, unit: 'ppm', delta: +8.4, historicalAvg: 448.0, min24h: 428.0, max24h: 512.0, status: 'caution' },
      no2: { value: 36.8, unit: 'ppb', delta: +6.2, historicalAvg: 28.4, min24h: 16.0, max24h: 54.0, status: 'caution' },
      o3: { value: 52.1, unit: 'ppb', delta: +4.8, historicalAvg: 41.0, min24h: 22.0, max24h: 68.0, status: 'caution' },
      so2: { value: 3.4, unit: 'ppb', delta: +0.4, historicalAvg: 2.8, min24h: 1.2, max24h: 5.8, status: 'nominal' },
      co: { value: 0.94, unit: 'ppm', delta: +0.12, historicalAvg: 0.72, min24h: 0.44, max24h: 1.48, status: 'nominal' },
      vocIndex: { value: 124, unit: 'pts', delta: +18, historicalAvg: 88, min24h: 42, max24h: 196, status: 'caution' },
      temperature: { value: 21.4, unit: '°C', delta: +1.2, historicalAvg: 19.8, min24h: 15.2, max24h: 23.8, status: 'nominal' },
      relativeHumidity: { value: 64.8, unit: '%', delta: -1.8, historicalAvg: 68.0, min24h: 54.0, max24h: 82.0, status: 'nominal' },
      barometricPressure: { value: 1011.8, unit: 'hPa', delta: -1.2, historicalAvg: 1013.0, min24h: 1009.2, max24h: 1015.4, status: 'nominal' },
      dewPoint: { value: 14.4, unit: '°C', delta: +0.6, historicalAvg: 13.8, min24h: 11.2, max24h: 16.2, status: 'nominal' },
      windSpeed: { value: 2.1, unit: 'm/s', delta: -0.4, historicalAvg: 2.6, min24h: 0.8, max24h: 4.8, status: 'nominal' },
      windDirectionDeg: 195,
      solarRadiation: { value: 380, unit: 'W/m²', delta: -22, historicalAvg: 420, min24h: 0, max24h: 760, status: 'nominal' }
    },
    hardwarePayload: [
      {
        id: 'opc-05',
        name: 'Optical Particle Counter (Dual Laser Micro)',
        technology: 'High-Concentration Optical Particle Profiler',
        serialNumber: 'TYO-OPC-6112-U',
        status: 'nominal',
        healthPercent: 88.6,
        snrDb: 38.2,
        zeroOffset: 0.22,
        spanFactor: 1.024,
        runtimeHours: 9840,
        lastZeroCalibration: '2026-09-22',
        wavelengthOrPotential: '655 nm Laser'
      },
      {
        id: 'ec-05',
        name: 'NO2/O3 Dual Electrochemical Cell',
        technology: 'Zero-Interference Catalytic Gas Sensor',
        serialNumber: 'TYO-EC-2091',
        status: 'drift-detected',
        healthPercent: 82.4,
        snrDb: 34.1,
        zeroOffset: 0.44,
        spanFactor: 1.042,
        runtimeHours: 8200,
        lastZeroCalibration: '2026-08-14',
        wavelengthOrPotential: '+300 mV Bias'
      }
    ],
    calibrationAxes: [
      { axis: 'Linearity', baseline: 98, current: 92, unit: '%' },
      { axis: 'Thermal Stability', baseline: 96, current: 89, unit: '%' },
      { axis: 'Response Time (t90)', baseline: 94, current: 88, unit: '%' },
      { axis: 'Signal-to-Noise', baseline: 95, current: 85, unit: 'dB' },
      { axis: 'Zero Drift Resistance', baseline: 98, current: 86, unit: '%' },
      { axis: 'Span Accuracy', baseline: 97, current: 91, unit: '%' }
    ]
  }
];

// Generate synthetic historical time series for given station & time window
export function generateStationTimeSeries(station: StationTelemetry, windowHours: number = 24): TimeSeriesSample[] {
  const pointsCount = windowHours <= 1 ? 60 : windowHours <= 6 ? 36 : windowHours <= 24 ? 48 : 60;
  const now = Date.now();
  const stepMs = (windowHours * 3600 * 1000) / pointsCount;
  const samples: TimeSeriesSample[] = [];

  const basePm25 = station.metrics.pm25.value;
  const basePm10 = station.metrics.pm10.value;
  const baseCo2 = station.metrics.co2.value;
  const baseO3 = station.metrics.o3.value;
  const baseVoc = station.metrics.vocIndex.value;
  const baseTemp = station.metrics.temperature.value;
  const baseHumidity = station.metrics.relativeHumidity.value;
  const basePressure = station.metrics.barometricPressure.value;

  for (let i = pointsCount; i >= 0; i--) {
    const t = now - i * stepMs;
    const date = new Date(t);
    const progress = 1 - i / pointsCount;

    // Harmonized diurnal cycle simulation
    const diurnal = Math.sin((date.getHours() - 6) * (Math.PI / 12));
    const noise = Math.sin(i * 1.7) * 0.4 + Math.cos(i * 0.9) * 0.3;

    const pm25Val = Math.max(0.5, Number((basePm25 + diurnal * (basePm25 * 0.25) + noise * (basePm25 * 0.15)).toFixed(1)));
    const pm10Val = Math.max(1.0, Number((basePm10 + diurnal * (basePm10 * 0.28) + noise * (basePm10 * 0.18)).toFixed(1)));
    const pm1Val = Math.max(0.2, Number((pm25Val * 0.44 + noise * 0.2).toFixed(1)));
    const co2Val = Math.max(380, Number((baseCo2 - diurnal * 12 + noise * 4).toFixed(1)));
    const o3Val = Math.max(5, Number((baseO3 + diurnal * 14 + noise * 3).toFixed(1)));
    const no2Val = Math.max(0.2, Number((station.metrics.no2.value - diurnal * 4 + noise * 2).toFixed(1)));
    const vocVal = Math.max(5, Math.round(baseVoc + diurnal * 10 + noise * 8));
    const tempVal = Number((baseTemp + diurnal * 3.5 + noise * 0.6).toFixed(1));
    const humVal = Math.min(99, Math.max(5, Number((baseHumidity - diurnal * 8 + noise * 2).toFixed(1))));
    const pressVal = Number((basePressure + Math.sin(progress * 4) * 1.2 + noise * 0.2).toFixed(1));

    let timeLabel = '';
    if (windowHours <= 1) {
      timeLabel = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } else if (windowHours <= 24) {
      timeLabel = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      timeLabel = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:00`;
    }

    samples.push({
      timestamp: t,
      isoTime: date.toISOString(),
      timeLabel,
      pm25: pm25Val,
      pm10: pm10Val,
      pm1: pm1Val,
      co2: co2Val,
      o3: o3Val,
      no2: no2Val,
      vocIndex: vocVal,
      temperature: tempVal,
      humidity: humVal,
      pressure: pressVal
    });
  }

  return samples;
}

export const INITIAL_ALERTS: AlertNotification[] = [
  {
    id: 'alt-001',
    stationId: 'station-epsilon',
    stationName: 'Tokyo Bay Urban Micro-Station',
    severity: 'caution',
    metric: 'pm25',
    metricLabel: 'Fine Particulates (PM2.5)',
    value: 24.6,
    threshold: 20.0,
    unit: 'µg/m³',
    timestamp: '14 mins ago (15:04 UTC)',
    acknowledged: false,
    resolved: false,
    recommendedAction: 'Verify nearby harbor diesel vessel arrivals and monitor micro-particle plume trajectory.'
  },
  {
    id: 'alt-002',
    stationId: 'station-epsilon',
    stationName: 'Tokyo Bay Urban Micro-Station',
    severity: 'caution',
    metric: 'vocIndex',
    metricLabel: 'Volatile Organic Compounds (VOC)',
    value: 124,
    threshold: 100,
    unit: 'pts',
    timestamp: '32 mins ago (14:46 UTC)',
    acknowledged: true,
    resolved: false,
    recommendedAction: 'Aromatic solvent evaporation event detected. Trigger PID automated self-calibration check.'
  },
  {
    id: 'alt-003',
    stationId: 'station-delta',
    stationName: 'Atacama High-Altitude Array',
    severity: 'caution',
    metric: 'o3',
    metricLabel: 'Tropospheric Ozone (O3)',
    value: 46.2,
    threshold: 45.0,
    unit: 'ppb',
    timestamp: '1 hour ago (14:12 UTC)',
    acknowledged: true,
    resolved: true,
    recommendedAction: 'Stratospheric intrusion downward flux observed during solar peak. Baseline normalized.'
  }
];

export const INITIAL_ALERT_RULES: ThresholdRule[] = [
  {
    id: 'rule-pm25-high',
    metric: 'pm25',
    label: 'PM2.5 Exceedance Threshold',
    operator: '>',
    threshold: 25.0,
    unit: 'µg/m³',
    durationMinutes: 15,
    severity: 'unhealthy',
    enabled: true,
    stationScope: 'all'
  },
  {
    id: 'rule-co2-indoor',
    metric: 'co2',
    label: 'CO2 Elevated Vector',
    operator: '>',
    threshold: 500.0,
    unit: 'ppm',
    durationMinutes: 30,
    severity: 'caution',
    enabled: true,
    stationScope: 'all'
  },
  {
    id: 'rule-o3-photochem',
    metric: 'o3',
    label: 'Ozone Peak Oxidation Warning',
    operator: '>',
    threshold: 50.0,
    unit: 'ppb',
    durationMinutes: 10,
    severity: 'caution',
    enabled: true,
    stationScope: 'all'
  },
  {
    id: 'rule-voc-spike',
    metric: 'vocIndex',
    label: 'VOC Hazardous Dispersion Alarm',
    operator: '>',
    threshold: 200,
    unit: 'pts',
    durationMinutes: 5,
    severity: 'hazardous',
    enabled: true,
    stationScope: 'all'
  }
];

export const REGULATORY_STANDARDS: RegulatoryStandard[] = [
  {
    pollutant: 'Fine Particulates (PM2.5)',
    averagingPeriod: '24-Hour Mean',
    epaStandard: 35.0,
    whoGuideline: 15.0,
    unit: 'µg/m³',
    category: 'Particulates',
    healthImpact: 'Deep pulmonary penetration, alveolar inflammation, systemic cardiovascular translocation.'
  },
  {
    pollutant: 'Coarse Particulates (PM10)',
    averagingPeriod: '24-Hour Mean',
    epaStandard: 150.0,
    whoGuideline: 45.0,
    unit: 'µg/m³',
    category: 'Particulates',
    healthImpact: 'Upper respiratory tract deposition, bronchial constriction, exacerbation of chronic obstructive disease.'
  },
  {
    pollutant: 'Tropospheric Ozone (O3)',
    averagingPeriod: '8-Hour Peak Daily',
    epaStandard: 70.0,
    whoGuideline: 50.0,
    unit: 'ppb',
    category: 'Photochemical Oxidants',
    healthImpact: 'Potent oxidative agent damaging cellular epithelial lining of lungs; reduces vital lung capacity.'
  },
  {
    pollutant: 'Nitrogen Dioxide (NO2)',
    averagingPeriod: '24-Hour Mean',
    epaStandard: 100.0,
    whoGuideline: 13.0,
    unit: 'ppb',
    category: 'Combustion Gases',
    healthImpact: 'Airway hyper-responsiveness, susceptibility to respiratory infection, precursor to nitrate aerosols.'
  },
  {
    pollutant: 'Sulfur Dioxide (SO2)',
    averagingPeriod: '24-Hour Mean',
    epaStandard: 75.0,
    whoGuideline: 15.0,
    unit: 'ppb',
    category: 'Combustion Gases',
    healthImpact: 'Bronchospasm in asthmatic individuals, formation of acid rain particulates, synergistic with PM2.5.'
  },
  {
    pollutant: 'Carbon Monoxide (CO)',
    averagingPeriod: '8-Hour Mean',
    epaStandard: 9.0,
    whoGuideline: 4.0,
    unit: 'ppm',
    category: 'Combustion Gases',
    healthImpact: 'Carboxyhemoglobin formation inhibiting tissue oxygenation, neurocognitive impairment.'
  }
];
