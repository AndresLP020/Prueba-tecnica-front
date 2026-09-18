"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Budget, Need, Urgency } from "@/lib/schemas";

export type SceneInput = {
  budget: Budget | "";
  urgency: Urgency | "";
  need: Need | "";
  launching: boolean;
};

const defaults: SceneInput = {
  budget: "",
  urgency: "",
  need: "",
  launching: false,
};

const Ctx = createContext<{
  scene: SceneInput;
  setScene: (patch: Partial<SceneInput>) => void;
}>({ scene: defaults, setScene: () => undefined });

export function OrbitProvider({ children }: { children: ReactNode }) {
  const [scene, setState] = useState<SceneInput>(defaults);
  const value = useMemo(
    () => ({
      scene,
      setScene: (patch: Partial<SceneInput>) =>
        setState((s) => ({ ...s, ...patch })),
    }),
    [scene],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useOrbitScene() {
  return useContext(Ctx);
}

export function budgetEnergy(budget: SceneInput["budget"]) {
  if (budget === "gt80k") return 1;
  if (budget === "30k_80k") return 0.72;
  if (budget === "10k_30k") return 0.42;
  if (budget === "lt10k") return 0.18;
  return 0.28;
}

export function urgencyHeat(urgency: SceneInput["urgency"]) {
  if (urgency === "asap") return 1;
  if (urgency === "month") return 0.7;
  if (urgency === "q1") return 0.4;
  if (urgency === "exploring") return 0.12;
  return 0.25;
}

export function needHue(need: SceneInput["need"]) {
  if (need === "automation" || need === "integrations_crm") return 0.55;
  if (need === "marketing_leads") return 0.18;
  if (need === "website_landing") return 0.85;
  if (need === "branding_design") return 0.08;
  return 0.35;
}

export function ringCount(budget: SceneInput["budget"]) {
  if (budget === "gt80k") return 5;
  if (budget === "30k_80k") return 4;
  if (budget === "10k_30k") return 3;
  return 2;
}
