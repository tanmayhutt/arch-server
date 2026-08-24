import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Pause, Play } from "lucide-react";
import * as THREE from "three";

const COUNT = 2100;
const STAGE_DURATION = 5600;
const PALETTE = ["#315f73", "#477b68", "#a66a42", "#7e8b88"];

// Official one-colour Arch mark from https://archlinux.org/art/.
// The SVG path is sampled as a point mask instead of approximating the logo with equations.
const ARCH_MARK_PATH = "M105.8125 16.625c-7.39687 18.135158-11.858304 29.997682-20.09375 47.59375 5.04936 5.35232 11.247211 11.585364 21.3125 18.625-10.821173-4.452846-18.202537-8.923398-23.71875-13.5625-10.5398 21.992913-27.052636 53.32084-60.5625 113.53125 26.337628-15.20517 46.754089-24.57932 65.78125-28.15625-.817034-3.51405-1.28155-7.31518-1.25-11.28125l.03125-.84375c.417917-16.87382 9.195665-29.84979 19.59375-28.96875 10.39809.88104 18.48041 15.28242 18.0625 32.15625-.0786 3.17512-.43674 6.22955-1.0625 9.0625 18.82058 3.68164 39.01873 13.03179 65 28.03125-5.123-9.4318-9.69572-17.93388-14.0625-26.03125-6.87839-5.33121-14.05289-12.2698-28.6875-19.78125 10.05899 2.61375 17.2611 5.62932 22.875 9-44.39803-82.661839-47.99359-93.645891-63.21875-129.375z";

const random = (index, salt = 0) => {
  const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
};

const createArchAsciiPointFactory = () => {
  if (typeof Path2D === "undefined" || typeof document === "undefined") return () => [0, 0, 0];
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const path = new Path2D(ARCH_MARK_PATH);
  const samples = [];
  // Treat the official vector as an ASCII-like grid: one evenly spaced cell becomes one point.
  for (let y = 18; y <= 182; y += 3) {
    for (let x = 23; x <= 189; x += 3) {
      if (context.isPointInPath(path, x, y)) samples.push([x, y]);
    }
  }
  return (index) => {
    const sample = samples[index % samples.length] || [105.8, 99.7];
    return [
      ((sample[0] - 105.8) / 43) * 0.88,
      ((99.7 - sample[1]) / 43) * 0.88,
      (random(index, 14) - 0.5) * 0.025,
    ];
  };
};

const createGridShapeFactory = ({ bounds, step = 0.065, contains, depth = 0.05 }) => {
  const [minX, maxX, minY, maxY] = bounds;
  const samples = [];
  for (let y = minY; y <= maxY; y += step) {
    for (let x = minX; x <= maxX; x += step) {
      if (contains(x, y)) samples.push([x, y]);
    }
  }
  return (index) => {
    const sample = samples[index % samples.length] || [0, 0];
    return [sample[0], sample[1], (random(index, 27) - 0.5) * depth];
  };
};

const inRect = (x, y, left, right, bottom, top) => x >= left && x <= right && y >= bottom && y <= top;
const nearLine = (x, y, ax, ay, bx, by, width = 0.055) => {
  const abX = bx - ax;
  const abY = by - ay;
  const projection = Math.max(0, Math.min(1, ((x - ax) * abX + (y - ay) * abY) / (abX * abX + abY * abY)));
  return Math.hypot(x - (ax + abX * projection), y - (ay + abY * projection)) <= width;
};
const inCircle = (x, y, cx, cy, radius) => Math.hypot(x - cx, y - cy) <= radius;

const failedDisplayPoint = createGridShapeFactory({
  bounds: [-2.25, 2.25, -1.6, 1.6],
  contains: (x, y) => {
    const frame = inRect(x, y, -2.05, 2.05, -1.32, 1.42)
      && !inRect(x, y, -1.89, 1.89, -1.16, 1.26);
    const stand = inRect(x, y, -0.13, 0.13, -1.58, -1.28) || inRect(x, y, -0.72, 0.72, -1.6, -1.5);
    const breakMark = nearLine(x, y, -0.42, 0.82, 0.12, 0.18, 0.07)
      || nearLine(x, y, 0.12, 0.18, -0.18, -0.18, 0.07)
      || nearLine(x, y, 0.12, 0.18, 0.62, -0.48, 0.07);
    return frame || stand || breakMark;
  },
});

const headlessPoint = createGridShapeFactory({
  bounds: [-2.25, 2.25, -1.35, 1.35],
  contains: (x, y) => {
    const lid = inRect(x, y, -1.82, 1.82, -0.56, 0.72)
      && !inRect(x, y, -1.66, 1.66, -0.4, 0.56);
    const base = nearLine(x, y, -2.12, -0.72, 2.12, -0.72, 0.1)
      || nearLine(x, y, -2.12, -0.72, -1.54, -1.02, 0.1)
      || nearLine(x, y, 2.12, -0.72, 1.54, -1.02, 0.1)
      || nearLine(x, y, -1.54, -1.02, 1.54, -1.02, 0.1);
    const status = inCircle(x, y, 1.42, -0.02, 0.11);
    return lid || base || status;
  },
});

const containerPoint = createGridShapeFactory({
  bounds: [-2.3, 2.3, -1.55, 1.55],
  contains: (x, y) => {
    const shell = inRect(x, y, -2.05, 2.05, -1.33, 1.33)
      && !inRect(x, y, -1.89, 1.89, -1.17, 1.17);
    const divider = Math.abs(x) <= 0.055 || Math.abs(y) <= 0.055;
    const ports = [-0.72, -0.24, 0.24, 0.72].some((cy) => inCircle(x, y, 1.5, cy, 0.075));
    return shell || divider || ports;
  },
});

const cloudflarePoint = createGridShapeFactory({
  bounds: [-2.35, 2.35, -1.75, 1.75],
  contains: (x, y) => {
    const cloud = inCircle(x, y, -0.82, 0.36, 0.72)
      || inCircle(x, y, 0.05, 0.72, 1.02)
      || inCircle(x, y, 1.02, 0.28, 0.76)
      || inRect(x, y, -1.45, 1.58, -0.08, 0.42);
    const tunnel = nearLine(x, y, 0, -0.12, 0, -1.28, 0.085)
      || nearLine(x, y, -0.27, -1.02, 0, -1.3, 0.085)
      || nearLine(x, y, 0.27, -1.02, 0, -1.3, 0.085);
    return cloud || tunnel;
  },
});

const tailscalePoint = createGridShapeFactory({
  bounds: [-2.15, 2.15, -1.8, 1.8],
  step: 0.055,
  contains: (x, y) => {
    const nodes = [-1, 0, 1].some((cx) => [-1, 0, 1].some((cy) => inCircle(x, y, cx, cy, 0.24)));
    const links = nearLine(x, y, -1, -1, 1, 1, 0.035)
      || nearLine(x, y, -1, 1, 1, -1, 0.035)
      || nearLine(x, y, -1, 0, 1, 0, 0.035)
      || nearLine(x, y, 0, -1, 0, 1, 0.035);
    return nodes || links;
  },
});

const deploymentPoint = createGridShapeFactory({
  bounds: [-2.25, 2.25, -1.65, 1.65],
  contains: (x, y) => {
    const pipeline = nearLine(x, y, -1.6, 0.92, -0.52, 0.92, 0.06)
      || nearLine(x, y, -0.52, 0.92, 0.12, 0, 0.06)
      || nearLine(x, y, 0.12, 0, 1.38, 0, 0.06)
      || nearLine(x, y, 1.38, 0, 1.08, 0.25, 0.06)
      || nearLine(x, y, 1.38, 0, 1.08, -0.25, 0.06);
    const branch = nearLine(x, y, -0.52, 0.92, -0.52, -0.82, 0.06)
      || nearLine(x, y, -0.52, -0.82, 0.34, -0.82, 0.06);
    const nodes = [[-1.6, 0.92], [-0.52, 0.92], [-0.52, -0.82], [0.34, -0.82], [0.12, 0], [1.38, 0]]
      .some(([cx, cy]) => inCircle(x, y, cx, cy, 0.14));
    return pipeline || branch || nodes;
  },
});

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
  ["01", "The display failed", "The panel stopped being useful, but the laptop itself was still healthy."],
  ["02", "Arch survived", "The customized Arch system underneath the broken display was still mine."],
  ["03", "It went headless", "I closed the lid on desktop life and kept the machine running without a screen."],
  ["04", "Services moved in", "Docker isolates the workloads; Nginx serves this React site from the machine."],
  ["05", "The public route", "Cloudflared makes an outbound tunnel, so Cloudflare can deliver the site without an open router port."],
  ["06", "The private route", "Tailscale gives trusted devices a private mesh for SSH, Samba, and administration."],
  ["07", "The deploy route", "A push lets GitHub Actions join as ephemeral CI, reach only SSH, and rebuild the Compose stack."],
  ["08", "One connected node", "The old laptop is now a physical Arch server with separate public, private, and deployment paths."],
];

const NetworkGlobe = () => {
  const mountRef = useRef(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  const [cycleKey, setCycleKey] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const shouldReduceMotion = useReducedMotion();
  const shapes = useMemo(() => {
    const archPoint = createArchAsciiPointFactory();
    return [
      buildShape(failedDisplayPoint),
      buildShape(archPoint),
      buildShape(headlessPoint),
      buildShape(containerPoint),
      buildShape(cloudflarePoint),
      buildShape(tailscalePoint),
      buildShape(deploymentPoint),
      buildShape(networkPoint),
    ];
  }, []);

  useEffect(() => { activeRef.current = active; }, [active]);

  useEffect(() => {
    if (shouldReduceMotion || !isPlaying) return undefined;
    const timer = window.setTimeout(() => {
      setActive((current) => (current + 1) % stages.length);
      setCycleKey((current) => current + 1);
    }, STAGE_DURATION);
    return () => window.clearTimeout(timer);
  }, [active, cycleKey, isPlaying, shouldReduceMotion]);

  const selectStage = (index) => {
    setActive(index);
    setCycleKey((current) => current + 1);
  };

  const togglePlayback = () => {
    setIsPlaying((current) => !current);
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
    <div className="machine-scene" data-stage={active + 1}>
      <div className="machine-scene-visual">
        <div ref={mountRef} className="machine-scene-canvas" aria-hidden="true" />
        {active === stages.length - 1 && (
          <div className="scene-route-labels" aria-hidden="true">
            <span className="scene-route scene-route-public">Cloudflare<small>public ingress</small></span>
            <span className="scene-route scene-route-private">Tailscale<small>private admin</small></span>
            <span className="scene-route scene-route-deploy">GitHub<small>deployment</small></span>
            <span className="scene-origin">Lenovo / Arch</span>
          </div>
        )}
      </div>
      <div className="scene-story-control">
        <div className="scene-active-copy" aria-live="polite">
          <span>{stages[active][0]} / 08</span>
          <div><strong>{stages[active][1]}</strong><p>{stages[active][2]}</p></div>
          {!shouldReduceMotion && (
            <button type="button" className="scene-playback" onClick={togglePlayback} aria-label={isPlaying ? "Pause automatic story" : "Play automatic story"}>
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              <span>{isPlaying ? "Pause" : "Play"}</span>
            </button>
          )}
        </div>
        <div className="scene-stage-picker" role="group" aria-label="Choose a chapter in the Arch server story">
          {stages.map(([number, title], index) => (
            <button key={title} type="button" className={active === index ? "active" : ""} onClick={() => selectStage(index)} aria-pressed={active === index}>
              <span>{number}</span><strong>{title}</strong>
              {active === index && isPlaying && !shouldReduceMotion && <span key={`${active}-${cycleKey}`} className="stage-progress" aria-hidden="true" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NetworkGlobe;
