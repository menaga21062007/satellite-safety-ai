const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

let dbPath = path.join(__dirname, '..', 'satellite_safety.sqlite');

// Support Vercel serverless environment with writable /tmp
if (process.env.VERCEL) {
  const tmpPath = path.join('/tmp', 'satellite_safety.sqlite');
  try {
    if (fs.existsSync(dbPath) && !fs.existsSync(tmpPath)) {
      fs.copyFileSync(dbPath, tmpPath);
    }
  } catch (e) {
    console.warn('[DB] Could not copy SQLite to /tmp, will initialize new DB:', e.message);
  }
  dbPath = tmpPath;
}

const db = new sqlite3.Database(dbPath);

// Promisified helper methods
const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const all = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

async function initDb() {
  await run(`
    CREATE TABLE IF NOT EXISTS satellites (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      status TEXT NOT NULL,
      altitude REAL NOT NULL,
      velocity REAL NOT NULL,
      current_orbit TEXT NOT NULL,
      inclination REAL NOT NULL,
      fuel_percent REAL NOT NULL,
      battery_percent REAL NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      mass_kg REAL NOT NULL,
      last_update TEXT NOT NULL,
      is_active INTEGER DEFAULT 0
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS debris (
      id TEXT PRIMARY KEY,
      satellite_id TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      distance REAL NOT NULL,
      velocity REAL NOT NULL,
      direction TEXT NOT NULL,
      size REAL NOT NULL,
      threat_level TEXT NOT NULL,
      risk_level TEXT NOT NULL,
      collision_probability REAL NOT NULL,
      time_to_impact REAL NOT NULL,
      time_to_impact_formatted TEXT NOT NULL,
      radial_distance REAL NOT NULL,
      bearing_angle REAL NOT NULL,
      relative_velocity_vector TEXT,
      last_seen TEXT NOT NULL
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      object_id TEXT NOT NULL,
      object_name TEXT NOT NULL,
      risk_level TEXT NOT NULL,
      distance REAL NOT NULL,
      velocity REAL NOT NULL,
      estimated_impact_time TEXT NOT NULL,
      recommended_action TEXT NOT NULL,
      status TEXT NOT NULL
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS maneuvers (
      id TEXT PRIMARY KEY,
      satellite_id TEXT NOT NULL,
      target_object_id TEXT NOT NULL,
      direction TEXT NOT NULL,
      altitude_change REAL NOT NULL,
      new_altitude REAL NOT NULL,
      delta_v REAL NOT NULL,
      burn_duration_seconds INTEGER NOT NULL,
      burn_duration_formatted TEXT NOT NULL,
      fuel_used_kg REAL NOT NULL,
      fuel_percent_used REAL NOT NULL,
      reason TEXT NOT NULL,
      status TEXT NOT NULL,
      timestamp TEXT NOT NULL
    )
  `);

  // Seed default satellites if table is empty
  const satCount = await get('SELECT COUNT(*) as count FROM satellites');
  if (satCount.count === 0) {
    const defaultSats = [
      {
        id: 'SAT-ALPHA-1',
        name: 'AstroVigil-1 (Earth Observer)',
        status: 'Operational',
        altitude: 550.0,
        velocity: 7.66,
        current_orbit: 'Sun-Synchronous LEO (550 km)',
        inclination: 97.4,
        fuel_percent: 88.5,
        battery_percent: 94.2,
        latitude: 28.5729,
        longitude: -80.6490,
        mass_kg: 850.0,
        last_update: new Date().toISOString(),
        is_active: 1
      },
      {
        id: 'SAT-BRAVO-2',
        name: 'AeroComms-8 (LEO Constellation)',
        status: 'Operational',
        altitude: 620.0,
        velocity: 7.55,
        current_orbit: 'Circular LEO (620 km)',
        inclination: 53.0,
        fuel_percent: 74.0,
        battery_percent: 91.0,
        latitude: -12.45,
        longitude: 45.22,
        mass_kg: 620.0,
        last_update: new Date().toISOString(),
        is_active: 0
      },
      {
        id: 'SAT-CHARLIE-3',
        name: 'TerraScan Hyperspectral 4',
        status: 'Standby Orbit',
        altitude: 705.0,
        velocity: 7.51,
        current_orbit: 'Polar LEO (705 km)',
        inclination: 98.2,
        fuel_percent: 92.8,
        battery_percent: 98.0,
        latitude: 64.12,
        longitude: -21.90,
        mass_kg: 1200.0,
        last_update: new Date().toISOString(),
        is_active: 0
      }
    ];

    for (const sat of defaultSats) {
      await run(
        `INSERT INTO satellites (id, name, status, altitude, velocity, current_orbit, inclination, fuel_percent, battery_percent, latitude, longitude, mass_kg, last_update, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          sat.id, sat.name, sat.status, sat.altitude, sat.velocity, sat.current_orbit,
          sat.inclination, sat.fuel_percent, sat.battery_percent, sat.latitude, sat.longitude,
          sat.mass_kg, sat.last_update, sat.is_active
        ]
      );
    }
  }

  // Verify debris table schema & ensure satellite_id column exists
  try {
    const tableInfo = await all('PRAGMA table_info(debris)');
    const hasSatCol = tableInfo.some(col => col.name === 'satellite_id');
    const debCount = await get('SELECT COUNT(*) as count FROM debris');
    if (!hasSatCol || debCount.count < 15) {
      await run('DROP TABLE IF EXISTS debris');
      await run(`
        CREATE TABLE debris (
          id TEXT PRIMARY KEY,
          satellite_id TEXT NOT NULL,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          distance REAL NOT NULL,
          velocity REAL NOT NULL,
          direction TEXT NOT NULL,
          size REAL NOT NULL,
          threat_level TEXT NOT NULL,
          risk_level TEXT NOT NULL,
          collision_probability REAL NOT NULL,
          time_to_impact REAL NOT NULL,
          time_to_impact_formatted TEXT NOT NULL,
          radial_distance REAL NOT NULL,
          bearing_angle REAL NOT NULL,
          relative_velocity_vector TEXT,
          last_seen TEXT NOT NULL
        )
      `);
    }
  } catch (err) {
    console.error('Debris table init check:', err.message);
  }

  // Seed debris catalog for all 3 satellites if empty
  const debrisCount = await get('SELECT COUNT(*) as count FROM debris');
  if (debrisCount.count === 0) {
    const initialDebris = [
      // --- SATELLITE 1: SAT-ALPHA-1 (AstroVigil-1 - Sun-Synchronous LEO 550 km) ---
      {
        id: 'DEB-2026-9041',
        satellite_id: 'SAT-ALPHA-1',
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
        relative_velocity_vector: JSON.stringify([0.15, -0.42, 0.08]),
        last_seen: new Date().toISOString()
      },
      {
        id: 'DEB-2026-8812',
        satellite_id: 'SAT-ALPHA-1',
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
        relative_velocity_vector: JSON.stringify([-0.22, 0.31, -0.05]),
        last_seen: new Date().toISOString()
      },
      {
        id: 'DEB-2026-5509',
        satellite_id: 'SAT-ALPHA-1',
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
        relative_velocity_vector: JSON.stringify([0.05, 0.12, 0.02]),
        last_seen: new Date().toISOString()
      },
      {
        id: 'DEB-2026-1102',
        satellite_id: 'SAT-ALPHA-1',
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
        relative_velocity_vector: JSON.stringify([0.35, -0.15, 0.10]),
        last_seen: new Date().toISOString()
      },
      {
        id: 'DEB-2026-3022',
        satellite_id: 'SAT-ALPHA-1',
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
        relative_velocity_vector: JSON.stringify([-0.18, -0.09, 0.04]),
        last_seen: new Date().toISOString()
      },

      // --- SATELLITE 2: SAT-BRAVO-2 (AeroComms-8 - Constellation LEO 620 km) ---
      {
        id: 'DEB-2026-7731',
        satellite_id: 'SAT-BRAVO-2',
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
        relative_velocity_vector: JSON.stringify([0.28, -0.36, 0.12]),
        last_seen: new Date().toISOString()
      },
      {
        id: 'DEB-2026-6219',
        satellite_id: 'SAT-BRAVO-2',
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
        relative_velocity_vector: JSON.stringify([-0.15, 0.22, -0.04]),
        last_seen: new Date().toISOString()
      },
      {
        id: 'DEB-2026-4482',
        satellite_id: 'SAT-BRAVO-2',
        name: 'Globalstar Solar Array Boom',
        type: 'defunct hardware',
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
        relative_velocity_vector: JSON.stringify([0.08, -0.19, 0.03]),
        last_seen: new Date().toISOString()
      },
      {
        id: 'DEB-2026-3190',
        satellite_id: 'SAT-BRAVO-2',
        name: 'Orbcomm FM Defunct Bus',
        type: 'decommissioned sat',
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
        relative_velocity_vector: JSON.stringify([-0.05, 0.14, -0.02]),
        last_seen: new Date().toISOString()
      },
      {
        id: 'DEB-2026-2005',
        satellite_id: 'SAT-BRAVO-2',
        name: 'Titan-3C Transtage Debris',
        type: 'booster fragment',
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
        relative_velocity_vector: JSON.stringify([0.11, 0.07, 0.05]),
        last_seen: new Date().toISOString()
      },

      // --- SATELLITE 3: SAT-CHARLIE-3 (TerraScan Hyperspectral 4 - Polar LEO 705 km) ---
      {
        id: 'DEB-2026-9902',
        satellite_id: 'SAT-CHARLIE-3',
        name: 'Envisat Auxiliary Mast Shard',
        type: 'satellite fragment',
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
        relative_velocity_vector: JSON.stringify([0.32, -0.45, 0.18]),
        last_seen: new Date().toISOString()
      },
      {
        id: 'DEB-2026-8430',
        satellite_id: 'SAT-CHARLIE-3',
        name: 'NOAA-16 Battery Rupture Cluster',
        type: 'space debris',
        distance: 19.8,
        velocity: 7.74,
        direction: 'Prograde Divergence (Az 100°)',
        size: 2.3,
        threat_level: 'risky',
        risk_level: 'High',
        collision_probability: 68.3,
        time_to_impact: 410,
        time_to_impact_formatted: '06m 50s',
        radial_distance: 19.8,
        bearing_angle: 100.0,
        relative_velocity_vector: JSON.stringify([-0.21, 0.28, -0.09]),
        last_seen: new Date().toISOString()
      },
      {
        id: 'DEB-2026-7211',
        satellite_id: 'SAT-CHARLIE-3',
        name: 'Ariane-4 Cryogenic Vent Fragment',
        type: 'rocket body',
        distance: 37.5,
        velocity: 7.61,
        direction: 'Descending Orbital Arc (Az 175°)',
        size: 3.5,
        threat_level: 'watchlist',
        risk_level: 'Medium',
        collision_probability: 22.7,
        time_to_impact: 1300,
        time_to_impact_formatted: '21m 40s',
        radial_distance: 37.5,
        bearing_angle: 175.0,
        relative_velocity_vector: JSON.stringify([0.14, -0.18, 0.06]),
        last_seen: new Date().toISOString()
      },
      {
        id: 'DEB-2026-5890',
        satellite_id: 'SAT-CHARLIE-3',
        name: 'SPOT-1 Thermal Blanket Foil',
        type: 'hardware fragment',
        distance: 55.2,
        velocity: 7.28,
        direction: 'Co-orbital Offset (Az 265°)',
        size: 0.9,
        threat_level: 'safe',
        risk_level: 'Low',
        collision_probability: 4.1,
        time_to_impact: 2480,
        time_to_impact_formatted: '41m 20s',
        radial_distance: 55.2,
        bearing_angle: 265.0,
        relative_velocity_vector: JSON.stringify([-0.09, 0.12, 0.01]),
        last_seen: new Date().toISOString()
      },
      {
        id: 'DEB-2026-3720',
        satellite_id: 'SAT-CHARLIE-3',
        name: 'Meteor-2 Radiometer Debris',
        type: 'instrument shard',
        distance: 91.0,
        velocity: 7.05,
        direction: 'Ascending Polar Crossing (Az 330°)',
        size: 1.1,
        threat_level: 'safe',
        risk_level: 'Low',
        collision_probability: 0.4,
        time_to_impact: 6300,
        time_to_impact_formatted: '01h 45m',
        radial_distance: 91.0,
        bearing_angle: 330.0,
        relative_velocity_vector: JSON.stringify([0.06, 0.09, -0.03]),
        last_seen: new Date().toISOString()
      }
    ];

    for (const d of initialDebris) {
      await run(
        `INSERT INTO debris (id, satellite_id, name, type, distance, velocity, direction, size, threat_level, risk_level, collision_probability, time_to_impact, time_to_impact_formatted, radial_distance, bearing_angle, relative_velocity_vector, last_seen)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          d.id, d.satellite_id, d.name, d.type, d.distance, d.velocity, d.direction, d.size, d.threat_level,
          d.risk_level, d.collision_probability, d.time_to_impact, d.time_to_impact_formatted,
          d.radial_distance, d.bearing_angle, d.relative_velocity_vector, d.last_seen
        ]
      );
    }
  }

  // Seed initial alerts if empty
  const alertCount = await get('SELECT COUNT(*) as count FROM alerts');
  if (alertCount.count === 0) {
    await run(
      `INSERT INTO alerts (id, timestamp, object_id, object_name, risk_level, distance, velocity, estimated_impact_time, recommended_action, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'ALT-2026-101',
        new Date().toISOString(),
        'DEB-2026-9041',
        'COSMOS-1408 Frag #4192',
        'High',
        18.4,
        7.82,
        '06m 20s',
        'Execute +12.5 km Prograde Orbit Boost Maneuver',
        'Active'
      ]
    );
  }
}

module.exports = {
  db,
  run,
  get,
  all,
  initDb
};
