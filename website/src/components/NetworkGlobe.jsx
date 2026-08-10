import { useEffect, useRef } from "react";

const origin = { lat: 20, lon: 78, kind: "origin" };
const routeNodes = [
  { lat: 37, lon: -122, kind: "public" },
  { lat: 51, lon: 0, kind: "public" },
  { lat: 1, lon: 104, kind: "private" },
  { lat: -33, lon: 151, kind: "private" },
];

const goldenAngle = Math.PI * (3 - Math.sqrt(5));
const toRadians = (degrees) => (degrees * Math.PI) / 180;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const toCartesian = ({ lat, lon }) => {
  const latitude = toRadians(lat);
  const longitude = toRadians(lon);
  return {
    x: Math.cos(latitude) * Math.cos(longitude),
    y: Math.sin(latitude),
    z: Math.cos(latitude) * Math.sin(longitude),
  };
};

const createSpherePoints = (count) => Array.from({ length: count }, (_, index) => {
  const y = 1 - (index / Math.max(1, count - 1)) * 2;
  const horizontalRadius = Math.sqrt(Math.max(0, 1 - y * y));
  const angle = goldenAngle * index;
  return {
    x: Math.cos(angle) * horizontalRadius,
    y,
    z: Math.sin(angle) * horizontalRadius,
    size: 0.45 + ((index * 29) % 71) / 130,
  };
});

const slerp = (from, to, progress) => {
  const dot = clamp(from.x * to.x + from.y * to.y + from.z * to.z, -1, 1);
  const angle = Math.acos(dot);
  const denominator = Math.sin(angle);
  if (denominator < 0.0001) return from;

  const fromWeight = Math.sin((1 - progress) * angle) / denominator;
  const toWeight = Math.sin(progress * angle) / denominator;
  return {
    x: from.x * fromWeight + to.x * toWeight,
    y: from.y * fromWeight + to.y * toWeight,
    z: from.z * fromWeight + to.z * toWeight,
  };
};

const NetworkGlobe = ({ className = "" }) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return undefined;

    const context = canvas.getContext("2d");
    if (!context) return undefined;

    const originVector = toCartesian(origin);
    const nodes = routeNodes.map((node) => ({ ...node, vector: toCartesian(node) }));
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const interaction = {
      dragging: false,
      lastX: 0,
      lastY: 0,
      rotation: -0.22,
      targetRotation: -0.22,
      tilt: -0.16,
      targetTilt: -0.16,
      velocityRotation: 0,
      velocityTilt: 0,
      lastInteraction: performance.now(),
    };

    let width = 0;
    let height = 0;
    let dpr = 1;
    let radius = 0;
    let centerX = 0;
    let centerY = 0;
    let lastFrame = performance.now();
    let spherePoints = [];
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

      centerX = width * 0.5;
      centerY = height * 0.49;
      radius = Math.min(width, height) * 0.32;
      spherePoints = createSpherePoints(Math.round(clamp(width, 430, 680)));
    };

    const rotateAndProject = (point) => {
      const cosRotation = Math.cos(interaction.rotation);
      const sinRotation = Math.sin(interaction.rotation);
      const rotatedX = point.x * cosRotation - point.z * sinRotation;
      const rotatedZ = point.z * cosRotation + point.x * sinRotation;
      const cosTilt = Math.cos(interaction.tilt);
      const sinTilt = Math.sin(interaction.tilt);
      const y = point.y * cosTilt - rotatedZ * sinTilt;
      const z = point.y * sinTilt + rotatedZ * cosTilt;

      return {
        x: centerX + rotatedX * radius,
        y: centerY - y * radius,
        z,
      };
    };

    const drawVisibleLine = (points, color, lineWidth = 0.8) => {
      context.strokeStyle = color;
      context.lineWidth = lineWidth;
      context.beginPath();
      let drawing = false;
      points.forEach((point) => {
        if (point.z > -0.04) {
          if (!drawing) context.moveTo(point.x, point.y);
          else context.lineTo(point.x, point.y);
          drawing = true;
        } else {
          drawing = false;
        }
      });
      context.stroke();
    };

    const drawGrid = () => {
      for (let latitude = -60; latitude <= 60; latitude += 20) {
        const samples = [];
        for (let longitude = -180; longitude <= 180; longitude += 5) {
          samples.push(rotateAndProject(toCartesian({ lat: latitude, lon: longitude })));
        }
        drawVisibleLine(samples, "rgba(139, 164, 175, 0.12)", 0.7);
      }

      for (let longitude = -180; longitude < 180; longitude += 30) {
        const samples = [];
        for (let latitude = -90; latitude <= 90; latitude += 4) {
          samples.push(rotateAndProject(toCartesian({ lat: latitude, lon: longitude })));
        }
        drawVisibleLine(samples, "rgba(139, 164, 175, 0.12)", 0.7);
      }
    };

    const drawRoutes = () => {
      nodes.forEach((node) => {
        const samples = Array.from({ length: 49 }, (_, index) => (
          rotateAndProject(slerp(node.vector, originVector, index / 48))
        ));
        const color = node.kind === "public"
          ? "rgba(126, 183, 205, 0.42)"
          : "rgba(128, 181, 156, 0.38)";
        drawVisibleLine(samples, color, 0.9);

        const projected = rotateAndProject(node.vector);
        if (projected.z > -0.04) {
          context.fillStyle = node.kind === "public"
            ? "rgba(159, 205, 222, 0.78)"
            : "rgba(145, 196, 171, 0.72)";
          context.beginPath();
          context.arc(projected.x, projected.y, 2, 0, Math.PI * 2);
          context.fill();
        }
      });
    };

    const drawServer = () => {
      const projected = rotateAndProject(originVector);
      if (projected.z <= -0.04) return;

      const scale = 0.82 + Math.max(0, projected.z) * 0.18;
      const iconWidth = 24 * scale;
      const iconHeight = 30 * scale;
      const left = projected.x - iconWidth / 2;
      const top = projected.y - iconHeight / 2;

      context.fillStyle = "rgba(8, 12, 14, 0.96)";
      context.strokeStyle = "rgba(224, 164, 102, 0.88)";
      context.lineWidth = 1;
      context.beginPath();
      context.roundRect(left, top, iconWidth, iconHeight, 4);
      context.fill();
      context.stroke();

      for (let bay = 0; bay < 3; bay += 1) {
        const bayY = top + 6 * scale + bay * 8 * scale;
        context.strokeStyle = "rgba(218, 228, 231, 0.55)";
        context.beginPath();
        context.moveTo(left + 5 * scale, bayY);
        context.lineTo(left + 19 * scale, bayY);
        context.stroke();
        context.fillStyle = "rgba(224, 164, 102, 0.9)";
        context.fillRect(left + 5 * scale, bayY + 2.5 * scale, 2 * scale, 1.2 * scale);
      }

      const labelOnLeft = projected.x > centerX + radius * 0.35;
      const labelX = labelOnLeft ? left - 12 : left + iconWidth + 12;
      const lineEndX = labelOnLeft ? left - 7 : left + iconWidth + 7;
      context.strokeStyle = "rgba(224, 164, 102, 0.52)";
      context.beginPath();
      context.moveTo(labelOnLeft ? left : left + iconWidth, projected.y);
      context.lineTo(lineEndX, projected.y);
      context.stroke();

      context.textAlign = labelOnLeft ? "right" : "left";
      context.textBaseline = "alphabetic";
      context.font = '600 8px "JetBrains Mono", monospace';
      context.fillStyle = "rgba(232, 226, 216, 0.88)";
      context.fillText("LENOVO / ARCH", labelX, projected.y - 2);
      context.font = '500 7px "JetBrains Mono", monospace';
      context.fillStyle = "rgba(156, 167, 171, 0.72)";
      context.fillText("PHYSICAL ORIGIN", labelX, projected.y + 9);
      context.textAlign = "start";
    };

    const draw = (now) => {
      const delta = Math.min(34, now - lastFrame || 16.67);
      lastFrame = now;
      const frameScale = delta / 16.67;

      if (!interaction.dragging) {
        interaction.targetRotation += interaction.velocityRotation * frameScale;
        interaction.targetTilt = clamp(
          interaction.targetTilt + interaction.velocityTilt * frameScale,
          -0.62,
          0.62,
        );
        interaction.velocityRotation *= 0.91 ** frameScale;
        interaction.velocityTilt *= 0.88 ** frameScale;

        if (!motionQuery.matches && now - interaction.lastInteraction > 1100) {
          interaction.targetRotation += delta * 0.000018;
        }
      }

      const easing = 1 - 0.84 ** frameScale;
      interaction.rotation += (interaction.targetRotation - interaction.rotation) * easing;
      interaction.tilt += (interaction.targetTilt - interaction.tilt) * easing;

      context.clearRect(0, 0, width, height);

      context.strokeStyle = "rgba(151, 174, 184, 0.2)";
      context.lineWidth = 1;
      context.beginPath();
      context.arc(centerX, centerY, radius, 0, Math.PI * 2);
      context.stroke();

      drawGrid();

      spherePoints.forEach((point) => {
        const projected = rotateAndProject(point);
        if (projected.z < -0.08) return;
        const depth = clamp((projected.z + 0.08) / 1.08, 0, 1);
        context.fillStyle = `rgba(156, 187, 199, ${0.13 + depth * 0.36})`;
        context.beginPath();
        context.arc(projected.x, projected.y, point.size * (0.7 + depth * 0.65), 0, Math.PI * 2);
        context.fill();
      });

      drawRoutes();
      drawServer();

      frameRef.current = isVisible && isDocumentVisible
        ? window.requestAnimationFrame(draw)
        : null;
    };

    const startLoop = () => {
      if (frameRef.current !== null || !isVisible || !isDocumentVisible) return;
      lastFrame = performance.now();
      frameRef.current = window.requestAnimationFrame(draw);
    };

    const handlePointerDown = (event) => {
      interaction.dragging = true;
      interaction.lastX = event.clientX;
      interaction.lastY = event.clientY;
      interaction.velocityRotation = 0;
      interaction.velocityTilt = 0;
      interaction.lastInteraction = performance.now();
      container.dataset.dragging = "true";
      container.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event) => {
      if (!interaction.dragging) return;
      const deltaX = event.clientX - interaction.lastX;
      const deltaY = event.clientY - interaction.lastY;
      interaction.lastX = event.clientX;
      interaction.lastY = event.clientY;

      const rotationDelta = deltaX * 0.0065;
      const tiltDelta = deltaY * 0.0048;
      interaction.targetRotation += rotationDelta;
      interaction.targetTilt = clamp(interaction.targetTilt + tiltDelta, -0.62, 0.62);
      interaction.velocityRotation = rotationDelta * 0.32;
      interaction.velocityTilt = tiltDelta * 0.24;
      interaction.lastInteraction = performance.now();
      startLoop();
    };

    const releasePointer = (event) => {
      if (!interaction.dragging) return;
      interaction.dragging = false;
      interaction.lastInteraction = performance.now();
      delete container.dataset.dragging;
      if (container.hasPointerCapture(event.pointerId)) container.releasePointerCapture(event.pointerId);
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
      startLoop();
    });
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible) startLoop();
      else if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    }, { rootMargin: "100px" });
    const handleVisibilityChange = () => {
      isDocumentVisible = document.visibilityState === "visible";
      if (isDocumentVisible) startLoop();
      else if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };

    resizeObserver.observe(container);
    visibilityObserver.observe(container);
    container.addEventListener("pointerdown", handlePointerDown);
    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerup", releasePointer);
    container.addEventListener("pointercancel", releasePointer);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    resize();
    startLoop();

    return () => {
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      container.removeEventListener("pointerdown", handlePointerDown);
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerup", releasePointer);
      container.removeEventListener("pointercancel", releasePointer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`network-globe ${className}`}
      aria-label="Rotatable network globe with the physical Lenovo Arch Linux server marked in India"
      role="img"
    >
      <canvas ref={canvasRef} aria-hidden="true" />
      <div className="globe-instruction" aria-hidden="true">Drag to rotate</div>
    </div>
  );
};

export default NetworkGlobe;
