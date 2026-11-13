import React from 'react';
import { DebrisObject } from '../types';
import { 
  Crosshair, 
  Radio, 
  Clock, 
  ArrowRight, 
  Gauge, 
  Satellite as SatIcon
} from 'lucide-react';

interface DebrisPageProps {
  debrisList: DebrisObject[];
  selectedDebris: DebrisObject | null;
  onSelectDebris: (debris: DebrisObject) => void;
  onNavigateToRisk: () => void;
}

export const DebrisPage: React.FC<DebrisPageProps> = ({
  debrisList,
  selectedDebris,
  onSelectDebris,
  onNavigateToRisk
}) => {
  const activeInspect = selectedDebris || debrisList[0] || null;

  return (
    <div className="space-y-4 font-sans max-w-6xl mx-auto pb-6">
      {/* Compact Top Control Strip */}
      <div className="flex items-center justify-between text-xs px-1">
        <span className="font-heading font-bold text-[#1e2418] text-sm tracking-wide">
          Tracked Radar Contacts ({debrisList.length})
        </span>

        <div className="flex items-center space-x-2">
          <span className="orbit-pill flex items-center space-x-1.5 font-mono py-1 px-3 bg-[#eae4d8] text-[#475e36] border border-[#d6cdbe]">
            <Radio className="w-3 h-3 text-[#597445] animate-pulse" />
            <span>SNR: 18.4 dB</span>
          </span>
          <span className="orbit-pill font-mono font-bold text-[#1e2418] py-1 px-3 bg-[#eae4d8] border border-[#d6cdbe]">
            {debrisList.length} TARGETS ACQUIRED
          </span>
        </div>
      </div>

      {/* Debris Cards Grid with Loading/Empty Fallback */}
      {debrisList.length === 0 ? (
        <div className="safari-card p-10 rounded-2xl text-center space-y-3 border border-[#ded6c5]">
          <Radio className="w-8 h-8 text-[#597445] mx-auto animate-pulse" />
          <div className="text-base font-heading font-bold text-[#1e2418]">Acquiring Orbital Radar Contacts...</div>
          <p className="text-xs text-[#636c5b] max-w-md mx-auto">
            Polling active telemetry stream from space defense radar. If this persists, ensure the backend simulation is active.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {debrisList.map((deb) => {
            const isSelected = activeInspect?.id === deb.id;
            const isCrit = deb.risk_level === 'Critical' || deb.risk_level === 'High';
            const isMed = deb.risk_level === 'Medium';

            return (
              <button
                key={deb.id}
                onClick={() => onSelectDebris(deb)}
                className={`safari-card p-3.5 text-left flex flex-col justify-between space-y-2.5 cursor-pointer rounded-2xl group transition-all border-2 ${
                  isSelected
                    ? 'border-[#597445] ring-2 ring-[#597445]/40 shadow-moss-glow bg-[#f4f7f2]'
                    : 'bg-[#fbf9f5] border-[#cfc4b2] hover:border-[#597445]'
                }`}
              >
                {/* Card Top: 3D Icon & Circular Arrow Button */}
                <div className="flex items-start justify-between">
                  <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform ${
                    isCrit 
                      ? 'bg-[#be7b38]/15 border-[#be7b38]/30 text-[#be7b38]' 
                      : isMed 
                      ? 'bg-[#d97706]/15 border-[#d97706]/30 text-[#d97706]' 
                      : 'bg-[#597445]/15 border-[#597445]/30 text-[#597445]'
                  }`}>
                    <SatIcon className="w-4 h-4" />
                  </div>

                  <div className="btn-circle-arrow">
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>

                {/* Card Middle: Title & Kinematics */}
                <div className="space-y-0.5">
                  <div className="text-[9px] text-[#597445] uppercase font-bold tracking-wider truncate">
                    {deb.id}
                  </div>
                  <h3 className="text-xs font-heading font-bold text-[#1e2418] group-hover:text-[#597445] transition-colors truncate">
                    {deb.name}
                  </h3>
                  <p className="text-[10px] text-[#636c5b]">
                    {deb.distance} km • {deb.velocity} km/s
                  </p>
                </div>

                {/* Card Bottom: Badges */}
                <div className="pt-1.5 border-t border-[#eae4d8] flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    isCrit 
                      ? 'bg-[#be7b38] text-white shadow-sm' 
                      : isMed 
                      ? 'bg-[#d97706] text-white shadow-sm' 
                      : 'bg-[#597445] text-white shadow-sm'
                  }`}>
                    {deb.risk_level}
                  </span>
                  <span className="text-[9px] text-[#636c5b] font-mono">
                    {deb.collision_probability}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Target Telemetry Lock Box (Tactile Sand/Ivory Box with Crisp Defined Border) */}
      {activeInspect && (
        <div className="safari-card p-4 sm:p-5 rounded-2xl space-y-4 shadow-sm border-2 border-[#cfc4b2]">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#cfc4b2] gap-2">
            <div>
              <div className="flex items-center space-x-2 text-[10px] font-heading font-bold text-[#597445] uppercase tracking-widest">
                <Crosshair className="w-3.5 h-3.5 text-[#597445] animate-pulse" />
                <span>Target Telemetry Lock</span>
              </div>
              <h2 className="text-lg font-heading font-bold text-[#1e2418] tracking-wide mt-0.5">
                {activeInspect.name}
              </h2>
              <div className="text-[11px] text-[#636c5b] flex items-center space-x-2 mt-0.5">
                <span>Object ID: <span className="text-[#597445] font-mono font-bold">{activeInspect.id}</span></span>
                <span>•</span>
                <span className="capitalize">Type: <span className="text-[#1e2418] font-medium">{activeInspect.type}</span></span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span
                className={`px-3 py-1 rounded-full text-[11px] font-heading font-bold uppercase tracking-wider ${
                  activeInspect.risk_level === 'Critical' || activeInspect.risk_level === 'High'
                    ? 'bg-[#be7b38] text-white shadow-sm'
                    : activeInspect.risk_level === 'Medium'
                    ? 'bg-[#d97706] text-white shadow-sm'
                    : 'bg-[#597445] text-white shadow-sm'
                }`}
              >
                {activeInspect.risk_level} Risk ({activeInspect.collision_probability}%)
              </span>
            </div>
          </div>

          {/* 6 Core Telemetry Cards (With Defined Crisp Borders) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
            <div className="p-2.5 bg-[#f5f2eb] rounded-xl border-2 border-[#cfc4b2] space-y-0.5">
              <div className="text-[#636c5b] text-[9px] uppercase font-semibold">Distance</div>
              <div className="font-mono font-bold text-[#1e2418] text-sm">{activeInspect.distance} km</div>
              <div className="text-[9px] text-[#8f9886]">Radial Separation</div>
            </div>

            <div className="p-2.5 bg-[#f5f2eb] rounded-xl border-2 border-[#cfc4b2] space-y-0.5">
              <div className="text-[#636c5b] text-[9px] uppercase font-semibold">Velocity</div>
              <div className="font-mono font-bold text-[#1e2418] text-sm">{activeInspect.velocity} km/s</div>
              <div className="text-[9px] text-[#8f9886]">Doppler Speed</div>
            </div>

            <div className="p-2.5 bg-[#f5f2eb] rounded-xl border-2 border-[#cfc4b2] space-y-0.5">
              <div className="text-[#636c5b] text-[9px] uppercase font-semibold">Impact (TCA)</div>
              <div className="font-mono font-bold text-[#be7b38] text-sm flex items-center space-x-1">
                <Clock className="w-3 h-3 text-[#be7b38]" />
                <span>{activeInspect.time_to_impact_formatted}</span>
              </div>
              <div className="text-[9px] text-[#8f9886]">Closest Approach</div>
            </div>

            <div className="p-2.5 bg-[#f5f2eb] rounded-xl border-2 border-[#cfc4b2] space-y-0.5">
              <div className="text-[#636c5b] text-[9px] uppercase font-semibold">Physical Size</div>
              <div className="font-mono font-bold text-[#1e2418] text-sm">{activeInspect.size} m</div>
              <div className="text-[9px] text-[#8f9886]">Radar Cross-Section</div>
            </div>

            <div className="p-2.5 bg-[#f5f2eb] rounded-xl border-2 border-[#cfc4b2] space-y-0.5">
              <div className="text-[#636c5b] text-[9px] uppercase font-semibold">Bearing</div>
              <div className="font-heading font-bold text-[#1e2418] text-xs truncate">
                Az {activeInspect.bearing_angle}°
              </div>
              <div className="text-[9px] text-[#597445] truncate">{activeInspect.direction}</div>
            </div>

            <div className="p-2.5 bg-[#f5f2eb] rounded-xl border-2 border-[#cfc4b2] space-y-0.5">
              <div className="text-[#636c5b] text-[9px] uppercase font-semibold">Miss Distance (b)</div>
              <div className="font-mono font-bold text-[#597445] text-sm">
                {Math.max(0.2, +(activeInspect.distance * 0.12).toFixed(2))} km
              </div>
              <div className="text-[9px] text-[#8f9886]">Foster B-Plane</div>
            </div>
          </div>

          {/* AI Collision Probability Gauge */}
          <div className="p-3 bg-[#f5f2eb] rounded-xl border-2 border-[#cfc4b2] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#1e2418] font-heading font-bold uppercase tracking-wider flex items-center space-x-1.5 text-[11px]">
                <Gauge className="w-3.5 h-3.5 text-[#597445]" />
                <span>Foster 2D B-Plane Collision Probability</span>
              </span>
              <span className="font-mono font-bold text-[#be7b38] text-sm">
                {activeInspect.collision_probability}%
              </span>
            </div>

            <div className="w-full bg-[#eae4d8] rounded-full h-2 overflow-hidden border border-[#ded6c5]">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  activeInspect.collision_probability > 60
                    ? 'bg-[#be7b38]'
                    : activeInspect.collision_probability > 25
                    ? 'bg-[#d97706]'
                    : 'bg-[#597445]'
                }`}
                style={{ width: `${Math.min(100, activeInspect.collision_probability)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-[#636c5b]">
              <span>Threshold: <span className="text-[#1e2418] font-semibold">25% (Warning) | 65% (Critical)</span></span>
              <span className="text-[#597445] font-semibold">
                {activeInspect.collision_probability >= 65 ? 'Critical Avoidance Burn Recommended' : 'Nominal Monitoring Active'}
              </span>
            </div>
          </div>

          {/* Moss Green Pill Action Button */}
          <button
            onClick={onNavigateToRisk}
            className="w-full btn-moss py-3 px-6 text-xs font-bold tracking-wider transition-all shadow-md uppercase flex items-center justify-center space-x-2"
          >
            <span>Proceed to AI Collision Risk & Astrodynamics</span>
            <ArrowRight className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      )}
    </div>
  );
};
