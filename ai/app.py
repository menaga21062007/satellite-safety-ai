"""
FastAPI Microservice for Satellite Collision Risk Prediction and Orbit Maneuvers.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional

from risk_model import (
    calculate_tca_and_miss_distance,
    calculate_collision_risk,
    recommend_orbit_maneuver
)

app = FastAPI(
    title="Satellite Safety AI Microservice",
    description="Astrodynamics, Foster B-Plane Collision Risk Probability, and Thruster Maneuver Calculations",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RiskRequest(BaseModel):
    satellite: Dict[str, Any]
    debris_objects: List[Dict[str, Any]]

class ManeuverRequest(BaseModel):
    satellite: Dict[str, Any]
    threat_object: Dict[str, Any]
    risk_info: Dict[str, Any]

@app.get("/health")
def health():
    return {"status": "ok", "service": "Satellite Safety AI Engine", "version": "1.0.0"}

@app.post("/predict-risk")
def predict_risk(data: RiskRequest):
    try:
        results = []
        sat = data.satellite
        sat_pos = sat.get("position", [0.0, 6878.0, 0.0])
        sat_vel = sat.get("velocity_vector", [7.66, 0.0, 0.0])

        for obj in data.debris_objects:
            obj_pos = obj.get("position", [0.0, 6878.0 + obj.get("distance", 20.0), 0.0])
            obj_vel = obj.get("velocity_vector", [7.60, 0.5, 0.1])
            dist = float(obj.get("distance", 25.0))
            rel_speed = float(obj.get("velocity", 7.5))
            size = float(obj.get("size", 1.5))

            tca, miss_dist, calc_rel_speed = calculate_tca_and_miss_distance(sat_pos, sat_vel, obj_pos, obj_vel)
            
            # If distance is provided directly, ensure miss_dist aligns
            if miss_dist > dist:
                miss_dist = max(0.2, dist * 0.4)

            risk = calculate_collision_risk(dist, rel_speed, size, miss_dist, tca)
            results.append({
                "object_id": obj.get("id"),
                "name": obj.get("name", obj.get("id")),
                **risk
            })

        # Overall satellite risk is highest individual risk
        critical_count = sum(1 for r in results if r["risk_level"] == "Critical")
        high_count = sum(1 for r in results if r["risk_level"] == "High")
        overall_level = "Critical" if critical_count > 0 else ("High" if high_count > 0 else ("Medium" if any(r["risk_level"] == "Medium" for r in results) else "Low"))

        max_risk_obj = max(results, key=lambda x: x["collision_probability"], default=None)

        return {
            "overall_risk_level": overall_level,
            "monitored_debris_count": len(results),
            "highest_risk_object": max_risk_obj,
            "risk_breakdown": results
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/recommend-maneuver")
def get_recommendation(data: ManeuverRequest):
    try:
        rec = recommend_orbit_maneuver(data.satellite, data.threat_object, data.risk_info)
        return rec
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8001, reload=True)
