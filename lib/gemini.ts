export type GeminiInsight = {
  summary: string;
  intent: "comprar_ahora" | "evaluando" | "curioseando";
  spamRisk: number;
  intro: string;
};

const FALLBACK: GeminiInsight = {
  summary: "Prospecto con señal clara de trabajo. Revisar encaje y abrir conversación, no un pitch genérico.",
  intent: "evaluando",
  spamRisk: 0,
  intro:
    "No es un acuse de recibo automático. Leímos lo que contaste y ya hay un siguiente movimiento sobre la mesa.",
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
      intro: String(parsed.intro || FALLBACK.intro).slice(0, 280),
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

  const prompt = `Eres la voz de ÓRBITA, una consultora de crecimiento en Ciudad de México. Hablas en es-MX, segunda persona, con pulso: serio, cercano, un poco literario, nunca corporativo hueco ni vendedor de cursos.

Recibes datos de un prospecto SIN correo completo ni teléfono. Devuelve SOLO JSON válido, sin markdown:

{"summary":"resumen interno en es-MX, 2 oraciones, tono de mesa de trabajo","intent":"comprar_ahora"|"evaluando"|"curioseando","spamRisk":0.0,"intro":"2 frases para el correo al prospecto. Trátalo de tú. Menciona su nombre o empresa si encajan. Sin puntaje, sin letra A/B/C, sin la palabra demo."}

Reglas de intro:
- Como si escribiera una persona, no un CRM.
- Evita clichés: "estamos emocionados", "no dudes en contactarnos", "tu solicitud ha sido recibida".
- Máximo 240 caracteres.
- spamRisk 0–1. 0.7+ solo con spam claro (apuestas, crypto no pedido, SEO spam, sinsentido).
- No inventes presupuesto ni empresa.

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
  const timer = setTimeout(() => controller.abort(), 12_000);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": key,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.75, maxOutputTokens: 500 },
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
