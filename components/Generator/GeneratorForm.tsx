"use client";

import { useState } from "react";
import type { CardData } from "@/types/card";
import { generateLocalCard } from "@/lib/local-generate";
import { Button } from "@/components/ui/Button";
import styles from "./GeneratorForm.module.css";

type Props = {
  onCard: (card: CardData) => void;
  onLoading: (v: boolean) => void;
  onError: (msg: string | null) => void;
};

export function GeneratorForm({ onCard, onLoading, onError }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  /** 0 elegant → 100 chaotic */
  const [styleChaos, setStyleChaos] = useState(50);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    onError(null);
    setSubmitting(true);
    onLoading(true);
    try {
      // Yield so the loading state can paint (static / GitHub Pages has no /api/generate).
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
      const card = generateLocalCard(
        name.trim(),
        description.trim(),
        styleChaos
      );
      onCard(card);
    } catch {
      onError("Couldn’t forge your card. Try again.");
    } finally {
      onLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      <div className={styles.field}>
        <label htmlFor="legendex-name">Name</label>
        <input
          id="legendex-name"
          name="name"
          autoComplete="nickname"
          maxLength={64}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          required
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="legendex-desc">About you</label>
        <textarea
          id="legendex-desc"
          name="description"
          maxLength={500}
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A short vibe check — hobbies, energy, chaos level…"
        />
      </div>
      <div className={styles.sliderField}>
        <label htmlFor="legendex-tone" className={styles.sliderMainLabel}>
          Card tone
        </label>
        <div className={styles.sliderEnds} aria-hidden>
          <span>Elegant</span>
          <span>Chaotic</span>
        </div>
        <input
          id="legendex-tone"
          type="range"
          min={0}
          max={100}
          step={1}
          value={styleChaos}
          onChange={(e) => setStyleChaos(Number(e.target.value))}
          className={styles.range}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={styleChaos}
          aria-valuetext={`${styleChaos} (${styleChaos < 33 ? "elegant" : styleChaos > 66 ? "chaotic" : "balanced"})`}
        />
      </div>
      <Button type="submit" className={styles.submit} disabled={submitting}>
        <span className="inline-flex items-center justify-center gap-3">
          {submitting ? (
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              className="animate-spin"
              aria-hidden
            >
              <circle
                cx="12"
                cy="12"
                r="9"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                opacity="0.25"
              />
              <path
                d="M21 12a9 9 0 0 0-9-9"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              />
            </svg>
          ) : null}
          <span>{submitting ? "Forging…" : "Forge my card"}</span>
        </span>
      </Button>
    </form>
  );
}
