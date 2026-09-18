export type GeminiInsight = {
  summary: string;
  intent: "comprar_ahora" | "evaluando" | "curioseando";
  spamRisk: number;
  intro: string;
};

const FALLBACK: GeminiInsight = {
  summary: "Prospecto en evaluación. El equipo revisa encaje y siguiente conversación.",
  intent: "evaluando",
  spamRisk: 0,
  intro: "Recibimos tu briefing. El equipo ya está en trayectoria de acercamiento.",
};

function extractJson(text: string): GeminiInsight | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[0]) as Partial<GeminiInsight>;
    const intent =
      parsed.intent === "comprar_ahora" || parsed.intent === "curioseando" || parsed.intent === "evaluando"
        ? parsed.intent
        : "evaluando";
    const spamRisk = Number(parsed.spamRisk);
    return {
      summary: String(parsed.summary || FALLBACK.summary).slice(0, 400),
      intent,
      spamRisk: Number.isFinite(spamRisk) ? Math.min(1, Math.max(0, spamRisk)) : 0,
      intro: String(parsed.intro || FALLBACK.intro).slice(0, 180),
    };
  } catch {
    return null;
  }
}

export async function analyzeLeadWithGemini(input: {
  firstName: string;
  company: string;
  niche: string;
  need: string;
  budget: string;
  urgency: string;
  message: string;
  emailDomain: string;
}): Promise<GeminiInsight> {
  const key = process.env.LLM_API_KEY;
  if (!key) return FALLBACK;

  const url =
    process.env.LLM_API_URL ||
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent";

  const prompt = `Eres un analista de una agencia mexicana llamada ÓRBITA (demo). Recibes datos de un prospecto SIN correo completo ni teléfono. Devuelve SOLO JSON válido, sin markdown, con esta forma:

{"summary":"resumen en es-MX, 2 oraciones máx.","intent":"comprar_ahora"|"evaluando"|"curioseando","spamRisk":0.0,"intro":"una frase cálida para el correo de confirmación, sin mencionar puntaje ni letra de órbita"}

Reglas:
- spamRisk entre 0 y 1. Usa 0.7+ solo con señales claras (apuestas, crypto no solicitado, texto sin sentido, SEO spam).
- No inventes empresa ni presupuesto.
- intro en segunda persona, máximo 160 caracteres.

Datos:
Nombre de pila: ${input.firstName}
Empresa: ${input.company}
Nicho: ${input.niche}
Necesidad: ${input.need}
Presupuesto (banda): ${input.budget}
Urgencia: ${input.urgency}
Mensaje (recortado): ${input.message.slice(0, 280)}
Dominio de correo: ${input.emailDomain}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6_000);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": key,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 400 },
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      console.error("Gemini HTTP", res.status, await res.text().catch(() => ""));
      return FALLBACK;
    }
    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return extractJson(text) || FALLBACK;
  } catch (err) {
    console.error("Gemini no disponible", err);
    return FALLBACK;
  } finally {
    clearTimeout(timer);
  }
}
