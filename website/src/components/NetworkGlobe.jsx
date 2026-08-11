import { useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";

const goldenAngle = Math.PI * (3 - Math.sqrt(5));
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const originLatitude = (20 * Math.PI) / 180;
const originLongitude = (78 * Math.PI) / 180;
const originVector = {
  x: Math.cos(originLatitude) * Math.cos(originLongitude),
  y: Math.sin(originLatitude),
  z: Math.cos(originLatitude) * Math.sin(originLongitude),
};

const createSpherePoints = (count) => Array.from({ length: count }, (_, index) => {
  const normalizedIndex = index / Math.max(1, count - 1);
  const y = 1 - normalizedIndex * 2;
  const horizontalRadius = Math.sqrt(Math.max(0, 1 - y * y));
  const angle = goldenAngle * index;
  const x = Math.cos(angle) * horizontalRadius;
  const z = Math.sin(angle) * horizontalRadius;
  const originProximity = x * originVector.x + y * originVector.y + z * originVector.z;

  return {
    x,
    y,
    z,
    size: 0.55 + (((index * 29) % 89) / 89) * 0.9,
    phase: (((index * 61) % 101) / 101) * Math.PI * 2,
    current: 0.7 + (((index * 43) % 97) / 97) * 0.65,
    origin: originProximity > 0.985,
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
  const spherePointsRef = useRef([]);
  const pointerRef = useRef({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    localX: 0,
    localY: 0,
    previousX: 0,
    previousY: 0,
    velocityX: 0,
    velocityY: 0,
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
    let fieldOffsetX = 0;
    let fieldOffsetY = 0;
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

      const particleCount = Math.round(clamp(width * 1.75, 620, 1080));
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

    const draw = (now) => {
      const elapsed = (now - start) / 1000;
      const pointer = pointerRef.current;
      pointer.x += (pointer.targetX - pointer.x) * 0.065;
      pointer.y += (pointer.targetY - pointer.y) * 0.065;
      pointer.velocityX *= 0.84;
      pointer.velocityY *= 0.84;

      context.clearRect(0, 0, width, height);

      const radius = Math.min(width, height) * 0.32;
      const targetFieldX = pointer.active ? pointer.x * radius * 0.16 : 0;
      const targetFieldY = pointer.active ? pointer.y * radius * 0.12 : 0;
      fieldOffsetX += (targetFieldX - fieldOffsetX) * 0.045;
      fieldOffsetY += (targetFieldY - fieldOffsetY) * 0.045;

      const centerX = width * 0.51 + fieldOffsetX;
      const centerY = height * 0.49 + fieldOffsetY;
      const rotation = 1.05 + (reducedMotion ? 0 : elapsed * 0.045) + pointer.x * 0.22;
      const tilt = -0.18 + pointer.y * 0.15;
      const cursorX = pointer.localX;
      const cursorY = pointer.localY;

      sceneCenterX = centerX;
      sceneCenterY = centerY;
      sceneRadius = radius;

      spherePointsRef.current.forEach((particle) => {
        const breathingRadius = radius * (
          1 + (reducedMotion ? 0 : Math.sin(elapsed * 0.55 * particle.current + particle.phase) * 0.009)
        );
        const base = rotateAndProject(particle, rotation, tilt, breathingRadius, centerX, centerY);
        const depth = clamp((base.z + 1) / 2);
        const particleXBeforeForce = base.x + particle.offsetX;
        const particleYBeforeForce = base.y + particle.offsetY;
        const cursorDx = particleXBeforeForce - cursorX;
        const cursorDy = particleYBeforeForce - cursorY;
        const cursorDistance = Math.max(0.01, Math.hypot(cursorDx, cursorDy));
        const interactionRadius = Math.max(105, radius * 0.72);
        const influence = pointer.active
          ? clamp(1 - cursorDistance / interactionRadius)
          : 0;

        if (influence > 0 && !reducedMotion) {
          const pressure = influence ** 2;
          const force = 2.1 * pressure * (0.6 + depth * 0.65);
          particle.velocityX += (cursorDx / cursorDistance) * force;
          particle.velocityY += (cursorDy / cursorDistance) * force;

          const flow = influence * 0.13;
          particle.velocityX += pointer.velocityX * flow;
          particle.velocityY += pointer.velocityY * flow;

          const swirl = pressure * 0.16;
          particle.velocityX += (-cursorDy / cursorDistance) * swirl;
          particle.velocityY += (cursorDx / cursorDistance) * swirl;
        }

        if (!reducedMotion) {
          const waveX = pointer.active
            ? Math.sin(elapsed * particle.current + particle.phase) * influence * 2.4
            : 0;
          const waveY = pointer.active
            ? Math.cos(elapsed * particle.current * 0.8 + particle.phase) * influence * 2.4
            : 0;
          particle.velocityX += (waveX - particle.offsetX) * 0.012;
          particle.velocityY += (waveY - particle.offsetY) * 0.012;
          particle.velocityX *= 0.925;
          particle.velocityY *= 0.925;
          particle.offsetX += particle.velocityX;
          particle.offsetY += particle.velocityY;

          const maxDisplacement = radius * 0.82;
          const displacement = Math.hypot(particle.offsetX, particle.offsetY);
          if (displacement > maxDisplacement) {
            const scale = maxDisplacement / displacement;
            particle.offsetX *= scale;
            particle.offsetY *= scale;
          }
        }

        const particleX = base.x + particle.offsetX;
        const particleY = base.y + particle.offsetY;
        const displacement = Math.hypot(particle.offsetX, particle.offsetY);
        const displacementAlpha = clamp(displacement / 80) * 0.13;
        const alpha = 0.1 + depth * 0.62 + displacementAlpha;
        const pointSize = particle.size * (0.6 + depth * 0.74 + influence * 0.18);

        context.fillStyle = particle.origin
          ? `rgba(176, 92, 42, ${Math.min(0.9, alpha + 0.12)})`
          : `rgba(37, 82, 101, ${alpha})`;
        context.beginPath();
        context.arc(particleX, particleY, pointSize, 0, Math.PI * 2);
        context.fill();
      });

      frameRef.current = isVisible && isDocumentVisible && !reducedMotion
        ? window.requestAnimationFrame(draw)
        : null;
    };

    const updatePointer = (event) => {
      const rect = container.getBoundingClientRect();
      const localX = event.clientX - rect.left;
      const localY = event.clientY - rect.top;
      const pointer = pointerRef.current;
      pointer.targetX = (localX / rect.width - 0.5) * 2;
      pointer.targetY = (localY / rect.height - 0.5) * 2;
      pointer.velocityX = clamp(localX - pointer.previousX, -26, 26);
      pointer.velocityY = clamp(localY - pointer.previousY, -26, 26);
      pointer.previousX = localX;
      pointer.previousY = localY;
      pointer.localX = localX;
      pointer.localY = localY;
      pointer.active = Math.hypot(localX - sceneCenterX, localY - sceneCenterY) <= sceneRadius * 1.22;
    };

    const handlePointerEnter = (event) => {
      const rect = container.getBoundingClientRect();
      pointerRef.current.previousX = event.clientX - rect.left;
      pointerRef.current.previousY = event.clientY - rect.top;
      updatePointer(event);
    };

    const handlePointerLeave = () => {
      pointerRef.current.targetX = 0;
      pointerRef.current.targetY = 0;
      pointerRef.current.velocityX = 0;
      pointerRef.current.velocityY = 0;
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
    container.addEventListener("pointerenter", handlePointerEnter);
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
      container.removeEventListener("pointerenter", handlePointerEnter);
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
      aria-label="Deformable particle globe centered on the physical Arch Linux origin in India"
      role="img"
    >
      <canvas ref={canvasRef} aria-hidden="true" />
      <div className="globe-coordinate globe-coordinate-top">GLOBAL REQUEST FIELD</div>
      <div className="globe-coordinate globe-coordinate-bottom">PHYSICAL ORIGIN / INDIA</div>
    </div>
  );
};

export default NetworkGlobe;
