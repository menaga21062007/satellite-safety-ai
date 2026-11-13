import React, { useRef, useEffect, useState } from 'react';
import { Satellite, DebrisObject } from '../types';
import { Crosshair, Eye, ShieldAlert, Zap, Globe, Compass } from 'lucide-react';

interface OrbitRadarCanvasProps {
  satellite: Satellite | null;
  debrisList: DebrisObject[];
  selectedDebrisId?: string | null;
  onSelectDebris?: (debris: DebrisObject) => void;
}

export const OrbitRadarCanvas: React.FC<OrbitRadarCanvasProps> = ({
  satellite,
  debrisList,
  selectedDebrisId,
  onSelectDebris
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [viewMode, setViewMode] = useState<'radar' | 'orbit'>('radar');
  const [sweepAngle, setSweepAngle] = useState(0);

  // Animation frame loop for radar sweep and orbital motion
  useEffect(() => {
    let animId: number;

    const render = () => {
      setSweepAngle((prev) => (prev + 0.02) % (Math.PI * 2));
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Draw on Canvas whenever props or sweepAngle changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.clearRect(0, 0, width, height);

    // Warm sand tactical background
    ctx.fillStyle = '#ede7dc';
    ctx.fillRect(0, 0, width, height);

    // Subtle coordinate stipples
    for (let i = 0; i < 40; i++) {
      const sx = ((i * 137.5) % width);
      const sy = ((i * 223.7) % height);
      const sRadius = (i % 3 === 0) ? 1.2 : 0.8;
      const alpha = 0.2 + 0.3 * Math.sin(sweepAngle * 2 + i);
      ctx.beginPath();
      ctx.arc(sx, sy, sRadius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(110, 100, 85, ${alpha.toFixed(2)})`;
      ctx.fill();
    }

    if (viewMode === 'radar') {
      // --- RADAR VIEW (Satellite-Centric Perimeter Radar) ---
      const maxRadius = Math.min(centerX, centerY) - 30;

      // Concentric Range Rings (25km, 50km, 75km, 100km)
      const rings = [
        { r: maxRadius * 0.25, label: '25 km' },
        { r: maxRadius * 0.50, label: '50 km' },
        { r: maxRadius * 0.75, label: '75 km' },
        { r: maxRadius * 1.00, label: '100 km' }
      ];

      rings.forEach((ring, idx) => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, ring.r, 0, Math.PI * 2);
        ctx.strokeStyle = idx === 0 ? 'rgba(190, 123, 56, 0.55)' : 'rgba(89, 116, 69, 0.3)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Ring label
        ctx.fillStyle = idx === 0 ? 'rgba(190, 123, 56, 0.9)' : 'rgba(71, 94, 54, 0.85)';
        ctx.font = '10px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(ring.label, centerX + 6, centerY - ring.r + 12);
      });

      // Crosshairs axes
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - maxRadius);
      ctx.lineTo(centerX, centerY + maxRadius);
      ctx.moveTo(centerX - maxRadius, centerY);
      ctx.lineTo(centerX + maxRadius, centerY);
      ctx.strokeStyle = 'rgba(89, 116, 69, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Radar Sweep Cone (Moss Green Tactical Sweep)
      const sweepGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, maxRadius
      );
      sweepGradient.addColorStop(0, 'rgba(89, 116, 69, 0.28)');
      sweepGradient.addColorStop(1, 'rgba(89, 116, 69, 0.0)');

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, maxRadius, sweepAngle - 0.45, sweepAngle);
      ctx.closePath();
      ctx.fillStyle = sweepGradient;
      ctx.fill();

      // Sweep leading beam line
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.cos(sweepAngle) * maxRadius,
        centerY + Math.sin(sweepAngle) * maxRadius
      );
      ctx.strokeStyle = 'rgba(89, 116, 69, 0.85)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // Draw Center: Active Satellite Blip (Deep Moss Green)
      ctx.save();
      // Outer pulse ring
      ctx.beginPath();
      ctx.arc(centerX, centerY, 12, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(89, 116, 69, 0.45)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Satellite core icon/dot
      ctx.beginPath();
      ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#597445';
      ctx.shadowColor = '#597445';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.restore();

      // Satellite label
      ctx.fillStyle = '#1e2418';
      ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(satellite?.name || 'ACTIVE SATELLITE', centerX, centerY + 24);
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = '#475e36';
      ctx.fillText(`ALT: ${satellite?.altitude || 550} KM | VEL: ${satellite?.velocity || 7.66} KM/S`, centerX, centerY + 36);

      // Draw Debris Objects on Radar
      debrisList.forEach((deb) => {
        // Map distance (0 to 100km) to radius (0 to maxRadius)
        const dNorm = Math.min(100, Math.max(2, deb.distance)) / 100;
        const rad = dNorm * maxRadius;
        const angleRad = (deb.bearing_angle * Math.PI) / 180;

        const objX = centerX + Math.cos(angleRad) * rad;
        const objY = centerY + Math.sin(angleRad) * rad;

        const isSelected = selectedDebrisId === deb.id;
        const isCritical = deb.risk_level === 'Critical';
        const isHigh = deb.risk_level === 'High';
        const isMedium = deb.risk_level === 'Medium';

        // Color coding (Terracotta for Critical/High, Amber for Medium, Moss Green for Safe)
        let color = '#597445'; // Green (Safe)
        if (isCritical || isHigh) color = '#be7b38'; // Terracotta (Critical/High)
        else if (isMedium) color = '#d97706'; // Amber (Medium)

        ctx.save();

        // If selected or critical, draw targeting ring
        if (isSelected || isCritical) {
          ctx.beginPath();
          ctx.arc(objX, objY, 14, 0, Math.PI * 2);
          ctx.strokeStyle = color;
          ctx.lineWidth = isSelected ? 2 : 1.5;
          ctx.setLineDash([3, 3]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Tracking crosshair notches
          ctx.beginPath();
          ctx.moveTo(objX - 18, objY);
          ctx.lineTo(objX - 12, objY);
          ctx.moveTo(objX + 12, objY);
          ctx.lineTo(objX + 18, objY);
          ctx.moveTo(objX, objY - 18);
          ctx.lineTo(objX, objY - 12);
          ctx.moveTo(objX, objY + 12);
          ctx.lineTo(objX, objY + 18);
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Trajectory vector line towards satellite
        if (isCritical || isHigh) {
          ctx.beginPath();
          ctx.moveTo(objX, objY);
          ctx.lineTo(centerX, centerY);
          ctx.strokeStyle = 'rgba(190, 123, 56, 0.45)';
          ctx.lineWidth = 1;
          ctx.setLineDash([2, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Debris Blip
        ctx.beginPath();
        const blipRadius = Math.max(3, Math.min(8, deb.size * 2));
        ctx.arc(objX, objY, blipRadius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = isCritical ? 10 : 4;
        ctx.fill();
        ctx.restore();

        // Label
        ctx.font = '10px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = isSelected ? '#1e2418' : '#3d4634';
        ctx.textAlign = 'left';
        ctx.fillText(`${deb.id}`, objX + 12, objY - 2);
        ctx.font = '8px "JetBrains Mono", monospace';
        ctx.fillStyle = color;
        ctx.fillText(`${deb.distance}km | ${deb.collision_probability}%`, objX + 12, objY + 9);
      });

    } else {
      // --- ORBITAL EARTH VIEW (Geocentric Orbit Projection) ---
      const earthRadius = 85;

      // Glow atmosphere
      const atmoGrad = ctx.createRadialGradient(
        centerX, centerY, earthRadius - 5,
        centerX, centerY, earthRadius + 25
      );
      atmoGrad.addColorStop(0, 'rgba(89, 116, 69, 0.35)');
      atmoGrad.addColorStop(0.5, 'rgba(89, 116, 69, 0.12)');
      atmoGrad.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(centerX, centerY, earthRadius + 25, 0, Math.PI * 2);
      ctx.fillStyle = atmoGrad;
      ctx.fill();

      // Earth body
      const earthGrad = ctx.createRadialGradient(
        centerX - 25, centerY - 25, 10,
        centerX, centerY, earthRadius
      );
      earthGrad.addColorStop(0, '#597445');
      earthGrad.addColorStop(0.7, '#3d4f2f');
      earthGrad.addColorStop(1, '#27341e');

      ctx.beginPath();
      ctx.arc(centerX, centerY, earthRadius, 0, Math.PI * 2);
      ctx.fillStyle = earthGrad;
      ctx.fill();
      ctx.strokeStyle = '#809f70';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Continental approximations
      ctx.fillStyle = '#809f70';
      ctx.beginPath();
      ctx.arc(centerX - 15, centerY - 20, 25, 0, Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(centerX + 20, centerY + 15, 30, 0, Math.PI * 0.8);
      ctx.fill();

      // Earth label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('EARTH (R=6378 KM)', centerX, centerY + 4);

      // Satellite Orbit Track (LEO ~550km)
      const orbitRadius = earthRadius + 75;
      ctx.beginPath();
      ctx.arc(centerX, centerY, orbitRadius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(89, 116, 69, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Higher safe orbit clearance track
      ctx.beginPath();
      ctx.arc(centerX, centerY, orbitRadius + 20, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(190, 123, 56, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Active Satellite on Orbit
      const satOrbitAngle = sweepAngle;
      const satX = centerX + Math.cos(satOrbitAngle) * orbitRadius;
      const satY = centerY + Math.sin(satOrbitAngle) * orbitRadius;

      ctx.save();
      ctx.beginPath();
      ctx.arc(satX, satY, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#00d4ff';
      ctx.shadowColor = '#00d4ff';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = '#00d4ff';
      ctx.font = 'bold 10px "Oxanium", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(satellite?.name || 'AstroVigil-1', satX, satY - 12);

      // Debris cluster in LEO orbit bands
      debrisList.forEach((deb, idx) => {
        const dAngle = satOrbitAngle + ((deb.bearing_angle - 45) * Math.PI) / 180;
        // Orbit radius variation based on relative distance
        const rOffset = (deb.distance - 20) * 0.8;
        const debOrbitRadius = orbitRadius + rOffset;

        const debX = centerX + Math.cos(dAngle) * debOrbitRadius;
        const debY = centerY + Math.sin(dAngle) * debOrbitRadius;

        const isCritical = deb.risk_level === 'Critical' || deb.risk_level === 'High';
        const color = isCritical ? '#ef4444' : (deb.risk_level === 'Medium' ? '#f59e0b' : '#10b981');

        ctx.beginPath();
        ctx.arc(debX, debY, 4, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = isCritical ? 10 : 4;
        ctx.fill();

        if (isCritical) {
          ctx.beginPath();
          ctx.arc(debX, debY, 9, 0, Math.PI * 2);
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1;
          ctx.setLineDash([2, 2]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });
    }

  }, [satellite, debrisList, selectedDebrisId, viewMode, sweepAngle]);

  // Handle canvas click to select debris
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !onSelectDebris) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const actualX = clickX * scaleX;
    const actualY = clickY * scaleY;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(centerX, centerY) - 30;

    // Find closest debris to click
    let closest: DebrisObject | null = null;
    let minDiff = 25; // hit radius in canvas pixels

    debrisList.forEach((deb) => {
      const dNorm = Math.min(100, Math.max(2, deb.distance)) / 100;
      const rad = dNorm * maxRadius;
      const angleRad = (deb.bearing_angle * Math.PI) / 180;

      const objX = centerX + Math.cos(angleRad) * rad;
      const objY = centerY + Math.sin(angleRad) * rad;

      const diff = Math.hypot(actualX - objX, actualY - objY);
      if (diff < minDiff) {
        minDiff = diff;
        closest = deb;
      }
    });

    if (closest) {
      onSelectDebris(closest);
    }
  };

  return (
    <div className="relative safari-card rounded-2xl overflow-hidden p-4 sm:p-5 flex flex-col items-center border-2 border-[#cfc4b2]">
      {/* HUD Header Toolbar (Compact) */}
      <div className="w-full flex items-center justify-between pb-3 border-b border-[#cfc4b2] mb-3">
        <div className="flex items-center space-x-2.5">
          <Crosshair className="w-4 h-4 text-[#597445] animate-pulse" />
          <span className="font-heading text-xs sm:text-sm text-[#1e2418] font-bold tracking-wide">
            Tactical Orbit & Perimeter Radar
          </span>
          <span className="orbit-pill font-mono py-0.5 px-2 text-[9px] bg-[#eae4d8] text-[#475e36] border border-[#cfc4b2]">
            LIVE 1.5s
          </span>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-1 bg-[#eae4d8] border-2 border-[#cfc4b2] rounded-full p-0.5 text-xs">
          <button
            onClick={() => setViewMode('radar')}
            className={`px-3 py-1 rounded-full transition-all flex items-center space-x-1 ${
              viewMode === 'radar'
                ? 'bg-[#597445] text-white shadow-sm font-semibold text-[11px]'
                : 'text-[#5c6850] hover:text-[#1e2418] text-[11px]'
            }`}
          >
            <Compass className="w-3 h-3" />
            <span>Polar</span>
          </button>
          <button
            onClick={() => setViewMode('orbit')}
            className={`px-3 py-1 rounded-full transition-all flex items-center space-x-1 ${
              viewMode === 'orbit'
                ? 'bg-[#597445] text-white shadow-sm font-semibold text-[11px]'
                : 'text-[#5c6850] hover:text-[#1e2418] text-[11px]'
            }`}
          >
            <Globe className="w-3 h-3" />
            <span>Earth LEO</span>
          </button>
        </div>
      </div>

      {/* Main Radar Canvas */}
      <div className="relative w-full aspect-square max-w-[460px] flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={600}
          height={600}
          onClick={handleCanvasClick}
          className="w-full h-full rounded-2xl cursor-crosshair border-2 border-[#cfc4b2] shadow-[0_8px_25px_rgba(110,95,75,0.08)]"
        />

        {/* Legend Overlay at bottom (Tactile Sand Pill) */}
        <div className="absolute bottom-3 left-3 bg-[#fbf9f5]/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border-2 border-[#cfc4b2] text-[9px] font-mono flex items-center space-x-3 shadow-md">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#597445] inline-block shadow-sm" />
            <span className="text-[#2b3323] font-semibold">Satellite</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#be7b38] inline-block shadow-sm" />
            <span className="text-[#2b3323] font-semibold">Critical Threat</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#d97706] inline-block shadow-sm" />
            <span className="text-[#2b3323] font-semibold">Medium</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#809f70] inline-block shadow-sm" />
            <span className="text-[#2b3323] font-semibold">Nominal</span>
          </div>
        </div>
      </div>

      {/* Hint footer */}
      <div className="w-full mt-2.5 text-center text-[10px] font-sans text-[#636c5b]">
        Click any contact on the radar to lock sensor & inspect conjunction kinematics
      </div>
    </div>
  );
};
