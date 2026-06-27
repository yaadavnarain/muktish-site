"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, useTexture } from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  DepthOfField,
} from "@react-three/postprocessing";
import { useEffect, useMemo, useRef, useState, Suspense } from "react";
import * as THREE from "three";

const GOLD = "#F5C842";
const GOLD_DEEP = "#B8881C";
const GOLD_WARM = "#FFE6A8";
const COOL = "#cfe0ff"; // neutral cool rim — pairs with the warm gold key (no teal)

// The real Mauritius Rs 5 coin (alpha-masked photo on a transparent bg).
const RS5_BACK = "/coin/rs5-back.png";
useTexture.preload([RS5_BACK]);

/* Shared pointer target in normalized [-1, 1] space. A window-level listener
   feeds this so parallax still works even though the canvas wrapper has
   pointer-events: none (so it never blocks the buttons). */
const pointer = { x: 0, y: 0 };

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
// 5th-order smootherstep — no linear ramps anywhere in the motion.
const smootherstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * t * (t * (t * 6 - 15) + 10);
};

type Quality = "high" | "low";

/* ------------------------------------------------------------------ *
 * The coin is a single physical disc: one face is the engraved silver
 * Rs 5, the other is clean polished gold. It scales in showing silver,
 * then spins forever on its Y axis — so the gold and the silver simply
 * turn into view one after another. The rotation IS the transformation,
 * so there is no material "swap" to glitch; it loops seamlessly.
 * ------------------------------------------------------------------ */
const INTRO = 1.3; // scale-in seconds
const SPIN_SPEED = 0.9; // rad/s — calm, cinematic continuous spin
const SILVER_OFFSET = Math.PI; // start with the silver face toward camera

/* The coin photo is a dark, warm, alpha-masked shot. We re-grade it into a
   bright, neutral-cool silver with boosted contrast (a dark low-contrast albedo
   washes flat once lit + tone-mapped), and derive a tangent-space normal map
   from its luminance so the engraving catches the key/rim light — genuine
   minted relief without shipping a second baked asset. Computed once. */
function buildCoinMaps(
  image: HTMLImageElement | HTMLCanvasElement,
  strength: number,
) {
  const maxDim = 512;
  const iw = (image as HTMLImageElement).naturalWidth || image.width;
  const ih = (image as HTMLImageElement).naturalHeight || image.height;
  const scale = Math.min(1, maxDim / Math.max(iw, ih));
  const w = Math.max(1, Math.round(iw * scale));
  const h = Math.max(1, Math.round(ih * scale));

  const src = document.createElement("canvas");
  src.width = w;
  src.height = h;
  const sctx = src.getContext("2d")!;
  sctx.drawImage(image, 0, 0, w, h);

  const img = sctx.getImageData(0, 0, w, h);
  const data = img.data;
  const lum = new Float32Array(w * h);
  const clampB = (v: number) => (v < 0 ? 0 : v > 255 ? 255 : v);
  for (let i = 0; i < w * h; i++) {
    const a = data[i * 4 + 3];
    const l =
      (0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2]) / 255;
    lum[i] = a < 16 ? 0.6 : l; // flatten transparent bg for a smooth edge
    if (a >= 16) {
      const g = clamp01((l - 0.46) * 1.5 + 0.46 + 0.26);
      data[i * 4] = clampB(g * 252);
      data[i * 4 + 1] = clampB(g * 255);
      data[i * 4 + 2] = clampB(g * 255 + 6);
    }
  }
  sctx.putImageData(img, 0, 0);
  const albedo = new THREE.CanvasTexture(src);
  albedo.colorSpace = THREE.SRGBColorSpace;
  albedo.needsUpdate = true;

  const at = (x: number, y: number) => {
    const cx = x < 0 ? 0 : x >= w ? w - 1 : x;
    const cy = y < 0 ? 0 : y >= h ? h - 1 : y;
    return lum[cy * w + cx];
  };
  const nrm = document.createElement("canvas");
  nrm.width = w;
  nrm.height = h;
  const nctx = nrm.getContext("2d")!;
  const nd = nctx.createImageData(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const gx =
        at(x - 1, y - 1) + 2 * at(x - 1, y) + at(x - 1, y + 1) -
        at(x + 1, y - 1) - 2 * at(x + 1, y) - at(x + 1, y + 1);
      const gy =
        at(x - 1, y - 1) + 2 * at(x, y - 1) + at(x + 1, y - 1) -
        at(x - 1, y + 1) - 2 * at(x, y + 1) - at(x + 1, y + 1);
      const nx = -gx * strength;
      const ny = -gy * strength;
      const inv = 1 / Math.sqrt(nx * nx + ny * ny + 1);
      const i = (y * w + x) * 4;
      nd.data[i] = (nx * inv * 0.5 + 0.5) * 255;
      nd.data[i + 1] = (ny * inv * 0.5 + 0.5) * 255;
      nd.data[i + 2] = (inv * 0.5 + 0.5) * 255;
      nd.data[i + 3] = 255;
    }
  }
  nctx.putImageData(nd, 0, 0);
  const normal = new THREE.CanvasTexture(nrm);
  normal.needsUpdate = true;

  return { albedo, normal };
}

function Coin({ quality }: { quality: Quality }) {
  const groupRef = useRef<THREE.Group>(null); // scale-in + float
  const spinRef = useRef<THREE.Group>(null); // continuous Y spin

  const back = useTexture(RS5_BACK);
  const maxAniso = useThree((s) => s.gl.capabilities.getMaxAnisotropy());
  const segs = quality === "high" ? 96 : 48;

  // Material array maps to the cylinder groups: [rim, top cap, bottom cap].
  // top = clean polished gold, bottom = engraved silver Rs 5.
  const { materials, disposables } = useMemo(() => {
    const strength = quality === "high" ? 2.2 : 1.6;
    const { albedo, normal } = buildCoinMaps(back.image as HTMLImageElement, strength);
    // The silver lives on the BOTTOM cap; rotated to face the camera it would
    // mirror, so flip U so the engraving reads correctly.
    for (const t of [albedo, normal]) {
      t.anisotropy = maxAniso;
      t.wrapS = THREE.RepeatWrapping;
      t.repeat.x = -1;
      t.offset.x = 1;
    }
    const nScale = quality === "high" ? 1.2 : 0.95;

    const rim = new THREE.MeshStandardMaterial({
      color: "#c9a64a",
      metalness: 0.95,
      roughness: 0.34,
      envMapIntensity: 0.7,
    });
    // Clean polished gold — smooth, no engraving. Slightly sub-mirror so the
    // face stays a consistent rich gold across the full spin (a pure mirror
    // reflects the dark env and reads as a dim ring at some angles).
    const gold = new THREE.MeshPhysicalMaterial({
      color: GOLD,
      metalness: 0.86,
      roughness: 0.3,
      clearcoat: 1,
      clearcoatRoughness: 0.32,
      envMapIntensity: quality === "high" ? 1.7 : 1.4,
      emissive: new THREE.Color(GOLD_DEEP),
      emissiveIntensity: 0.1, // low — cinematic, not glowy
    });
    // Engraved silver — low metalness + env so the photo albedo and relief read
    // as real silver, not a brassy mirror of the warm key.
    const silver = new THREE.MeshStandardMaterial({
      map: albedo,
      normalMap: normal,
      normalScale: new THREE.Vector2(nScale, nScale),
      color: "#eef1f5",
      metalness: 0.5,
      roughness: 0.44,
      envMapIntensity: 0.42,
    });
    return {
      materials: [rim, gold, silver],
      disposables: [rim, gold, silver, albedo, normal],
    };
  }, [back, maxAniso, quality]);

  const goldMat = materials[1] as THREE.MeshPhysicalMaterial;

  useEffect(
    () => () => disposables.forEach((d) => d.dispose()),
    [disposables],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // scale-in with a soft premium overshoot
    const intro = smootherstep(0, INTRO, t);
    const overshoot = 1 + 0.05 * Math.sin(intro * Math.PI) * (1 - intro);
    const g = groupRef.current;
    if (g) {
      g.scale.setScalar(intro * overshoot);
      const floatAmt = smootherstep(INTRO, INTRO + 1.2, t);
      g.position.y = Math.sin(t * 0.6) * 0.06 * floatAmt;
      g.rotation.z = 0.1 + Math.sin(t * 0.45) * 0.02 * floatAmt;
      // gentle pointer parallax (X tilt only; Y spin is owned by spinRef)
      const tx = -pointer.y * 0.1;
      g.rotation.x += (tx - g.rotation.x) * 0.03;
    }

    // continuous spin — silver first, easing up to a steady cinematic rate
    if (spinRef.current) {
      spinRef.current.rotation.y = SILVER_OFFSET + t * SPIN_SPEED;
    }

    // a slow, faint gold gleam as the face turns through the light
    goldMat.emissiveIntensity = 0.08 + 0.05 * (0.5 + 0.5 * Math.sin(t * 0.5));
  });

  return (
    <group ref={groupRef} scale={0}>
      <group ref={spinRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={materials}>
          <cylinderGeometry args={[1, 1, 0.16, segs]} />
        </mesh>
      </group>
    </group>
  );
}

/* A soft, restrained gold glow behind the coin — the implied light source.
   A radial gradient on an additive plane (no busy vortex), gentle pulse. */
function PortalGlow() {
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, "rgba(255,226,150,0.8)");
    g.addColorStop(0.34, "rgba(245,200,66,0.32)");
    g.addColorStop(0.64, "rgba(184,136,28,0.1)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    const t = new THREE.CanvasTexture(c);
    t.needsUpdate = true;
    return t;
  }, []);
  useEffect(() => () => tex.dispose(), [tex]);

  useFrame((state) => {
    if (matRef.current)
      matRef.current.opacity = 0.2 + 0.04 * Math.sin(state.clock.elapsedTime * 0.7);
  });

  return (
    <mesh position={[0, 0, -1.9]} scale={5.2}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        ref={matRef}
        map={tex}
        transparent
        opacity={0.2}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

function Scene({ quality }: { quality: Quality }) {
  const parallaxRef = useRef<THREE.Group>(null);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame(() => {
    const p = parallaxRef.current;
    if (p) {
      const ty = pointer.x * 0.14;
      p.rotation.y += (ty - p.rotation.y) * 0.03;
    }
  });

  const envRes = quality === "high" ? 256 : 128;

  return (
    <group ref={parallaxRef}>
      {/* Cinematic key + cool rim + neutral front fill so both the silver and
          gold faces read well as the coin turns. */}
      <ambientLight intensity={0.16} color="#20242b" />
      <directionalLight position={[4.5, 3, 4]} intensity={1.4} color="#FFE2A0" />
      <directionalLight position={[-5, 1.5, -4]} intensity={0.85} color={COOL} />
      <directionalLight position={[0, 1.2, 6]} intensity={1.1} color="#f2f5fa" />

      {/* Dark studio env. A broad warm panel BEHIND the camera (+Z) gives the
          polished gold something to reflect; kept moderate so it never washes
          the silver or blows out into a glow. */}
      <Environment resolution={envRes} frames={1}>
        <color attach="background" args={["#000000"]} />
        <Lightformer form="rect" intensity={1.1} color={GOLD_WARM} position={[0, 1, 8]} scale={[11, 8, 1]} />
        <Lightformer form="rect" intensity={1.4} color={GOLD_WARM} position={[3.5, 2, 3]} scale={[6, 5, 1]} />
        <Lightformer form="rect" intensity={0.8} color={COOL} position={[-4.5, 0, -3]} scale={[7, 5, 1]} />
      </Environment>

      <PortalGlow />

      <Suspense fallback={null}>
        <Coin quality={quality} />
      </Suspense>
    </group>
  );
}

function Effects({ quality }: { quality: Quality }) {
  // Restrained, controlled bloom only on the brightest highlights; subtle,
  // desktop-only DOF for a premium fall-off (dropped on mobile for smoothness).
  if (quality === "low") {
    return (
      <EffectComposer multisampling={0} enableNormalPass={false}>
        <Bloom luminanceThreshold={1.0} luminanceSmoothing={0.14} intensity={0.28} radius={0.25} mipmapBlur />
      </EffectComposer>
    );
  }
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom luminanceThreshold={1.0} luminanceSmoothing={0.14} intensity={0.34} radius={0.28} mipmapBlur />
      <DepthOfField focusDistance={0.0} focalLength={0.035} bokehScale={1.8} height={480} />
    </EffectComposer>
  );
}

export default function HeroScene({ quality = "high" }: { quality?: Quality }) {
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

  const dpr: [number, number] = quality === "high" ? [1, 2] : [1, 1.5];

  return (
    <div ref={containerRef} className="absolute inset-0">
      <Canvas
        dpr={dpr}
        frameloop={active ? "always" : "never"}
        camera={{ position: [0, 0.2, 6.2], fov: 40 }}
        onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
        gl={{
          alpha: true,
          antialias: quality === "high",
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
        }}
      >
        <Suspense fallback={null}>
          <Scene quality={quality} />
          <Effects quality={quality} />
        </Suspense>
      </Canvas>
    </div>
  );
}
