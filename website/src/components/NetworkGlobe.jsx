import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import * as THREE from "three";

const COUNT = 1800;
const STAGE_DURATION = 5600;
const PALETTE = ["#315f73", "#477b68", "#a66a42", "#7e8b88"];

const random = (index, salt = 0) => {
  const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
};

const laptopPoint = (index) => {
  const section = index % 16;
  const t = random(index, 1);
  if (section < 6) {
    const edge = index % 4;
    if (edge === 0) return [-2.25 + t * 4.5, 1.55, random(index, 2) * 0.12];
    if (edge === 1) return [2.25, -1.15 + t * 2.7, random(index, 2) * 0.12];
    if (edge === 2) return [2.25 - t * 4.5, -1.15, random(index, 2) * 0.12];
    return [-2.25, 1.55 - t * 2.7, random(index, 2) * 0.12];
  }
  if (section < 12) {
    return [-1.98 + t * 3.96, -0.92 + random(index, 3) * 2.16, (random(index, 4) - 0.5) * 0.06];
  }
  const depth = random(index, 4);
  return [-2.65 + t * 5.3, -1.34 - depth * 0.72, (depth - 0.5) * 1.55];
};

const serverPoint = (index) => {
  const rack = index % 5;
  const face = index % 8;
  const x = -1.28 + random(index, 5) * 2.56;
  const y = -1.72 + rack * 0.86 + random(index, 6) * 0.48;
  const z = (random(index, 7) - 0.5) * 1.18;
  if (face < 4) return [x, y, face % 2 ? 0.58 : -0.58];
  if (face < 6) return [face % 2 ? 1.28 : -1.28, y, z];
  return [x, -1.72 + rack * 0.86, z];
};

const archPoint = (index) => {
  const y = -1.72 + random(index, 11) * 3.72;
  const outerHalf = Math.max(0.05, (2 - y) * 0.61);
  const innerHalf = y < 0.84 ? Math.max(0, (0.84 - y) * 0.35) : 0;
  const side = random(index, 12) < 0.5 ? -1 : 1;
  const fill = random(index, 13);
  const x = innerHalf > 0
    ? side * (innerHalf + fill * (outerHalf - innerHalf))
    : (fill * 2 - 1) * outerHalf;
  const crownCut = y > 1.18 && Math.abs(x) < (y - 1.18) * 0.16;
  return [crownCut ? x + side * 0.17 : x, y, (random(index, 14) - 0.5) * 0.22];
};

const networkPoint = (index) => {
  const phi = Math.acos(1 - 2 * ((index + 0.5) / COUNT));
  const theta = Math.PI * (1 + Math.sqrt(5)) * index;
  const radius = 2.25 + (random(index, 8) - 0.5) * 0.08;
  return [Math.cos(theta) * Math.sin(phi) * radius, Math.cos(phi) * radius, Math.sin(theta) * Math.sin(phi) * radius];
};

const buildShape = (factory) => {
  const points = new Float32Array(COUNT * 3);
  for (let index = 0; index < COUNT; index += 1) {
    const [x, y, z] = factory(index);
    points[index * 3] = x;
    points[index * 3 + 1] = y;
    points[index * 3 + 2] = z;
  }
  return points;
};

const stages = [
  ["01", "Broken display", "The screen stopped being a dependable way into the machine."],
  ["02", "Arch survives", "The display failed. The customized Arch system underneath it did not."],
  ["03", "Headless node", "Arch kept running, so the laptop became a small always-on server."],
  ["04", "Connected system", "Cloudflare, Tailscale, and GitHub now give it three deliberate routes."],
];

const NetworkGlobe = () => {
  const mountRef = useRef(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  const [cycleKey, setCycleKey] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  const shapes = useMemo(() => [buildShape(laptopPoint), buildShape(archPoint), buildShape(serverPoint), buildShape(networkPoint)], []);

  useEffect(() => { activeRef.current = active; }, [active]);

  useEffect(() => {
    if (shouldReduceMotion) return undefined;
    const timer = window.setTimeout(() => {
      setActive((current) => (current + 1) % stages.length);
      setCycleKey((current) => current + 1);
    }, STAGE_DURATION);
    return () => window.clearTimeout(timer);
  }, [active, cycleKey, shouldReduceMotion]);

  const selectStage = (index) => {
    setActive(index);
    setCycleKey((current) => current + 1);
  };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 8.7);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const positions = shapes[0].slice();
    const velocities = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    for (let index = 0; index < COUNT; index += 1) {
      const color = new THREE.Color(PALETTE[index % PALETTE.length]);
      colors[index * 3] = color.r;
      colors[index * 3 + 1] = color.g;
      colors[index * 3 + 2] = color.b;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const material = new THREE.PointsMaterial({ size: 0.047, sizeAttenuation: true, transparent: true, opacity: 0.9, vertexColors: true, depthWrite: false });
    const cloud = new THREE.Points(geometry, material);
    scene.add(cloud);

    const routeGroup = new THREE.Group();
    const routeMaterials = [];
    const routeColors = [0x315f73, 0x477b68, 0xa66a42];
    const routeCurves = [
      [[-2.05, 0.62, 0.25], [-0.72, 2.75, 0.72], [1.4, 1.78, 0.2]],
      [[-1.95, -0.78, 0.28], [-0.35, -2.8, 0.85], [1.78, -1.32, 0.12]],
      [[1.4, 1.78, 0.2], [2.9, 0.55, 0.72], [1.78, -1.32, 0.12]],
    ];
    routeCurves.forEach(([start, control, end], index) => {
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(...start),
        new THREE.Vector3(...control),
        new THREE.Vector3(...end),
      );
      const routeGeometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(52));
      const routeMaterial = new THREE.LineBasicMaterial({ color: routeColors[index], transparent: true, opacity: 0 });
      routeMaterials.push(routeMaterial);
      routeGroup.add(new THREE.Line(routeGeometry, routeMaterial));
    });
    const nodeGeometry = new THREE.BufferGeometry();
    nodeGeometry.setAttribute("position", new THREE.Float32BufferAttribute([
      -2.05, 0.62, 0.25, -1.95, -0.78, 0.28, 1.4, 1.78, 0.2, 1.78, -1.32, 0.12,
    ], 3));
    const nodeMaterial = new THREE.PointsMaterial({ color: 0x274f60, size: 0.13, transparent: true, opacity: 0, depthWrite: false });
    routeMaterials.push(nodeMaterial);
    routeGroup.add(new THREE.Points(nodeGeometry, nodeMaterial));
    scene.add(routeGroup);

    const pointer = { x: 20, y: 20, active: false };
    const resize = () => {
      const { width, height } = mount.getBoundingClientRect();
      renderer.setSize(Math.max(1, width), Math.max(1, height), false);
      camera.aspect = width / Math.max(1, height);
      camera.updateProjectionMatrix();
    };
    const onPointerMove = (event) => {
      const rect = mount.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 7.4;
      pointer.y = -((event.clientY - rect.top) / rect.height - 0.5) * 5.2;
      pointer.active = true;
    };
    const onPointerLeave = () => { pointer.active = false; };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    mount.addEventListener("pointermove", onPointerMove);
    mount.addEventListener("pointerleave", onPointerLeave);

    let frame = 0;
    let visible = true;
    let previousTime = performance.now();
    let routeOpacity = 0;
    const visibilityObserver = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { rootMargin: "120px" });
    visibilityObserver.observe(mount);
    const render = () => {
      frame = window.requestAnimationFrame(render);
      if (!visible) return;
      const now = performance.now();
      const delta = Math.min((now - previousTime) / 16.667, 2);
      previousTime = now;
      const target = shapes[activeRef.current];
      const attribute = geometry.attributes.position;
      const array = attribute.array;
      for (let index = 0; index < COUNT; index += 1) {
        const offset = index * 3;
        if (shouldReduceMotion) {
          array[offset] = target[offset];
          array[offset + 1] = target[offset + 1];
          array[offset + 2] = target[offset + 2];
          continue;
        }
        velocities[offset] += (target[offset] - array[offset]) * 0.026 * delta;
        velocities[offset + 1] += (target[offset + 1] - array[offset + 1]) * 0.026 * delta;
        velocities[offset + 2] += (target[offset + 2] - array[offset + 2]) * 0.026 * delta;
        if (pointer.active) {
          const dx = array[offset] - pointer.x;
          const dy = array[offset + 1] - pointer.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 1.15) {
            const force = (1.15 - distance) * 0.042;
            velocities[offset] += (dx / Math.max(distance, 0.08)) * force * delta;
            velocities[offset + 1] += (dy / Math.max(distance, 0.08)) * force * delta;
            velocities[offset + 2] += (random(index, 10) - 0.5) * force * delta;
          }
        }
        const damping = Math.pow(0.88, delta);
        velocities[offset] *= damping;
        velocities[offset + 1] *= damping;
        velocities[offset + 2] *= damping;
        array[offset] += velocities[offset] * delta;
        array[offset + 1] += velocities[offset + 1] * delta;
        array[offset + 2] += velocities[offset + 2] * delta;
      }
      const connected = activeRef.current === stages.length - 1;
      routeOpacity += ((connected ? 0.72 : 0) - routeOpacity) * 0.055 * delta;
      routeMaterials.forEach((routeMaterial, index) => { routeMaterial.opacity = index === routeMaterials.length - 1 ? routeOpacity : routeOpacity * 0.78; });
      cloud.rotation.y += pointer.active && connected ? 0.0018 * delta : 0;
      cloud.rotation.x += ((pointer.active ? pointer.y * -0.018 : 0) - cloud.rotation.x) * 0.025 * delta;
      routeGroup.rotation.copy(cloud.rotation);
      attribute.needsUpdate = true;
      renderer.render(scene, camera);
    };
    render();
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      visibilityObserver.disconnect();
      mount.removeEventListener("pointermove", onPointerMove);
      mount.removeEventListener("pointerleave", onPointerLeave);
      geometry.dispose();
      material.dispose();
      routeGroup.traverse((object) => { object.geometry?.dispose(); });
      routeMaterials.forEach((routeMaterial) => routeMaterial.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [shapes, shouldReduceMotion]);

  return (
    <div className="machine-scene">
      <div ref={mountRef} className="machine-scene-canvas" aria-hidden="true" />
      {active === stages.length - 1 && (
        <div className="scene-route-labels" aria-hidden="true">
          <span className="scene-route scene-route-public">Cloudflare<small>public ingress</small></span>
          <span className="scene-route scene-route-private">Tailscale<small>private admin</small></span>
          <span className="scene-route scene-route-deploy">GitHub<small>deployment</small></span>
          <span className="scene-origin">Lenovo / Arch</span>
        </div>
      )}
      <div className="scene-stage-picker" role="group" aria-label="The laptop's transformation">
        {stages.map(([number, title, detail], index) => (
          <button key={title} type="button" className={active === index ? "active" : ""} onClick={() => selectStage(index)} aria-pressed={active === index}>
            <span>{number}</span><strong>{title}</strong><small>{detail}</small>
            {active === index && !shouldReduceMotion && <span key={`${active}-${cycleKey}`} className="stage-progress" aria-hidden="true" />}
          </button>
        ))}
      </div>
      <p className="scene-instruction">The story advances automatically. Select a stage or move through the particles to interrupt it.</p>
    </div>
  );
};

export default NetworkGlobe;
