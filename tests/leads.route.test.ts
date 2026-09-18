import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/ingestLead", () => ({
  ingestLead: vi.fn(),
}));

vi.mock("@/lib/outbox", () => ({
  saveSubmission: vi.fn().mockResolvedValue(undefined),
  markSubmission: vi.fn().mockResolvedValue(undefined),
}));

import { POST } from "@/app/api/leads/route";
import { resetRateLimitForTests } from "@/lib/rateLimit";
import { ingestLead } from "@/lib/ingestLead";

const ingest = vi.mocked(ingestLead);

function env() {
  process.env.MONGODB_URI = "mongodb://localhost:27017";
  process.env.MONGODB_DB = "leadflow";
  process.env.ADMIN_PASSWORD = "adminpass1";
  process.env.ADMIN_SECRET = "admin-secret-16ok";
  process.env.CAL_BASE_URL = "https://cal.com/orbita";
  process.env.APP_URL = "http://localhost:3000";
}

const valid = {
  fullName: "Ana Pérez",
  email: "ana@acme.mx",
  phoneCountry: "MX",
  phone: "5512345678",
  company: "Acme",
  niche: "ecommerce",
  budget: "gt80k",
  urgency: "asap",
  need: "automation",
  message: "",
  consent: true,
  website: "",
  submissionId: "11111111-1111-4111-8111-111111111111",
  startedAt: Date.now() - 8_000,
};

function req(body: unknown, ip = "1.1.1.1") {
  return new Request("http://localhost/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });
}

describe("POST /api/leads", () => {
  beforeEach(() => {
    env();
    resetRateLimitForTests();
    ingest.mockReset();
    ingest.mockResolvedValue({
      leadId: "ld_1",
      tier: "A",
      bookingUrl: "https://cal.com/orbita/priority-15min",
      duplicate: false,
      emailSent: true,
    });
  });

  it("acepta un payload válido y no expone SMTP", async () => {
    const res = await POST(req(valid));
    expect(res.status).toBe(200);
    const data = (await res.json()) as { ok: boolean; orbit: string; leadId: string };
    expect(data.ok).toBe(true);
    expect(data.orbit).toBe("priority");
    expect(data.leadId).toBe("ld_1");
    expect(JSON.stringify(data)).not.toContain("smtp");
    expect(ingest).toHaveBeenCalledOnce();
  });

  it("rechaza campos vacíos", async () => {
    const res = await POST(
      req({ startedAt: Date.now() - 8_000, website: "", submissionId: valid.submissionId }),
    );
    expect(res.status).toBe(400);
    expect(ingest).not.toHaveBeenCalled();
  });

  it("honeypot responde 200 y no procesa el lead", async () => {
    const res = await POST(req({ ...valid, website: "https://spam.test" }));
    expect(res.status).toBe(200);
    expect(ingest).not.toHaveBeenCalled();
  });

  it("rate limit 5 / 10 min por IP", async () => {
    for (let i = 0; i < 5; i += 1) {
      await POST(req({ website: "bot" }, "9.9.9.9"));
    }
    const res = await POST(req({ website: "bot" }, "9.9.9.9"));
    expect(res.status).toBe(429);
  });
});
