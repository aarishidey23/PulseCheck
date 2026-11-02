/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Flame, CloudFog, Wind, Sun, RotateCcw, X, ShieldAlert } from 'lucide-react';

interface SimulateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyScenario: (scenario: 'wildfire' | 'inversion' | 'dust' | 'ozone' | 'reset') => void;
}

export const SimulateEventModal: React.FC<SimulateEventModalProps> = ({
  isOpen,
  onClose,
  onApplyScenario,
}) => {
  if (!isOpen) return null;

  const scenarios = [
    {
      id: 'wildfire' as const,
      name: 'Wildfire Smoke Plume Advection',
      description: 'Massive organic carbon & black carbon aerosol flux. PM2.5 spikes to 118 µg/m³; CO reaches 2.8 ppm; AQI enters Unhealthy vector.',
      icon: Flame,
      color: '#f43f5e',
      badge: 'Unhealthy (AQI 165)',
    },
    {
      id: 'inversion' as const,
      name: 'Thermal Boundary Layer Inversion',
      description: 'Stagnant nocturnal cold layer traps low-level combustion emissions. NO2 surges to 54 ppb; VOC index spikes to 210 pts.',
      icon: CloudFog,
      color: '#f59e0b',
      badge: 'Caution (AQI 88)',
    },
    {
      id: 'dust' as const,
      name: 'Mineral Dust Storm Transport',
      description: 'Long-range trans-continental crustal dust transport. Coarse PM10 surges to 186 µg/m³; solar irradiance attenuated.',
      icon: Wind,
      color: '#eab308',
      badge: 'Elevated (AQI 95)',
    },
    {
      id: 'ozone' as const,
      name: 'Stratospheric Ozone Tropopause Folding',
      description: 'Upper-tropospheric intrusion of stratospheric dry air. O3 levels spike to 72 ppb with extreme oxidative potential.',
      icon: Sun,
      color: '#a855f7',
      badge: 'Hazardous (AQI 210)',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="glass-overlay-l3 rounded-xl max-w-xl w-full p-6 space-y-5 border border-[rgba(6,182,212,0.4)] shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#1e293b] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[rgba(6,182,212,0.15)] border border-[#06b6d4]/40 flex items-center justify-center text-[#4cd7f6]">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-[#64748b] tracking-wider">
              Atmospheric Dynamic Simulation Engine
            </span>
            <h3 className="text-lg font-bold font-display text-[#f8fafc]">
              Inject Macro-Climate Dispersion Event
            </h3>
          </div>
        </div>

        <p className="text-xs text-[#94a3b8] font-mono leading-relaxed">
          Select an environmental dispersion scenario to inject realistic multi-parameter perturbations into the live sensor stream, update radar dispersion maps, and trigger the regulatory alert matrix.
        </p>

        {/* Scenarios Grid */}
        <div className="space-y-2.5">
          {scenarios.map(sc => {
            const Icon = sc.icon;
            return (
              <button
                key={sc.id}
                onClick={() => {
                  onApplyScenario(sc.id);
                  onClose();
                }}
                className="w-full text-left p-3.5 rounded-lg glass-panel-l1 hover:glass-panel-l2 hover:border-[rgba(6,182,212,0.4)] transition-all cursor-pointer group flex items-start gap-3.5"
              >
                <div
                  className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border"
                  style={{
                    backgroundColor: `${sc.color}18`,
                    color: sc.color,
                    borderColor: `${sc.color}40`,
                  }}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold font-display text-[#f8fafc] group-hover:text-[#4cd7f6] transition-colors">
                      {sc.name}
                    </span>
                    <span
                      className="text-[10px] font-mono px-2 py-0.2 rounded font-semibold border"
                      style={{
                        backgroundColor: `${sc.color}15`,
                        color: sc.color,
                        borderColor: `${sc.color}40`,
                      }}
                    >
                      {sc.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#94a3b8] font-mono leading-normal">
                    {sc.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Reset Action */}
        <div className="pt-3 border-t border-[rgba(148,163,184,0.12)] flex items-center justify-between">
          <button
            onClick={() => {
              onApplyScenario('reset');
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#1e293b] border border-[rgba(148,163,184,0.15)] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Pristine Baseline</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-mono text-[#94a3b8] hover:text-[#f8fafc] cursor-pointer"
          >
            Dismiss
          </button>
        </div>

      </div>
    </div>
  );
};
