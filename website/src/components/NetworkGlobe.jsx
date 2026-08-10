import { useEffect, useRef } from "react";

const globeNodes = [
  { lat: 37, lon: -122, size: 3.2 },
  { lat: 51, lon: 0, size: 2.8 },
  { lat: 28, lon: 77, size: 4.2, origin: true },
  { lat: 1, lon: 104, size: 2.6 },
  { lat: -33, lon: 151, size: 2.5 },
  { lat: 35, lon: 139, size: 2.5 },
];

const routePairs = [
  [0, 2],
  [1, 2],
  [3, 2],
  [4, 2],
  [5, 2],
];

const toRadians = (degrees) => (degrees * Math.PI) / 180;

const NetworkGlobe = ({ className = "" }) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const pointsRef = useRef([]);
  const pointerRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return undefined;

    const context = canvas.getContext("2d");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let start = performance.now();

    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      pointsRef.current = Array.from({ length: Math.max(28, Math.floor(width / 14)) }, (_, index) => ({
        x: ((index * 83) % 101) / 101 * width,
        y: ((index * 47) % 97) / 97 * height,
        alpha: 0.08 + (index % 5) * 0.025,
      }));
    };

    const project = (lat, lon, rotation, tilt, radius, centerX, centerY) => {
      const latitude = toRadians(lat);
      const longitude = toRadians(lon) + rotation;
      const rawX = Math.cos(latitude) * Math.cos(longitude);
      const rawY = Math.sin(latitude);
      const rawZ = Math.cos(latitude) * Math.sin(longitude);
      const cosTilt = Math.cos(tilt);
      const sinTilt = Math.sin(tilt);
      const y = rawY * cosTilt - rawZ * sinTilt;
      const z = rawY * sinTilt + rawZ * cosTilt;

      return {
        x: centerX + rawX * radius,
        y: centerY - y * radius,
        z,
      };
    };

    const drawSegmentedLine = (samples, strokeStyle, lineWidth) => {
      context.strokeStyle = strokeStyle;
      context.lineWidth = lineWidth;
      let drawing = false;
      context.beginPath();
      samples.forEach((point) => {
        if (point.z > -0.08) {
          if (!drawing) context.moveTo(point.x, point.y);
          else context.lineTo(point.x, point.y);
          drawing = true;
        } else {
          drawing = false;
        }
      });
      context.stroke();
    };

    const draw = (now) => {
      const elapsed = (now - start) / 1000;
      const pointer = pointerRef.current;
      pointer.x += (pointer.targetX - pointer.x) * 0.055;
      pointer.y += (pointer.targetY - pointer.y) * 0.055;

      context.clearRect(0, 0, width, height);

      const centerX = width * 0.51 + pointer.x * 14;
      const centerY = height * 0.49 + pointer.y * 10;
      const radius = Math.min(width, height) * 0.31;
      const rotation = 1.05 + (reducedMotion ? 0 : elapsed * 0.055) + pointer.x * 0.18;
      const tilt = -0.18 + pointer.y * 0.12;

      pointsRef.current.forEach((point) => {
        const distance = Math.hypot(point.x - (pointer.x + 1) * width * 0.5, point.y - (pointer.y + 1) * height * 0.5);
        const proximity = Math.max(0, 1 - distance / 170);
        context.fillStyle = `rgba(145, 177, 197, ${point.alpha + proximity * 0.18})`;
        context.fillRect(point.x, point.y, 1, 1);
      });

      const glow = context.createRadialGradient(centerX, centerY, radius * 0.15, centerX, centerY, radius * 1.35);
      glow.addColorStop(0, "rgba(49, 145, 190, 0.16)");
      glow.addColorStop(0.55, "rgba(22, 68, 91, 0.09)");
      glow.addColorStop(1, "rgba(0, 0, 0, 0)");
      context.fillStyle = glow;
      context.beginPath();
      context.arc(centerX, centerY, radius * 1.35, 0, Math.PI * 2);
      context.fill();

      context.strokeStyle = "rgba(107, 159, 184, 0.16)";
      context.lineWidth = 1;
      context.beginPath();
      context.arc(centerX, centerY, radius, 0, Math.PI * 2);
      context.stroke();

      for (let lat = -60; lat <= 60; lat += 20) {
        const samples = [];
        for (let lon = -180; lon <= 180; lon += 4) {
          samples.push(project(lat, lon, rotation, tilt, radius, centerX, centerY));
        }
        drawSegmentedLine(samples, "rgba(105, 154, 177, 0.13)", 0.75);
      }

      for (let lon = -180; lon < 180; lon += 20) {
        const samples = [];
        for (let lat = -90; lat <= 90; lat += 3) {
          samples.push(project(lat, lon, rotation, tilt, radius, centerX, centerY));
        }
        drawSegmentedLine(samples, "rgba(105, 154, 177, 0.13)", 0.75);
      }

      const projectedNodes = globeNodes.map((node) => ({
        ...node,
        ...project(node.lat, node.lon, rotation, tilt, radius, centerX, centerY),
      }));

      routePairs.forEach(([fromIndex, toIndex], routeIndex) => {
        const from = projectedNodes[fromIndex];
        const to = projectedNodes[toIndex];
        if (from.z < -0.05 || to.z < -0.05) return;

        const controlX = (from.x + to.x) / 2 + pointer.x * 18;
        const controlY = Math.min(from.y, to.y) - radius * (0.18 + Math.abs(from.x - to.x) / width * 0.2) + pointer.y * 12;
        context.strokeStyle = "rgba(102, 190, 224, 0.34)";
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(from.x, from.y);
        context.quadraticCurveTo(controlX, controlY, to.x, to.y);
        context.stroke();

        const progress = reducedMotion ? 0.58 : (elapsed * 0.16 + routeIndex * 0.19) % 1;
        const inverse = 1 - progress;
        const packetX = inverse * inverse * from.x + 2 * inverse * progress * controlX + progress * progress * to.x;
        const packetY = inverse * inverse * from.y + 2 * inverse * progress * controlY + progress * progress * to.y;
        context.fillStyle = "rgba(185, 232, 248, 0.95)";
        context.shadowColor = "rgba(102, 200, 235, 0.8)";
        context.shadowBlur = 9;
        context.beginPath();
        context.arc(packetX, packetY, 1.7, 0, Math.PI * 2);
        context.fill();
        context.shadowBlur = 0;
      });

      projectedNodes.forEach((node) => {
        if (node.z < -0.05) return;
        const alpha = 0.45 + Math.max(0, node.z) * 0.5;
        context.fillStyle = node.origin ? `rgba(238, 167, 82, ${alpha})` : `rgba(139, 211, 238, ${alpha})`;
        context.strokeStyle = node.origin ? "rgba(238, 167, 82, 0.24)" : "rgba(139, 211, 238, 0.2)";
        context.lineWidth = 1;
        context.beginPath();
        context.arc(node.x, node.y, node.size + 5, 0, Math.PI * 2);
        context.stroke();
        context.beginPath();
        context.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        context.fill();
      });

      context.strokeStyle = "rgba(124, 170, 191, 0.12)";
      context.setLineDash([2, 8]);
      context.beginPath();
      context.ellipse(centerX, centerY, radius * 1.24, radius * 0.34, -0.18 + pointer.x * 0.04, 0, Math.PI * 2);
      context.stroke();
      context.setLineDash([]);

      frameRef.current = window.requestAnimationFrame(draw);
    };

    const handlePointerMove = (event) => {
      const rect = container.getBoundingClientRect();
      pointerRef.current.targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      pointerRef.current.targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    const handlePointerLeave = () => {
      pointerRef.current.targetX = 0;
      pointerRef.current.targetY = 0;
    };

    const observer = new ResizeObserver(resize);
    observer.observe(container);
    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerleave", handlePointerLeave);
    resize();
    start = performance.now();
    frameRef.current = window.requestAnimationFrame(draw);

    return () => {
      observer.disconnect();
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", handlePointerLeave);
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <div ref={containerRef} className={`network-globe ${className}`}>
      <canvas ref={canvasRef} aria-hidden="true" />
      <div className="globe-coordinate globe-coordinate-top">EDGE NETWORK / GLOBAL</div>
      <div className="globe-coordinate globe-coordinate-bottom">ORIGIN / PRIVATE NODE</div>
      <div className="globe-origin-label">
        <span />
        physical origin
      </div>
    </div>
  );
};

export default NetworkGlobe;
