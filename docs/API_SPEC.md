# Satellite Safety Monitoring AI - API Specification

RESTful API service listening on `http://localhost:5000`.

---

## 1. Satellite Endpoints

### `GET /api/satellite`
Returns real-time telemetry for the active monitored satellite.
- **Response `200 OK`**:
```json
{
  "id": "SAT-ALPHA-1",
  "name": "Aegis-Sentinel 1 (Earth Observer)",
  "status": "Operational",
  "altitude": 550.0,
  "velocity": 7.66,
  "current_orbit": "Sun-Synchronous LEO (550 km)",
  "inclination": 97.4,
  "fuel_percent": 88.5,
  "battery_percent": 94.2,
  "latitude": 28.5729,
  "longitude": -80.6490,
  "mass_kg": 850.0,
  "last_update": "2026-10-26T10:14:00.000Z",
  "is_active": 1
}
```

### `GET /api/satellites`
Returns all monitored satellites in the constellation.

### `POST /api/satellite/select`
Switches active satellite focus.
- **Body**: `{ "id": "SAT-BRAVO-2" }`

---

## 2. Debris Radar Endpoints

### `GET /api/debris`
Returns list of nearby objects within radar tracking perimeter (0 to 100 km).
- **Response `200 OK`**:
```json
[
  {
    "id": "DEB-2026-9041",
    "name": "COSMOS-1408 Frag #4192",
    "type": "space debris",
    "distance": 18.4,
    "velocity": 7.82,
    "direction": "Prograde Crossing (Az 045°)",
    "size": 1.8,
    "threat_level": "risky",
    "risk_level": "High",
    "collision_probability": 74.8,
    "time_to_impact": 380,
    "time_to_impact_formatted": "06m 20s",
    "radial_distance": 18.4,
    "bearing_angle": 45.0,
    "last_seen": "2026-10-26T10:14:00.000Z"
  }
]
```

### `GET /api/debris/:id`
Retrieves radar telemetry for an individual target.

---

## 3. Simulation Controls

### `POST /api/simulation/start`
Starts live ticking orbital radar simulation.

### `POST /api/simulation/stop`
Pauses simulation loop.

### `POST /api/simulation/reset`
Resets satellite and debris positions back to baseline scenario.

### `POST /api/simulation/trigger-hazard`
Injects an immediate critical collision trajectory for Demo Mode.

---

## 4. AI Conjunction Risk Assessment

### `GET /api/risk-analysis`
Computes holistic multi-object collision risk, returns overall severity, threat counts, highest risk hazard, and AI maneuver recommendation.
- **Response `200 OK`**:
```json
{
  "satellite_id": "SAT-ALPHA-1",
  "overall_risk_level": "Critical",
  "monitored_objects_count": 5,
  "counts": { "critical": 1, "high": 0, "medium": 1, "low": 3 },
  "highest_threat": { ... },
  "ai_recommendation": {
    "maneuver_id": "CAM-DEB-2026-9041",
    "target_object_id": "DEB-2026-9041",
    "target_object_name": "COSMOS-1408 Frag #4192",
    "direction": "+Radial Out & Prograde Boost",
    "altitude_change": 12.5,
    "new_altitude": 562.5,
    "delta_v": 14.8,
    "burn_duration_seconds": 572,
    "burn_duration_formatted": "09m 32s",
    "fuel_used_kg": 1.82,
    "fuel_percent_used": 2.1,
    "reason": "Critical conjunction event...",
    "safety_clearance_post_maneuver_km": 62.1,
    "post_maneuver_risk": "Low"
  }
}
```

---

## 5. Collision Avoidance Maneuver

### `POST /api/maneuver`
Executes safe orbit maneuver. Updates satellite altitude, expends propellant, relocates threatening debris away from satellite, resolves active alert, and logs maneuver history.

---

## 6. Alerts Management

### `GET /api/alerts`
Returns recent conjunction warning alerts.

### `POST /api/alerts/:id/acknowledge`
Marks alert as `Acknowledged`.

### `POST /api/alerts/:id/resolve`
Marks alert as `Resolved`.

---

## 7. Report Generation

### `GET /api/report/pdf`
Streams an audit-ready, styled PDF report (`application/pdf`) with telemetry tables, hazard breakdowns, and alert logs.

### `GET /api/report/csv`
Downloads tabular CSV dataset (`text/csv`) of all tracked objects and encounter parameters.
