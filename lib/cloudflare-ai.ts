type FluxResponse =
  | { image: string }
  | { result?: { image?: string } }
  | { success?: boolean; result?: { image?: string } };

export async function generateFluxSchnellDataUri(opts: {
  prompt: string;
  seed?: number;
  steps?: number;
}): Promise<string> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !token) {
    throw new Error("Missing Cloudflare credentials");
  }

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/black-forest-labs/flux-1-schnell`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: opts.prompt,
        seed: opts.seed,
        steps: opts.steps ?? 4,
      }),
    }
  );

  if (!res.ok) {
    const contentType = res.headers.get("content-type") ?? "";
    const text = await res.text().catch(() => "");
    let details = text;
    if (contentType.includes("application/json")) {
      try {
        const j = JSON.parse(text) as any;
        details =
          j?.errors?.[0]?.message ??
          j?.messages?.[0]?.message ??
          j?.error ??
          text;
      } catch {
        // keep text
      }
    }
    throw new Error(`Cloudflare AI error: ${res.status} ${String(details)}`.slice(0, 500));
  }

  const json = (await res.json()) as FluxResponse;
  const image =
    "image" in json
      ? json.image
      : json?.result && "image" in json.result
        ? json.result.image
        : undefined;

  if (!image || typeof image !== "string") {
    throw new Error("Cloudflare AI returned no image");
  }

  return `data:image/jpeg;charset=utf-8;base64,${image}`;
}

