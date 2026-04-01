"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/Card/Card";
import { CardReveal } from "@/components/Card/CardReveal";
import { GeneratorForm } from "@/components/Generator/GeneratorForm";
import { DownloadButton } from "@/components/ui/DownloadButton";
import type { CardData } from "@/types/card";
import { BackgroundVideo } from "@/components/BackgroundVideo";
import { BrandLogo } from "@/components/BrandLogo";

export default function Home() {
  const [card, setCard] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [portraitStatus, setPortraitStatus] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [portraitError, setPortraitError] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const overlayTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (overlayTimerRef.current) {
        window.clearTimeout(overlayTimerRef.current);
        overlayTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!card) return;
      if (card.art_url) {
        setPortraitStatus("ready");
        return;
      }
      setPortraitStatus("loading");
      setPortraitError(null);
      try {
        const prefix = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
        const res = await fetch(`${prefix}/api/portrait`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(card),
        });

        if (!res.ok) {
          // Static / GitHub Pages has no API — show placeholder art.
          if (res.status === 404) {
            if (!cancelled) setPortraitStatus("idle");
            return;
          }
          // 501 means “not configured” — treat as idle (placeholder art).
          if (res.status === 501) {
            if (!cancelled) setPortraitStatus("idle");
            return;
          }
          const err = (await res.json().catch(() => ({}))) as {
            error?: string;
            detail?: string;
          };
          if (!cancelled) {
            setPortraitError(err.detail || err.error || `HTTP ${res.status}`);
            setPortraitStatus("error");
          }
          return;
        }

        const data = (await res.json().catch(() => ({}))) as {
          art_url?: string;
        };
        if (!data.art_url) {
          if (!cancelled) setPortraitStatus("error");
          return;
        }
        if (!cancelled) {
          setCard((prev) => (prev ? { ...prev, art_url: data.art_url } : prev));
          setPortraitStatus("ready");
        }
      } catch {
        if (!cancelled) setPortraitStatus("error");
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [card?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <main className="relative flex min-h-screen flex-col">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <BackgroundVideo
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260306_074215_04640ca7-042c-45d6-bb56-58b1e8a42489.mp4"
          className="h-full w-full object-cover opacity-75"
        />
        {/* Darken + gradient fade so it's subtle */}
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/20 to-transparent" />
      </div>

      <div className="relative z-0 flex flex-1 flex-col items-center justify-center px-4 pb-10 pt-8">
        <div className="-mt-12 flex w-full max-w-md flex-col gap-10">
          <div className="flex justify-center">
            <BrandLogo />
          </div>
          <header className="text-center">
            <h1 className="font-serif text-[clamp(1.65rem,min(7vw+0.75rem,4.25rem),4.25rem)] font-semibold leading-[1.06] tracking-[-0.045em] text-white">
              Your Nickname,
              <br />
              <span className="inline-block whitespace-nowrap">
                Your Trading&nbsp;Card
              </span>
            </h1>
            <p className="mt-5 text-sm font-normal leading-relaxed text-zinc-400 md:text-base">
              Describe yourself — we forge a title, rarity, and stats from what you type. Preview
              is interactive; the PNG is a high-res snapshot (holo may look flatter).
            </p>
          </header>

          <section
            aria-busy={loading}
            className="flex w-full flex-col items-stretch gap-6"
          >
            <GeneratorForm
              onCard={(c) => {
                setCard(c);
                // Start portrait generation immediately (card set triggers effect),
                // but delay opening the overlay so the portrait has a head start.
                if (overlayTimerRef.current) {
                  window.clearTimeout(overlayTimerRef.current);
                  overlayTimerRef.current = null;
                }
                overlayTimerRef.current = window.setTimeout(() => {
                  setShowOverlay(true);
                }, 500);
                setPortraitStatus("idle");
                setPortraitError(null);
              }}
              onLoading={(v) => {
                setLoading(v);
                if (v) setCard(null);
              }}
              onError={setError}
            />

            {error ? (
              <p className="text-center text-sm text-red-300/90" role="alert">
                {error}
              </p>
            ) : null}

          </section>
        </div>
      </div>

      {card && showOverlay ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 md:items-center md:pt-4"
          role="dialog"
          aria-modal="true"
          aria-label="Card preview"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-[2px]"
            aria-label="Close preview"
            onClick={() => setShowOverlay(false)}
          />
          <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-4">
            <div className="self-end">
              <button
                type="button"
                onClick={() => setShowOverlay(false)}
                className="border border-white/25 bg-black/50 px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/90 hover:border-white/40 hover:bg-black/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              >
                Close
              </button>
            </div>
            <CardReveal card={card}>
              <Card ref={cardRef} card={card} />
            </CardReveal>
            {portraitStatus === "loading" ? (
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                Generating portrait…
              </p>
            ) : portraitStatus === "error" ? (
              <p className="text-xs text-red-300/90">
                Portrait failed.{" "}
                <span className="text-red-200/70">{portraitError}</span>
              </p>
            ) : null}
            <DownloadButton
              cardRef={cardRef}
              filename={card.nickname || card.name || "legendex-card"}
            />
          </div>
        </div>
      ) : null}
    </main>
  );
}
