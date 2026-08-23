import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import * as THREE from "three";

const COUNT = 2600;
const STAGE_DURATION = 5600;
const PALETTE = ["#315f73", "#477b68", "#a66a42", "#7e8b88"];

// Official one-colour Arch mark from https://archlinux.org/art/.
// The SVG path is sampled as a point mask instead of approximating the logo with equations.
const ARCH_MARK_PATH = "M105.8125 16.625c-7.39687 18.135158-11.858304 29.997682-20.09375 47.59375 5.04936 5.35232 11.247211 11.585364 21.3125 18.625-10.821173-4.452846-18.202537-8.923398-23.71875-13.5625-10.5398 21.992913-27.052636 53.32084-60.5625 113.53125 26.337628-15.20517 46.754089-24.57932 65.78125-28.15625-.817034-3.51405-1.28155-7.31518-1.25-11.28125l.03125-.84375c.417917-16.87382 9.195665-29.84979 19.59375-28.96875 10.39809.88104 18.48041 15.28242 18.0625 32.15625-.0786 3.17512-.43674 6.22955-1.0625 9.0625 18.82058 3.68164 39.01873 13.03179 65 28.03125-5.123-9.4318-9.69572-17.93388-14.0625-26.03125-6.87839-5.33121-14.05289-12.2698-28.6875-19.78125 10.05899 2.61375 17.2611 5.62932 22.875 9-44.39803-82.661839-47.99359-93.645891-63.21875-129.375z";

const random = (index, salt = 0) => {
  const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
};

const createArchPointFactory = () => {
  if (typeof Path2D === "undefined" || typeof document === "undefined") return () => [0, 0, 0];
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const path = new Path2D(ARCH_MARK_PATH);
  const samples = [];
  for (let y = 18; y <= 182; y += 2.6) {
    for (let x = 23; x <= 189; x += 2.6) {
      if (context.isPointInPath(path, x, y)) samples.push([x, y]);
    }
  }
  return (index) => {
    const sample = samples[Math.floor(random(index, 31) * samples.length)] || [105.8, 99.7];
    const jitter = 0.012;
    return [
      (sample[0] - 105.8) / 43 + (random(index, 32) - 0.5) * jitter,
      (99.7 - sample[1]) / 43 + (random(index, 33) - 0.5) * jitter,
      (random(index, 14) - 0.5) * 0.08,
    ];
  };
};

const createLaptopPointFactory = (archPoint) => (index) => {
  const section = index % 22;
  const t = random(index, 1);
  if (section < 7) {
    const edge = index % 4;
    if (edge === 0) return [-2.28 + t * 4.56, 1.62, 0.04];
    if (edge === 1) return [2.28, -1.22 + t * 2.84, 0.04];
    if (edge === 2) return [2.28 - t * 4.56, -1.22, 0.04];
    return [-2.28, 1.62 - t * 2.84, 0.04];
  }
  if (section < 16) {
    const [x, y, z] = archPoint(index);
    return [x * 0.78, y * 0.64 + 0.2, z + 0.08];
  }
  if (section < 19) {
    const crack = section - 16;
    const starts = [[-1.78, 1.2], [1.72, 1.08], [-1.9, -0.55]];
    const ends = [[-0.44, 0.16], [0.38, 0.06], [-0.38, 0.02]];
    return [starts[crack][0] + (ends[crack][0] - starts[crack][0]) * t, starts[crack][1] + (ends[crack][1] - starts[crack][1]) * t, 0.1];
  }
  const depth = random(index, 4);
  return [-2.72 + t * 5.44, -1.36 - depth * 0.58, (depth - 0.5) * 1.34];
};

const serverPoint = (index) => {
  const section = index % 20;
  const x = -1.62 + random(index, 5) * 3.24;
  const y = -1.78 + random(index, 6) * 3.56;
  const z = (random(index, 7) - 0.5) * 0.8;
  if (section < 6) {
    const edge = section % 4;
    if (edge === 0) return [x, 1.78, z];
    if (edge === 1) return [1.62, y, z];
    if (edge === 2) return [x, -1.78, z];
    return [-1.62, y, z];
  }
  if (section < 15) {
    const bay = Math.floor(random(index, 18) * 4);
    const bayY = 1.22 - bay * 0.78;
    const edge = index % 4;
    if (edge === 0) return [-1.28 + random(index, 19) * 2.12, bayY + 0.25, 0.45];
    if (edge === 1) return [0.84, bayY - 0.25 + random(index, 19) * 0.5, 0.45];
    if (edge === 2) return [0.84 - random(index, 19) * 2.12, bayY - 0.25, 0.45];
    return [-1.28, bayY + 0.25 - random(index, 19) * 0.5, 0.45];
  }
  const port = Math.floor(random(index, 20) * 4);
  const angle = random(index, 21) * Math.PI * 2;
  return [1.18 + Math.cos(angle) * 0.1, 1.18 - port * 0.77 + Math.sin(angle) * 0.1, 0.5];
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
  ["01", "Broken display", "The panel failed, but the customized Arch system underneath it survived."],
  ["02", "Headless node", "Without a useful screen, the laptop became a small always-on server."],
  ["03", "Connected system", "Cloudflare, Tailscale, and GitHub now give it three deliberate routes."],
];

const NetworkGlobe = () => {
  const mountRef = useRef(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  const [cycleKey, setCycleKey] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  const shapes = useMemo(() => {
    const archPoint = createArchPointFactory();
    return [buildShape(createLaptopPointFactory(archPoint)), buildShape(serverPoint), buildShape(networkPoint)];
  }, []);

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
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      vertexColors: true,
      uniforms: { pointScale: { value: 31 * Math.min(window.devicePixelRatio || 1, 1.6) } },
      vertexShader: `
        uniform float pointScale;
        varying vec3 vColor;
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = pointScale / max(4.5, -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          vec2 centered = gl_PointCoord - vec2(0.5);
          if (dot(centered, centered) > 0.22) discard;
          gl_FragColor = vec4(vColor, 0.92);
        }
      `,
    });
    const cloud = new THREE.Points(geometry, material);
    scene.add(cloud);

    const routeGroup = new THREE.Group();
    const routeMaterials = [];
    const routeColors = [0x315f73, 0x477b68, 0xa66a42];
    const routeCurves = [
      [[-1.92, 0.68, 1.08], [-0.58, 2.72, 2.68], [1.34, 1.7, 1.22]],
      [[-1.88, -0.76, 1.12], [-0.28, -2.72, 2.72], [1.68, -1.3, 1.02]],
      [[1.34, 1.7, 1.22], [2.82, 0.48, 2.62], [1.68, -1.3, 1.02]],
    ];
    routeCurves.forEach(([start, control, end], index) => {
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(...start),
        new THREE.Vector3(...control),
        new THREE.Vector3(...end),
      );
      const routeGeometry = new THREE.TubeGeometry(curve, 64, 0.018, 5, false);
      const routeMaterial = new THREE.MeshBasicMaterial({
        color: routeColors[index], transparent: true, opacity: 0, depthTest: false,
      });
      routeMaterials.push(routeMaterial);
      const route = new THREE.Mesh(routeGeometry, routeMaterial);
      route.renderOrder = 3;
      routeGroup.add(route);
    });
    const nodeGeometry = new THREE.BufferGeometry();
    nodeGeometry.setAttribute("position", new THREE.Float32BufferAttribute([
      -1.92, 0.68, 1.08, -1.88, -0.76, 1.12, 1.34, 1.7, 1.22, 1.68, -1.3, 1.02,
    ], 3));
    const nodeMaterial = new THREE.PointsMaterial({
      color: 0x274f60, size: 0.15, transparent: true, opacity: 0, depthWrite: false, depthTest: false,
    });
    routeMaterials.push(nodeMaterial);
    routeGroup.add(new THREE.Points(nodeGeometry, nodeMaterial));
    scene.add(routeGroup);

    const pointer = { x: 20, y: 20, targetX: 20, targetY: 20, active: false, speed: 0 };
    const resize = () => {
      const { width, height } = mount.getBoundingClientRect();
      renderer.setSize(Math.max(1, width), Math.max(1, height), false);
      camera.aspect = width / Math.max(1, height);
      camera.updateProjectionMatrix();
    };
    const onPointerMove = (event) => {
      const rect = mount.getBoundingClientRect();
      const nextX = ((event.clientX - rect.left) / rect.width - 0.5) * 7.4;
      const nextY = -((event.clientY - rect.top) / rect.height - 0.5) * 5.2;
      pointer.speed = Math.min(1.8, Math.hypot(nextX - pointer.targetX, nextY - pointer.targetY));
      pointer.targetX = nextX;
      pointer.targetY = nextY;
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
      pointer.x += (pointer.targetX - pointer.x) * 0.16 * delta;
      pointer.y += (pointer.targetY - pointer.y) * 0.16 * delta;
      pointer.speed *= Math.pow(0.82, delta);
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
          if (distance < 1.28) {
            const force = (1.28 - distance) * (0.032 + pointer.speed * 0.028);
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
      const targetRotationY = pointer.active ? pointer.x * 0.022 : 0;
      const targetRotationX = pointer.active ? pointer.y * -0.018 : 0;
      cloud.rotation.y += (targetRotationY - cloud.rotation.y) * 0.032 * delta;
      cloud.rotation.x += (targetRotationX - cloud.rotation.x) * 0.032 * delta;
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
