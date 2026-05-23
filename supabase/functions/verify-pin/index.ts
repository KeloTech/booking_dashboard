// Supabase Edge Function: verify-pin
// Tarkistaa annetun salasanan palvelimen ympäristömuuttujaa `DASHBOARD_PIN` vasten.
// Suoritetaan Deno-ympäristössä Supabasen alustalla.
//
// Aseta salasana Supabasen hallintaan ennen käyttöä:
//   1) CLI:llä:        supabase secrets set DASHBOARD_PIN="oma_salasanasi"
//   2) Tai dashboard:  Project → Edge Functions → Settings → Secrets → DASHBOARD_PIN
//
// Deployaa:           supabase functions deploy verify-pin --no-verify-jwt
//
// `--no-verify-jwt` on tärkeää, koska kutsu tehdään ennen kuin käyttäjä on
// kirjautunut: emme voi vaatia voimassa olevaa JWT:tä.

// deno-lint-ignore-file no-explicit-any
declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (req: Request) => Response | Promise<Response>): void;
};

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

/**
 * Vakioaikainen merkkijonovertailu. Palauttaa true vain jos jokainen tavu täsmää.
 * Pituuden eroavaisuus käsitellään pad-bytellä, joten vertailuaika ei vuoda
 * merkkien lukumäärän tarkkaa eroa.
 */
function constantTimeEqual(input: string, secret: string): boolean {
  const a = new TextEncoder().encode(input);
  const b = new TextEncoder().encode(secret);
  const len = Math.max(a.length, b.length);
  let mismatch = a.length ^ b.length;
  for (let i = 0; i < len; i += 1) {
    mismatch |= (a[i] ?? 0) ^ (b[i] ?? 0);
  }
  return mismatch === 0;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ ok: false, error: "method_not_allowed" }, 405);
  }

  let pin = "";
  try {
    const body = await req.json();
    pin = typeof body?.pin === "string" ? body.pin : "";
  } catch (_err) {
    return jsonResponse({ ok: false, error: "invalid_json" }, 400);
  }

  const expected = Deno.env.get("DASHBOARD_PIN") ?? "";
  if (!expected) {
    return jsonResponse(
      { ok: false, error: "server_secret_missing" },
      500,
    );
  }

  if (!pin) {
    return jsonResponse({ ok: false, error: "pin_required" }, 400);
  }

  const matches = constantTimeEqual(pin, expected);
  return jsonResponse({ ok: matches });
});
