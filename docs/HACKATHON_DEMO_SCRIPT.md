# Hackathon Demo Presentation Script (3-Minute Walkthrough)

Follow this pitch script to present **Satellite Safety Monitoring AI** to hackathon judges.

---

## 🕒 Minute 0:00 - 0:45: The Problem & Opening Hook
> *"Judges, over 36,000 pieces of trackable space debris orbit Earth at 7.8 kilometers per second—ten times faster than a bullet. A single paint fleck or bolt fragment can obliterate a $500M Earth-observation satellite and trigger the Kessler Syndrome. Satellite operators are flooded with false alarms and slow manual conjunction calculations.  
> We built **Satellite Safety Monitoring AI**—an autonomous Space Situational Awareness mission control system that continuously tracks orbital debris, predicts collision risk using statistical 2D B-plane models, and automatically plans propellant-efficient evasive maneuvers."*

---

## 🕒 Minute 0:45 - 1:30: Live Dashboard & Radar Visualization
1. **Show the Main Dashboard**:
   - Point out the **2D Tactical Orbit & Perimeter Radar**:
     > *"Here on our Mission Control Master HUD, you can see our active satellite, Aegis-Sentinel 1, operating in LEO at 550 km. Notice the live 1.5-second radar sweep detecting 5 nearby objects within a 100 km radius."*
   - Toggle from **Radar Polar** to **Earth Geocentric** view:
     > *"With one click, operators can toggle between satellite-centric radar tracking and geocentric Earth orbital view showing the satellite trajectory and surrounding debris clouds."*
   - Click on an approaching debris object on the radar:
     > *"Clicking on any contact locks our tracking sensor and reveals instant telemetry: range, relative speed, bearing angle, and physical size estimate."*

---

## 🕒 Minute 1:30 - 2:15: Trigger Demo Hazard & AI Risk Analysis
2. **Click the `INJECT HAZARD` Button in the Top Bar**:
   - Watch the red alarm banner flash and audio beep:
     > *"Let's simulate a real-world emergency: Russian ASAT fragment COSMOS-1408 is on a crossing trajectory. Our AI immediately detects the danger—distance collapses to 11.2 km, time-to-impact is 3 minutes 15 seconds, and collision probability spikes to over 90% (CRITICAL)."*
3. **Navigate to the AI Collision Risk Page**:
   - Show the Recharts bar chart & category breakdown:
     > *"Our AI doesn't just use arbitrary thresholds—it implements the Foster 1992 B-plane formulation, projecting positional covariance uncertainty ellipsoids onto the encounter plane to calculate true Gaussian collision probability."*

---

## 🕒 Minute 2:15 - 2:45: Autonomous Maneuver Execution
4. **Click `MOVE TO SAFE ORBIT` (or `EXECUTE MANEUVER`)**:
   - Show the thruster burn progress and live confirmation:
     > *"Now the operator triggers the AI-recommended safe orbit maneuver. The AI calculated an impulsive +12.5 km prograde boost requiring 14.8 m/s Delta-V and 1.82 kg of hydrazine monopropellant.  
     > Watch what happens: The thrusters fire, satellite altitude increases to 562.5 km, separation widens to over 50 km, and collision risk instantly drops to LOW (SAFE). The alert automatically resolves in real time."*

---

## 🕒 Minute 2:45 - 3:00: Mission Audit Reports & Closing
5. **Navigate to Reports Page & Click `DOWNLOAD PDF REPORT`**:
   - Open the downloaded PDF in the browser:
     > *"Finally, compliance and flight audits are automated. With one click, the system generates a mission-grade PDF safety report with full satellite telemetry, debris catalogs, and maneuver audit trails, along with CSV export for ground telemetry archives.  
     > Satellite Safety Monitoring AI ensures our critical orbital infrastructure stays safe, autonomous, and collision-free. Thank you!"*
