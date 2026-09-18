export const brand = {
  name: "ÓRBITA",
  nameAscii: "ORBITA",
  tagline: "Tu proyecto entra en órbita.",
  domain: "orbita.agency",
  demoLabel: "demo",
} as const;

export type OrbitKind = "priority" | "stable" | "forming";

export const orbitCopy: Record<
  OrbitKind,
  { title: string; kicker: string; body: string }
> = {
  priority: {
    title: "Órbita prioritaria",
    kicker: "Ventana inmediata",
    body: "Detectamos tracción alta. Reserva 15 minutos en las próximas 48 horas.",
  },
  stable: {
    title: "Órbita estable",
    kicker: "Siguiente paso",
    body: "Encaja. Elige un horario de discovery de 30 minutos cuando te acomode.",
  },
  forming: {
    title: "Órbita en formación",
    kicker: "Afinamos el rumbo",
    body: "Recibimos tu señal. Tres preguntas más y te nutrimos con una secuencia breve.",
  },
};

export function orbitFromTier(tier: string | undefined | null): OrbitKind {
  if (tier === "A") return "priority";
  if (tier === "B") return "stable";
  return "forming";
}
