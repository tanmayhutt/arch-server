import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import * as THREE from "three";

const COUNT = 960;
const PALETTE = ["#315f73", "#477b68", "#a66a42", "#7e8b88"];

const random = (index, salt = 0) => {
  const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
};

const laptopPoint = (index) => {
  const section = index % 10;
  const t = random(index, 1);
  if (section < 7) {
    const edge = index % 4;
    if (edge === 0) return [-2.25 + t * 4.5, 1.55, random(index, 2) * 0.12];
    if (edge === 1) return [2.25, -1.15 + t * 2.7, random(index, 2) * 0.12];
    if (edge === 2) return [2.25 - t * 4.5, -1.15, random(index, 2) * 0.12];
    return [-2.25, 1.55 - t * 2.7, random(index, 2) * 0.12];
  }
  return [-2.6 + t * 5.2, -1.35 - random(index, 3) * 0.75, (random(index, 4) - 0.5) * 1.4];
};

const serverPoint = (index) => {
  const rack = index % 4;
  const angle = random(index, 5) * Math.PI * 2;
  const radius = 1.05 + random(index, 6) * 0.22;
  const y = -1.65 + rack * 1.05 + (random(index, 7) - 0.5) * 0.35;
  return [Math.cos(angle) * radius, y, Math.sin(angle) * radius * 0.65];
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
  ["02", "Headless node", "Arch kept running, so the laptop became a small always-on server."],
  ["03", "Connected system", "Cloudflare, Tailscale, and GitHub now give it three deliberate routes."],
];

const NetworkGlobe = () => {
  const mountRef = useRef(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  const shapes = useMemo(() => [buildShape(laptopPoint), buildShape(serverPoint), buildShape(networkPoint)], []);

  useEffect(() => { activeRef.current = active; }, [active]);

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
    const material = new THREE.PointsMaterial({ size: 0.055, sizeAttenuation: true, transparent: true, opacity: 0.88, vertexColors: true, depthWrite: false });
    const cloud = new THREE.Points(geometry, material);
    scene.add(cloud);

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
    const visibilityObserver = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { rootMargin: "120px" });
    visibilityObserver.observe(mount);
    const render = () => {
      frame = window.requestAnimationFrame(render);
      if (!visible) return;
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
        velocities[offset] += (target[offset] - array[offset]) * 0.026;
        velocities[offset + 1] += (target[offset + 1] - array[offset + 1]) * 0.026;
        velocities[offset + 2] += (target[offset + 2] - array[offset + 2]) * 0.026;
        if (pointer.active) {
          const dx = array[offset] - pointer.x;
          const dy = array[offset + 1] - pointer.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 1.15) {
            const force = (1.15 - distance) * 0.042;
            velocities[offset] += (dx / Math.max(distance, 0.08)) * force;
            velocities[offset + 1] += (dy / Math.max(distance, 0.08)) * force;
            velocities[offset + 2] += (random(index, 10) - 0.5) * force;
          }
        }
        velocities[offset] *= 0.88;
        velocities[offset + 1] *= 0.88;
        velocities[offset + 2] *= 0.88;
        array[offset] += velocities[offset];
        array[offset + 1] += velocities[offset + 1];
        array[offset + 2] += velocities[offset + 2];
      }
      cloud.rotation.y += pointer.active && activeRef.current === 2 ? 0.0018 : 0;
      cloud.rotation.x += ((pointer.active ? pointer.y * -0.018 : 0) - cloud.rotation.x) * 0.025;
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
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [shapes, shouldReduceMotion]);

  return (
    <div className="machine-scene">
      <div ref={mountRef} className="machine-scene-canvas" aria-hidden="true" />
      {active === 2 && (
        <div className="scene-route-labels" aria-hidden="true">
          <span className="scene-route scene-route-public">Cloudflare<small>public ingress</small></span>
          <span className="scene-route scene-route-private">Tailscale<small>private admin</small></span>
          <span className="scene-route scene-route-deploy">GitHub<small>deployment</small></span>
          <span className="scene-origin">Lenovo / Arch</span>
        </div>
      )}
      <div className="scene-stage-picker" role="group" aria-label="The laptop's transformation">
        {stages.map(([number, title, detail], index) => (
          <button key={title} type="button" className={active === index ? "active" : ""} onClick={() => setActive(index)} aria-pressed={active === index}>
            <span>{number}</span><strong>{title}</strong><small>{detail}</small>
          </button>
        ))}
      </div>
      <p className="scene-instruction">Move across the particles to disturb them. They rebuild around the selected state.</p>
    </div>
  );
};

export default NetworkGlobe;
