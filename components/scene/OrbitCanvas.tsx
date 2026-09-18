"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AdditiveBlending,
  Color,
  type Group,
  type Mesh,
  type Points,
  ShaderMaterial,
} from "three";
import { useReducedMotion } from "motion/react";
import {
  budgetEnergy,
  needHue,
  ringCount,
  urgencyHeat,
  useOrbitScene,
} from "./OrbitProvider";
import { SceneFallback } from "./SceneFallback";

const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uDistort;
varying vec3 vNormalW;
varying vec3 vWorld;

float hash(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float noise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
        mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
    mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
        mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
    f.z
  );
}

void main() {
  float n = noise(position * 2.4 + uTime * 0.25);
  vec3 p = position + normal * n * uDistort;
  vec4 world = modelMatrix * vec4(p, 1.0);
  vWorld = world.xyz;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

const fragmentShader = /* glsl */ `
uniform float uHeat;
uniform float uHue;
uniform float uBoost;
varying vec3 vNormalW;
varying vec3 vWorld;

vec3 plasma() {
  vec3 ice = vec3(0.365, 0.882, 1.0);
  vec3 ember = vec3(1.0, 0.357, 0.18);
  vec3 lime = vec3(0.784, 1.0, 0.239);
  vec3 warm = mix(ice, ember, uHeat);
  return mix(warm, lime, uHue * 0.35);
}

void main() {
  vec3 n = normalize(vNormalW);
  float fresnel = pow(1.0 - abs(dot(n, vec3(0.0, 0.0, 1.0))), 2.2);
  vec3 col = plasma();
  float core = 0.22 + uBoost * 0.55;
  vec3 glow = col * (core + fresnel * (0.8 + uHeat * 0.6));
  gl_FragColor = vec4(glow, 1.0);
}
`;

function Core() {
  const mesh = useRef<Mesh>(null);
  const mat = useRef<ShaderMaterial>(null);
  const { scene } = useOrbitScene();
  const energy = budgetEnergy(scene.budget);
  const heat = urgencyHeat(scene.urgency);
  const hue = needHue(scene.need);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (mesh.current) {
      const speed = 0.12 + heat * 1.4 + (scene.launching ? 2.2 : 0);
      mesh.current.rotation.y += speed * 0.016;
      mesh.current.rotation.x += speed * 0.007;
      const scale = 0.85 + energy * 0.85 + (scene.launching ? 0.25 : 0);
      mesh.current.scale.setScalar(scale);
    }
    if (mat.current) {
      mat.current.uniforms.uTime.value = t;
      mat.current.uniforms.uDistort.value = 0.12 + energy * 0.28 + (scene.launching ? 0.2 : 0);
      mat.current.uniforms.uHeat.value = heat;
      mat.current.uniforms.uHue.value = hue;
      mat.current.uniforms.uBoost.value = energy + (scene.launching ? 0.5 : 0);
    }
  });

  return (
    <mesh ref={mesh}>
      <icosahedronGeometry args={[1.15, 24]} />
      <shaderMaterial
        ref={mat}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uDistort: { value: 0.16 },
          uHeat: { value: 0.25 },
          uHue: { value: 0.35 },
          uBoost: { value: 0.3 },
        }}
      />
    </mesh>
  );
}

function Rings() {
  const group = useRef<Group>(null);
  const { scene } = useOrbitScene();
  const count = ringCount(scene.budget);
  const heat = urgencyHeat(scene.urgency);
  const hue = needHue(scene.need);
  const color = useMemo(() => {
    const ice = new Color("#5DE1FF");
    const ember = new Color("#FF5B2E");
    const lime = new Color("#C8FF3D");
    return ice.clone().lerp(ember, heat).lerp(lime, hue * 0.25);
  }, [heat, hue]);

  useFrame((_, delta) => {
    if (!group.current) return;
    const dir = scene.launching ? 0.02 : 1;
    group.current.rotation.z += delta * (0.08 + heat * 0.7) * dir;
    group.current.rotation.y += delta * (0.05 + heat * 0.25);
    if (scene.launching) {
      group.current.rotation.x += (0 - group.current.rotation.x) * 0.08;
    }
  });

  return (
    <group ref={group}>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i} rotation={[Math.PI / 2.2, 0.2 * i, i * 0.45]}>
          <torusGeometry args={[1.7 + i * 0.42, 0.008, 8, 128]} />
          <meshBasicMaterial color={color} transparent opacity={0.55 - i * 0.06} />
        </mesh>
      ))}
    </group>
  );
}

function hash01(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function Particles({ mobile }: { mobile: boolean }) {
  const points = useRef<Points>(null);
  const count = mobile ? 90 : 420;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const r = 2.2 + hash01(i) * 6;
      const theta = hash01(i + 17) * Math.PI * 2;
      const phi = Math.acos(2 * hash01(i + 31) - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, [count]);

  useFrame((_, delta) => {
    if (points.current) points.current.rotation.y += delta * 0.03;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={mobile ? 0.035 : 0.022}
        color="#F2EDE4"
        transparent
        opacity={0.55}
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function CameraRig() {
  const { scene } = useOrbitScene();
  useFrame((state) => {
    const targetZ = scene.launching ? 4.2 : 6.4;
    state.camera.position.z += (targetZ - state.camera.position.z) * 0.05;
    const mx = state.pointer.x * 0.35;
    const my = state.pointer.y * 0.2;
    state.camera.position.x += (mx - state.camera.position.x) * 0.04;
    state.camera.position.y += (my - state.camera.position.y) * 0.04;
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

function SceneInner({ mobile }: { mobile: boolean }) {
  return (
    <>
      <color attach="background" args={["#0A0908"]} />
      <ambientLight intensity={0.35} />
      <pointLight position={[4, 3, 5]} intensity={1.4} color="#C8FF3D" />
      <pointLight position={[-4, -2, 3]} intensity={0.8} color="#FF5B2E" />
      <Particles mobile={mobile} />
      <Rings />
      <Float speed={0.5} rotationIntensity={0.15} floatIntensity={0.35}>
        <Core />
      </Float>
      <CameraRig />
    </>
  );
}

export function OrbitCanvas({ active }: { active: boolean }) {
  const reduce = useReducedMotion();
  const [mobile, setMobile] = useState(false);
  const [webgl, setWebgl] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const apply = () => setMobile(mq.matches);
    mq.addEventListener("change", apply);
    const t = window.setTimeout(() => {
      apply();
      try {
        const c = document.createElement("canvas");
        setWebgl(Boolean(c.getContext("webgl2") || c.getContext("webgl")));
      } catch {
        setWebgl(false);
      }
    }, 0);
    return () => {
      mq.removeEventListener("change", apply);
      window.clearTimeout(t);
    };
  }, []);

  if (reduce || !webgl) return <SceneFallback />;

  return (
    <Canvas
      className="absolute inset-0"
      dpr={mobile ? [1, 1.5] : [1, 2]}
      camera={{ position: [0, 0, 6.4], fov: 42 }}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: !mobile, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.setClearColor("#0A0908", 1);
      }}
    >
      <SceneInner mobile={mobile} />
    </Canvas>
  );
}

