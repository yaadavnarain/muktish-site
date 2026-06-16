"use client";

import { Canvas, useFrame, type ThreeElements } from "@react-three/fiber";
import { Environment, Float, Lightformer } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useEffect, useMemo, useRef, useState, Suspense } from "react";
import * as THREE from "three";

const GOLD = "#F5C842";
const GOLD_DEEP = "#B8881C";

/* Shared pointer target in normalized [-1, 1] space. A window-level listener
   feeds this so parallax still works even though the canvas wrapper has
   pointer-events: none (so it never blocks the buttons). */
const pointer = { x: 0, y: 0 };

type CoinConfig = {
  radius: number; // orbit radius
  y: number; // orbit height
  speed: number; // orbital angular speed (varied so it never looks mechanical)
  phase: number; // starting angle
  size: number; // disc radius
  floatSpeed: number;
  variant: "gold" | "chrome";
};

// 5 coins on slightly different orbits/heights with varied speeds.
const COINS: CoinConfig[] = [
  { radius: 2.5, y: 0.35, speed: 0.16, phase: 0.0, size: 0.55, floatSpeed: 1.6, variant: "gold" },
  { radius: 3.1, y: -0.55, speed: -0.11, phase: 1.7, size: 0.48, floatSpeed: 1.1, variant: "chrome" },
  { radius: 2.2, y: 0.95, speed: 0.21, phase: 3.1, size: 0.4, floatSpeed: 2.0, variant: "gold" },
  { radius: 3.4, y: 0.1, speed: -0.14, phase: 4.4, size: 0.6, floatSpeed: 1.3, variant: "chrome" },
  { radius: 2.8, y: -1.0, speed: 0.18, phase: 5.6, size: 0.45, floatSpeed: 1.8, variant: "gold" },
];

function Coin({ config }: { config: CoinConfig }) {
  const orbitRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const a = config.phase + t * config.speed;
    const g = orbitRef.current;
    if (g) g.position.set(Math.cos(a) * config.radius, config.y, Math.sin(a) * config.radius);
  });

  const material = useMemo<ThreeElements["meshStandardMaterial"]>(() => {
    if (config.variant === "gold") {
      return { color: "#E8B53A", metalness: 1, roughness: 0.28, envMapIntensity: 1.1 };
    }
    return { color: "#15161a", metalness: 1, roughness: 0.16, envMapIntensity: 1.4 };
  }, [config.variant]);

  return (
    <group ref={orbitRef}>
      <Float speed={config.floatSpeed} rotationIntensity={0.6} floatIntensity={0.7} floatingRange={[-0.12, 0.12]}>
        {/* lay the cylinder down so its round face reads as a coin toward the camera */}
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow={false} receiveShadow={false}>
          <cylinderGeometry args={[config.size, config.size, 0.075, 48]} />
          <meshStandardMaterial {...material} />
        </mesh>
      </Float>
    </group>
  );
}

function Portal() {
  const ringRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.16;
      ringRef.current.rotation.x = Math.sin(t * 0.2) * 0.08;
    }
    if (coreRef.current) {
      const pulse = 1 + Math.sin(t * 1.2) * 0.06;
      coreRef.current.scale.setScalar(pulse);
      const mat = coreRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.16 + (Math.sin(t * 1.2) + 1) * 0.05;
    }
  });

  return (
    <group>
      {/* Emissive gold ring — bright enough to be the only thing the bloom catches */}
      <mesh ref={ringRef}>
        <torusGeometry args={[1.35, 0.13, 16, 96]} />
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
      <mesh ref={coreRef} position={[0, 0, -0.25]}>
        <circleGeometry args={[1.25, 48]} />
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
      <mesh position={[0, 0, -0.2]}>
        <circleGeometry args={[0.5, 40]} />
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
    if (spinRef.current) spinRef.current.rotation.y += delta * 0.08;
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
      <ambientLight intensity={0.18} />
      <directionalLight position={[3, 4, 2]} intensity={1.3} color="#FFD27A" />
      <directionalLight position={[-4, -1, -3]} intensity={0.35} color="#9fb4d0" />

      {/* Self-contained dark "night" environment built from Lightformers — gives
          controlled metallic reflections with no runtime CDN dependency. */}
      <Environment resolution={256} frames={1}>
        <color attach="background" args={["#050505"]} />
        <Lightformer form="rect" intensity={1.4} color={GOLD} position={[0, 2.5, -4]} scale={[8, 4, 1]} />
        <Lightformer form="circle" intensity={0.5} color="#cfe0ff" position={[-5, 1, 2]} scale={3} />
        <Lightformer form="ring" intensity={0.9} color={GOLD_DEEP} position={[4, -1.5, 1]} scale={3} />
      </Environment>

      <group ref={spinRef}>
        <Portal />
        {COINS.map((c, i) => (
          <Coin key={i} config={c} />
        ))}
      </group>
    </group>
  );
}

function Effects() {
  // Bloom tuned high so ONLY the emissive gold (ring + cores) glows — the
  // lit metallic coins and dark background stay below threshold.
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        luminanceThreshold={0.75}
        luminanceSmoothing={0.18}
        intensity={0.95}
        radius={0.72}
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
        camera={{ position: [0, 0.2, 7], fov: 42 }}
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
