"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { SceneFallback } from "./SceneFallback";

const Canvas = dynamic(
  () => import("./OrbitCanvas").then((m) => m.OrbitCanvas),
  { ssr: false, loading: () => <SceneFallback /> },
);

export function OrbitStage() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setActive(Boolean(entry?.isIntersecting) && document.visibilityState === "visible"),
      { threshold: 0.12 },
    );
    io.observe(el);
    const onVis = () => {
      setActive(document.visibilityState === "visible");
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <div ref={ref} className="absolute inset-0" aria-hidden="true">
      <Canvas active={active} />
    </div>
  );
}
