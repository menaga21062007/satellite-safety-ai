const { run, get, all } = require('../db');
const { calculateCollisionRisk, recommendOrbitManeuver } = require('../ai/riskEngine');

class SimulationManager {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
    this.tickRateMs = 1500; // updates every 1.5s
    this.hazardActive = true;
    this.hazardApproaching = true;
    this.approachingObjectId = 'DEB-2026-9041';
    this.activeSatelliteId = 'SAT-ALPHA-1';
  }

  async setActiveSatellite(satelliteId) {
    this.activeSatelliteId = satelliteId;
    const topHazard = await get(
      'SELECT * FROM debris WHERE satellite_id = ? ORDER BY collision_probability DESC LIMIT 1',
      [satelliteId]
    );
    if (topHazard) {
      this.approachingObjectId = topHazard.id;
      this.hazardApproaching = true;
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.intervalId = setInterval(() => this.tick(), this.tickRateMs);
    console.log('[Simulation] Simulation started.');
  }

  stop() {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log('[Simulation] Simulation stopped.');
  }

  async reset() {
    this.hazardApproaching = true;
    const activeSat = await get('SELECT * FROM satellites WHERE is_active = 1');
    const satId = activeSat?.id || this.activeSatelliteId || 'SAT-ALPHA-1';
    const nominalAlt = satId === 'SAT-CHARLIE-3' ? 705.0 : (satId === 'SAT-BRAVO-2' ? 620.0 : 550.0);

    // Reset active satellite to nominal altitude
    await run(`
      UPDATE satellites
      SET altitude = ?,
          status = 'Operational',
          last_update = ?
      WHERE id = ?
    `, [nominalAlt, new Date().toISOString(), satId]);

    // Find and reset the top threat for this satellite
    const topThreat = await get(
      'SELECT * FROM debris WHERE satellite_id = ? ORDER BY collision_probability DESC LIMIT 1',
      [satId]
    );

    if (topThreat) {
      this.approachingObjectId = topThreat.id;
      await run(`
        UPDATE debris
        SET distance = 14.8,
            radial_distance = 14.8,
            bearing_angle = 42.0,
            threat_level = 'risky',
            risk_level = 'High',
            collision_probability = 76.5,
            time_to_impact = 310,
            time_to_impact_formatted = '05m 10s',
            last_seen = ?
        WHERE id = ?
      `, [new Date().toISOString(), topThreat.id]);
    }

    console.log(`[Simulation] Simulation state reset for satellite ${satId}.`);
  }

  async triggerHazard() {
    this.hazardApproaching = true;
    const now = new Date().toISOString();
    const activeSat = await get('SELECT * FROM satellites WHERE is_active = 1');
    const satId = activeSat?.id || this.activeSatelliteId || 'SAT-ALPHA-1';

    const target = await get(
      'SELECT * FROM debris WHERE satellite_id = ? ORDER BY collision_probability DESC LIMIT 1',
      [satId]
    );

    if (!target) return;
    this.approachingObjectId = target.id;

    // Update to imminent critical hazard
    await run(`
      UPDATE debris
      SET distance = 6.2,
          radial_distance = 6.2,
          bearing_angle = 36.0,
          threat_level = 'critical',
          risk_level = 'Critical',
          collision_probability = 95.8,
          time_to_impact = 120,
          time_to_impact_formatted = '02m 00s',
          last_seen = ?
      WHERE id = ?
    `, [now, target.id]);

    // Trigger or update alert
    const existingAlert = await get('SELECT * FROM alerts WHERE object_id = ? AND status = "Active"', [target.id]);
    if (!existingAlert) {
      const alertId = `ALT-${Date.now().toString().slice(-6)}`;
      await run(`
        INSERT INTO alerts (id, timestamp, object_id, object_name, risk_level, distance, velocity, estimated_impact_time, recommended_action, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        alertId,
        now,
        target.id,
        target.name,
        'Critical',
        6.2,
        target.velocity,
        '02m 00s',
        `Immediate Collision Avoidance Thruster Burn Required for ${activeSat ? activeSat.name : satId}`,
        'Active'
      ]);
    }
  }

  async executeManeuver(satelliteId, threatObjectId) {
    const sat = await get('SELECT * FROM satellites WHERE id = ?', [satelliteId]);
    const obj = await get('SELECT * FROM debris WHERE id = ?', [threatObjectId]);

    if (!sat || !obj) {
      throw new Error('Satellite or threat object not found.');
    }

    const riskInfo = {
      collision_probability: obj.collision_probability,
      miss_distance_km: 1.2
    };

    const recommendation = recommendOrbitManeuver(sat, obj, riskInfo);

    // Update satellite state
    const newFuel = Math.max(0, sat.fuel_percent - recommendation.fuel_percent_used);
    const now = new Date().toISOString();

    await run(`
      UPDATE satellites
      SET altitude = ?,
          fuel_percent = ?,
          status = 'Operational (Safe Orbit Restored)',
          last_update = ?
      WHERE id = ?
    `, [recommendation.new_altitude, +newFuel.toFixed(1), now, sat.id]);

    // Reposition previous threat safely away post-maneuver
    await run(`
      UPDATE debris
      SET distance = 65.0,
          radial_distance = 65.0,
          threat_level = 'safe',
          risk_level = 'Low',
          collision_probability = 0.04,
          time_to_impact = 5400,
          time_to_impact_formatted = '01h 30m',
          last_seen = ?
      WHERE id = ?
    `, [now, obj.id]);

    // Mark active alerts for this previous object as Resolved
    await run(`
      UPDATE alerts
      SET status = 'Resolved'
      WHERE object_id = ? AND status = 'Active'
    `, [obj.id]);

    // Select the next orbital hazard for THIS satellite
    const satDebris = await all(
      'SELECT * FROM debris WHERE satellite_id = ? ORDER BY id ASC',
      [sat.id]
    );

    const currentIndex = satDebris.findIndex(d => d.id === obj.id);
    const nextIndex = (currentIndex + 1) % satDebris.length;
    const nextThreat = satDebris[nextIndex];

    if (nextThreat) {
      this.approachingObjectId = nextThreat.id;
      this.hazardApproaching = true;

      const nextDistance = 15.2;
      const nextBearing = 44.0;
      const nextRisk = calculateCollisionRisk(nextDistance, nextThreat.velocity || 7.45, nextThreat.size || 2.5, nextBearing, 240);

      await run(`
        UPDATE debris
        SET distance = ?,
            radial_distance = ?,
            bearing_angle = ?,
            threat_level = 'critical',
            risk_level = 'Critical',
            collision_probability = ?,
            time_to_impact = ?,
            time_to_impact_formatted = ?,
            last_seen = ?
        WHERE id = ?
      `, [
        nextDistance,
        nextDistance,
        nextBearing,
        Math.max(84.6, nextRisk.collision_probability),
        240,
        '04m 00s',
        now,
        nextThreat.id
      ]);

      const alertId = `ALT-${Date.now().toString().slice(-6)}`;
      await run(`
        INSERT INTO alerts (id, timestamp, object_id, object_name, risk_level, distance, velocity, estimated_impact_time, recommended_action, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        alertId,
        now,
        nextThreat.id,
        nextThreat.name,
        'Critical',
        nextDistance,
        nextThreat.velocity || 7.45,
        '04m 00s',
        `Critical conjunction detected with ${nextThreat.name}. Autonomous CAM burn required.`,
        'Active'
      ]);
    }

    // Record maneuver in database
    const maneuverId = `MAN-${Date.now().toString().slice(-6)}`;
    await run(`
      INSERT INTO maneuvers (id, satellite_id, target_object_id, direction, altitude_change, new_altitude, delta_v, burn_duration_seconds, burn_duration_formatted, fuel_used_kg, fuel_percent_used, reason, status, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      maneuverId,
      sat.id,
      obj.id,
      recommendation.direction,
      recommendation.altitude_change,
      recommendation.new_altitude,
      recommendation.delta_v,
      recommendation.burn_duration_seconds,
      recommendation.burn_duration_formatted,
      recommendation.fuel_used_kg,
      recommendation.fuel_percent_used,
      recommendation.reason,
      'Executed (Nominal Burn)',
      now
    ]);

    return {
      ...recommendation,
      maneuver_id: maneuverId,
      status: 'Executed (Nominal Burn)',
      timestamp: now
    };
  }

  async tick() {
    try {
      const now = new Date().toISOString();

      // 1. Update active satellite position along orbit
      const activeSat = await get('SELECT * FROM satellites WHERE is_active = 1');
      if (activeSat) {
        this.activeSatelliteId = activeSat.id;

        let newLon = (activeSat.longitude + 0.35);
        if (newLon > 180) newLon -= 360;

        const timeSec = Date.now() / 1000;
        const newLat = +(Math.sin(timeSec / 80) * activeSat.inclination * 0.75).toFixed(4);
        const newVel = +(7.66 + (Math.sin(timeSec / 10) * 0.02)).toFixed(3);

        await run(`
          UPDATE satellites
          SET longitude = ?,
              latitude = ?,
              velocity = ?,
              last_update = ?
          WHERE id = ?
        `, [+newLon.toFixed(4), newLat, newVel, now, activeSat.id]);

        // 2. Update debris objects for THIS ACTIVE SATELLITE
        const debrisList = await all(
          'SELECT * FROM debris WHERE satellite_id = ?',
          [activeSat.id]
        );

        for (const d of debrisList) {
          let newDistance = d.distance;
          let newBearing = (d.bearing_angle + 0.8) % 360;
          let newTca = d.time_to_impact;

          if (d.id === this.approachingObjectId) {
            if (this.hazardApproaching) {
              newDistance = Math.max(3.2, +(d.distance - 0.25).toFixed(2));
              newTca = Math.max(20, d.time_to_impact - 4);
            } else {
              newDistance = +(d.distance + 0.4).toFixed(2);
              newTca = d.time_to_impact + 6;
            }
          } else {
            const delta = (Math.sin(Date.now() / 3000 + d.bearing_angle) * 0.08);
            newDistance = Math.max(12.0, +(d.distance + delta).toFixed(2));
            newTca = Math.max(600, d.time_to_impact - 1.5);
          }

          const risk = calculateCollisionRisk(newDistance, d.velocity, d.size, (newBearing % 90), newTca);

          await run(`
            UPDATE debris
            SET distance = ?,
                radial_distance = ?,
                bearing_angle = ?,
                threat_level = ?,
                risk_level = ?,
                collision_probability = ?,
                time_to_impact = ?,
                time_to_impact_formatted = ?,
                last_seen = ?
            WHERE id = ?
          `, [
            newDistance,
            newDistance,
            +newBearing.toFixed(1),
            risk.threat_level,
            risk.risk_level,
            risk.collision_probability,
            risk.tca_seconds,
            risk.tca_formatted,
            now,
            d.id
          ]);
        }
      }
    } catch (err) {
      console.error('[Simulation] Tick error:', err.message);
    }
  }
}

const simulationManager = new SimulationManager();

module.exports = simulationManager;
