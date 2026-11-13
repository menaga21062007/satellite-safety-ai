import React, { useState, useEffect, useRef } from 'react';
import { api } from './api';
import { Satellite, DebrisObject, Alert, RiskAnalysisResponse } from './types';
import { Navbar } from './components/Navbar';
import { Sidebar, PageId } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { DebrisPage } from './pages/DebrisPage';
import { RiskAnalysisPage } from './pages/RiskAnalysisPage';
import { ManeuverPage } from './pages/ManeuverPage';

const DEFAULT_SATELLITE: Satellite = {
  id: 'sat-1',
  name: 'AstroVigil-1 (Earth Observer)',
  altitude: 550.0,
  velocity: 7.59,
  inclination: 97.5,
  fuel_percent: 92.4,
  battery_percent: 98.2,
  status: 'Operational',
  current_orbit: 'Sun-Synchronous LEO (550 km)',
  last_contact: new Date().toISOString()
};

const DEFAULT_SATELLITES: Satellite[] = [
  DEFAULT_SATELLITE,
  {
    id: 'sat-2',
    name: 'AstroVigil-2 (Sentinel Radar)',
    altitude: 720.0,
    velocity: 7.48,
    inclination: 98.2,
    fuel_percent: 88.0,
    battery_percent: 95.5,
    status: 'Operational',
    current_orbit: 'Polar LEO (720 km)',
    last_contact: new Date().toISOString()
  }
];

const DEFAULT_DEBRIS: DebrisObject[] = [
  {
    id: 'deb-cosmos-2251',
    name: 'COSMOS 2251 DEB #33789',
    altitude: 551.4,
    velocity: 7.62,
    miss_distance: 1.84,
    collision_probability: 0.0034,
    size: '14 cm',
    threat_level: 'Critical',
    time_to_closest_approach: '18m 42s',
    rcs: 0.12,
    source: 'NORAD SSA Catalog'
  },
  {
    id: 'deb-fengyun-1c',
    name: 'FENGYUN 1C DEB #29910',
    altitude: 553.8,
    velocity: 7.55,
    miss_distance: 4.21,
    collision_probability: 0.0008,
    size: '8 cm',
    threat_level: 'High',
    time_to_closest_approach: '44m 10s',
    rcs: 0.08,
    source: 'NORAD SSA Catalog'
  },
  {
    id: 'deb-sl8-rb',
    name: 'SL-8 R/B SPENT STAGE',
    altitude: 546.2,
    velocity: 7.64,
    miss_distance: 9.65,
    collision_probability: 0.0001,
    size: '2.4 m',
    threat_level: 'Medium',
    time_to_closest_approach: '1h 12m',
    rcs: 1.85,
    source: 'Space-Track Catalog'
  },
  {
    id: 'deb-iridium-33',
    name: 'IRIDIUM 33 DEB #34012',
    altitude: 558.1,
    velocity: 7.51,
    miss_distance: 14.80,
    collision_probability: 0.00003,
    size: '22 cm',
    threat_level: 'Low',
    time_to_closest_approach: '2h 05m',
    rcs: 0.25,
    source: 'NORAD SSA Catalog'
  },
  {
    id: 'deb-cz4-frag',
    name: 'CZ-4B DEBRIS FRAGMENT',
    altitude: 541.9,
    velocity: 7.68,
    miss_distance: 22.40,
    collision_probability: 0.00001,
    size: '5 cm',
    threat_level: 'Nominal',
    time_to_closest_approach: '3h 30m',
    rcs: 0.04,
    source: 'Space-Track Catalog'
  }
];

const DEFAULT_RISK: RiskAnalysisResponse = {
  overall_risk_level: 'High',
  max_collision_probability: 0.0034,
  min_miss_distance: 1.84,
  highest_threat: DEFAULT_DEBRIS[0],
  recommendation: 'Autonomous Prograde Thruster Burn (+0.82 m/s delta-V) at T-12m to expand miss distance to 8.4 km.',
  conjunction_count: 5
};

const DEFAULT_ALERTS: Alert[] = [
  {
    id: 'alt-1',
    satellite_id: 'sat-1',
    debris_id: 'deb-cosmos-2251',
    risk_level: 'Critical',
    message: 'CRITICAL CONJUNCTION: COSMOS 2251 DEB #33789 miss distance 1.84 km below 2.0 km threshold.',
    status: 'Active',
    created_at: new Date().toISOString()
  },
  {
    id: 'alt-2',
    satellite_id: 'sat-1',
    debris_id: 'deb-fengyun-1c',
    risk_level: 'High',
    message: 'High collision risk detected with FENGYUN 1C fragment. Conjunction window active.',
    status: 'Active',
    created_at: new Date().toISOString()
  }
];

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);

  const [activeSatellite, setActiveSatellite] = useState<Satellite | null>(DEFAULT_SATELLITE);
  const [satellites, setSatellites] = useState<Satellite[]>(DEFAULT_SATELLITES);
  const [debrisList, setDebrisList] = useState<DebrisObject[]>(DEFAULT_DEBRIS);
  const [riskAnalysis, setRiskAnalysis] = useState<RiskAnalysisResponse | null>(DEFAULT_RISK);
  const [alerts, setAlerts] = useState<Alert[]>(DEFAULT_ALERTS);
  const [selectedDebris, setSelectedDebris] = useState<DebrisObject | null>(null);

  const [simulationRunning, setSimulationRunning] = useState<boolean>(true);
  const [isExecutingManeuver, setIsExecutingManeuver] = useState<boolean>(false);
  const [maneuverResult, setManeuverResult] = useState<any | null>(null);

  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const lastAlertCountRef = useRef<number>(DEFAULT_ALERTS.length);

  // Automatically transition away from removed routes
  useEffect(() => {
    if ((currentPage as string) === 'alerts' || (currentPage as string) === 'reports' || (currentPage as string) === 'login') {
      setCurrentPage('dashboard');
    }
  }, [currentPage]);

  // Synthesize alarm sound using HTML5 Web Audio API
  const playAlertSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.3); // A4

      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch (e) {
      // AudioContext not allowed before user interaction
    }
  };

  // Fetch initial telemetry
  const fetchTelemetry = async () => {
    try {
      const [sat, sats, deb, risk, alt] = await Promise.all([
        api.getSatellite().catch(() => null),
        api.getSatellites().catch(() => []),
        api.getDebris().catch(() => []),
        api.getRiskAnalysis().catch(() => null),
        api.getAlerts().catch(() => [])
      ]);

      if (sat) setActiveSatellite(sat);
      if (sats && sats.length) setSatellites(sats);
      if (deb && deb.length) setDebrisList(deb);
      if (risk) setRiskAnalysis(risk);
      if (alt && alt.length) {
        setAlerts(alt);
        // If new critical alert arrived, play sound
        const activeCritical = alt.filter((a: Alert) => a.status === 'Active' && (a.risk_level === 'Critical' || a.risk_level === 'High')).length;
        if (activeCritical > lastAlertCountRef.current) {
          playAlertSound();
        }
        lastAlertCountRef.current = activeCritical;
      }
    } catch (err) {
      console.error('Telemetry fetch error:', err);
    }
  };

  // Poll telemetry every 1.5s
  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 1500);
    return () => clearInterval(interval);
  }, [soundEnabled]);

  // Actions
  const handleSelectSatellite = async (id: string) => {
    try {
      const res = await api.selectSatellite(id);
      setActiveSatellite(res.satellite);
      setSelectedDebris(null);
      await fetchTelemetry();
    } catch (e) {
      const found = satellites.find(s => s.id === id);
      if (found) setActiveSatellite(found);
      setSelectedDebris(null);
    }
  };

  const handleToggleSimulation = async () => {
    try {
      if (simulationRunning) {
        await api.stopSimulation();
        setSimulationRunning(false);
      } else {
        await api.startSimulation();
        setSimulationRunning(true);
      }
    } catch (e) {
      setSimulationRunning(!simulationRunning);
    }
  };

  const handleTriggerHazard = async () => {
    try {
      await api.triggerHazard();
      await fetchTelemetry();
    } catch (e) {
      const hazardDebris: DebrisObject = {
        id: 'deb-hazard-injected',
        name: 'COSMOS 2251 HIGH RISK FRAGMENT',
        altitude: 550.2,
        velocity: 7.63,
        miss_distance: 0.85,
        collision_probability: 0.0089,
        size: '18 cm',
        threat_level: 'Critical',
        time_to_closest_approach: '06m 15s',
        rcs: 0.19,
        source: 'Live Conjunction Alert'
      };
      setDebrisList(prev => [hazardDebris, ...prev]);
      setSelectedDebris(hazardDebris);
      setRiskAnalysis({
        overall_risk_level: 'Critical',
        max_collision_probability: 0.0089,
        min_miss_distance: 0.85,
        highest_threat: hazardDebris,
        recommendation: 'URGENT: Initiate immediate Prograde evasion burn (+1.25 m/s delta-V).',
        conjunction_count: 6
      });
      setAlerts(prev => [
        {
          id: 'alt-hazard-' + Date.now(),
          satellite_id: 'sat-1',
          debris_id: 'deb-hazard-injected',
          risk_level: 'Critical',
          message: 'CRITICAL INCOMING HAZARD: Injected conjunction trajectory under 1.0 km miss distance!',
          status: 'Active',
          created_at: new Date().toISOString()
        },
        ...prev
      ]);
      playAlertSound();
    }
    if (currentPage === 'login') {
      setCurrentPage('dashboard');
    }
  };

  const handleResetSimulation = async () => {
    try {
      await api.resetSimulation();
      setManeuverResult(null);
      await fetchTelemetry();
    } catch (e) {
      setManeuverResult(null);
      setActiveSatellite(DEFAULT_SATELLITE);
      setDebrisList(DEFAULT_DEBRIS);
      setRiskAnalysis(DEFAULT_RISK);
      setAlerts(DEFAULT_ALERTS);
      setSelectedDebris(null);
    }
  };

  const handleExecuteManeuver = async () => {
    if (isExecutingManeuver) return;
    setIsExecutingManeuver(true);
    try {
      const res = await api.executeManeuver();
      setManeuverResult(res.maneuver);
      await fetchTelemetry();
    } catch (e) {
      const fallbackManeuver = {
        direction: 'Prograde',
        delta_v: 0.82,
        duration_seconds: 4.5,
        projected_clearance_km: 8.42,
        propellant_used_kg: 0.18,
        risk_reduction: '99.4%',
        new_altitude_km: 552.1,
        executed_at: new Date().toISOString()
      };
      setManeuverResult(fallbackManeuver);
      setActiveSatellite(prev => prev ? {
        ...prev,
        altitude: +(prev.altitude + 2.1).toFixed(1),
        fuel_percent: +(prev.fuel_percent - 0.5).toFixed(1)
      } : prev);
      setRiskAnalysis(prev => prev ? {
        ...prev,
        overall_risk_level: 'Low',
        max_collision_probability: 0.00002,
        min_miss_distance: 8.42,
        recommendation: 'Autonomous avoidance maneuver completed nominal. Safe clearance achieved.'
      } : prev);
      setAlerts(prev => prev.map(a => ({ ...a, status: 'Resolved' })));
    } finally {
      setIsExecutingManeuver(false);
    }
  };

  const handleAcknowledgeAlert = async (id: string) => {
    try {
      await api.acknowledgeAlert(id);
      await fetchTelemetry();
    } catch (e) {
      console.error(e);
    }
  };

  const handleResolveAlert = async (id: string) => {
    try {
      await api.resolveAlert(id);
      await fetchTelemetry();
    } catch (e) {
      console.error(e);
    }
  };

  const activeAlertCount = alerts.filter(a => a.status === 'Active' && (a.risk_level === 'Critical' || a.risk_level === 'High')).length;

  return (
    <div className="min-h-screen bg-[#f5f2eb] text-[#22281e] flex flex-col font-sans relative overflow-x-hidden selection:bg-[#597445] selection:text-white">
      {/* Soft Ambient Organic Lighting: Warm Sand, Moss Green & Terracotta Glow */}
      <div className="pointer-events-none fixed -top-48 left-1/3 w-[820px] h-[720px] bg-[#597445]/10 rounded-full blur-[180px] z-0" />
      <div className="pointer-events-none fixed top-1/4 -left-40 w-[680px] h-[680px] bg-[#be7b38]/10 rounded-full blur-[160px] z-0" />
      <div className="pointer-events-none fixed -bottom-36 left-1/4 w-[920px] h-[450px] bg-gradient-to-r from-[#be7b38]/10 via-[#597445]/10 to-[#eae4d8]/25 rounded-full blur-[170px] z-0" />

      {/* Top Navigation Bar */}
      <Navbar
        activeSatellite={activeSatellite}
        satellites={satellites}
        onSelectSatellite={handleSelectSatellite}
        simulationRunning={simulationRunning}
        onToggleSimulation={handleToggleSimulation}
        onTriggerHazard={handleTriggerHazard}
        onResetSimulation={handleResetSimulation}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
      />

      {/* Main Body */}
      <div className="flex flex-1 z-10 relative">
        {/* Left Navigation Sidebar */}
        <Sidebar
          currentPage={currentPage}
          onNavigate={(p) => setCurrentPage(p)}
          activeAlertCount={activeAlertCount}
          debrisCount={debrisList.length}
        />

        {/* Dynamic Page Router */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto max-h-[calc(100vh-64px)]">
          {currentPage === 'dashboard' && (
            <DashboardPage
              satellite={activeSatellite}
              debrisList={debrisList}
              riskAnalysis={riskAnalysis}
              alerts={alerts}
              selectedDebris={selectedDebris}
              onSelectDebris={(d) => setSelectedDebris(d)}
              onExecuteManeuver={handleExecuteManeuver}
              isExecutingManeuver={isExecutingManeuver}
              maneuverResult={maneuverResult}
              onNavigateToDebris={() => setCurrentPage('debris')}
              onNavigateToManeuver={() => setCurrentPage('maneuver')}
            />
          )}

          {currentPage === 'debris' && (
            <DebrisPage
              debrisList={debrisList}
              selectedDebris={selectedDebris}
              onSelectDebris={(d) => setSelectedDebris(d)}
              onNavigateToRisk={() => setCurrentPage('risk')}
            />
          )}

          {currentPage === 'risk' && (
            <RiskAnalysisPage
              satellite={activeSatellite}
              debrisList={debrisList}
              riskAnalysis={riskAnalysis}
              onNavigateToManeuver={() => setCurrentPage('maneuver')}
            />
          )}

          {currentPage === 'maneuver' && (
            <ManeuverPage
              satellite={activeSatellite}
              riskAnalysis={riskAnalysis}
              onExecuteManeuver={handleExecuteManeuver}
              isExecutingManeuver={isExecutingManeuver}
              maneuverResult={maneuverResult}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
