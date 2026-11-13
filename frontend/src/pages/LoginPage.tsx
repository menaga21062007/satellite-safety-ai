import React, { useState } from 'react';
import { ShieldCheck, Satellite, Key, Radio, CheckCircle, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [operatorId, setOperatorId] = useState('OPERATOR-SSA-41');
  const [clearanceKey, setClearanceKey] = useState('••••••••••••');
  const [selectedRole, setSelectedRole] = useState('Flight Dynamics Officer');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess();
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl bg-space-900/90 border border-space-700 rounded-2xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Glow corner accents */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyber-blue shadow-[0_0_15px_rgba(0,212,255,0.4)]">
            <Satellite className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-heading tracking-wide text-white">
              SATELLITE SAFETY MONITORING AI
            </h1>
            <p className="text-xs text-slate-400 font-medium tracking-wide">
              Mission Control Access Portal & Space Situational Awareness Console
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-base font-bold font-heading text-cyan-300 uppercase mb-3 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-cyber-green" />
              <span>Operator Authentication</span>
            </h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-medium">
                  Operator Identifier
                </label>
                <input
                  type="text"
                  value={operatorId}
                  onChange={(e) => setOperatorId(e.target.value)}
                  className="w-full bg-space-950 border border-space-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyber-blue"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1 font-medium">
                  Security Clearance Key
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={clearanceKey}
                    onChange={(e) => setClearanceKey(e.target.value)}
                    className="w-full bg-space-950 border border-space-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyber-blue"
                    required
                  />
                  <Key className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1 font-medium">
                  Operational Station Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full bg-space-950 border border-space-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyber-blue"
                >
                  <option>Flight Dynamics Officer (FDO)</option>
                  <option>Space Debris Conjunction Officer</option>
                  <option>Orbital Safety Mission Director</option>
                  <option>Guest Evaluator (Hackathon Demo)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-heading font-bold text-sm tracking-wider py-2.5 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all shadow-lg shadow-cyan-900/40 hover:scale-102"
              >
                <span>ENTER MISSION CONTROL</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="bg-space-950/70 border border-space-800 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="text-sm font-heading text-cyan-400 font-bold uppercase mb-3 flex items-center space-x-2 tracking-wider">
                <Radio className="w-4 h-4 text-cyber-blue animate-pulse" />
                <span>Station Telemetry Readiness</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-cyber-green shrink-0" />
                  <span>Ground Radar Tracking: Online (1.5s ping)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-cyber-green shrink-0" />
                  <span>Foster B-Plane AI Model: Armed</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-cyber-green shrink-0" />
                  <span>Propulsion System: Thrusters Armed</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-cyber-green shrink-0" />
                  <span>Automated Safety PDF Audit: Ready</span>
                </li>
              </ul>
            </div>

            <div className="mt-4 pt-3 border-t border-space-800 text-[11px] text-slate-400">
              <span className="text-amber-400 font-semibold">Hackathon Quick Demo:</span> Click the button above to jump directly into the live mission dashboard with active simulated collision hazards.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
