export interface Satellite {
  id: string;
  name: string;
  status: string;
  altitude: number;
  velocity: number;
  current_orbit: string;
  inclination: number;
  fuel_percent: number;
  battery_percent: number;
  latitude: number;
  longitude: number;
  mass_kg: number;
  last_update: string;
  is_active: number;
}

export interface DebrisObject {
  id: string;
  name: string;
  type: 'space debris' | 'old satellite fragment' | 'rocket body' | 'unknown object';
  distance: number;
  velocity: number;
  direction: string;
  size: number;
  threat_level: 'safe' | 'watchlist' | 'risky' | 'critical';
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
  collision_probability: number;
  time_to_impact: number;
  time_to_impact_formatted: string;
  radial_distance: number;
  bearing_angle: number;
  relative_velocity_vector?: string;
  last_seen: string;
}

export interface Alert {
  id: string;
  timestamp: string;
  object_id: string;
  object_name: string;
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
  distance: number;
  velocity: number;
  estimated_impact_time: string;
  recommended_action: string;
  status: 'Active' | 'Acknowledged' | 'Resolved';
}

export interface ManeuverRecommendation {
  maneuver_id: string;
  target_object_id: string;
  target_object_name: string;
  direction: string;
  altitude_change: number;
  new_altitude: number;
  delta_v: number;
  burn_duration_seconds: number;
  burn_duration_formatted: string;
  fuel_used_kg: number;
  fuel_percent_used: number;
  reason: string;
  safety_clearance_post_maneuver_km: number;
  post_maneuver_risk: string;
}

export interface RiskAnalysisResponse {
  satellite_id: string;
  overall_risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
  monitored_objects_count: number;
  counts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  highest_threat: DebrisObject | null;
  ai_recommendation: ManeuverRecommendation | null;
  detailed_analysis: DebrisObject[];
}
