"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Float, Lightformer, useTexture } from "@react-three/drei";
import { EffectComposer, Bloom, DepthOfField } from "@react-three/postprocessing";
import { useEffect, useMemo, useRef, useState, Suspense } from "react";
import * as THREE from "three";

const GOLD = "#F5C842";
const GOLD_DEEP = "#B8881C";

const RS5_FRONT = "/textures/rs5-front.png";
const RS5_BACK = "/textures/rs5-back.png";
// Preload the silver coin faces so the transform never stalls mid-cycle.
useTexture.preload([RS5_FRONT, RS5_BACK]);

/* Shared pointer target in normalized [-1, 1] space. A window-level listener
   feeds this so parallax still works even though the canvas wrapper has
   pointer-events: none (so it never blocks the buttons). */
const pointer = { x: 0, y: 0 };

/* ------------------------------------------------------------------ *
 * The transformation cycle is one seamless loop of length CYCLE.
 * Everything is derived from `phase` in [0, 1) and tuned so every
 * animated quantity is 0 at the loop boundary => no visible jump.
 *
 *  phase 0.00  flash peaks; previous silver coin has vanished; the
 *              gold coins burst out of the portal core
 *  0.00–0.18   gold coins fan outward to their layered anchors
 *  0.18–0.50   gold coins hold and drift slowly at varied depths
 *  0.50–0.66   gold coins recede behind the portal and fade to nothing
 *  0.06–1.00   a single silver Rs 5 coin drifts in and spins, arriving
 *              at the portal centre exactly as phase wraps -> next flash
 * ------------------------------------------------------------------ */
const CYCLE = 10.5; // seconds per cycle (calm, ~9–12s)
const CENTER = new THREE.Vector3(0, 0, 0);
const SILVER_START = new THREE.Vector3(3.0, 0.85, 4.7); // front/side, toward camera

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

type GoldConfig = {
  // anchor: a layered position around the portal (screen X/Y + depth Z)
  anchor: [number, number, number];
  size: number;
  driftSpeed: number;
  driftRadius: number;
  phase0: number;
  floatSpeed: number;
  stagger: number; // small spawn delay so the burst isn't perfectly synced
  fadeStart: number; // staggered recede start so a few coins always remain
};

// 6 gold coins arranged around the portal at varied heights, depths and sizes
// (some upper, some lower; some in front of the ring plane, some behind).
// Fade-out is staggered across the cycle so the portal is never left bare —
// a few coins keep orbiting while the next silver coin is already arriving.
const GOLD_COINS: GoldConfig[] = [
  { anchor: [-2.7, 1.35, -0.6], size: 0.56, driftSpeed: 0.22, driftRadius: 0.3, phase0: 0.0, floatSpeed: 1.4, stagger: 0.0, fadeStart: 0.6 },
  { anchor: [2.9, 1.05, 0.7], size: 0.48, driftSpeed: 0.18, driftRadius: 0.26, phase0: 1.1, floatSpeed: 1.7, stagger: 0.02, fadeStart: 0.82 },
  { anchor: [-3.1, -1.05, 0.5], size: 0.52, driftSpeed: 0.26, driftRadius: 0.32, phase0: 2.3, floatSpeed: 1.2, stagger: 0.05, fadeStart: 0.54 },
  { anchor: [2.6, -1.45, -0.9], size: 0.44, driftSpeed: 0.2, driftRadius: 0.24, phase0: 3.4, floatSpeed: 1.9, stagger: 0.03, fadeStart: 0.85 },
  { anchor: [3.5, 0.05, -0.4], size: 0.4, driftSpeed: 0.16, driftRadius: 0.22, phase0: 4.6, floatSpeed: 1.5, stagger: 0.06, fadeStart: 0.7 },
  { anchor: [-2.3, 0.15, 1.25], size: 0.62, driftSpeed: 0.24, driftRadius: 0.28, phase0: 5.5, floatSpeed: 1.1, stagger: 0.04, fadeStart: 0.76 },
];

/* A reusable domed/beveled gold-coin profile (revolved by latheGeometry) so
   the gold coins read as solid polished tokens, not flat discs. Base radius
   0.5; each coin is scaled to its configured size. */
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
    const geo = new THREE.LatheGeometry(pts, 48);
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
    // presence envelope: grow in after the flash, hold, then recede/fade
    const env =
      smoothstep(config.stagger, config.stagger + 0.16, phase) *
      (1 - smoothstep(config.fadeStart, config.fadeStart + 0.14, phase));

    const g = orbitRef.current;
    if (g) {
      // gentle drift around the layered anchor
      const [ax, ay, az] = config.anchor;
      const s = config.driftSpeed;
      const r = config.driftRadius;
      const tx = ax + Math.cos(t * s + config.phase0) * r;
      const ty = ay + Math.sin(t * s * 0.8 + config.phase0) * r * 0.55;
      const tz = az + Math.sin(t * s + config.phase0 * 1.3) * r * 0.7;
      // lerp from the portal centre outward by env: fans out, then recedes
      g.position.set(tx * env, ty * env, tz * env);
      g.scale.setScalar(config.size * env);
      g.visible = env > 0.001;
    }
    if (matRef.current) matRef.current.opacity = env;
  });

  return (
    <group ref={orbitRef} visible={false}>
      <Float speed={config.floatSpeed} rotationIntensity={0.7} floatIntensity={0.6} floatingRange={[-0.1, 0.1]}>
        <mesh geometry={geometry}>
          {/* Polished gold PBR. A faint gold emissive (well below the bloom
              threshold) keeps the coins reading as gold even when a face turns
              away from the key light — without making them glow/bloom. */}
          <meshStandardMaterial
            ref={matRef}
            color={GOLD}
            metalness={1}
            roughness={0.2}
            envMapIntensity={1.4}
            emissive={GOLD_DEEP}
            emissiveIntensity={0.22}
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
      roughness: 0.32,
      envMapIntensity: 1.3,
    });
    const top = new THREE.MeshStandardMaterial({
      map: front,
      color: "#eef0f3",
      metalness: 0.5,
      roughness: 0.45,
      envMapIntensity: 0.8,
    });
    const bottom = new THREE.MeshStandardMaterial({
      map: back,
      color: "#eef0f3",
      metalness: 0.5,
      roughness: 0.45,
      envMapIntensity: 0.8,
    });
    return [rim, top, bottom];
  }, [front, back]);

  useEffect(() => () => materials.forEach((m) => m.dispose()), [materials]);

  useFrame((state, delta) => {
    const phase = (state.clock.elapsedTime % CYCLE) / CYCLE;
    const g = groupRef.current;
    if (g) {
      // drift from start to the portal centre across the cycle
      const approach = smoothstep(0.06, 1.0, phase);
      g.position.lerpVectors(SILVER_START, CENTER, approach);
      // scale in on entry, vanish into the flash at the end
      const scaleIn = smoothstep(0.06, 0.15, phase);
      const scaleOut = 1 - smoothstep(0.9, 1.0, phase);
      g.scale.setScalar(0.6 * scaleIn * scaleOut);
      g.visible = phase > 0.05 && phase < 1.0;
    }
    // gentle tumble so both engraved faces catch the light
    if (spinRef.current) spinRef.current.rotation.y += delta * 1.5;
  });

  return (
    <group ref={groupRef} visible={false}>
      <group ref={spinRef} rotation={[0, 0, 0.18]}>
        {/* thin, low-profile disc; caps rotated to face the camera */}
        <mesh rotation={[Math.PI / 2, 0, 0]} material={materials}>
          <cylinderGeometry args={[1, 1, 0.12, 56]} />
        </mesh>
      </group>
    </group>
  );
}

function TransformFlash() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const phase = (state.clock.elapsedTime % CYCLE) / CYCLE;
    const d = Math.min(phase, 1 - phase); // distance to the loop boundary
    const flash = Math.exp(-((d / 0.042) ** 2)); // brief, tight pulse at the transform
    const m = ref.current;
    if (m) {
      m.scale.setScalar(0.5 + flash * 2.6);
      (m.material as THREE.MeshBasicMaterial).opacity = flash * 0.82;
      m.visible = flash > 0.01;
    }
  });

  return (
    <mesh ref={ref} position={[0, 0, 0.05]} visible={false}>
      <circleGeometry args={[1, 48]} />
      <meshBasicMaterial
        color="#FFF1C0"
        transparent
        opacity={0}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

function Portal() {
  const ringRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.14;
      ringRef.current.rotation.x = Math.sin(t * 0.2) * 0.07;
    }
    if (coreRef.current) {
      // base pulse + a brighter swell at the transform moment
      const phase = (t % CYCLE) / CYCLE;
      const d = Math.min(phase, 1 - phase);
      const flash = Math.exp(-((d / 0.05) ** 2));
      const pulse = 1 + Math.sin(t * 1.2) * 0.06 + flash * 0.18;
      coreRef.current.scale.setScalar(pulse);
      const mat = coreRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.16 + (Math.sin(t * 1.2) + 1) * 0.05 + flash * 0.22;
    }
  });

  return (
    <group>
      {/* Large emissive gold ring — the bright neon centrepiece the bloom catches */}
      <mesh ref={ringRef}>
        <torusGeometry args={[1.95, 0.16, 18, 110]} />
        <meshStandardMaterial
          color={GOLD}
          emissive={GOLD}
          emissiveIntensity={2.1}
          metalness={0.9}
          roughness={0.25}
          toneMapped={false}
        />
      </mesh>

      {/* Soft additive glowing core behind the ring; gently pulses */}
      <mesh ref={coreRef} position={[0, 0, -0.3]}>
        <circleGeometry args={[1.75, 56]} />
        <meshBasicMaterial
          color={GOLD}
          transparent
          opacity={0.18}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* a second, smaller hot core for a tighter bloom centre */}
      <mesh position={[0, 0, -0.22]}>
        <circleGeometry args={[0.7, 44]} />
        <meshBasicMaterial
          color="#FFE9A0"
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function Scene() {
  const parallaxRef = useRef<THREE.Group>(null);
  const spinRef = useRef<THREE.Group>(null);
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
    // slow auto-rotation of the whole arrangement
    if (spinRef.current) spinRef.current.rotation.y += delta * 0.06;
    // ease a few degrees of parallax toward the pointer
    const p = parallaxRef.current;
    if (p) {
      const ty = pointer.x * 0.28;
      const tx = -pointer.y * 0.18;
      p.rotation.y += (ty - p.rotation.y) * 0.04;
      p.rotation.x += (tx - p.rotation.x) * 0.04;
    }
  });

  return (
    <group ref={parallaxRef}>
      {/* dim, moody lighting for real metallic reflections */}
      <ambientLight intensity={0.16} />
      <directionalLight position={[3, 4, 2]} intensity={1.3} color="#FFD27A" />
      <directionalLight position={[-4, -1, -3]} intensity={0.32} color="#9fb4d0" />
      {/* cool neutral fill from the camera side so the silver Rs 5 reads as
          real silver and isn't fully tinted gold by the warm environment */}
      <directionalLight position={[0, 0.5, 6]} intensity={0.65} color="#dfe6f2" />
      {/* gold rim/back light so the coins and ring catch a neon gold edge */}
      <directionalLight position={[0, 1.5, -7]} intensity={1.9} color={GOLD} />
      <pointLight position={[0, 0, -1.5]} intensity={3.4} distance={9} decay={2} color={GOLD} />

      {/* Self-contained dark "night" environment built from Lightformers — gives
          controlled metallic reflections with no runtime CDN dependency. */}
      <Environment resolution={256} frames={1}>
        <color attach="background" args={["#050505"]} />
        <Lightformer form="rect" intensity={1.7} color={GOLD} position={[0, 2.5, -4]} scale={[9, 4, 1]} />
        <Lightformer form="circle" intensity={0.5} color="#cfe0ff" position={[-5, 1, 2]} scale={3} />
        <Lightformer form="ring" intensity={1.0} color={GOLD_DEEP} position={[4, -1.5, 1]} scale={3} />
      </Environment>

      <group ref={spinRef}>
        <Portal />
        <TransformFlash />
        {GOLD_COINS.map((c, i) => (
          <GoldCoin key={i} config={c} geometry={goldGeometry} />
        ))}
        {/* Silver coin loads its textures lazily; the rest of the scene renders
            immediately while they stream in. */}
        <Suspense fallback={null}>
          <SilverCoin />
        </Suspense>
      </group>
    </group>
  );
}

function Effects() {
  // Shallow depth-of-field focused on the portal plane gives the moody,
  // cinematic falloff — off-plane coins (and the far incoming silver coin)
  // soften. Bloom is tuned high so ONLY the gold/emissive elements glow; the
  // silver coin and dark background stay below threshold and never blow out.
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <DepthOfField target={[0, 0, 0]} worldFocusRange={5.5} bokehScale={2.2} />
      <Bloom
        luminanceThreshold={0.78}
        luminanceSmoothing={0.18}
        intensity={1.05}
        radius={0.74}
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
        camera={{ position: [0, 0.15, 8.5], fov: 38 }}
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
