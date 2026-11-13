import { Satellite, DebrisObject, Alert, RiskAnalysisResponse, ManeuverRecommendation } from './types';

const API_BASE = '/api';

export const api = {
  async getSatellite(): Promise<Satellite> {
    const res = await fetch(`${API_BASE}/satellite`);
    if (!res.ok) throw new Error('Failed to fetch active satellite');
    return res.json();
  },

  async getSatellites(): Promise<Satellite[]> {
    const res = await fetch(`${API_BASE}/satellites`);
    if (!res.ok) throw new Error('Failed to fetch satellites list');
    return res.json();
  },

  async selectSatellite(id: string): Promise<{ message: string; satellite: Satellite }> {
    const res = await fetch(`${API_BASE}/satellite/select`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    if (!res.ok) throw new Error('Failed to select active satellite');
    return res.json();
  },

  async getDebris(): Promise<DebrisObject[]> {
    const res = await fetch(`${API_BASE}/debris`);
    if (!res.ok) throw new Error('Failed to fetch debris radar feed');
    return res.json();
  },

  async getRiskAnalysis(): Promise<RiskAnalysisResponse> {
    const res = await fetch(`${API_BASE}/risk-analysis`);
    if (!res.ok) throw new Error('Failed to fetch AI risk analysis');
    return res.json();
  },

  async startSimulation(): Promise<{ message: string; running: boolean }> {
    const res = await fetch(`${API_BASE}/simulation/start`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to start simulation');
    return res.json();
  },

  async stopSimulation(): Promise<{ message: string; running: boolean }> {
    const res = await fetch(`${API_BASE}/simulation/stop`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to stop simulation');
    return res.json();
  },

  async resetSimulation(): Promise<{ message: string; running: boolean }> {
    const res = await fetch(`${API_BASE}/simulation/reset`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset simulation');
    return res.json();
  },

  async triggerHazard(): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/simulation/trigger-hazard`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to trigger collision hazard');
    return res.json();
  },

  async executeManeuver(): Promise<{ success: boolean; message: string; maneuver: ManeuverRecommendation }> {
    const res = await fetch(`${API_BASE}/maneuver`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to execute safe orbit maneuver');
    return res.json();
  },

  async getAlerts(): Promise<Alert[]> {
    const res = await fetch(`${API_BASE}/alerts`);
    if (!res.ok) throw new Error('Failed to fetch alerts');
    return res.json();
  },

  async acknowledgeAlert(id: string): Promise<{ message: string; alert: Alert }> {
    const res = await fetch(`${API_BASE}/alerts/${id}/acknowledge`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to acknowledge alert');
    return res.json();
  },

  async resolveAlert(id: string): Promise<{ message: string; alert: Alert }> {
    const res = await fetch(`${API_BASE}/alerts/${id}/resolve`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to resolve alert');
    return res.json();
  },

  getPdfReportUrl(satelliteId?: string): string {
    return satelliteId 
      ? `${API_BASE}/report/pdf?satellite_id=${encodeURIComponent(satelliteId)}` 
      : `${API_BASE}/report/pdf`;
  },

  getCsvReportUrl(): string {
    return `${API_BASE}/report/csv`;
  }
};
