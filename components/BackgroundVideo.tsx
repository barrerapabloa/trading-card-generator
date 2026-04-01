"use client";

import { useEffect, useRef } from "react";
import Hls from "hls.js";

type Props = {
  src: string;
  className?: string;
};

export function BackgroundVideo({ src, className = "" }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Ensure autoplay works across browsers.
    video.muted = true;
    video.playsInline = true;

    // Non-HLS sources (e.g. mp4) can be played directly everywhere.
    if (!src.endsWith(".m3u8")) {
      video.src = src;
      void video.play().catch(() => {
        // Autoplay can still be blocked; user gesture would be required.
      });
      return;
    }

    // Safari supports HLS natively via <video src="...m3u8">.
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      void video.play().catch(() => {
        // Autoplay can still be blocked; user gesture would be required.
      });
      return;
    }

    // Chrome/Firefox need MSE via hls.js.
    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.attachMedia(video);
      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        hls.loadSource(src);
      });
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        void video.play().catch(() => {
          // Autoplay can still be blocked; user gesture would be required.
        });
      });
      hls.on(Hls.Events.ERROR, (_event, data) => {
        // eslint-disable-next-line no-console
        console.error("HLS error", data);
      });

      return () => {
        hls.destroy();
      };
    }
  }, [src]);

  return (
    <video
      ref={videoRef}
      className={className}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
    />
  );
}

