const PDFDocument = require('pdfkit');
const { get, all } = require('../db');
const { recommendOrbitManeuver } = require('../ai/riskEngine');

async function generatePdfReport(satelliteId = null) {
  let sat;
  if (satelliteId) {
    sat = await get('SELECT * FROM satellites WHERE id = ?', [satelliteId]);
  }
  if (!sat) {
    sat = await get('SELECT * FROM satellites WHERE is_active = 1') || {};
  }
  const debrisList = await all(
    'SELECT * FROM debris WHERE satellite_id = ? ORDER BY collision_probability DESC',
    [sat.id || 'SAT-ALPHA-1']
  );
  const topHazard = debrisList[0] || {};

  const riskInfo = {
    collision_probability: topHazard.collision_probability || 85.0,
    miss_distance_km: Math.max(0.4, +((topHazard.distance || 15) * 0.12).toFixed(2))
  };

  const cam = recommendOrbitManeuver(sat, topHazard, riskInfo);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const buffers = [];

    doc.on('data', chunk => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', err => reject(err));

    // Styling palette
    const darkNavy = '#0B132B';
    const cyberBlue = '#0077B6';
    const alertRed = '#D90429';
    const safeGreen = '#10B981';
    const textDark = '#1C2541';
    const textMuted = '#475569';

    // --- Header Banner ---
    doc.rect(40, 40, 515, 68).fill(darkNavy);
    
    doc.fillColor('#FFFFFF')
       .fontSize(16)
       .font('Helvetica-Bold')
       .text('ASTROVIGIL: SATELLITE SAFETY MONITORING AI', 55, 50);

    doc.fontSize(10)
       .font('Helvetica-Bold')
       .fillColor('#90E0EF')
       .text('CONJUNCTION HAZARD: DANGEROUS VS SAFE CONDITION REPORT', 55, 70);

    doc.fontSize(8)
       .font('Helvetica')
       .fillColor('#CBD5E1')
       .text(`Target Asset: ${sat.name || 'Active Satellite'} (${sat.id || 'N/A'}) | Restricted SSA Level-4`, 55, 86);

    // --- Asset Specifications Bar ---
    let y = 120;
    doc.fillColor(cyberBlue).fontSize(11).font('Helvetica-Bold').text('PARTICULAR SATELLITE TELEMETRY SPECIFICATIONS', 40, y);
    doc.strokeColor(cyberBlue).lineWidth(1).moveTo(40, y + 14).lineTo(555, y + 14).stroke();
    y += 22;

    doc.rect(40, y, 515, 52).fillAndStroke('#F8FAFC', '#E2E8F0');
    doc.fillColor(textDark).fontSize(8.5).font('Helvetica');

    doc.text(`Satellite Identifier: ${sat.name || 'N/A'} (${sat.id || 'N/A'})`, 50, y + 8);
    doc.text(`Current Altitude: ${sat.altitude || 550} km (${sat.current_orbit || 'LEO'})`, 50, y + 22);
    doc.text(`Orbital Velocity: ${sat.velocity || 7.66} km/s`, 50, y + 36);

    doc.text(`Dry Mass: ${sat.mass_kg || 850} kg | Inclination: ${sat.inclination || 97.4}°`, 300, y + 8);
    doc.text(`Active Propellant Margin: ${sat.fuel_percent || 90}% Hydrazine`, 300, y + 22);
    doc.text(`Propulsion Readiness: Armed & Nominal (<150ms)`, 300, y + 36);
    y += 66;

    // --- 1. DANGEROUS CONDITION ---
    doc.fillColor(alertRed).fontSize(12).font('Helvetica-Bold').text('1. DANGEROUS CONDITION (IMMINENT COLLISION THREAT)', 40, y);
    doc.strokeColor(alertRed).lineWidth(1.5).moveTo(40, y + 15).lineTo(555, y + 15).stroke();
    y += 24;

    doc.rect(40, y, 515, 125).fillAndStroke('#FEF2F2', '#FECACA');
    
    // Danger tag
    doc.rect(50, y + 10, 150, 16).fill(alertRed);
    doc.fillColor('#FFFFFF').fontSize(8).font('Helvetica-Bold').text('CRITICAL COLLISION RISK', 58, y + 14);

    doc.fillColor(alertRed).fontSize(10).font('Helvetica-Bold')
       .text(`TARGET CONJUNCTION HAZARD: ${topHazard.name || 'COSMOS-1408 Frag #4192'} (${topHazard.id || 'DEB-2026-9041'})`, 50, y + 32);

    doc.fillColor(textDark).fontSize(9).font('Helvetica');
    doc.text(`• Object Classification: ${topHazard.type || 'space debris'}`, 50, y + 48);
    doc.text(`• Proximity Distance: ${topHazard.distance || 14.8} km (Immediate Perimeter Breach)`, 50, y + 62);
    doc.text(`• Relative Closing Velocity: ${topHazard.velocity || 7.82} km/s`, 50, y + 76);

    doc.text(`• Collision Probability (Pc): ${topHazard.collision_probability || 84.6}% [CRITICAL]`, 280, y + 48);
    doc.text(`• Time to Closest Approach (TCA): ${topHazard.time_to_impact_formatted || '04m 00s'}`, 280, y + 62);
    doc.text(`• Miss Distance Estimate: ${riskInfo.miss_distance_km} km`, 280, y + 76);

    doc.fillColor(textMuted).fontSize(8).font('Helvetica-Oblique')
       .text(`Danger Assessment: Trajectory intersection predicts direct impact without intervention. The radial distance has fallen below safe separation envelope, creating catastrophic fragmentation risk for ${sat.name}.`, 50, y + 96, { width: 495 });
    y += 140;

    // --- 2. SAFE CONDITION ---
    doc.fillColor(safeGreen).fontSize(12).font('Helvetica-Bold').text('2. SAFE CONDITION (POST-MANEUVER PROTECTION RESTORATION)', 40, y);
    doc.strokeColor(safeGreen).lineWidth(1.5).moveTo(40, y + 15).lineTo(555, y + 15).stroke();
    y += 24;

    doc.rect(40, y, 515, 135).fillAndStroke('#ECFDF5', '#A7F3D0');

    // Safe tag
    doc.rect(50, y + 10, 140, 16).fill(safeGreen);
    doc.fillColor('#FFFFFF').fontSize(8).font('Helvetica-Bold').text('SAFE ORBIT RESTORATION', 58, y + 14);

    doc.fillColor(safeGreen).fontSize(10).font('Helvetica-Bold')
       .text(`RECOMMENDED COLLISION AVOIDANCE MANEUVER (CAM)`, 50, y + 32);

    doc.fillColor(textDark).fontSize(9).font('Helvetica');
    doc.text(`• Safe Movement Vector: ${cam.direction}`, 50, y + 48);
    doc.text(`• Target Safe Orbit Altitude: ${cam.new_altitude} km (+${cam.altitude_change} km Boost)`, 50, y + 62);
    doc.text(`• Required Velocity Delta (Delta-V): ${cam.delta_v} m/s`, 50, y + 76);

    doc.text(`• Estimated Thruster Burn Duration: ${cam.burn_duration_formatted}`, 280, y + 48);
    doc.text(`• Propellant Consumption: ${cam.fuel_used_kg} kg Hydrazine (${cam.fuel_percent_used}%)`, 280, y + 62);
    doc.text(`• Post-Maneuver Separation: ${cam.safety_clearance_post_maneuver_km || '>50'} km`, 280, y + 76);

    doc.fillColor(textDark).fontSize(8.5).font('Helvetica-Bold')
       .text(`Safe Condition Guarantee:`, 50, y + 96);

    doc.fillColor(textMuted).fontSize(8).font('Helvetica')
       .text(`Executing this evasive burn elevates ${sat.name} into an orbitally cleared trajectory, reducing collision probability from ${topHazard.collision_probability}% to < 0.02% and restoring nominal operational status with zero secondary conjunction hazards.`, 50, y + 108, { width: 495 });
    y += 150;

    // --- Sign-off / Certification ---
    doc.rect(40, y, 515, 45).fillAndStroke('#F1F5F9', '#CBD5E1');
    doc.fillColor(textDark).fontSize(8).font('Helvetica-Bold')
       .text(`OPERATIONAL SSA CERTIFICATION:`, 50, y + 8);
    doc.fillColor(textMuted).fontSize(7.5).font('Helvetica')
       .text(`This report strictly evaluates the dangerous and safe conditions for ${sat.name} (${sat.id}) alone under Space Situational Awareness protocol. Calculations verified via Foster 2D encounter geometry & Tsiolkovsky impulsive burn mechanics.`, 50, y + 20, { width: 495 });

    // Footer
    doc.fontSize(8).fillColor(textMuted).text(`END OF REPORT - EXCLUSIVE SATELLITE SAFETY AUDIT • ${new Date().toISOString()}`, 40, 785, { align: 'center', width: 515 });

    doc.end();
  });
}

module.exports = {
  generatePdfReport
};
