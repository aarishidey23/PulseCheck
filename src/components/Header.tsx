/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Activity, Radio, AlertTriangle } from 'lucide-react';

interface HeaderProps {
  activeScreen: 'telemetry' | 'geospatial' | 'diagnostics' | 'regulatory' | 'data-lab' | 'python-analytics';
  onNavigate: (screen: 'telemetry' | 'geospatial' | 'diagnostics' | 'regulatory' | 'data-lab' | 'python-analytics') => void;
  isLiveStreaming: boolean;
  onToggleLiveStream: () => void;
  onOpenSimulateModal: () => void;
  unacknowledgedAlertsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeScreen,
  onNavigate,
  isLiveStreaming,
  onToggleLiveStream,
  onOpenSimulateModal,
  unacknowledgedAlertsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[rgba(148,163,184,0.12)] bg-[#0b0f19]/90 backdrop-blur-md px-4 lg:px-8 py-3.5">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4 md:gap-8">
        
        {/* Zone 1: Single-element Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[rgba(6,182,212,0.15)] border border-[#06b6d4]/50 flex items-center justify-center text-[#4cd7f6] shadow-[0_0_12px_rgba(6,182,212,0.25)]">
            <Activity className="w-4 h-4" />
          </div>
          <button
            onClick={() => onNavigate('telemetry')}
            className="text-left group cursor-pointer focus:outline-none"
          >
            <span className="text-base lg:text-lg font-bold font-display tracking-tight text-[#f8fafc] group-hover:text-[#4cd7f6] transition-colors whitespace-nowrap">
              PulseCheck
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs font-mono text-[#64748b] tracking-wider uppercase">
              Atmospheric Intel
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links (single line, no wrapping) */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <button
            onClick={() => onNavigate('telemetry')}
            className={`px-3 py-1.5 text-xs lg:text-sm font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeScreen === 'telemetry'
                ? 'text-[#4cd7f6] bg-[rgba(6,182,212,0.12)] border border-[rgba(6,182,212,0.3)] shadow-[0_0_8px_rgba(6,182,212,0.15)]'
                : 'text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#171b26]'
            }`}
          >
            Telemetry Grid
          </button>

          <button
            onClick={() => onNavigate('geospatial')}
            className={`px-3 py-1.5 text-xs lg:text-sm font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeScreen === 'geospatial'
                ? 'text-[#4cd7f6] bg-[rgba(6,182,212,0.12)] border border-[rgba(6,182,212,0.3)] shadow-[0_0_8px_rgba(6,182,212,0.15)]'
                : 'text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#171b26]'
            }`}
          >
            Geospatial Radar
          </button>

          <button
            onClick={() => onNavigate('diagnostics')}
            className={`px-3 py-1.5 text-xs lg:text-sm font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeScreen === 'diagnostics'
                ? 'text-[#4cd7f6] bg-[rgba(6,182,212,0.12)] border border-[rgba(6,182,212,0.3)] shadow-[0_0_8px_rgba(6,182,212,0.15)]'
                : 'text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#171b26]'
            }`}
          >
            Diagnostics & Drift
          </button>

          <button
            onClick={() => onNavigate('regulatory')}
            className={`px-3 py-1.5 text-xs lg:text-sm font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer relative ${
              activeScreen === 'regulatory'
                ? 'text-[#4cd7f6] bg-[rgba(6,182,212,0.12)] border border-[rgba(6,182,212,0.3)] shadow-[0_0_8px_rgba(6,182,212,0.15)]'
                : 'text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#171b26]'
            }`}
          >
            <span>Regulatory Standards</span>
            {unacknowledgedAlertsCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 font-mono text-[10px] bg-[#f43f5e]/20 text-[#f43f5e] border border-[#f43f5e]/40 rounded">
                {unacknowledgedAlertsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onNavigate('data-lab')}
            className={`px-3 py-1.5 text-xs lg:text-sm font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeScreen === 'data-lab'
                ? 'text-[#4cd7f6] bg-[rgba(6,182,212,0.12)] border border-[rgba(6,182,212,0.3)] shadow-[0_0_8px_rgba(6,182,212,0.15)]'
                : 'text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#171b26]'
            }`}
          >
            Historical Laboratory
          </button>

          <button
            onClick={() => onNavigate('python-analytics')}
            className={`px-3 py-1.5 text-xs lg:text-sm font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeScreen === 'python-analytics'
                ? 'text-[#4cd7f6] bg-[rgba(6,182,212,0.12)] border border-[rgba(6,182,212,0.3)] shadow-[0_0_8px_rgba(6,182,212,0.15)]'
                : 'text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#171b26]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
            <span>Python Engine</span>
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action + Live Stream Status Control */}
        <div className="flex items-center gap-2 lg:gap-3 shrink-0">
          <button
            onClick={onToggleLiveStream}
            title={isLiveStreaming ? "Pause real-time stream" : "Resume real-time telemetry stream"}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all border cursor-pointer ${
              isLiveStreaming
                ? 'bg-[rgba(16,185,129,0.1)] text-[#10b981] border-[#10b981]/40 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                : 'bg-[rgba(30,41,59,0.6)] text-[#94a3b8] border-[rgba(148,163,184,0.15)]'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isLiveStreaming ? 'animate-pulse text-[#10b981]' : 'text-[#64748b]'}`} />
            <span className="hidden sm:inline">
              {isLiveStreaming ? 'LIVE 1Hz' : 'PAUSED'}
            </span>
          </button>

          <button
            onClick={onOpenSimulateModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#4cd7f6] bg-[rgba(6,182,212,0.15)] border border-[#06b6d4] hover:bg-[#06b6d4] hover:text-[#0b0f19] transition-all cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.2)] whitespace-nowrap"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Simulate Event</span>
            <span className="sm:hidden">Sim</span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-between gap-1 overflow-x-auto pt-2.5 mt-2.5 border-t border-[rgba(148,163,184,0.1)] text-xs scrollbar-none">
        <button
          onClick={() => onNavigate('telemetry')}
          className={`px-2.5 py-1 rounded whitespace-nowrap cursor-pointer ${
            activeScreen === 'telemetry' ? 'text-[#4cd7f6] bg-[rgba(6,182,212,0.12)] font-semibold' : 'text-[#94a3b8]'
          }`}
        >
          Telemetry
        </button>
        <button
          onClick={() => onNavigate('geospatial')}
          className={`px-2.5 py-1 rounded whitespace-nowrap cursor-pointer ${
            activeScreen === 'geospatial' ? 'text-[#4cd7f6] bg-[rgba(6,182,212,0.12)] font-semibold' : 'text-[#94a3b8]'
          }`}
        >
          Radar Map
        </button>
        <button
          onClick={() => onNavigate('diagnostics')}
          className={`px-2.5 py-1 rounded whitespace-nowrap cursor-pointer ${
            activeScreen === 'diagnostics' ? 'text-[#4cd7f6] bg-[rgba(6,182,212,0.12)] font-semibold' : 'text-[#94a3b8]'
          }`}
        >
          Diagnostics
        </button>
        <button
          onClick={() => onNavigate('regulatory')}
          className={`px-2.5 py-1 rounded whitespace-nowrap cursor-pointer ${
            activeScreen === 'regulatory' ? 'text-[#4cd7f6] bg-[rgba(6,182,212,0.12)] font-semibold' : 'text-[#94a3b8]'
          }`}
        >
          Standards
        </button>
        <button
          onClick={() => onNavigate('data-lab')}
          className={`px-2.5 py-1 rounded whitespace-nowrap cursor-pointer ${
            activeScreen === 'data-lab' ? 'text-[#4cd7f6] bg-[rgba(6,182,212,0.12)] font-semibold' : 'text-[#94a3b8]'
          }`}
        >
          Data Lab
        </button>
        <button
          onClick={() => onNavigate('python-analytics')}
          className={`px-2.5 py-1 rounded whitespace-nowrap cursor-pointer ${
            activeScreen === 'python-analytics' ? 'text-[#4cd7f6] bg-[rgba(6,182,212,0.12)] font-semibold' : 'text-[#94a3b8]'
          }`}
        >
          Python
        </button>
      </div>
    </header>
  );
};
