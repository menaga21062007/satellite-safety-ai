import React, { useState } from 'react';
import { Satellite, DebrisObject, Alert, RiskAnalysisResponse } from '../types';
import { api } from '../api';
import { 
  FileText, 
  Download, 
  CheckCircle2, 
  Printer, 
  ShieldCheck, 
  Clock, 
  ExternalLink 
} from 'lucide-react';

interface ReportsPageProps {
  satellite: Satellite | null;
  debrisList: DebrisObject[];
  alerts: Alert[];
  riskAnalysis: RiskAnalysisResponse | null;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({
  satellite,
  debrisList,
  alerts,
  riskAnalysis
}) => {
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const handleDownloadPdf = () => {
    setDownloadingPdf(true);
    window.open(api.getPdfReportUrl(), '_blank');
    setTimeout(() => setDownloadingPdf(false), 2000);
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Top Header & Download Action Buttons */}
      <div className="hud-card rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-cyber-blue" />
            <h1 className="hud-panel-header text-sm text-slate-100">
              Satellite Safety & Conjunction Audit Reports
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Aerospace-standard mission safety audit reports exportable in high-resolution PDF
          </p>
        </div>

        {/* Download Buttons */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          {/* Download PDF */}
          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="flex-1 md:flex-none bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-heading font-bold text-xs tracking-wider py-3 px-6 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-red-950/40 hover:scale-102 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{downloadingPdf ? 'GENERATING REPORT...' : 'DOWNLOAD SAFETY REPORT'}</span>
          </button>
        </div>
      </div>

      {/* Report Document Preview Sheet */}
      <div className="hud-card rounded-xl p-6 bg-space-900/90 border border-space-700 shadow-2xl space-y-6">
        {/* Document Header */}
        <div className="p-4 rounded-lg bg-space-950 border border-space-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">
              OFFICIAL SPACE SITUATIONAL AWARENESS (SSA) SAFETY AUDIT
            </div>
            <div className="text-lg font-bold text-white mt-1">
              CONJUNCTION RISK ASSESSMENT REPORT
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Target Asset: <span className="text-white font-bold">{satellite?.name} ({satellite?.id})</span>
            </div>
          </div>

          <div className="text-xs text-right space-y-1">
            <div className="text-slate-400">Report Date: <span className="text-white font-semibold">{new Date().toUTCString()}</span></div>
            <div className="text-slate-400">Security: <span className="text-cyan-400 font-semibold">RESTRICTED SSA LEVEL-4</span></div>
            <div className="text-slate-400">Status: <span className="text-emerald-400 font-bold">AUDIT READY</span></div>
          </div>
        </div>

        {/* 1. Satellite Details */}
        <div>
          <div className="text-xs font-bold text-cyber-blue uppercase tracking-wider mb-2 pb-1 border-b border-space-800">
            1. Active Satellite Telemetry Snapshot
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-space-950 rounded-lg border border-space-800">
              <div className="text-slate-400 text-[10px]">Altitude</div>
              <div className="font-bold text-white text-sm">{satellite?.altitude} km</div>
            </div>
            <div className="p-3 bg-space-950 rounded-lg border border-space-800">
              <div className="text-slate-400 text-[10px]">Orbital Velocity</div>
              <div className="font-bold text-white text-sm">{satellite?.velocity} km/s</div>
            </div>
            <div className="p-3 bg-space-950 rounded-lg border border-space-800">
              <div className="text-slate-400 text-[10px]">Current Orbit Profile</div>
              <div className="font-bold text-white text-sm">{satellite?.current_orbit}</div>
            </div>
            <div className="p-3 bg-space-950 rounded-lg border border-space-800">
              <div className="text-slate-400 text-[10px]">Propellant Remaining</div>
              <div className="font-bold text-amber-400 text-sm">{satellite?.fuel_percent}% Hydrazine</div>
            </div>
          </div>
        </div>

        {/* 2. Detected Objects & Risk Analysis */}
        <div>
          <div className="text-xs font-bold text-cyber-blue uppercase tracking-wider mb-2 pb-1 border-b border-space-800">
            2. Monitored Orbital Debris & Conjunction Forecast
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-space-800 text-[10px] uppercase">
                  <th className="pb-2">Object ID</th>
                  <th className="pb-2">Name & Classification</th>
                  <th className="pb-2">Distance</th>
                  <th className="pb-2">Rel Speed</th>
                  <th className="pb-2">Size</th>
                  <th className="pb-2">Collision Prob</th>
                  <th className="pb-2">Impact ETA</th>
                  <th className="pb-2">Risk Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-space-800/60">
                {debrisList.map((d) => (
                  <tr key={d.id} className="text-slate-300">
                    <td className="py-2.5 font-bold text-white">{d.id}</td>
                    <td className="py-2.5">
                      <div>{d.name}</div>
                      <div className="text-[10px] text-slate-500 capitalize">{d.type}</div>
                    </td>
                    <td className="py-2.5 font-semibold text-white">{d.distance} km</td>
                    <td className="py-2.5">{d.velocity} km/s</td>
                    <td className="py-2.5">{d.size} m</td>
                    <td className="py-2.5 font-bold text-cyan-300">{d.collision_probability}%</td>
                    <td className="py-2.5">{d.time_to_impact_formatted}</td>
                    <td className="py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          d.risk_level === 'Critical'
                            ? 'bg-red-950 text-red-300 border border-red-800'
                            : d.risk_level === 'High'
                            ? 'bg-red-950/70 text-red-400 border border-red-900'
                            : d.risk_level === 'Medium'
                            ? 'bg-amber-950 text-amber-300 border border-amber-900'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-900'
                        }`}
                      >
                        {d.risk_level}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Recommended Maneuvers */}
        <div>
          <div className="text-xs font-bold text-cyber-blue uppercase tracking-wider mb-2 pb-1 border-b border-space-800">
            3. AI Recommended Collision Avoidance Maneuver (CAM)
          </div>
          {riskAnalysis?.ai_recommendation ? (
            <div className="p-4 bg-space-950 rounded-lg border border-space-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Target Hazard:</span>
                <span className="font-bold text-red-400">{riskAnalysis.ai_recommendation.target_object_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Burn Direction:</span>
                <span className="font-bold text-cyber-cyan">{riskAnalysis.ai_recommendation.direction}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Altitude Boost (ΔH):</span>
                <span className="font-bold text-emerald-400">+{riskAnalysis.ai_recommendation.altitude_change} km</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Delta-V & Estimated Burn:</span>
                <span className="font-bold text-white">{riskAnalysis.ai_recommendation.delta_v} m/s ({riskAnalysis.ai_recommendation.burn_duration_formatted})</span>
              </div>
              <div className="p-2 bg-space-900 rounded border border-space-800 text-[11px] text-slate-300">
                {riskAnalysis.ai_recommendation.reason}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-space-950 rounded-lg border border-space-800 text-xs text-slate-400">
              No immediate maneuvers currently recommended.
            </div>
          )}
        </div>

        {/* 4. Recent Alerts */}
        <div>
          <div className="text-xs font-bold text-cyber-blue uppercase tracking-wider mb-2 pb-1 border-b border-space-800">
            4. Recent Conjunction Alerts History
          </div>
          <div className="space-y-2">
            {alerts.slice(0, 4).map((a) => (
              <div key={a.id} className="p-2.5 bg-space-950 rounded-lg border border-space-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white">{a.object_name}</span>
                  <span className="text-slate-400 text-[11px] ml-2">({a.distance} km, ETA: {a.estimated_impact_time})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-slate-400">{new Date(a.timestamp).toLocaleTimeString()}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-space-900 border border-space-700 text-cyan-300">
                    {a.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
