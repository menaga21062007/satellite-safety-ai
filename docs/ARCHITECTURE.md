# System Architecture & Technical Specifications

## 1. System Overview
**Satellite Safety Monitoring AI** is an aerospace-grade Space Situational Awareness (SSA) and collision avoidance platform. The application continuously ingests radar-like tracking data, maintains state vectors for active satellites and nearby space debris objects, evaluates close-encounter conjunctions using statistical Foster 2D B-plane probability models, generates optimal delta-V maneuver recommendations, and renders everything on a NASA-style mission control dashboard.

```
       +-------------------------------------------------------------+
       |               RADAR SIMULATION & TRACKING FEED              |
       |  Proximity Detection (100km) | Bearing & Range Rate Sensors  |
       +-------------------------------------------------------------+
                                      |
                                      v
       +-------------------------------------------------------------+
       |             NODE.JS / EXPRESS BACKEND ENGINE                |
       |  Simulation Manager | SQLite Persistent Store | PDF Reports |
       +-------------------------------------------------------------+
                       |                             |
                       v                             v
       +-----------------------------+ +-----------------------------+
       |      AI CONJUNCTION RISK    | |    SAFE ORBIT MANEUVER      |
       |   Foster 2D B-Plane Model   | | Tsiolkovsky Rocket Equation |
       |     Pc, Miss Dist, TCA      | | Delta-V, Burn Time, Fuel %  |
       +-----------------------------+ +-----------------------------+
                       |                             |
                       +--------------+--------------+
                                      |
                                      v
       +-------------------------------------------------------------+
       |              REACT + TYPESCRIPT MISSION DASHBOARD           |
       |  2D Tactical Canvas | Recharts Telemetry | Real-Time Alerts  |
       +-------------------------------------------------------------+
```

---

## 2. Core Mathematical & Astrodynamics Models

### 2.1 Conjunction Kinematics & Time to Closest Approach (TCA)
Given satellite state $(\mathbf{r}_{sat}, \mathbf{v}_{sat})$ and debris state $(\mathbf{r}_{obj}, \mathbf{v}_{obj})$ in Earth-Centered Inertial (ECI) frame:
$$\mathbf{r}_{rel} = \mathbf{r}_{obj} - \mathbf{r}_{sat}, \quad \mathbf{v}_{rel} = \mathbf{v}_{obj} - \mathbf{v}_{sat}$$
The time to closest approach ($TCA$) is derived by minimizing $|\mathbf{r}_{rel}(t)|$:
$$TCA = -\frac{\mathbf{r}_{rel} \cdot \mathbf{v}_{rel}}{\|\mathbf{v}_{rel}\|^2}$$
If $TCA > 0$, the encounter is upcoming. The projected miss distance vector is:
$$\mathbf{b} = \mathbf{r}_{rel} + \mathbf{v}_{rel} \cdot TCA$$

### 2.2 Foster 2D B-Plane Collision Probability ($P_c$)
The collision probability integrates the joint positional covariance over the hard-body collision cross-section $R_c = R_{sat} + R_{obj}$:
$$P_c = \frac{1}{2\pi \sigma^2} \iint_{x^2 + y^2 \le R_c^2} \exp\left( -\frac{(x - b_x)^2 + (y - b_y)^2}{2\sigma^2} \right) dx dy$$
Where $\sigma$ represents the 1-sigma positional uncertainty in Low Earth Orbit (typically $0.5 \cdot \sqrt{d}$ to $2.5\text{ km}$).

### 2.3 Impulsive Collision Avoidance Maneuver (CAM)
When $P_c$ breaches safe operational thresholds ($\ge 25\%$), the AI optimizes an impulsive delta-V ($\Delta V$) thrust vector along the prograde/radial direction to increase orbital separation at the encounter point.
Fuel consumption is modeled via the **Tsiolkovsky Rocket Equation**:
$$\Delta m = m_0 \cdot \left(1 - \exp\left(-\frac{\Delta V}{I_{sp} \cdot g_0}\right)\right)$$
Where:
- $m_0$: Satellite wet mass (850 kg)
- $I_{sp}$: Thruster specific impulse (285 seconds for hydrazine monopropellant)
- $g_0$: Standard gravitational acceleration ($9.80665\text{ m/s}^2$)
Burn duration is computed as $t_{burn} = \frac{m_{avg} \cdot \Delta V}{F_{thrust}}$.

---

## 3. Database Schema (SQLite)
The application utilizes an embedded SQLite database (`satellite_safety.sqlite`):
1. **`satellites`**: Stores satellite telemetry (altitude, velocity, orbit, fuel, battery, lat/lon, status).
2. **`debris`**: Real-time catalog of nearby objects, cross-section sizes, distances, speeds, bearing angles, and risk metrics.
3. **`alerts`**: Conjunction warning events, severity levels, acknowledged/resolved states, and timestamps.
4. **`maneuvers`**: Historical log of executed orbital burns, delta-V expended, fuel consumed, and post-maneuver clearances.
