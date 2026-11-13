import React from 'react';
import { Satellite, DebrisObject, RiskAnalysisResponse } from '../types';
import { OrbitRadarCanvas } from '../components/OrbitRadarCanvas';
import { 
  Fuel, 
  BatteryCharging, 
  ArrowRight, 
  Orbit as OrbitIcon, 
  ShieldAlert, 
  Zap,
  Compass,
  CheckCircle2,
  Barcode,
  Sparkles,
  Sun
} from 'lucide-react';

interface DashboardPageProps {
  satellite: Satellite | null;
  debrisList: DebrisObject[];
  riskAnalysis: RiskAnalysisResponse | null;
  alerts?: any[];
  selectedDebris: DebrisObject | null;
  onSelectDebris: (debris: DebrisObject) => void;
  onExecuteManeuver?: () => void;
  isExecutingManeuver?: boolean;
  maneuverResult?: any | null;
  onNavigateToDebris?: () => void;
  onNavigateToManeuver?: () => void;
  onNavigateToAlerts?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  satellite,
  debrisList,
  riskAnalysis,
  selectedDebris,
  onSelectDebris,
  onNavigateToDebris,
  onNavigateToManeuver,
  maneuverResult
}) => {
  const topThreat = selectedDebris || riskAnalysis?.highest_threat || debrisList[0] || null;
  const isCritical = riskAnalysis?.overall_risk_level === 'Critical';
  const isHigh = riskAnalysis?.overall_risk_level === 'High';

  return (
    <div className="space-y-4 font-sans max-w-7xl mx-auto pb-6">
      {/* Moved Safely Banner when Avoidance Maneuver has been executed */}
      {maneuverResult && (
        <div className="p-3.5 rounded-2xl bg-[#eef5eb] border-2 border-[#597445] text-[#1e2418] text-xs flex items-center justify-between shadow-sm animate-in fade-in duration-300">
          <div className="flex items-center space-x-2.5">
            <div className="w-6 h-6 rounded-lg bg-[#597445] text-white flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-heading font-black text-[#597445] text-xs tracking-wider uppercase mr-1.5">
                MOVED SAFELY:
              </span>
              <span className="text-[#3b4731]">
                Spacecraft elevated to safe orbit altitude (<span className="font-bold text-[#1e2418] font-mono">{satellite?.altitude} km</span>). Conjunction threat cleared!
              </span>
            </div>
          </div>
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-[#597445] text-white text-[9px] font-bold uppercase tracking-wider">
            Safe Orbit Nominal
          </span>
        </div>
      )}

      {/* 4 Compact Telemetry Cards (With Defined Crisp Borders) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Altitude & Flight Vector */}
        <div 
          onClick={onNavigateToDebris}
          className="safari-card p-4 rounded-2xl flex flex-col justify-between space-y-3 cursor-pointer group border-2 border-[#cfc4b2] hover:border-[#597445]"
        >
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-xl bg-[#597445]/15 border-2 border-[#597445]/30 flex items-center justify-center text-[#597445] shadow-sm group-hover:scale-105 transition-transform">
              <OrbitIcon className="w-4 h-4 text-[#597445]" />
            </div>
            <div className="btn-circle-arrow">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="text-[10px] text-[#597445] uppercase font-bold tracking-wider">Flight Vector</div>
            <h3 className="text-base font-heading font-bold text-[#1e2418]">
              {satellite?.altitude} km
            </h3>
            <p className="text-[11px] text-[#636c5b]">
              {satellite?.velocity} km/s • {satellite?.current_orbit?.split(' ')[0] || 'LEO'}
            </p>
          </div>
        </div>

        {/* Card 2: Propellant Reservoir */}
        <div 
          onClick={onNavigateToManeuver}
          className="safari-card p-4 rounded-2xl flex flex-col justify-between space-y-3 cursor-pointer group border-2 border-[#cfc4b2] hover:border-[#be7b38]"
        >
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-xl bg-[#be7b38]/15 border-2 border-[#be7b38]/30 flex items-center justify-center text-[#be7b38] shadow-sm group-hover:scale-105 transition-transform">
              <Fuel className="w-4 h-4 text-[#be7b38]" />
            </div>
            <div className="btn-circle-arrow">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="text-[10px] text-[#be7b38] uppercase font-bold tracking-wider">Propellant Budget</div>
            <h3 className="text-base font-heading font-bold text-[#1e2418]">
              {satellite?.fuel_percent}% <span className="text-[10px] font-normal text-[#636c5b]">Hydrazine</span>
            </h3>
            <p className="text-[11px] text-[#636c5b]">
              ~148 m/s • 22N Thruster
            </p>
          </div>
        </div>

        {/* Card 3: Photovoltaic Power Bus */}
        <div className="safari-card p-4 rounded-2xl flex flex-col justify-between space-y-3 group border-2 border-[#cfc4b2] hover:border-[#597445]">
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-xl bg-[#597445]/15 border-2 border-[#597445]/30 flex items-center justify-center text-[#597445] shadow-sm group-hover:scale-105 transition-transform">
              <BatteryCharging className="w-4 h-4 text-[#597445]" />
            </div>
            <div className="w-7 h-7 rounded-full bg-[#eae4d8] border border-[#cfc4b2] flex items-center justify-center text-[#597445]">
              <Zap className="w-3.5 h-3.5 text-[#597445]" />
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="text-[10px] text-[#597445] uppercase font-bold tracking-wider">Power Storage</div>
            <h3 className="text-base font-heading font-bold text-[#1e2418]">
              {satellite?.battery_percent}% <span className="text-[10px] font-normal text-[#636c5b]">Nominal</span>
            </h3>
            <p className="text-[11px] text-[#636c5b]">
              Photovoltaic Array • 28V Bus
            </p>
          </div>
        </div>

        {/* Card 4: AI Collision Risk Assessment */}
        <div 
          onClick={onNavigateToManeuver}
          className={`safari-card p-4 rounded-2xl flex flex-col justify-between space-y-3 cursor-pointer group border-2 ${
            isCritical || isHigh ? 'border-[#be7b38] shadow-clay-glow' : 'border-[#cfc4b2] hover:border-[#597445]'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform ${
              isCritical || isHigh 
                ? 'bg-[#be7b38]/15 border-[#be7b38]/30 text-[#be7b38]' 
                : 'bg-[#597445]/15 border-[#597445]/30 text-[#597445]'
            }`}>
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="btn-circle-arrow">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="text-[10px] text-[#be7b38] uppercase font-bold tracking-wider">Collision Risk</div>
            <h3 className={`text-base font-heading font-bold ${isCritical || isHigh ? 'text-[#be7b38]' : 'text-[#597445]'}`}>
              {topThreat?.collision_probability || 0.01}% <span className="text-[10px] font-normal text-[#636c5b]">({riskAnalysis?.overall_risk_level || 'Low'})</span>
            </h3>
            <p className="text-[11px] text-[#636c5b] truncate">
              {topThreat?.name || 'Nominal Orbit'}
            </p>
          </div>
        </div>
      </div>

      {/* Compact Horizontal Stats Capsule Bar (With Crisp Defined Border) */}
      <div className="stats-capsule p-3 sm:p-3.5 grid grid-cols-2 md:grid-cols-4 gap-2 divide-y md:divide-y-0 md:divide-x divide-[#cfc4b2] text-center rounded-2xl border-2 border-[#cfc4b2]">
        <div className="pt-1 md:pt-0">
          <div className="text-base sm:text-lg font-heading font-bold text-[#1e2418]">
            {satellite?.id || 'SAT-ALPHA-1'}
          </div>
          <div className="text-[10px] text-[#636c5b]">Active Protected Satellite</div>
        </div>

        <div className="pt-2 md:pt-0 md:pl-2">
          <div className="text-base sm:text-lg font-heading font-bold text-[#1e2418]">
            {debrisList.length} Objects
          </div>
          <div className="text-[10px] text-[#636c5b]">Tracked in 100 km Radius</div>
        </div>

        <div className="pt-2 md:pt-0 md:pl-2">
          <div className="text-base sm:text-lg font-heading font-bold text-[#597445]">
            &lt; 150 ms
          </div>
          <div className="text-[10px] text-[#636c5b]">Thruster Response Latency</div>
        </div>

        <div className="pt-2 md:pt-0 md:pl-2">
          <div className="text-base sm:text-lg font-heading font-bold text-[#be7b38]">
            100%
          </div>
          <div className="text-[10px] text-[#636c5b]">Covariance Verification</div>
        </div>
      </div>

      {/* Main Tactical Radar Centerpiece in Tactile Shell */}
      <div className="w-full flex justify-center">
        <div className="w-full max-w-4xl glass-shell p-4 sm:p-5 rounded-2xl">
          <OrbitRadarCanvas
            satellite={satellite}
            debrisList={debrisList}
            selectedDebrisId={selectedDebris?.id}
            onSelectDebris={onSelectDebris}
          />
        </div>
      </div>
    </div>
  );
};
