import React, { useState, useEffect, useRef } from 'react';
import { api } from './api';
import { Satellite, DebrisObject, Alert, RiskAnalysisResponse, ManeuverRecommendation } from './types';
import { Navbar } from './components/Navbar';
import { Sidebar, PageId } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { DebrisPage } from './pages/DebrisPage';
import { RiskAnalysisPage } from './pages/RiskAnalysisPage';
import { ManeuverPage } from './pages/ManeuverPage';

const DEFAULT_SATELLITES: Satellite[] = [
  {
    id: 'SAT-ALPHA-1',
    name: 'AstroVigil-1 (Earth Observer)',
    altitude: 550.0,
    velocity: 7.66,
    inclination: 97.4,
    fuel_percent: 88.5,
    battery_percent: 94.2,
    status: 'Operational',
    current_orbit: 'Sun-Synchronous LEO (550 km)',
    latitude: 28.5729,
    longitude: -80.6490,
    mass_kg: 850.0,
    last_update: new Date().toISOString(),
    is_active: 1
  },
  {
    id: 'SAT-BRAVO-2',
    name: 'AeroComms-8 (LEO Constellation)',
    altitude: 620.0,
    velocity: 7.55,
    inclination: 53.0,
    fuel_percent: 74.0,
    battery_percent: 91.0,
    status: 'Operational',
    current_orbit: 'Circular LEO (620 km)',
    latitude: -12.45,
    longitude: 45.22,
    mass_kg: 620.0,
    last_update: new Date().toISOString(),
    is_active: 0
  },
  {
    id: 'SAT-CHARLIE-3',
    name: 'TerraScan Hyperspectral 4',
    altitude: 705.0,
    velocity: 7.51,
    inclination: 98.2,
    fuel_percent: 92.8,
    battery_percent: 98.0,
    status: 'Standby Orbit',
    current_orbit: 'Polar LEO (705 km)',
    latitude: 64.12,
    longitude: -21.90,
    mass_kg: 1200.0,
    last_update: new Date().toISOString(),
    is_active: 0
  }
];

const SATELLITE_DEBRIS_CATALOG: Record<string, DebrisObject[]> = {
  'SAT-ALPHA-1': [
    {
      id: 'DEB-2026-9041',
      name: 'COSMOS-1408 Frag #4192',
      type: 'space debris',
      distance: 18.4,
      velocity: 7.82,
      direction: 'Prograde Crossing (Az 045°)',
      size: 1.8,
      threat_level: 'risky',
      risk_level: 'High',
      collision_probability: 74.8,
      time_to_impact: 380,
      time_to_impact_formatted: '06m 20s',
      radial_distance: 18.4,
      bearing_angle: 45.0,
      last_seen: new Date().toISOString()
    },
    {
      id: 'DEB-2026-8812',
      name: 'SL-16 Rocket Body Fragment',
      type: 'rocket body',
      distance: 42.1,
      velocity: 7.45,
      direction: 'Retrograde Incline (Az 160°)',
      size: 4.2,
      threat_level: 'watchlist',
      risk_level: 'Medium',
      collision_probability: 18.2,
      time_to_impact: 1450,
      time_to_impact_formatted: '24m 10s',
      radial_distance: 42.1,
      bearing_angle: 160.0,
      last_seen: new Date().toISOString()
    },
    {
      id: 'DEB-2026-5509',
      name: 'Defunct Microsat Sensor Mast',
      type: 'old satellite fragment',
      distance: 78.5,
      velocity: 7.21,
      direction: 'Co-orbital Lead (Az 310°)',
      size: 0.8,
      threat_level: 'safe',
      risk_level: 'Low',
      collision_probability: 2.1,
      time_to_impact: 4200,
      time_to_impact_formatted: '01h 10m',
      radial_distance: 78.5,
      bearing_angle: 310.0,
      last_seen: new Date().toISOString()
    },
    {
      id: 'DEB-2026-1102',
      name: 'Uncataloged Radar Blip #09',
      type: 'unknown object',
      distance: 95.0,
      velocity: 8.10,
      direction: 'Hyperbolic Flyby (Az 220°)',
      size: 0.4,
      threat_level: 'safe',
      risk_level: 'Low',
      collision_probability: 0.8,
      time_to_impact: 6500,
      time_to_impact_formatted: '01h 48m',
      radial_distance: 95.0,
      bearing_angle: 220.0,
      last_seen: new Date().toISOString()
    },
    {
      id: 'DEB-2026-3022',
      name: 'Fregat Upper Stage Debris',
      type: 'rocket body',
      distance: 61.2,
      velocity: 7.60,
      direction: 'Descending Node (Az 085°)',
      size: 2.6,
      threat_level: 'safe',
      risk_level: 'Low',
      collision_probability: 4.5,
      time_to_impact: 2900,
      time_to_impact_formatted: '48m 20s',
      radial_distance: 61.2,
      bearing_angle: 85.0,
      last_seen: new Date().toISOString()
    }
  ],
  'SAT-BRAVO-2': [
    {
      id: 'DEB-2026-7731',
      name: 'IRIDIUM-33 Collision Debris #882',
      type: 'space debris',
      distance: 8.4,
      velocity: 7.91,
      direction: 'Crossing Node (Az 025°)',
      size: 2.1,
      threat_level: 'critical',
      risk_level: 'Critical',
      collision_probability: 89.4,
      time_to_impact: 165,
      time_to_impact_formatted: '02m 45s',
      radial_distance: 8.4,
      bearing_angle: 25.0,
      last_seen: new Date().toISOString()
    },
    {
      id: 'DEB-2026-6219',
      name: 'Delta II Second Stage Shroud',
      type: 'rocket body',
      distance: 24.6,
      velocity: 7.58,
      direction: 'Prograde Lead (Az 115°)',
      size: 3.8,
      threat_level: 'risky',
      risk_level: 'High',
      collision_probability: 48.7,
      time_to_impact: 495,
      time_to_impact_formatted: '08m 15s',
      radial_distance: 24.6,
      bearing_angle: 115.0,
      last_seen: new Date().toISOString()
    },
    {
      id: 'DEB-2026-4482',
      name: 'Globalstar Solar Array Boom',
      type: 'old satellite fragment',
      distance: 49.3,
      velocity: 7.39,
      direction: 'Retrograde Crossing (Az 205°)',
      size: 1.4,
      threat_level: 'watchlist',
      risk_level: 'Medium',
      collision_probability: 15.6,
      time_to_impact: 1710,
      time_to_impact_formatted: '28m 30s',
      radial_distance: 49.3,
      bearing_angle: 205.0,
      last_seen: new Date().toISOString()
    },
    {
      id: 'DEB-2026-3190',
      name: 'Orbcomm FM Defunct Bus',
      type: 'space debris',
      distance: 68.7,
      velocity: 7.42,
      direction: 'In-plane Trail (Az 280°)',
      size: 1.9,
      threat_level: 'safe',
      risk_level: 'Low',
      collision_probability: 3.2,
      time_to_impact: 3130,
      time_to_impact_formatted: '52m 10s',
      radial_distance: 68.7,
      bearing_angle: 280.0,
      last_seen: new Date().toISOString()
    },
    {
      id: 'DEB-2026-2005',
      name: 'Titan-3C Transtage Debris',
      type: 'rocket body',
      distance: 84.1,
      velocity: 7.18,
      direction: 'Ascending Node (Az 340°)',
      size: 3.2,
      threat_level: 'safe',
      risk_level: 'Low',
      collision_probability: 0.8,
      time_to_impact: 4920,
      time_to_impact_formatted: '01h 22m',
      radial_distance: 84.1,
      bearing_angle: 340.0,
      last_seen: new Date().toISOString()
    }
  ],
  'SAT-CHARLIE-3': [
    {
      id: 'DEB-2026-9902',
      name: 'Envisat Auxiliary Mast Shard',
      type: 'space debris',
      distance: 5.8,
      velocity: 8.15,
      direction: 'Polar Cross-track (Az 015°)',
      size: 1.6,
      threat_level: 'critical',
      risk_level: 'Critical',
      collision_probability: 96.4,
      time_to_impact: 95,
      time_to_impact_formatted: '01m 35s',
      radial_distance: 5.8,
      bearing_angle: 15.0,
      last_seen: new Date().toISOString()
    },
    {
      id: 'DEB-2026-8430',
      name: 'NOAA-16 Battery Rupture Cluster',
      type: 'space debris',
      distance: 19.8,
      velocity: 7.74,
      direction: 'Retrograde Node (Az 120°)',
      size: 1.1,
      threat_level: 'risky',
      risk_level: 'High',
      collision_probability: 62.1,
      time_to_impact: 460,
      time_to_impact_formatted: '07m 40s',
      radial_distance: 19.8,
      bearing_angle: 120.0,
      last_seen: new Date().toISOString()
    },
    {
      id: 'DEB-2026-6701',
      name: 'CZ-2C Spent Rocket Stage #44',
      type: 'rocket body',
      distance: 38.2,
      velocity: 7.62,
      direction: 'Descending Incline (Az 195°)',
      size: 3.5,
      threat_level: 'watchlist',
      risk_level: 'Medium',
      collision_probability: 22.4,
      time_to_impact: 1190,
      time_to_impact_formatted: '19m 50s',
      radial_distance: 38.2,
      bearing_angle: 195.0,
      last_seen: new Date().toISOString()
    },
    {
      id: 'DEB-2026-4011',
      name: 'USA-193 Anti-Sat Fragment #11',
      type: 'old satellite fragment',
      distance: 72.4,
      velocity: 7.40,
      direction: 'Co-orbital Lag (Az 265°)',
      size: 0.9,
      threat_level: 'safe',
      risk_level: 'Low',
      collision_probability: 4.1,
      time_to_impact: 3315,
      time_to_impact_formatted: '55m 15s',
      radial_distance: 72.4,
      bearing_angle: 265.0,
      last_seen: new Date().toISOString()
    },
    {
      id: 'DEB-2026-1509',
      name: 'Thor-Burner Booster Clump',
      type: 'rocket body',
      distance: 89.0,
      velocity: 7.31,
      direction: 'Hyperbolic Pass (Az 330°)',
      size: 2.8,
      threat_level: 'safe',
      risk_level: 'Low',
      collision_probability: 1.2,
      time_to_impact: 5700,
      time_to_impact_formatted: '01h 35m',
      radial_distance: 89.0,
      bearing_angle: 330.0,
      last_seen: new Date().toISOString()
    }
  ]
};

function buildRiskAnalysis(satellite: Satellite, debris: DebrisObject[]): RiskAnalysisResponse {
  const topHazard = [...debris].sort((a, b) => b.collision_probability - a.collision_probability)[0] || debris[0];
  const criticalCount = debris.filter(d => d.risk_level === 'Critical').length;
  const highCount = debris.filter(d => d.risk_level === 'High').length;
  const mediumCount = debris.filter(d => d.risk_level === 'Medium').length;
  const lowCount = debris.filter(d => d.risk_level === 'Low').length;

  let overallLevel: 'Critical' | 'High' | 'Medium' | 'Low' = 'Low';
  if (criticalCount > 0) overallLevel = 'Critical';
  else if (highCount > 0) overallLevel = 'High';
  else if (mediumCount > 0) overallLevel = 'Medium';

  const maneuver: ManeuverRecommendation = {
    maneuver_id: 'man-' + satellite.id,
    target_object_id: topHazard?.id || 'deb-primary',
    target_object_name: topHazard?.name || 'Primary Conjunction Hazard',
    direction: 'Prograde',
    altitude_change: 2.5,
    new_altitude: satellite.altitude + 2.5,
    delta_v: 0.85,
    burn_duration_seconds: 4.8,
    burn_duration_formatted: '4.8s',
    fuel_used_kg: 0.19,
    fuel_percent_used: 0.5,
    reason: `Autonomous evasion burn (+0.85 m/s delta-V) to clear ${topHazard?.name || 'conjunction threat'}.`,
    safety_clearance_post_maneuver_km: 54.2,
    post_maneuver_risk: 'Low'
  };

  return {
    satellite_id: satellite.id,
    overall_risk_level: overallLevel,
    monitored_objects_count: debris.length,
    counts: {
      critical: criticalCount,
      high: highCount,
      medium: mediumCount,
      low: lowCount
    },
    highest_threat: topHazard,
    ai_recommendation: maneuver,
    detailed_analysis: debris
  };
}

function buildAlertsForSatellite(satellite: Satellite, debris: DebrisObject[]): Alert[] {
  return debris
    .filter(d => d.risk_level === 'Critical' || d.risk_level === 'High')
    .map((d, index) => ({
      id: `alt-${satellite.id}-${index + 1}`,
      timestamp: new Date().toISOString(),
      object_id: d.id,
      object_name: d.name,
      risk_level: d.risk_level,
      distance: d.distance,
      velocity: d.velocity,
      estimated_impact_time: d.time_to_impact_formatted,
      recommended_action: `Initiate Prograde avoidance burn to clear ${d.name}.`,
      status: 'Active'
    }));
}

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);

  const [activeSatellite, setActiveSatellite] = useState<Satellite>(DEFAULT_SATELLITES[0]);
  const [satellites, setSatellites] = useState<Satellite[]>(DEFAULT_SATELLITES);
  const [debrisList, setDebrisList] = useState<DebrisObject[]>(SATELLITE_DEBRIS_CATALOG['SAT-ALPHA-1']);
  const [riskAnalysis, setRiskAnalysis] = useState<RiskAnalysisResponse>(
    buildRiskAnalysis(DEFAULT_SATELLITES[0], SATELLITE_DEBRIS_CATALOG['SAT-ALPHA-1'])
  );
  const [alerts, setAlerts] = useState<Alert[]>(
    buildAlertsForSatellite(DEFAULT_SATELLITES[0], SATELLITE_DEBRIS_CATALOG['SAT-ALPHA-1'])
  );
  const [selectedDebris, setSelectedDebris] = useState<DebrisObject | null>(null);

  const [simulationRunning, setSimulationRunning] = useState<boolean>(true);
  const [isExecutingManeuver, setIsExecutingManeuver] = useState<boolean>(false);
  const [maneuverResult, setManeuverResult] = useState<any | null>(null);

  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const lastAlertCountRef = useRef<number>(0);

  // Transition away from legacy paths
  useEffect(() => {
    if ((currentPage as string) === 'alerts' || (currentPage as string) === 'reports' || (currentPage as string) === 'login') {
      setCurrentPage('dashboard');
    }
  }, [currentPage]);

  // Sound synthesizer for audio cues
  const playAlertSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch (e) {
      // AudioContext interaction safeguard
    }
  };

  // Fetch telemetry from backend API if connected
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
        const activeCritical = alt.filter((a: Alert) => a.status === 'Active' && (a.risk_level === 'Critical' || a.risk_level === 'High')).length;
        if (activeCritical > lastAlertCountRef.current) {
          playAlertSound();
        }
        lastAlertCountRef.current = activeCritical;
      }
    } catch (err) {
      // Running standalone
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 2500);
    return () => clearInterval(interval);
  }, [soundEnabled]);

  // Switching satellite: update active satellite AND its unique debris hazards!
  const handleSelectSatellite = async (id: string) => {
    try {
      await api.selectSatellite(id);
      await fetchTelemetry();
    } catch (e) {
      const selected = satellites.find(s => s.id === id) || satellites[0];
      const updatedSats = satellites.map(s => ({
        ...s,
        is_active: s.id === id ? 1 : 0
      }));
      setSatellites(updatedSats);
      setActiveSatellite({ ...selected, is_active: 1 });

      // Load THAT specific satellite's unique debris hazards
      const satelliteDebris = SATELLITE_DEBRIS_CATALOG[id] || SATELLITE_DEBRIS_CATALOG['SAT-ALPHA-1'];
      setDebrisList(satelliteDebris);
      setSelectedDebris(null);
      setManeuverResult(null);

      // Recalculate AI collision risk & alerts for the newly selected satellite
      const newRisk = buildRiskAnalysis(selected, satelliteDebris);
      setRiskAnalysis(newRisk);
      setAlerts(buildAlertsForSatellite(selected, satelliteDebris));
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
        id: 'DEB-HAZARD-' + Date.now(),
        name: 'URGENT CONJUNCTION FRAGMENT #99',
        type: 'space debris',
        distance: 1.2,
        velocity: 7.95,
        direction: 'Prograde Head-on (Az 010°)',
        size: 0.65,
        threat_level: 'critical',
        risk_level: 'Critical',
        collision_probability: 98.6,
        time_to_impact: 120,
        time_to_impact_formatted: '02m 00s',
        radial_distance: 1.2,
        bearing_angle: 10.0,
        last_seen: new Date().toISOString()
      };
      const updatedDebris = [hazardDebris, ...debrisList];
      setDebrisList(updatedDebris);
      setSelectedDebris(hazardDebris);

      setRiskAnalysis({
        satellite_id: activeSatellite.id,
        overall_risk_level: 'Critical',
        monitored_objects_count: updatedDebris.length,
        counts: {
          critical: updatedDebris.filter(d => d.risk_level === 'Critical').length,
          high: updatedDebris.filter(d => d.risk_level === 'High').length,
          medium: updatedDebris.filter(d => d.risk_level === 'Medium').length,
          low: updatedDebris.filter(d => d.risk_level === 'Low').length
        },
        highest_threat: hazardDebris,
        ai_recommendation: {
          maneuver_id: 'man-hazard-' + Date.now(),
          target_object_id: hazardDebris.id,
          target_object_name: hazardDebris.name,
          direction: 'Prograde',
          altitude_change: 3.2,
          new_altitude: activeSatellite.altitude + 3.2,
          delta_v: 1.15,
          burn_duration_seconds: 6.2,
          burn_duration_formatted: '6.2s',
          fuel_used_kg: 0.26,
          fuel_percent_used: 0.6,
          reason: 'URGENT: Initiate immediate Prograde burn to evade critical fragment under 2.0 km!',
          safety_clearance_post_maneuver_km: 55.4,
          post_maneuver_risk: 'Low'
        },
        detailed_analysis: updatedDebris
      });

      setAlerts(prev => [
        {
          id: 'alt-hazard-' + Date.now(),
          timestamp: new Date().toISOString(),
          object_id: hazardDebris.id,
          object_name: hazardDebris.name,
          risk_level: 'Critical',
          distance: 1.2,
          velocity: 7.95,
          estimated_impact_time: '02m 00s',
          recommended_action: 'Perform emergency CAM burn immediately.',
          status: 'Active'
        },
        ...prev
      ]);
      playAlertSound();
    }
  };

  const handleResetSimulation = async () => {
    try {
      await api.resetSimulation();
      setManeuverResult(null);
      await fetchTelemetry();
    } catch (e) {
      setManeuverResult(null);
      // Find original baseline satellite values
      const baseline = DEFAULT_SATELLITES.find(s => s.id === activeSatellite.id) || DEFAULT_SATELLITES[0];
      setActiveSatellite(baseline);
      const originalDebris = SATELLITE_DEBRIS_CATALOG[baseline.id] || SATELLITE_DEBRIS_CATALOG['SAT-ALPHA-1'];
      setDebrisList(originalDebris);
      setRiskAnalysis(buildRiskAnalysis(baseline, originalDebris));
      setAlerts(buildAlertsForSatellite(baseline, originalDebris));
      setSelectedDebris(null);
    }
  };

  // MOVE TO SAFE ORBIT (EXECUTE MANEUVER):
  // Satellite burns thrusters AND all debris hazards are cleared and moved outward!
  const handleExecuteManeuver = async () => {
    if (isExecutingManeuver) return;
    setIsExecutingManeuver(true);

    try {
      const res = await api.executeManeuver();
      setManeuverResult(res.maneuver);
      await fetchTelemetry();
    } catch (e) {
      const boostAmount = activeSatellite.id === 'SAT-CHARLIE-3' ? 3.5 : activeSatellite.id === 'SAT-BRAVO-2' ? 2.8 : 2.1;
      const newAlt = +(activeSatellite.altitude + boostAmount).toFixed(1);
      const newFuel = +(activeSatellite.fuel_percent - 0.5).toFixed(1);

      const maneuverData: ManeuverRecommendation = {
        maneuver_id: 'man-' + Date.now(),
        target_object_id: selectedDebris?.id || debrisList[0]?.id || 'DEB-TOP',
        target_object_name: selectedDebris?.name || debrisList[0]?.name || 'Primary Conjunction Hazard',
        direction: 'Prograde',
        altitude_change: boostAmount,
        new_altitude: newAlt,
        delta_v: 0.88,
        burn_duration_seconds: 4.8,
        burn_duration_formatted: '4.8s',
        fuel_used_kg: 0.21,
        fuel_percent_used: 0.5,
        reason: 'Autonomous avoidance maneuver completed nominal. Satellite elevated to safe orbit clearance.',
        safety_clearance_post_maneuver_km: 56.8,
        post_maneuver_risk: 'Low'
      };

      setManeuverResult(maneuverData);

      // 1. Move satellite to safe altitude and adjust fuel
      setActiveSatellite(prev => ({
        ...prev,
        altitude: newAlt,
        fuel_percent: newFuel
      }));

      // 2. CLEAR ALL HAZARDS: Debris distances expand by +45 to +60 km into safe zones!
      const clearedDebris = debrisList.map(deb => {
        const expandedDistance = +(deb.distance + 48.0).toFixed(1);
        return {
          ...deb,
          distance: expandedDistance,
          radial_distance: expandedDistance,
          threat_level: 'safe' as const,
          risk_level: 'Low' as const,
          collision_probability: 0.0001,
          time_to_impact: 99999,
          time_to_impact_formatted: '> 4h 00m'
        };
      });
      setDebrisList(clearedDebris);

      // 3. Update Risk Analysis to Low and all threats mitigated
      setRiskAnalysis({
        satellite_id: activeSatellite.id,
        overall_risk_level: 'Low',
        monitored_objects_count: clearedDebris.length,
        counts: { critical: 0, high: 0, medium: 0, low: clearedDebris.length },
        highest_threat: clearedDebris[0],
        ai_recommendation: maneuverData,
        detailed_analysis: clearedDebris
      });

      // 4. Mark all alerts resolved
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
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'Acknowledged' } : a));
    }
  };

  const handleResolveAlert = async (id: string) => {
    try {
      await api.resolveAlert(id);
      await fetchTelemetry();
    } catch (e) {
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'Resolved' } : a));
    }
  };

  const activeAlertCount = alerts.filter(a => a.status === 'Active' && (a.risk_level === 'Critical' || a.risk_level === 'High')).length;

  return (
    <div className="min-h-screen bg-[#f5f2eb] text-[#22281e] flex flex-col font-sans relative overflow-x-hidden selection:bg-[#597445] selection:text-white">
      {/* Soft Ambient Organic Lighting */}
      <div className="pointer-events-none fixed -top-48 left-1/3 w-[820px] h-[720px] bg-[#597445]/10 rounded-full blur-[180px] z-0" />
      <div className="pointer-events-none fixed top-1/4 -left-40 w-[680px] h-[680px] bg-[#be7b38]/10 rounded-full blur-[160px] z-0" />

      {/* Persistent Top Navigation Bar */}
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

      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Tactile Sidebar */}
        <Sidebar
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          activeAlertCount={activeAlertCount}
          debrisCount={debrisList.length}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-y-auto px-4 py-4 md:px-7 md:py-5 custom-scrollbar">
          {currentPage === 'dashboard' && (
            <DashboardPage
              satellite={activeSatellite}
              debrisList={debrisList}
              riskAnalysis={riskAnalysis}
              alerts={alerts}
              selectedDebris={selectedDebris}
              onSelectDebris={setSelectedDebris}
              onExecuteManeuver={handleExecuteManeuver}
              isExecutingManeuver={isExecutingManeuver}
              maneuverResult={maneuverResult}
              onNavigateToDebris={() => setCurrentPage('debris')}
              onNavigateToManeuver={() => setCurrentPage('maneuver')}
              onNavigateToAlerts={() => setCurrentPage('dashboard')}
            />
          )}

          {currentPage === 'debris' && (
            <DebrisPage
              debrisList={debrisList}
              selectedDebris={selectedDebris}
              onSelectDebris={setSelectedDebris}
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
