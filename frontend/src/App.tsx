import React, { useState, useEffect, useRef } from 'react';
import { api } from './api';
import { Satellite, DebrisObject, Alert, RiskAnalysisResponse, ManeuverRecommendation } from './types';
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
  latitude: 28.57,
  longitude: -80.64,
  mass_kg: 420.0,
  last_update: new Date().toISOString(),
  is_active: 1
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
    latitude: -12.45,
    longitude: 130.84,
    mass_kg: 580.0,
    last_update: new Date().toISOString(),
    is_active: 0
  }
];

const DEFAULT_DEBRIS: DebrisObject[] = [
  {
    id: 'deb-cosmos-2251',
    name: 'COSMOS 2251 DEB #33789',
    type: 'space debris',
    distance: 1.84,
    velocity: 7.62,
    direction: 'NW',
    size: 0.14,
    threat_level: 'critical',
    risk_level: 'Critical',
    collision_probability: 0.0034,
    time_to_impact: 1122,
    time_to_impact_formatted: '18m 42s',
    radial_distance: 1.84,
    bearing_angle: 42,
    last_seen: new Date().toISOString()
  },
  {
    id: 'deb-fengyun-1c',
    name: 'FENGYUN 1C DEB #29910',
    type: 'space debris',
    distance: 4.21,
    velocity: 7.55,
    direction: 'SE',
    size: 0.08,
    threat_level: 'risky',
    risk_level: 'High',
    collision_probability: 0.0008,
    time_to_impact: 2650,
    time_to_impact_formatted: '44m 10s',
    radial_distance: 4.21,
    bearing_angle: 135,
    last_seen: new Date().toISOString()
  },
  {
    id: 'deb-sl8-rb',
    name: 'SL-8 R/B SPENT STAGE',
    type: 'rocket body',
    distance: 9.65,
    velocity: 7.64,
    direction: 'NE',
    size: 2.4,
    threat_level: 'watchlist',
    risk_level: 'Medium',
    collision_probability: 0.0001,
    time_to_impact: 4320,
    time_to_impact_formatted: '1h 12m',
    radial_distance: 9.65,
    bearing_angle: 210,
    last_seen: new Date().toISOString()
  },
  {
    id: 'deb-iridium-33',
    name: 'IRIDIUM 33 DEB #34012',
    type: 'space debris',
    distance: 14.80,
    velocity: 7.51,
    direction: 'SW',
    size: 0.22,
    threat_level: 'safe',
    risk_level: 'Low',
    collision_probability: 0.00003,
    time_to_impact: 7500,
    time_to_impact_formatted: '2h 05m',
    radial_distance: 14.80,
    bearing_angle: 285,
    last_seen: new Date().toISOString()
  },
  {
    id: 'deb-cz4-frag',
    name: 'CZ-4B DEBRIS FRAGMENT',
    type: 'old satellite fragment',
    distance: 22.40,
    velocity: 7.68,
    direction: 'E',
    size: 0.05,
    threat_level: 'safe',
    risk_level: 'Low',
    collision_probability: 0.00001,
    time_to_impact: 12600,
    time_to_impact_formatted: '3h 30m',
    radial_distance: 22.40,
    bearing_angle: 340,
    last_seen: new Date().toISOString()
  }
];

const DEFAULT_MANEUVER: ManeuverRecommendation = {
  maneuver_id: 'man-1',
  target_object_id: 'deb-cosmos-2251',
  target_object_name: 'COSMOS 2251 DEB #33789',
  direction: 'Prograde',
  altitude_change: 2.1,
  new_altitude: 552.1,
  delta_v: 0.82,
  burn_duration_seconds: 4.5,
  burn_duration_formatted: '4.5s',
  fuel_used_kg: 0.18,
  fuel_percent_used: 0.5,
  reason: 'Autonomous evasion burn to clear COSMOS 2251 fragment below safety threshold.',
  safety_clearance_post_maneuver_km: 8.42,
  post_maneuver_risk: 'Low'
};

const DEFAULT_RISK: RiskAnalysisResponse = {
  satellite_id: 'sat-1',
  overall_risk_level: 'Critical',
  monitored_objects_count: 5,
  counts: {
    critical: 1,
    high: 1,
    medium: 1,
    low: 2
  },
  highest_threat: DEFAULT_DEBRIS[0],
  ai_recommendation: DEFAULT_MANEUVER,
  detailed_analysis: DEFAULT_DEBRIS
};

const DEFAULT_ALERTS: Alert[] = [
  {
    id: 'alt-1',
    timestamp: new Date().toISOString(),
    object_id: 'deb-cosmos-2251',
    object_name: 'COSMOS 2251 DEB #33789',
    risk_level: 'Critical',
    distance: 1.84,
    velocity: 7.62,
    estimated_impact_time: '18m 42s',
    recommended_action: 'Initiate +0.82 m/s Prograde burn at T-12m.',
    status: 'Active'
  },
  {
    id: 'alt-2',
    timestamp: new Date().toISOString(),
    object_id: 'deb-fengyun-1c',
    object_name: 'FENGYUN 1C DEB #29910',
    risk_level: 'High',
    distance: 4.21,
    velocity: 7.55,
    estimated_impact_time: '44m 10s',
    recommended_action: 'Maintain orbital surveillance window.',
    status: 'Active'
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
        type: 'space debris',
        distance: 0.85,
        velocity: 7.63,
        direction: 'NW',
        size: 0.18,
        threat_level: 'critical',
        risk_level: 'Critical',
        collision_probability: 0.0089,
        time_to_impact: 375,
        time_to_impact_formatted: '06m 15s',
        radial_distance: 0.85,
        bearing_angle: 35,
        last_seen: new Date().toISOString()
      };
      setDebrisList(prev => [hazardDebris, ...prev]);
      setSelectedDebris(hazardDebris);
      setRiskAnalysis({
        satellite_id: activeSatellite?.id || 'sat-1',
        overall_risk_level: 'Critical',
        monitored_objects_count: 6,
        counts: { critical: 2, high: 1, medium: 1, low: 2 },
        highest_threat: hazardDebris,
        ai_recommendation: {
          maneuver_id: 'man-hazard',
          target_object_id: hazardDebris.id,
          target_object_name: hazardDebris.name,
          direction: 'Prograde',
          altitude_change: 3.5,
          new_altitude: (activeSatellite?.altitude || 550) + 3.5,
          delta_v: 1.25,
          burn_duration_seconds: 6.8,
          burn_duration_formatted: '6.8s',
          fuel_used_kg: 0.28,
          fuel_percent_used: 0.7,
          reason: 'URGENT: Initiate immediate Prograde evasion burn to clear high risk fragment.',
          safety_clearance_post_maneuver_km: 9.15,
          post_maneuver_risk: 'Low'
        },
        detailed_analysis: [hazardDebris, ...DEFAULT_DEBRIS]
      });
      setAlerts(prev => [
        {
          id: 'alt-hazard-' + Date.now(),
          timestamp: new Date().toISOString(),
          object_id: hazardDebris.id,
          object_name: hazardDebris.name,
          risk_level: 'Critical',
          distance: 0.85,
          velocity: 7.63,
          estimated_impact_time: '06m 15s',
          recommended_action: 'Initiate immediate Prograde evasion burn.',
          status: 'Active'
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
      const fallbackManeuver: ManeuverRecommendation = {
        maneuver_id: 'man-' + Date.now(),
        target_object_id: selectedDebris?.id || DEFAULT_DEBRIS[0].id,
        target_object_name: selectedDebris?.name || DEFAULT_DEBRIS[0].name,
        direction: 'Prograde',
        altitude_change: 2.1,
        new_altitude: (activeSatellite?.altitude || 550) + 2.1,
        delta_v: 0.82,
        burn_duration_seconds: 4.5,
        burn_duration_formatted: '4.5s',
        fuel_used_kg: 0.18,
        fuel_percent_used: 0.5,
        reason: 'Autonomous avoidance maneuver completed nominal. Safe clearance achieved.',
        safety_clearance_post_maneuver_km: 8.42,
        post_maneuver_risk: 'Low'
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
        counts: { critical: 0, high: 0, medium: 1, low: 4 },
        ai_recommendation: fallbackManeuver
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
