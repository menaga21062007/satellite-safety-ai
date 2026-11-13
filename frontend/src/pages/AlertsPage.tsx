import React, { useState } from 'react';
import { Alert } from '../types';
import { 
  BellRing, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  ShieldAlert, 
  Filter, 
  CheckCheck,
  Check
} from 'lucide-react';

interface AlertsPageProps {
  alerts: Alert[];
  onAcknowledgeAlert: (id: string) => void;
  onResolveAlert: (id: string) => void;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({
  alerts,
  onAcknowledgeAlert,
  onResolveAlert
}) => {
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Acknowledged' | 'Resolved'>('All');
  const [riskFilter, setRiskFilter] = useState<string>('All');

  const filteredAlerts = alerts.filter((a) => {
    const matchStatus = statusFilter === 'All' || a.status === statusFilter;
    const matchRisk = riskFilter === 'All' || a.risk_level === riskFilter;
    return matchStatus && matchRisk;
  });

  return (
    <div className="space-y-4 font-sans">
      {/* Header & Filter Controls */}
      <div className="hud-card rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <BellRing className="w-5 h-5 text-cyber-red animate-pulse" />
            <h1 className="hud-panel-header text-sm text-slate-100">
              Conjunction Alerts & Incident History
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time critical encounter warning logs and operator audit timeline
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2 text-xs">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-space-950 border border-space-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyber-blue"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Alerts</option>
            <option value="Acknowledged">Acknowledged</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-space-950 border border-space-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyber-blue"
          >
            <option value="All">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Alerts Timeline List */}
      <div className="space-y-3">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alt) => {
            const isCrit = alt.risk_level === 'Critical' || alt.risk_level === 'High';
            const isResolved = alt.status === 'Resolved';
            const isAck = alt.status === 'Acknowledged';

            return (
              <div
                key={alt.id}
                className={`hud-card rounded-xl p-4 transition-all border-l-4 ${
                  isResolved
                    ? 'border-l-emerald-500 bg-space-900/60'
                    : isCrit
                    ? 'border-l-red-500 bg-red-950/20 shadow-[0_0_15px_rgba(239,68,68,0.15)]'
                    : 'border-l-amber-500'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-space-800">
                  <div className="flex items-center space-x-3">
                    <span
                      className={`p-2 rounded-lg ${
                        isResolved
                          ? 'bg-emerald-950 text-emerald-400'
                          : isCrit
                          ? 'bg-red-950 text-red-400 animate-pulse'
                          : 'bg-amber-950 text-amber-400'
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4" />
                    </span>
                    <div>
                      <div className="font-bold text-white text-sm flex items-center space-x-2">
                        <span>{alt.object_name}</span>
                        <span className="text-[10px] text-slate-400">({alt.object_id})</span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center space-x-2 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>Logged: {new Date(alt.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Risk Badge */}
                    <span
                      className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase ${
                        alt.risk_level === 'Critical'
                          ? 'bg-red-950 text-red-300 border border-red-700'
                          : alt.risk_level === 'High'
                          ? 'bg-red-950/70 text-red-400 border border-red-800'
                          : alt.risk_level === 'Medium'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {alt.risk_level} Risk
                    </span>

                    {/* Status Badge */}
                    <span
                      className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase ${
                        isResolved
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                          : isAck
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                          : 'bg-red-950 text-red-200 border border-red-800 animate-pulse'
                      }`}
                    >
                      {alt.status}
                    </span>
                  </div>
                </div>

                {/* Telemetry info row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-3 text-xs">
                  <div className="p-2 bg-space-950 rounded border border-space-800">
                    <div className="text-[10px] text-slate-400 uppercase">Proximity Distance</div>
                    <div className="font-bold text-white text-sm">{alt.distance} km</div>
                  </div>
                  <div className="p-2 bg-space-950 rounded border border-space-800">
                    <div className="text-[10px] text-slate-400 uppercase">Relative Velocity</div>
                    <div className="font-bold text-white text-sm">{alt.velocity} km/s</div>
                  </div>
                  <div className="p-2 bg-space-950 rounded border border-space-800">
                    <div className="text-[10px] text-slate-400 uppercase">Estimated Impact (TCA)</div>
                    <div className="font-bold text-red-400 text-sm">{alt.estimated_impact_time}</div>
                  </div>
                  <div className="p-2 bg-space-950 rounded border border-space-800">
                    <div className="text-[10px] text-slate-400 uppercase">Alert ID</div>
                    <div className="font-bold text-cyan-300 text-sm">{alt.id}</div>
                  </div>
                </div>

                {/* Recommended Action & Operator Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-3 mt-3 border-t border-space-800 text-xs">
                  <div className="text-slate-300 text-xs">
                    <span className="text-slate-400 uppercase font-semibold">Recommended Action: </span>
                    <span className="font-semibold text-white">{alt.recommended_action}</span>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {!isResolved && !isAck && (
                      <button
                        onClick={() => onAcknowledgeAlert(alt.id)}
                        className="px-3 py-1.5 rounded-lg bg-space-850 hover:bg-space-700 text-cyan-300 border border-space-700 text-xs flex items-center space-x-1.5 transition-all"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Acknowledge</span>
                      </button>
                    )}

                    {!isResolved && (
                      <button
                        onClick={() => onResolveAlert(alt.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700 text-xs flex items-center space-x-1.5 transition-all"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Mark Resolved</span>
                      </button>
                    )}

                    {isResolved && (
                      <span className="text-emerald-400 text-xs flex items-center space-x-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Conjunction Mitigated</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="hud-card rounded-xl p-12 text-center text-slate-400 text-xs">
            <CheckCircle className="w-10 h-10 text-cyber-green mx-auto mb-2" />
            <div>No alerts matching the selected filters.</div>
          </div>
        )}
      </div>
    </div>
  );
};
