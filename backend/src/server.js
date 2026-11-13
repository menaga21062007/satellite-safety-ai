const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDb, get, all, run } = require('./db');
const simulationManager = require('./simulation/simulationManager');
const { recommendOrbitManeuver } = require('./ai/riskEngine');
const { generatePdfReport } = require('./reports/reportGenerator');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize SQLite database and start the background physics loop
(async () => {
  try {
    await initDb();
    console.log('[Database] SQLite database initialized successfully.');
    // Start live simulation loop
    simulationManager.start();
  } catch (err) {
    console.error('[Database] Initialization error:', err);
  }
})();

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'Satellite Safety Monitoring AI Backend',
    simulation_running: simulationManager.isRunning,
    timestamp: new Date().toISOString()
  });
});

// 1. Satellite Endpoints
app.get('/api/satellite', async (req, res) => {
  try {
    const satellite = await get('SELECT * FROM satellites WHERE is_active = 1');
    if (!satellite) {
      return res.status(404).json({ error: 'Active satellite not found' });
    }
    res.json(satellite);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/satellites', async (req, res) => {
  try {
    const satellites = await all('SELECT * FROM satellites ORDER BY is_active DESC, name ASC');
    res.json(satellites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/satellite/select', async (req, res) => {
  try {
    const id = req.body.id || req.body.satellite_id;
    if (!id) return res.status(400).json({ error: 'Satellite ID required' });

    await run('UPDATE satellites SET is_active = 0');
    await run('UPDATE satellites SET is_active = 1 WHERE id = ?', [id]);

    await simulationManager.setActiveSatellite(id);

    const activeSat = await get('SELECT * FROM satellites WHERE is_active = 1');
    const debrisList = await all('SELECT * FROM debris WHERE satellite_id = ? ORDER BY distance ASC', [id]);
    res.json({ message: 'Active satellite updated', satellite: activeSat, debris: debrisList });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Debris Endpoints
app.get('/api/debris', async (req, res) => {
  try {
    let satId = req.query.satellite_id;
    if (!satId) {
      const activeSat = await get('SELECT id FROM satellites WHERE is_active = 1');
      satId = activeSat?.id || 'SAT-ALPHA-1';
    }
    const debrisList = await all('SELECT * FROM debris WHERE satellite_id = ? ORDER BY distance ASC', [satId]);
    res.json(debrisList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/debris/:id', async (req, res) => {
  try {
    const debris = await get('SELECT * FROM debris WHERE id = ?', [req.params.id]);
    if (!debris) return res.status(404).json({ error: 'Debris object not found' });
    res.json(debris);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Simulation Endpoints
app.post('/api/simulation/start', (req, res) => {
  simulationManager.start();
  res.json({ message: 'Simulation radar stream started', running: true });
});

app.post('/api/simulation/stop', (req, res) => {
  simulationManager.stop();
  res.json({ message: 'Simulation radar stream stopped', running: false });
});

app.post('/api/simulation/reset', async (req, res) => {
  try {
    await simulationManager.reset();
    res.json({ message: 'Simulation reset to nominal scenario', running: simulationManager.isRunning });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/simulation/trigger-hazard', async (req, res) => {
  try {
    await simulationManager.triggerHazard();
    res.json({ message: 'Approaching collision hazard injected successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. AI Collision Risk Analysis Endpoint
app.get('/api/risk-analysis', async (req, res) => {
  try {
    const satellite = await get('SELECT * FROM satellites WHERE is_active = 1');
    const satId = satellite?.id || 'SAT-ALPHA-1';
    const debrisList = await all('SELECT * FROM debris WHERE satellite_id = ? ORDER BY collision_probability DESC', [satId]);

    const criticalItems = debrisList.filter(d => d.risk_level === 'Critical');
    const highItems = debrisList.filter(d => d.risk_level === 'High');
    const mediumItems = debrisList.filter(d => d.risk_level === 'Medium');
    const lowItems = debrisList.filter(d => d.risk_level === 'Low');

    const overallRisk = criticalItems.length > 0 ? 'Critical' : (highItems.length > 0 ? 'High' : (mediumItems.length > 0 ? 'Medium' : 'Low'));
    const topThreat = debrisList[0] || null;

    // AI Maneuver Recommendation for highest risk object
    let recommendation = null;
    if (topThreat && (topThreat.risk_level === 'High' || topThreat.risk_level === 'Critical' || topThreat.collision_probability > 10)) {
      recommendation = recommendOrbitManeuver(satellite, topThreat, {
        collision_probability: topThreat.collision_probability,
        miss_distance_km: Math.max(0.4, (topThreat.distance * 0.12).toFixed(2))
      });
    }

    res.json({
      satellite_id: satellite?.id,
      overall_risk_level: overallRisk,
      monitored_objects_count: debrisList.length,
      counts: {
        critical: criticalItems.length,
        high: highItems.length,
        medium: mediumItems.length,
        low: lowItems.length
      },
      highest_threat: topThreat,
      ai_recommendation: recommendation,
      detailed_analysis: debrisList
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Maneuver Execution Endpoint
app.post('/api/maneuver', async (req, res) => {
  try {
    const satellite = await get('SELECT * FROM satellites WHERE is_active = 1');
    const satId = satellite?.id || 'SAT-ALPHA-1';
    const debrisList = await all('SELECT * FROM debris WHERE satellite_id = ? ORDER BY collision_probability DESC', [satId]);
    const targetThreat = debrisList[0];

    if (!satellite || !targetThreat) {
      return res.status(400).json({ error: 'No active satellite or threat object found to maneuver away from.' });
    }

    const maneuverResult = await simulationManager.executeManeuver(satellite.id, targetThreat.id);
    res.json({
      success: true,
      message: 'Collision avoidance maneuver successfully completed. Satellite safely relocated to higher orbit.',
      maneuver: maneuverResult
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Alerts Endpoints
app.get('/api/alerts', async (req, res) => {
  try {
    const alerts = await all('SELECT * FROM alerts ORDER BY timestamp DESC LIMIT 50');
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/alerts/:id/acknowledge', async (req, res) => {
  try {
    await run('UPDATE alerts SET status = "Acknowledged" WHERE id = ?', [req.params.id]);
    const updated = await get('SELECT * FROM alerts WHERE id = ?', [req.params.id]);
    res.json({ message: 'Alert acknowledged', alert: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/alerts/:id/resolve', async (req, res) => {
  try {
    await run('UPDATE alerts SET status = "Resolved" WHERE id = ?', [req.params.id]);
    const updated = await get('SELECT * FROM alerts WHERE id = ?', [req.params.id]);
    res.json({ message: 'Alert resolved', alert: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Report Endpoint (PDF)
app.get('/api/report/pdf', async (req, res) => {
  try {
    const satelliteId = req.query.satellite_id || null;
    const pdfBuffer = await generatePdfReport(satelliteId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=AstroVigil_Safety_Report_${Date.now()}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('PDF error:', err);
    res.status(500).send('Error generating PDF report');
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Express Error]', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// Start Express Server only when not in serverless environment
if (require.main === module || !process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] ASTROVIGIL - Satellite Safety Monitoring AI Backend running on http://localhost:${PORT}`);
  });
}

module.exports = app;
