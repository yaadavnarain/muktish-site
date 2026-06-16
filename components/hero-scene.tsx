"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Float, Lightformer, useTexture } from "@react-three/drei";
import { EffectComposer, Bloom, DepthOfField } from "@react-three/postprocessing";
import { useEffect, useMemo, useRef, useState, Suspense } from "react";
import * as THREE from "three";

const GOLD = "#F5C842";
const GOLD_DEEP = "#B8881C";
const GOLD_WARM = "#FFE6A8";
const COOL = "#cfe0ff"; // neutral cool rim — pairs with the warm gold key (no teal)

const RS5_FRONT = "/textures/rs5-front.png";
const RS5_BACK = "/textures/rs5-back.png";
// Preload the silver coin faces so the transform never stalls mid-cycle.
useTexture.preload([RS5_FRONT, RS5_BACK]);

/* Shared pointer target in normalized [-1, 1] space. A window-level listener
   feeds this so parallax still works even though the canvas wrapper has
   pointer-events: none (so it never blocks the buttons). */
const pointer = { x: 0, y: 0 };

/* ------------------------------------------------------------------ *
 * One seamless loop of length CYCLE. Everything is derived from
 * `phase` in [0, 1) and tuned so every animated quantity returns to
 * its start at the loop boundary => no visible jump.
 *
 *  phase 0.00  flash peaks (gold); the previous silver coin has
 *              vanished; gold coins burst from the portal core
 *  0.00–0.20   gold coins ease outward to layered orbits
 *  0.20–0.55   gold coins hold and drift on slow arcs at varied depths
 *  0.55–0.99   gold coins recede behind the portal and fade (staggered,
 *              so a few always remain while the next Rs 5 is arriving)
 *  0.06–1.00   a silver Rs 5 coin eases in spinning, reaching the portal
 *              centre exactly as phase wraps -> next flash
 * ------------------------------------------------------------------ */
const CYCLE = 12; // seconds per cycle (calm, ~10–13s)
const CENTER = new THREE.Vector3(0, 0, 0);
const SILVER_START = new THREE.Vector3(1.05, 0.7, 3.7); // front, toward camera (kept in frame)

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
// smoother (5th-order) easing for the long arcs — no linear ramps anywhere
const smootherstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * t * (t * (t * 6 - 15) + 10);
};

type GoldConfig = {
  // anchor: a layered position around the portal (screen X/Y + depth Z).
  // Kept within frame so coins never clip the screen edges.
  anchor: [number, number, number];
  size: number;
  driftSpeed: number;
  driftRadius: number;
  phase0: number;
  floatSpeed: number;
  stagger: number; // small spawn delay so the burst isn't perfectly synced
  fadeStart: number; // staggered recede start so a few coins always remain
};

const GOLD_COINS: GoldConfig[] = [
  { anchor: [-2.3, 1.2, -0.5], size: 0.54, driftSpeed: 0.18, driftRadius: 0.22, phase0: 0.0, floatSpeed: 1.2, stagger: 0.0, fadeStart: 0.7 },
  { anchor: [2.4, 0.9, -0.7], size: 0.5, driftSpeed: 0.15, driftRadius: 0.2, phase0: 1.1, floatSpeed: 1.5, stagger: 0.04, fadeStart: 0.86 },
  { anchor: [-2.5, -0.95, 0.3], size: 0.52, driftSpeed: 0.2, driftRadius: 0.24, phase0: 2.3, floatSpeed: 1.1, stagger: 0.02, fadeStart: 0.66 },
  { anchor: [2.1, -1.1, -0.4], size: 0.46, driftSpeed: 0.17, driftRadius: 0.2, phase0: 3.4, floatSpeed: 1.6, stagger: 0.06, fadeStart: 0.9 },
  { anchor: [1.5, 0.25, 1.1], size: 0.4, driftSpeed: 0.14, driftRadius: 0.18, phase0: 4.6, floatSpeed: 1.3, stagger: 0.03, fadeStart: 0.76 },
  { anchor: [-1.7, 0.1, 0.9], size: 0.44, driftSpeed: 0.19, driftRadius: 0.2, phase0: 5.5, floatSpeed: 1.0, stagger: 0.05, fadeStart: 0.81 },
];

/* A reusable domed/beveled gold-coin profile (revolved by latheGeometry) so
   the gold coins read as solid polished tokens with rims that catch light. */
function useGoldGeometry() {
  return useMemo(() => {
    const pts = [
      new THREE.Vector2(0.0, 0.085),
      new THREE.Vector2(0.3, 0.08),
      new THREE.Vector2(0.46, 0.064),
      new THREE.Vector2(0.5, 0.03),
      new THREE.Vector2(0.5, -0.03),
      new THREE.Vector2(0.46, -0.064),
      new THREE.Vector2(0.3, -0.08),
      new THREE.Vector2(0.0, -0.085),
    ];
    const geo = new THREE.LatheGeometry(pts, 64);
    geo.computeVertexNormals();
    return geo;
  }, []);
}

function GoldCoin({ config, geometry }: { config: GoldConfig; geometry: THREE.BufferGeometry }) {
  const orbitRef = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const phase = (t % CYCLE) / CYCLE;
    // presence envelope: ease in after the flash, hold, then recede/fade
    const env =
      smootherstep(config.stagger, config.stagger + 0.2, phase) *
      (1 - smootherstep(config.fadeStart, config.fadeStart + 0.14, phase));

    const g = orbitRef.current;
    if (g) {
      const [ax, ay, az] = config.anchor;
      const s = config.driftSpeed;
      const r = config.driftRadius;
      // smooth elliptical drift around the layered anchor
      const tx = ax + Math.cos(t * s + config.phase0) * r;
      const ty = ay + Math.sin(t * s * 0.8 + config.phase0) * r * 0.55;
      const tz = az + Math.sin(t * s + config.phase0 * 1.3) * r * 0.7;
      // ease from the portal centre outward by env: fans out, then recedes
      g.position.set(tx * env, ty * env, tz * env);
      g.scale.setScalar(config.size * env);
      g.visible = env > 0.001;
    }
    if (matRef.current) matRef.current.opacity = env;
  });

  return (
    <group ref={orbitRef} visible={false}>
      <Float speed={config.floatSpeed} rotationIntensity={0.35} floatIntensity={0.5} floatingRange={[-0.08, 0.08]}>
        {/* rotate the lathe (its faces point up/down by default) so the coin
            face reads toward the camera; Float then tilts it gently */}
        <mesh geometry={geometry} rotation={[Math.PI / 2, 0.2, 0]}>
          {/* Polished gold PBR — low roughness for sharp specular + mirror-like
              env reflections. Faint emissive keeps it reading gold off-key,
              but stays well below the bloom threshold so it never blows out. */}
          <meshStandardMaterial
            ref={matRef}
            color={GOLD}
            metalness={1}
            roughness={0.15}
            envMapIntensity={1.7}
            emissive={GOLD_DEEP}
            emissiveIntensity={0.2}
            transparent
            opacity={0}
          />
        </mesh>
      </Float>
    </group>
  );
}

function SilverCoin() {
  const groupRef = useRef<THREE.Group>(null);
  const spinRef = useRef<THREE.Group>(null);

  const [front, back] = useTexture([RS5_FRONT, RS5_BACK]);
  const maxAniso = useThree((s) => s.gl.capabilities.getMaxAnisotropy());

  useEffect(() => {
    for (const t of [front, back]) {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = maxAniso;
      t.needsUpdate = true;
    }
  }, [front, back, maxAniso]);

  // material array maps to cylinder groups: [side(rim), top cap, bottom cap]
  const materials = useMemo(() => {
    const rim = new THREE.MeshStandardMaterial({
      color: "#cdd1d8",
      metalness: 1,
      roughness: 0.28,
      envMapIntensity: 1.2,
    });
    const top = new THREE.MeshStandardMaterial({
      map: front,
      color: "#eef0f3",
      metalness: 0.5,
      roughness: 0.36,
      envMapIntensity: 0.7,
    });
    const bottom = new THREE.MeshStandardMaterial({
      map: back,
      color: "#eef0f3",
      metalness: 0.5,
      roughness: 0.36,
      envMapIntensity: 0.7,
    });
    return [rim, top, bottom];
  }, [front, back]);

  useEffect(() => () => materials.forEach((m) => m.dispose()), [materials]);

  useFrame((state, delta) => {
    const phase = (state.clock.elapsedTime % CYCLE) / CYCLE;
    const g = groupRef.current;
    if (g) {
      // ease from start to the portal centre across the cycle (no linear ramp)
      const approach = smootherstep(0.06, 1.0, phase);
      g.position.lerpVectors(SILVER_START, CENTER, approach);
      // scale in on entry, vanish into the flash at the end
      const scaleIn = smoothstep(0.06, 0.16, phase);
      const scaleOut = 1 - smoothstep(0.9, 1.0, phase);
      g.scale.setScalar(0.5 * scaleIn * scaleOut);
      g.visible = phase > 0.05 && phase < 1.0;
    }
    // gentle, calm tumble so both engraved faces catch the light
    if (spinRef.current) spinRef.current.rotation.y += delta * 1.05;
  });

  return (
    <group ref={groupRef} visible={false}>
      <group ref={spinRef} rotation={[0, 0, 0.16]}>
        {/* thin, low-profile disc; caps rotated to face the camera */}
        <mesh rotation={[Math.PI / 2, 0, 0]} material={materials}>
          <cylinderGeometry args={[1, 1, 0.12, 64]} />
        </mesh>
      </group>
    </group>
  );
}

function TransformFlash() {
  const goldRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const phase = (state.clock.elapsedTime % CYCLE) / CYCLE;
    const d = Math.min(phase, 1 - phase); // distance to the loop boundary
    const flash = Math.exp(-((d / 0.04) ** 2)); // brief, tight pulse at the transform
    const gold = goldRef.current;
    if (gold) {
      gold.scale.setScalar(0.45 + flash * 2.0);
      (gold.material as THREE.MeshBasicMaterial).opacity = flash * 0.9;
      gold.visible = flash > 0.01;
    }
    const ring = ringRef.current;
    if (ring) {
      // a contained warm-gold shockwave ring just outside the core
      ring.scale.setScalar(0.7 + flash * 1.6);
      (ring.material as THREE.MeshBasicMaterial).opacity = flash * 0.4;
      ring.visible = flash > 0.01;
    }
  });

  return (
    <group position={[0, 0, 0.06]}>
      <mesh ref={goldRef} visible={false}>
        <circleGeometry args={[1, 48]} />
        <meshBasicMaterial color={GOLD_WARM} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh ref={ringRef} visible={false}>
        <ringGeometry args={[0.82, 1.0, 64]} />
        <meshBasicMaterial color={GOLD} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Portal() {
  const tiltRef = useRef<THREE.Group>(null);
  const hotRef = useRef<THREE.Mesh>(null);
  const goldRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const phase = (t % CYCLE) / CYCLE;
    const d = Math.min(phase, 1 - phase);
    const flash = Math.exp(-((d / 0.05) ** 2));
    const breathe = (Math.sin(t * 1.1) + 1) * 0.5; // 0..1, smooth

    // Held face-on with a fixed perspective tilt (appears wider than tall);
    // a tiny breathing sway only — it NEVER rotates edge-on.
    if (tiltRef.current) {
      tiltRef.current.rotation.x = 0.3 + Math.sin(t * 0.22) * 0.02;
      tiltRef.current.rotation.z = Math.sin(t * 0.16) * 0.015;
    }
    // gold-centre core: crisp bright pulse + flash swell
    if (hotRef.current) {
      hotRef.current.scale.setScalar(1 + breathe * 0.07 + flash * 0.4);
      (hotRef.current.material as THREE.MeshBasicMaterial).opacity = 0.55 + breathe * 0.15 + flash * 0.4;
    }
    if (goldRef.current) {
      (goldRef.current.material as THREE.MeshBasicMaterial).opacity = 0.16 + breathe * 0.06 + flash * 0.25;
    }
  });

  return (
    <group ref={tiltRef} rotation={[0.3, 0, 0]}>
      {/* Solid emissive gold ring — crisp, bright, the bloom centrepiece */}
      <mesh>
        <torusGeometry args={[1.95, 0.12, 20, 128]} />
        <meshStandardMaterial
          color={GOLD}
          emissive={GOLD}
          emissiveIntensity={2.4}
          metalness={0.9}
          roughness={0.22}
          toneMapped={false}
        />
      </mesh>

      {/* compact gold mid glow inside the ring */}
      <mesh ref={goldRef} position={[0, 0, -0.34]}>
        <circleGeometry args={[0.9, 56]} />
        <meshBasicMaterial color={GOLD} transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      {/* crisp hot gold centre */}
      <mesh ref={hotRef} position={[0, 0, -0.24]}>
        <circleGeometry args={[0.42, 48]} />
        <meshBasicMaterial color={GOLD_WARM} transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>

      <TransformFlash />
    </group>
  );
}

function ReflectiveFloor() {
  // A cheap reflective surface: a dark, smooth metal disc that mirrors the
  // gold/cool environment (no real-time reflection pass). A radial alpha fades
  // the edges so there's no hard horizon line over the dark hero.
  const alphaMap = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.6, "rgba(255,255,255,0.55)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
  }, []);

  useEffect(() => () => alphaMap.dispose(), [alphaMap]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.75, 0]}>
      <circleGeometry args={[7, 72]} />
      <meshStandardMaterial
        color="#0a0c0f"
        metalness={1}
        roughness={0.4}
        envMapIntensity={0.75}
        transparent
        alphaMap={alphaMap}
        opacity={0.5}
        depthWrite={false}
      />
    </mesh>
  );
}

function Scene() {
  const parallaxRef = useRef<THREE.Group>(null);
  const coinOrbitRef = useRef<THREE.Group>(null);
  const goldGeometry = useGoldGeometry();

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((_, delta) => {
    // Coins orbit slowly around the VIEW axis (Z) — smooth arcs that never
    // tip the portal edge-on (the portal is outside this group).
    if (coinOrbitRef.current) coinOrbitRef.current.rotation.z += delta * 0.035;
    // damped parallax — eases a few degrees toward the pointer
    const p = parallaxRef.current;
    if (p) {
      const ty = pointer.x * 0.22;
      const tx = -pointer.y * 0.14;
      p.rotation.y += (ty - p.rotation.y) * 0.03;
      p.rotation.x += (tx - p.rotation.x) * 0.03;
    }
  });

  return (
    <group ref={parallaxRef}>
      {/* Two-tone cinematic lighting: warm GOLD key one side, neutral cool rim
          the other, very low neutral ambient (clean near-black, no colour wash). */}
      <ambientLight intensity={0.15} color="#23282f" />
      <directionalLight position={[4.5, 3, 4]} intensity={2.7} color="#FFE2A0" />
      {/* neutral cool rim/back light: lights the coins' far edges (cool sheen)
          and keeps them visible against the near-black background */}
      <directionalLight position={[-5, 1.5, -4]} intensity={1.05} color={COOL} />
      {/* neutral fill from the camera side so the silver Rs 5 reads as real
          silver (counters the warm key + cool rim on its front face) */}
      <directionalLight position={[0, 1, 6]} intensity={0.85} color="#eaf0f7" />
      {/* small gold accent behind the portal for local rim on nearby coins */}
      <pointLight position={[0, 0, -1.2]} intensity={2.6} distance={8} decay={2} color={GOLD} />

      {/* Self-contained dark studio environment (gold key panel + cool rim
          panel + gold catch-ring) — real reflections, two-tone sheen, clean
          black background, and no runtime CDN dependency. */}
      <Environment resolution={256} frames={1}>
        <color attach="background" args={["#000000"]} />
        <Lightformer form="rect" intensity={2.6} color={GOLD_WARM} position={[3.5, 2, 3]} scale={[7, 5, 1]} />
        <Lightformer form="rect" intensity={1.1} color={COOL} position={[-4.5, 0, -3]} scale={[7, 5, 1]} />
        <Lightformer form="ring" intensity={1.4} color={GOLD} position={[0, 0, -5]} scale={4} />
      </Environment>

      <ReflectiveFloor />
      <Portal />

      <group ref={coinOrbitRef}>
        {GOLD_COINS.map((c, i) => (
          <GoldCoin key={i} config={c} geometry={goldGeometry} />
        ))}
      </group>

      {/* Silver coin loads its textures lazily; the rest renders immediately. */}
      <Suspense fallback={null}>
        <SilverCoin />
      </Suspense>
    </group>
  );
}

function Effects() {
  // Tight, controlled bloom: high threshold + small radius so ONLY the portal
  // core, ring and transform flash glow — coins and background stay crisp and
  // never blow out. Subtle DOF softens the deep background for cinematic depth.
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <DepthOfField target={[0, 0, 0]} worldFocusRange={3.2} bokehScale={1.6} />
      <Bloom
        luminanceThreshold={0.9}
        luminanceSmoothing={0.1}
        intensity={0.72}
        radius={0.42}
        mipmapBlur
      />
    </EffectComposer>
  );
}

export default function HeroScene() {
  // Pause rendering when the hero is scrolled out of view.
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), {
      threshold: 0.01,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0">
      <Canvas
        dpr={[1, 2]}
        frameloop={active ? "always" : "never"}
        camera={{ position: [0, 0.5, 9], fov: 40 }}
        onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
        }}
      >
        <Suspense fallback={null}>
          <Scene />
          <Effects />
        </Suspense>
      </Canvas>
    </div>
  );
}
