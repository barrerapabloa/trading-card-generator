"use client";

import { useState, type RefObject } from "react";
import html2canvas from "html2canvas";
import { Button } from "./Button";

type Props = {
  cardRef: RefObject<HTMLDivElement | null>;
  filename: string;
};

export function DownloadButton({ cardRef, filename }: Props) {
  const [busy, setBusy] = useState(false);

  const handleDownload = async () => {
    const el = cardRef.current;
    if (!el || busy) return;

    setBusy(true);
    const prevTransform = el.style.transform;
    const prevX = el.style.getPropertyValue("--mouse-x");
    const prevY = el.style.getPropertyValue("--mouse-y");
    const prevGlare = el.style.getPropertyValue("--glare-opacity");

    try {
      el.style.transform = "none";
      el.style.setProperty("--mouse-x", "50%");
      el.style.setProperty("--mouse-y", "50%");
      el.style.setProperty("--glare-opacity", "0");

      const canvas = await html2canvas(el, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });

      el.style.transform = prevTransform;
      el.style.setProperty("--mouse-x", prevX || "50%");
      el.style.setProperty("--mouse-y", prevY || "50%");
      el.style.setProperty("--glare-opacity", prevGlare || "0");

      const link = document.createElement("a");
      link.download = `${filename.replace(/[^a-z0-9-_]+/gi, "-")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error(e);
      el.style.transform = prevTransform;
      el.style.setProperty("--mouse-x", prevX || "50%");
      el.style.setProperty("--mouse-y", prevY || "50%");
      el.style.setProperty("--glare-opacity", prevGlare || "0");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleDownload}
      disabled={busy}
      className="border border-orange-400/50 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 px-8 py-3.5 text-[0.7rem] font-bold tracking-[0.18em] text-zinc-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] hover:border-orange-300/60 hover:from-orange-400 hover:via-amber-400 hover:to-orange-300 focus-visible:ring-orange-400/40"
    >
      {busy ? "Preparing…" : "Download PNG"}
    </Button>
  );
}
