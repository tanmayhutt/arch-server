import { useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";

const globeNodes = [
  { lat: 37, lon: -122, size: 3.2 },
  { lat: 51, lon: 0, size: 2.8 },
  { lat: 20, lon: 78, size: 4.2, origin: true },
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

const goldenAngle = Math.PI * (3 - Math.sqrt(5));
const toRadians = (degrees) => (degrees * Math.PI) / 180;
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const createSpherePoints = (count) => Array.from({ length: count }, (_, index) => {
  const normalizedIndex = index / Math.max(1, count - 1);
  const y = 1 - normalizedIndex * 2;
  const horizontalRadius = Math.sqrt(Math.max(0, 1 - y * y));
  const angle = goldenAngle * index;
  return {
    x: Math.cos(angle) * horizontalRadius,
    y,
    z: Math.sin(angle) * horizontalRadius,
    size: 0.55 + (((index * 29) % 89) / 89) * 0.8,
    offsetX: 0,
    offsetY: 0,
    velocityX: 0,
    velocityY: 0,
  };
});

const NetworkGlobe = ({ className = "" }) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const ambientPointsRef = useRef([]);
  const spherePointsRef = useRef([]);
  const pointerRef = useRef({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    localX: 0,
    localY: 0,
    active: false,
  });
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return undefined;

    const context = canvas.getContext("2d");
    if (!context) return undefined;

    const reducedMotion = Boolean(prefersReducedMotion);
    let width = 0;
    let height = 0;
    let dpr = 1;
    let start = performance.now();
    let sceneCenterX = 0;
    let sceneCenterY = 0;
    let sceneRadius = 0;
    let isVisible = true;
    let isDocumentVisible = document.visibilityState === "visible";

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

      ambientPointsRef.current = Array.from({ length: Math.max(28, Math.floor(width / 14)) }, (_, index) => ({
        x: ((((index * 83) % 101) / 101) * width),
        y: ((((index * 47) % 97) / 97) * height),
        alpha: 0.08 + (index % 5) * 0.025,
      }));

      const particleCount = Math.round(clamp(width * 1.35, 420, 760));
      spherePointsRef.current = createSpherePoints(particleCount);
    };

    const rotateAndProject = (point, rotation, tilt, radius, centerX, centerY) => {
      const cosRotation = Math.cos(rotation);
      const sinRotation = Math.sin(rotation);
      const rotatedX = point.x * cosRotation - point.z * sinRotation;
      const rotatedZ = point.z * cosRotation + point.x * sinRotation;
      const cosTilt = Math.cos(tilt);
      const sinTilt = Math.sin(tilt);
      const y = point.y * cosTilt - rotatedZ * sinTilt;
      const z = point.y * sinTilt + rotatedZ * cosTilt;

      return {
        x: centerX + rotatedX * radius,
        y: centerY - y * radius,
        z,
      };
    };

    const project = (lat, lon, rotation, tilt, radius, centerX, centerY) => {
      const latitude = toRadians(lat);
      const longitude = toRadians(lon);

      return rotateAndProject({
        x: Math.cos(latitude) * Math.cos(longitude),
        y: Math.sin(latitude),
        z: Math.cos(latitude) * Math.sin(longitude),
      }, rotation, tilt, radius, centerX, centerY);
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
      const cursorX = pointer.localX;
      const cursorY = pointer.localY;
      const structureAlpha = 1;

      sceneCenterX = centerX;
      sceneCenterY = centerY;
      sceneRadius = radius;

      ambientPointsRef.current.forEach((point) => {
        const distance = Math.hypot(point.x - cursorX, point.y - cursorY);
        const proximity = Math.max(0, 1 - distance / 170);
        context.fillStyle = `rgba(145, 177, 197, ${point.alpha + proximity * 0.18})`;
        context.fillRect(point.x, point.y, 1, 1);
      });

      const glow = context.createRadialGradient(centerX, centerY, radius * 0.15, centerX, centerY, radius * 1.45);
      glow.addColorStop(0, "rgba(49, 145, 190, 0.14)");
      glow.addColorStop(0.55, "rgba(22, 68, 91, 0.09)");
      glow.addColorStop(1, "rgba(0, 0, 0, 0)");
      context.fillStyle = glow;
      context.beginPath();
      context.arc(centerX, centerY, radius * 1.45, 0, Math.PI * 2);
      context.fill();

      context.strokeStyle = "rgba(107, 159, 184, 0.14)";
      context.lineWidth = 1;
      context.beginPath();
      context.arc(centerX, centerY, radius, 0, Math.PI * 2);
      context.stroke();

      for (let lat = -60; lat <= 60; lat += 20) {
        const samples = [];
        for (let lon = -180; lon <= 180; lon += 4) {
          samples.push(project(lat, lon, rotation, tilt, radius, centerX, centerY));
        }
        drawSegmentedLine(samples, `rgba(105, 154, 177, ${0.13 * structureAlpha})`, 0.75);
      }

      for (let lon = -180; lon < 180; lon += 20) {
        const samples = [];
        for (let lat = -90; lat <= 90; lat += 3) {
          samples.push(project(lat, lon, rotation, tilt, radius, centerX, centerY));
        }
        drawSegmentedLine(samples, `rgba(105, 154, 177, ${0.13 * structureAlpha})`, 0.75);
      }

      spherePointsRef.current.forEach((particle) => {
        const base = rotateAndProject(particle, rotation, tilt, radius, centerX, centerY);
        if (base.z < -0.14) return;

        const depth = clamp((base.z + 0.14) / 1.14);
        const particleXBeforeForce = base.x + particle.offsetX;
        const particleYBeforeForce = base.y + particle.offsetY;
        const cursorDx = particleXBeforeForce - cursorX;
        const cursorDy = particleYBeforeForce - cursorY;
        const cursorDistance = Math.max(0.01, Math.hypot(cursorDx, cursorDy));
        const interactionRadius = Math.max(74, radius * 0.48);

        if (pointer.active && cursorDistance < interactionRadius && !reducedMotion) {
          const influence = (1 - cursorDistance / interactionRadius) ** 2;
          const force = 2.35 * influence;
          particle.velocityX += (cursorDx / cursorDistance) * force;
          particle.velocityY += (cursorDy / cursorDistance) * force;
          particle.velocityX += (-cursorDy / cursorDistance) * force * 0.08;
          particle.velocityY += (cursorDx / cursorDistance) * force * 0.08;
        }

        if (!reducedMotion) {
          particle.velocityX += -particle.offsetX * 0.018;
          particle.velocityY += -particle.offsetY * 0.018;
          particle.velocityX *= 0.9;
          particle.velocityY *= 0.9;
          particle.offsetX += particle.velocityX;
          particle.offsetY += particle.velocityY;
        }

        const particleX = base.x + particle.offsetX;
        const particleY = base.y + particle.offsetY;
        const displacement = Math.hypot(particle.offsetX, particle.offsetY);
        const alpha = 0.1 + depth * 0.36 + clamp(displacement / 70) * 0.2;
        const pointSize = particle.size * (0.62 + depth * 0.58);
        context.fillStyle = `rgba(151, 211, 232, ${alpha})`;
        context.beginPath();
        context.arc(particleX, particleY, pointSize, 0, Math.PI * 2);
        context.fill();
      });

      const projectedNodes = globeNodes.map((node) => ({
        ...node,
        ...project(node.lat, node.lon, rotation, tilt, radius, centerX, centerY),
      }));

      context.save();
      context.globalAlpha = structureAlpha;

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

      const originNode = projectedNodes.find((node) => node.origin);
      if (originNode?.z > -0.05) {
        context.fillStyle = "rgba(232, 162, 90, 0.72)";
        context.font = '500 8px "JetBrains Mono", monospace';
        context.textBaseline = "middle";
        context.fillText("PHYSICAL ORIGIN", originNode.x + 13, originNode.y - 11);
      }

      context.restore();

      context.strokeStyle = `rgba(124, 170, 191, ${0.12 * structureAlpha})`;
      context.setLineDash([2, 8]);
      context.beginPath();
      context.ellipse(centerX, centerY, radius * 1.24, radius * 0.34, -0.18 + pointer.x * 0.04, 0, Math.PI * 2);
      context.stroke();
      context.setLineDash([]);

      frameRef.current = isVisible && isDocumentVisible && !reducedMotion
        ? window.requestAnimationFrame(draw)
        : null;
    };

    const updatePointer = (event) => {
      const rect = container.getBoundingClientRect();
      const localX = event.clientX - rect.left;
      const localY = event.clientY - rect.top;
      pointerRef.current.targetX = (localX / rect.width - 0.5) * 2;
      pointerRef.current.targetY = (localY / rect.height - 0.5) * 2;
      pointerRef.current.localX = localX;
      pointerRef.current.localY = localY;

      const isInsideGlobe = Math.hypot(localX - sceneCenterX, localY - sceneCenterY) <= sceneRadius * 1.08;
      pointerRef.current.active = isInsideGlobe;
    };

    const handlePointerLeave = () => {
      pointerRef.current.targetX = 0;
      pointerRef.current.targetY = 0;
      pointerRef.current.active = false;
    };

    const handleResize = () => {
      resize();
      if (reducedMotion) draw(performance.now());
    };

    const resizeObserver = new ResizeObserver(handleResize);
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible && isDocumentVisible && !reducedMotion && frameRef.current === null) {
        frameRef.current = window.requestAnimationFrame(draw);
      } else if (!isVisible && frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      } else if (isVisible && reducedMotion) {
        draw(performance.now());
      }
    }, { rootMargin: "120px" });

    const handleVisibilityChange = () => {
      isDocumentVisible = document.visibilityState === "visible";
      if (!isDocumentVisible && frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      } else if (isDocumentVisible && isVisible && !reducedMotion && frameRef.current === null) {
        frameRef.current = window.requestAnimationFrame(draw);
      }
    };

    resizeObserver.observe(container);
    visibilityObserver.observe(container);
    container.addEventListener("pointermove", updatePointer);
    container.addEventListener("pointerleave", handlePointerLeave);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    resize();
    start = performance.now();
    if (reducedMotion) draw(start);
    else frameRef.current = window.requestAnimationFrame(draw);

    return () => {
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      container.removeEventListener("pointermove", updatePointer);
      container.removeEventListener("pointerleave", handlePointerLeave);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    };
  }, [prefersReducedMotion]);

  return (
    <div
      ref={containerRef}
      className={`network-globe ${className}`}
      aria-label="Interactive point-field globe showing encrypted routes to the physical Arch Linux origin"
      role="img"
    >
      <canvas ref={canvasRef} aria-hidden="true" />
      <div className="globe-coordinate globe-coordinate-top">EDGE NETWORK / GLOBAL</div>
      <div className="globe-coordinate globe-coordinate-bottom">ORIGIN / PRIVATE NODE</div>
    </div>
  );
};

export default NetworkGlobe;
