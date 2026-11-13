import React, { useState } from 'react';
import { Satellite } from '../types';
import { 
  Radio, 
  Play, 
  Square, 
  AlertTriangle, 
  ChevronDown,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  Search
} from 'lucide-react';

interface NavbarProps {
  activeSatellite: Satellite | null;
  satellites: Satellite[];
  onSelectSatellite: (id: string) => void;
  simulationRunning: boolean;
  onToggleSimulation: () => void;
  onTriggerHazard: () => void;
  onResetSimulation: () => void;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSatellite,
  satellites,
  onSelectSatellite,
  simulationRunning,
  onToggleSimulation,
  onTriggerHazard,
  onResetSimulation
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="w-full h-16 bg-[#fbf9f5]/90 backdrop-blur-2xl border-b border-[#e2dacf] px-6 flex items-center justify-between sticky top-0 z-50 shadow-[0_4px_20px_rgba(110,95,75,0.06)] font-sans">
      {/* Left: Brand Identity matching Safari & Moss Aesthetic */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-3 group cursor-pointer">
          {/* Tactile Moss Green Rounded Icon */}
          <div className="w-9 h-9 rounded-2xl bg-[#597445] p-0.5 shadow-md shadow-[#597445]/25 flex items-center justify-center transition-transform group-hover:scale-105">
            <span className="font-heading font-black text-white text-base tracking-tighter">A</span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-heading font-bold text-lg tracking-tight text-[#1e2418]">
                astrovigil
              </span>
              <span className="text-[9px] px-2.5 py-0.5 bg-[#eae4d8] border border-[#d8cfbf] text-[#475e36] rounded-full font-mono font-bold tracking-widest shadow-sm">
                AI SSA
              </span>
            </div>
          </div>
        </div>

        {/* Center/Left: Satellite Capsule Selector (Tactile Sand Pill) */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2.5 bg-[#fbf9f5] hover:bg-[#f3ede2] border-2 border-[#cfc4b2] hover:border-[#597445] px-4 py-2 rounded-full text-xs transition-all duration-200 text-[#2b3323] shadow-sm hover:shadow"
          >
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#597445] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#597445] shadow-[0_0_8px_#597445]" />
            </div>
            <span className="font-semibold text-xs text-[#1e2418] tracking-wide whitespace-nowrap">
              {activeSatellite?.name || 'Select Satellite'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#736a57] transition-transform duration-200" />
          </button>

          {dropdownOpen && (
            <div className="absolute left-0 mt-2 w-72 bg-[#fbf9f5] backdrop-blur-2xl border-2 border-[#cfc4b2] rounded-2xl shadow-[0_15px_35px_rgba(110,95,75,0.18)] z-50 py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3.5 py-1.5 text-[10px] font-heading text-[#597445] uppercase tracking-widest border-b border-[#cfc4b2] font-bold">
                Constellation Fleet Assets
              </div>
              {satellites.length === 0 ? (
                <div className="px-3.5 py-3 text-xs text-[#736a57] text-center">
                  Connecting to fleet assets...
                </div>
              ) : (
                satellites.map((sat) => (
                  <button
                    key={sat.id}
                    onClick={() => {
                      onSelectSatellite(sat.id);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between hover:bg-[#f0ebe0] transition-colors ${
                      sat.is_active ? 'bg-[#eef3eb] text-[#1e2418] border-l-2 border-[#597445] font-semibold' : 'text-[#48533c]'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-xs text-[#1e2418]">{sat.name}</div>
                      <div className="text-[10px] text-[#736a57]">{sat.current_orbit}</div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#eae4d8] border border-[#cfc4b2] text-[#475e36]">
                      {sat.altitude} km
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls: Moss & Sand Tactile Action Buttons */}
      <div className="flex items-center space-x-3">
        {/* Radar Status Badge */}
        <div className="hidden sm:flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#eae4d8] border-2 border-[#cfc4b2] text-xs">
          <Radio className={`w-3.5 h-3.5 text-[#597445] ${simulationRunning ? 'animate-pulse' : 'opacity-60'}`} />
          <span className="text-[#6d6350] text-[10px] tracking-wider font-semibold">RADAR</span>
          <span className="text-[#1e2418] font-bold text-xs tracking-wider">
            {simulationRunning ? 'ACTIVE' : 'STANDBY'}
          </span>
        </div>

        {/* Reset Button */}
        <button
          onClick={onResetSimulation}
          title="Reset Simulation Scenario"
          className="p-2 rounded-full bg-[#fbf9f5] hover:bg-[#f0ebe0] border-2 border-[#cfc4b2] text-[#554e3d] hover:text-[#1e2418] transition-all duration-200 group shadow-sm hover:scale-105 active:scale-95"
        >
          <RefreshCw className="w-4 h-4 transition-transform duration-500 group-hover:rotate-180 text-[#597445]" />
        </button>

        {/* Hazard Inject Button (Warm Terracotta / Clay Pill) */}
        <button
          onClick={onTriggerHazard}
          title="Inject Immediate Conjunction Hazard (Demo Mode)"
          className="flex items-center space-x-2 bg-[#be7b38] hover:bg-[#a6682b] text-white px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-all duration-200 shadow-md shadow-[#be7b38]/25 hover:scale-102 active:scale-98"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-white animate-pulse" />
          <span className="whitespace-nowrap">INJECT HAZARD</span>
        </button>

        {/* Start / Stop Simulation Button (Signature Moss Green Pill Button) */}
        <button
          onClick={onToggleSimulation}
          className={`px-5 py-2 text-xs font-bold tracking-wide transition-all duration-200 whitespace-nowrap flex items-center space-x-2 rounded-full shadow-md ${
            simulationRunning
              ? 'bg-[#597445] hover:bg-[#475e36] text-white shadow-[#597445]/30'
              : 'bg-[#fbf9f5] hover:bg-[#f0ebe0] text-[#1e2418] border border-[#ded6c5]'
          }`}
        >
          {simulationRunning ? (
            <>
              <Square className="w-3.5 h-3.5 text-white fill-white" />
              <span>RADAR RUNNING</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 text-[#1e2418] fill-[#1e2418]" />
              <span>START RADAR</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5 text-[#1e2418]" />
            </>
          )}
        </button>
      </div>
    </header>
  );
};
