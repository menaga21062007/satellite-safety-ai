import React, { useState } from 'react';
import { DebrisObject, RiskAnalysisResponse, Satellite } from '../types';
import { downloadSafetyReportPdf } from '../utils/reportDownloader';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  ArrowRight, 
  Download, 
  CheckCircle2, 
  Fuel
} from 'lucide-react';

interface RiskAnalysisPageProps {
  satellite: Satellite | null;
  debrisList: DebrisObject[];
  riskAnalysis: RiskAnalysisResponse | null;
  onNavigateToManeuver: () => void;
}

export const RiskAnalysisPage: React.FC<RiskAnalysisPageProps> = ({
  satellite,
  debrisList,
  riskAnalysis,
  onNavigateToManeuver
}) => {
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Highest threat target object
  const topHazard = riskAnalysis?.highest_threat || debrisList[0] || null;

  const handleDownloadPdf = () => {
    setDownloadingPdf(true);
    try {
      downloadSafetyReportPdf(
        satellite,
        debrisList,
        riskAnalysis,
        riskAnalysis?.ai_recommendation || null
      );
    } catch (e) {
      console.error('PDF download error:', e);
    } finally {
      setTimeout(() => setDownloadingPdf(false), 1200);
    }
  };

  return (
    <div className="space-y-4 font-sans max-w-6xl mx-auto pb-6">
      {/* Compact Top Control Strip */}
      <div className="flex items-center justify-between text-xs px-1">
        <span className="font-heading font-bold text-[#1e2418] text-sm tracking-wide">
          Conjunction Risk & Protection Status
        </span>

        <div className="flex items-center space-x-2.5">
          <div className="orbit-pill flex items-center space-x-2 py-1 px-3 font-mono bg-[#eae4d8] border border-[#ded6c5]">
            <span className="text-[#636c5b]">Severity: </span>
            <span
              className={`font-heading font-bold uppercase tracking-wider ${
                riskAnalysis?.overall_risk_level === 'Critical'
                  ? 'text-[#be7b38]'
                  : riskAnalysis?.overall_risk_level === 'High'
                  ? 'text-[#d97706]'
                  : 'text-[#597445]'
              }`}
            >
              {riskAnalysis?.overall_risk_level || 'LOW'}
            </span>
          </div>

          <button
            onClick={onNavigateToManeuver}
            className="btn-sand-pill px-4 py-1.5 text-xs font-semibold tracking-wide flex items-center space-x-1.5"
          >
            <span>Review Maneuver Plan</span>
            <ArrowRight className="w-3 h-3 text-[#597445]" />
          </button>
        </div>
      </div>

      {/* The Two Condition Cards (Dangerous Condition & Safe Condition) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Primary Conjunction Target (Dangerous Condition) */}
        <div className="safari-card p-4 sm:p-5 rounded-2xl border-2 border-[#cfc4b2] border-l-4 border-l-[#be7b38] flex flex-col justify-between space-y-4 shadow-sm">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#cfc4b2] mb-3.5">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-3.5 h-3.5 text-[#be7b38] animate-pulse" />
                <span className="text-[11px] font-heading font-bold text-[#be7b38] uppercase tracking-wider">
                  Dangerous Condition • Primary Threat
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-heading font-bold uppercase tracking-wider bg-[#be7b38] text-white shadow-sm">
                {topHazard?.risk_level || 'Critical'} Hazard
              </span>
            </div>

            <h2 className="text-lg font-heading font-bold text-[#1e2418] tracking-wide">
              {topHazard?.name || 'Defunct Microsat Sensor Mast'}
            </h2>
            <div className="text-[11px] text-[#636c5b] mb-3.5 mt-0.5">
              ID: <span className="text-[#be7b38] font-mono font-bold">{topHazard?.id || 'DEB-2026-5509'}</span>
              <span className="mx-2">•</span>
              <span className="capitalize text-[#1e2418] font-medium">{topHazard?.type || 'Satellite Fragment'}</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-2.5 bg-[#f5f2eb] rounded-xl border-2 border-[#cfc4b2] space-y-0.5">
                <div className="text-[#636c5b] text-[9px] uppercase font-semibold">Distance</div>
                <div className="font-mono font-bold text-[#1e2418] text-sm">{topHazard?.distance || 78.28} km</div>
                <div className="text-[9px] text-[#8f9886]">Radial Separation</div>
              </div>

              <div className="p-2.5 bg-[#f5f2eb] rounded-xl border-2 border-[#cfc4b2] space-y-0.5">
                <div className="text-[#636c5b] text-[9px] uppercase font-semibold">Velocity</div>
                <div className="font-mono font-bold text-[#1e2418] text-sm">{topHazard?.velocity || 7.21} km/s</div>
                <div className="text-[9px] text-[#8f9886]">Doppler Speed</div>
              </div>

              <div className="p-2.5 bg-[#f5f2eb] rounded-xl border-2 border-[#cfc4b2] space-y-0.5">
                <div className="text-[#636c5b] text-[9px] uppercase font-semibold">Collision Risk</div>
                <div className="font-mono font-bold text-[#be7b38] text-sm">{topHazard?.collision_probability || 99.9}%</div>
                <div className="text-[9px] text-[#be7b38]">Critical Action Level</div>
              </div>

              <div className="p-2.5 bg-[#f5f2eb] rounded-xl border-2 border-[#cfc4b2] space-y-0.5">
                <div className="text-[#636c5b] text-[9px] uppercase font-semibold">Impact (TCA)</div>
                <div className="font-mono font-bold text-[#1e2418] text-sm flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-[#597445]" />
                  <span>{topHazard?.time_to_impact_formatted || '1h 05m'}</span>
                </div>
                <div className="text-[9px] text-[#8f9886]">Closest Approach</div>
              </div>
            </div>
          </div>

          {/* Probability Bar */}
          <div className="p-2.5 bg-[#f5f2eb] rounded-xl border-2 border-[#cfc4b2] space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#636c5b] text-[9px] uppercase font-semibold">Collision Risk Severity</span>
              <span className="font-mono font-bold text-[#be7b38] text-xs">{topHazard?.collision_probability || 99.9}%</span>
            </div>
            <div className="w-full bg-[#eae4d8] rounded-full h-2 overflow-hidden border border-[#cfc4b2]">
              <div
                className="h-full bg-[#be7b38] rounded-full"
                style={{ width: `${Math.min(100, topHazard?.collision_probability || 99.9)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Satellite Protection Status (Safe Condition) */}
        <div className="safari-card p-4 sm:p-5 rounded-2xl border-2 border-[#cfc4b2] border-l-4 border-l-[#597445] flex flex-col justify-between space-y-4 shadow-sm">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#cfc4b2] mb-3.5">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-3.5 h-3.5 text-[#597445]" />
                <span className="text-[11px] font-heading font-bold text-[#597445] uppercase tracking-wider">
                  Safe Condition • Protection Status
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-heading font-bold uppercase tracking-wider bg-[#597445] text-white flex items-center space-x-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span>Armed & Ready</span>
              </span>
            </div>

            <h2 className="text-lg font-heading font-bold text-[#1e2418] tracking-wide">
              Thruster System Ready
            </h2>
            <div className="text-[11px] text-[#636c5b] mb-3.5 mt-0.5">
              Asset: <span className="text-[#1e2418] font-semibold">{satellite?.name || 'AstroVigil-1'}</span>
              <span className="mx-2">•</span>
              <span>Altitude: <span className="text-[#597445] font-mono font-bold">{satellite?.altitude || 705} km</span></span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-2.5 bg-[#f5f2eb] rounded-xl border-2 border-[#cfc4b2] space-y-0.5">
                <div className="text-[#636c5b] text-[9px] uppercase font-semibold">Autonomous Maneuver</div>
                <div className="font-heading font-bold text-[#597445] text-xs">Enabled (Prograde/Radial)</div>
                <div className="text-[9px] text-[#8f9886]">Autonomous CAM Engine</div>
              </div>

              <div className="p-2.5 bg-[#f5f2eb] rounded-xl border-2 border-[#cfc4b2] space-y-0.5">
                <div className="text-[#636c5b] text-[9px] uppercase font-semibold">Action Threshold</div>
                <div className="font-mono font-bold text-[#1e2418] text-xs">Pc &gt; 25% | Dist &lt; 20 km</div>
                <div className="text-[9px] text-[#8f9886]">Intervention Trigger</div>
              </div>

              <div className="p-2.5 bg-[#f5f2eb] rounded-xl border-2 border-[#cfc4b2] space-y-0.5">
                <div className="text-[#636c5b] text-[9px] uppercase font-semibold">Propellant Margin</div>
                <div className="font-mono font-bold text-[#597445] text-xs flex items-center space-x-1">
                  <Fuel className="w-3 h-3 text-[#597445]" />
                  <span>{satellite?.fuel_percent || 92.8}% Hydrazine</span>
                </div>
                <div className="text-[9px] text-[#8f9886]">Propulsion Reservoir</div>
              </div>

              <div className="p-2.5 bg-[#f5f2eb] rounded-xl border-2 border-[#cfc4b2] space-y-0.5">
                <div className="text-[#636c5b] text-[9px] uppercase font-semibold">Response Latency</div>
                <div className="font-mono font-bold text-[#1e2418] text-xs">&lt; 150 ms</div>
                <div className="text-[9px] text-[#8f9886]">Real-Time Thruster Igniter</div>
              </div>
            </div>
          </div>

          <div className="p-2.5 bg-[#f4f7f2] border-2 border-[#597445]/25 rounded-xl text-[10px] text-[#2b3323] leading-relaxed">
            <span className="text-[#597445] font-bold">Safety Guarantee: </span>
            Thrusters deliver up to 14.8 m/s delta-V, achieving &gt; 50 km orbit separation within single burn.
          </div>
        </div>
      </div>

      {/* Produce Report Card: Direct PDF Generation */}
      <div className="safari-card p-3.5 sm:p-4 rounded-2xl shadow-sm border-2 border-[#cfc4b2] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="font-heading font-bold text-sm text-[#1e2418] tracking-wide flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-[#597445]" />
          <span>Generate Satellite Conjunction Safety Report</span>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="btn-moss py-2 px-5 text-xs font-bold tracking-wide transition-all shadow-md hover:scale-102 active:scale-98 disabled:opacity-50 uppercase flex items-center space-x-2"
          >
            <Download className="w-3.5 h-3.5 text-white" />
            <span>{downloadingPdf ? 'GENERATING...' : 'DOWNLOAD SAFETY REPORT'}</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};
