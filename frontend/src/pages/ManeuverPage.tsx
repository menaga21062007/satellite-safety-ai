import React from 'react';
import { Satellite, RiskAnalysisResponse } from '../types';
import { 
  Rocket, 
  Flame, 
  ShieldCheck, 
  Clock, 
  Fuel, 
  ArrowRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface ManeuverPageProps {
  satellite: Satellite | null;
  riskAnalysis: RiskAnalysisResponse | null;
  onExecuteManeuver: () => void;
  isExecutingManeuver: boolean;
  maneuverResult: any | null;
}

export const ManeuverPage: React.FC<ManeuverPageProps> = ({
  satellite,
  riskAnalysis,
  onExecuteManeuver,
  isExecutingManeuver,
  maneuverResult
}) => {
  const recommendation = riskAnalysis?.ai_recommendation;
  const topThreat = riskAnalysis?.highest_threat;

  return (
    <div className="space-y-4 font-sans max-w-6xl mx-auto pb-6">
      {/* Compact Top Control Strip */}
      <div className="flex items-center justify-between text-xs px-1">
        <span className="font-heading font-bold text-[#1e2418] text-sm tracking-wide">
          Collision Avoidance Maneuver Guidance (CAM)
        </span>

        <div className="flex items-center space-x-2">
          <span className="text-[#636c5b] font-medium">Thruster:</span>
          <span className="orbit-pill flex items-center space-x-1.5 text-[#597445] py-1 px-3 font-bold font-mono bg-[#eae4d8] border border-[#ded6c5]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#597445] animate-pulse" />
            <span>22N ARMED</span>
          </span>
        </div>
      </div>

      {/* Main Execution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Active Recommendation Card (Col 8) */}
        <div className="lg:col-span-8 safari-card p-4 sm:p-5 rounded-2xl shadow-sm border-2 border-[#cfc4b2] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#cfc4b2] mb-3.5">
              <span className="font-heading font-bold text-sm tracking-wide text-[#1e2418] flex items-center space-x-2">
                <Flame className="w-3.5 h-3.5 text-[#be7b38]" />
                <span>Recommended Burn Profile</span>
              </span>
              <span className="orbit-pill text-[9px] text-[#475e36] py-0.5 px-2 bg-[#eae4d8] border border-[#cfc4b2]">
                MAX SEPARATION
              </span>
            </div>

            {maneuverResult && (
              <div className="p-4 rounded-2xl bg-[#eef5eb] border-2 border-[#597445] text-[#1e2418] text-xs flex items-center justify-between shadow-md animate-in fade-in slide-in-from-top-2 duration-300 mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-[#597445] text-white flex items-center justify-center shadow-sm shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-heading font-black text-sm text-[#597445] tracking-wide flex items-center space-x-1.5">
                      <span>MOVED SAFELY</span>
                      <span className="w-2 h-2 rounded-full bg-[#597445] animate-ping" />
                    </div>
                    <div className="text-[11px] text-[#3b4731] mt-0.5">
                      Satellite moved safely to orbit altitude <span className="text-[#1e2418] font-mono font-bold">{maneuverResult.new_altitude} km</span> (+{maneuverResult.altitude_change} km boost). All conjunction hazards cleared!
                    </div>
                  </div>
                </div>
                <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-[#597445] text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                  SAFE ORBIT ACTIVE
                </span>
              </div>
            )}

            {recommendation ? (
              <div className="space-y-3">
                {/* Target threat notice */}
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#fbf5ee] via-[#f7eee2] to-[#f5f2eb] border-2 border-[#be7b38]/40 flex items-center justify-between">
                  <div>
                    <div className="text-[9px] text-[#be7b38] uppercase font-bold tracking-widest">Target Hazard</div>
                    <div className="text-base font-heading font-bold text-[#1e2418] mt-0.5">{recommendation.target_object_name}</div>
                    <div className="text-[11px] text-[#636c5b]">
                      Distance: <span className="text-[#1e2418] font-bold">{topThreat?.distance} km</span> | Probability: <span className="text-[#be7b38] font-bold">{topThreat?.collision_probability}%</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#be7b38] text-white text-[10px] font-bold uppercase tracking-wider shadow-sm animate-pulse">
                    CRITICAL
                  </span>
                </div>

                {/* 4 Core Requirements Grid */}
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div className="p-2.5 bg-[#f5f2eb] rounded-xl border-2 border-[#cfc4b2] space-y-0.5">
                    <div className="text-[#636c5b] text-[9px] uppercase font-semibold">1. Safe Direction</div>
                    <div className="text-sm font-heading font-bold text-[#597445]">{recommendation.direction}</div>
                    <div className="text-[10px] text-[#8f9886]">Along vector + Radial offset</div>
                  </div>

                  <div className="p-2.5 bg-[#f5f2eb] rounded-xl border-2 border-[#cfc4b2] space-y-0.5">
                    <div className="text-[#636c5b] text-[9px] uppercase font-semibold">2. Recommended Altitude</div>
                    <div className="text-sm font-heading font-bold text-[#597445]">
                      +{recommendation.altitude_change} km (Target: {recommendation.new_altitude} km)
                    </div>
                    <div className="text-[10px] text-[#8f9886]">Current: {satellite?.altitude} km</div>
                  </div>

                  <div className="p-2.5 bg-[#f5f2eb] rounded-xl border-2 border-[#cfc4b2] space-y-0.5">
                    <div className="text-[#636c5b] text-[9px] uppercase font-semibold">3. Estimated Burn Duration</div>
                    <div className="text-sm font-heading font-bold text-[#1e2418] flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-[#597445]" />
                      <span>{recommendation.burn_duration_formatted}</span>
                    </div>
                    <div className="text-[10px] text-[#8f9886]">Impulsive continuous burn</div>
                  </div>

                  <div className="p-2.5 bg-[#f5f2eb] rounded-xl border-2 border-[#cfc4b2] space-y-0.5">
                    <div className="text-[#636c5b] text-[9px] uppercase font-semibold">4. Propellant Consumption</div>
                    <div className="text-sm font-heading font-bold text-[#be7b38] flex items-center space-x-1">
                      <Fuel className="w-3 h-3 text-[#be7b38]" />
                      <span>{recommendation.fuel_used_kg} kg ({recommendation.fuel_percent_used}%)</span>
                    </div>
                    <div className="text-[10px] text-[#8f9886]">Reserve: {satellite?.fuel_percent}%</div>
                  </div>
                </div>

                {/* 5. Flight Dynamics Rationale */}
                <div className="p-2.5 bg-[#f5f2eb] rounded-xl border-2 border-[#cfc4b2] space-y-0.5">
                  <div className="text-[#636c5b] text-[9px] uppercase font-semibold">5. Flight Dynamics Rationale</div>
                  <p className="text-[11px] text-[#2b3323] leading-relaxed font-sans">
                    {recommendation.reason}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center text-[#636c5b] space-y-2">
                <ShieldCheck className="w-10 h-10 text-[#597445] mx-auto drop-shadow-sm" />
                <div className="text-sm font-heading font-bold text-[#1e2418]">Current Orbit is Nominal & Safe</div>
                <p className="text-[11px] text-[#636c5b] max-w-sm mx-auto">
                  No active threats exceed the collision threshold. Click "Inject Hazard" in the top bar to trigger a simulation.
                </p>
              </div>
            )}
          </div>

          {/* Move to Safe Orbit Action Button (Moss Green Pill Button) */}
          {recommendation && (
            <div className="mt-5 pt-3.5 border-t border-[#cfc4b2]">
              {maneuverResult ? (
                <div className="w-full py-3.5 px-6 rounded-2xl bg-[#597445] text-white font-heading font-black text-xs tracking-wider uppercase flex items-center justify-center space-x-2 shadow-md">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>MOVED SAFELY • SATELLITE IN SAFE ORBIT</span>
                </div>
              ) : (
                <button
                  onClick={onExecuteManeuver}
                  disabled={isExecutingManeuver}
                  className="w-full btn-moss py-3 px-6 text-xs font-bold tracking-wider shadow-md active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed uppercase flex items-center justify-center space-x-2 transition-all"
                >
                  <Rocket className={`w-4 h-4 text-white ${isExecutingManeuver ? 'animate-bounce' : ''}`} />
                  <span>{isExecutingManeuver ? 'EXECUTING THRUSTER BURN (PLEASE WAIT)...' : 'MOVE TO SAFE ORBIT (EXECUTE NOW)'}</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-0.5 text-white" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right: Satellite State & Thruster Telemetry (Col 4) */}
        <div className="lg:col-span-4 safari-card p-4 sm:p-5 rounded-2xl shadow-sm border-2 border-[#cfc4b2] flex flex-col justify-between space-y-4">
          <div>
            <div className="pb-3 border-b border-[#cfc4b2] mb-3.5 flex items-center justify-between">
              <span className="font-heading font-bold text-sm tracking-wide text-[#1e2418]">
                Propulsion Specs
              </span>
              <Sparkles className="w-3.5 h-3.5 text-[#597445]" />
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 bg-[#f5f2eb] rounded-xl border-2 border-[#cfc4b2] space-y-0.5">
                <div className="text-[#636c5b] text-[9px] uppercase font-semibold">Dry Mass</div>
                <div className="font-heading font-bold text-[#1e2418] text-sm">{satellite?.mass_kg || 850} kg</div>
              </div>

              <div className="p-2.5 bg-[#f5f2eb] rounded-xl border-2 border-[#cfc4b2] space-y-0.5">
                <div className="text-[#636c5b] text-[9px] uppercase font-semibold">Thruster Type</div>
                <div className="font-heading font-bold text-[#597445] text-xs">Hydrazine (Isp = 285s)</div>
              </div>

              <div className="p-2.5 bg-[#f5f2eb] rounded-xl border-2 border-[#cfc4b2] space-y-0.5">
                <div className="text-[#636c5b] text-[9px] uppercase font-semibold">Total Delta-V</div>
                <div className="font-heading font-bold text-[#1e2418] text-sm">~148 m/s</div>
              </div>

              <div className="p-2.5 bg-[#f5f2eb] rounded-xl border-2 border-[#cfc4b2] space-y-0.5">
                <div className="text-[#636c5b] text-[9px] uppercase font-semibold">Orbit Profile</div>
                <div className="font-heading font-bold text-[#597445] text-xs">{satellite?.current_orbit}</div>
              </div>
            </div>
          </div>

          <div className="p-2.5 bg-[#f4f7f2] border-2 border-[#597445]/25 rounded-xl text-[10px] text-[#2b3323] leading-relaxed shadow-inner">
            <span className="text-[#597445] font-bold">Safeguard: </span>
            Thrusters hold attitude alignment and verify covariance clearance before returning to nominal modes.
          </div>
        </div>
      </div>
    </div>
  );
};
