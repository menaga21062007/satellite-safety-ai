import React, { useState, useEffect, useRef } from 'react';
import { api } from './api';
import { Satellite, DebrisObject, Alert, RiskAnalysisResponse } from './types';
import { Navbar } from './components/Navbar';
import { Sidebar, PageId } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { DebrisPage } from './pages/DebrisPage';
import { RiskAnalysisPage } from './pages/RiskAnalysisPage';
import { ManeuverPage } from './pages/ManeuverPage';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);

  const [activeSatellite, setActiveSatellite] = useState<Satellite | null>(null);
  const [satellites, setSatellites] = useState<Satellite[]>([]);
  const [debrisList, setDebrisList] = useState<DebrisObject[]>([]);
  const [riskAnalysis, setRiskAnalysis] = useState<RiskAnalysisResponse | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedDebris, setSelectedDebris] = useState<DebrisObject | null>(null);

  const [simulationRunning, setSimulationRunning] = useState<boolean>(true);
  const [isExecutingManeuver, setIsExecutingManeuver] = useState<boolean>(false);
  const [maneuverResult, setManeuverResult] = useState<any | null>(null);

  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const lastAlertCountRef = useRef<number>(0);

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
      if (sats) setSatellites(sats);
      if (deb) setDebrisList(deb);
      if (risk) setRiskAnalysis(risk);
      if (alt) {
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
      console.error(e);
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
      console.error(e);
    }
  };

  const handleTriggerHazard = async () => {
    try {
      await api.triggerHazard();
      await fetchTelemetry();
      // Ensure we navigate to dashboard to see hazard unfold
      if (currentPage === 'login') {
        setCurrentPage('dashboard');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetSimulation = async () => {
    try {
      await api.resetSimulation();
      setManeuverResult(null);
      await fetchTelemetry();
    } catch (e) {
      console.error(e);
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
      console.error('Maneuver execution failed:', e);
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
