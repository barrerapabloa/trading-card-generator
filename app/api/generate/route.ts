import { NextResponse } from "next/server";
import { generateLocalCard } from "@/lib/local-generate";

const MAX_NAME = 64;
const MAX_DESC = 500;

/**
 * Fast card JSON only. Portrait art is loaded asynchronously via `POST /api/portrait`
 * so this route never blocks on Cloudflare/Flux (which caused “stuck” loading spinners).
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name =
    typeof body === "object" && body !== null && "name" in body
      ? String((body as { name: unknown }).name ?? "").trim()
      : "";
  const description =
    typeof body === "object" && body !== null && "description" in body
      ? String((body as { description: unknown }).description ?? "").trim()
      : "";

  let styleChaos = 50;
  if (typeof body === "object" && body !== null && "style_chaos" in body) {
    const raw = Number((body as { style_chaos: unknown }).style_chaos);
    if (Number.isFinite(raw)) {
      styleChaos = Math.round(Math.min(100, Math.max(0, raw)));
    }
  }

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (name.length > MAX_NAME) {
    return NextResponse.json({ error: "Name too long" }, { status: 400 });
  }
  if (description.length > MAX_DESC) {
    return NextResponse.json({ error: "Description too long" }, { status: 400 });
  }

  const card = generateLocalCard(name, description, styleChaos);
  return NextResponse.json(card);
}
