"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  type MouseEvent,
} from "react";
import VanillaTilt from "vanilla-tilt";
import type { HTMLVanillaTiltElement } from "vanilla-tilt";
import type { CardData } from "@/types/card";
import { RARITY_LABEL } from "@/lib/rarity";
import { CardArt } from "./CardArt";
import styles from "./Card.module.css";

type Props = {
  card: CardData;
};

function CardInner({ card }: Props, ref: React.ForwardedRef<HTMLDivElement>) {
  const localRef = useRef<HTMLDivElement | null>(null);

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      localRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref]
  );

  useEffect(() => {
    const el = localRef.current;
    if (!el) return;
    VanillaTilt.init(el, {
      max: 4,
      speed: 650,
      glare: false,
      perspective: 800,
      scale: 1.005,
      gyroscope: false,
    });
    return () => {
      (el as unknown as HTMLVanillaTiltElement).vanillaTilt?.destroy();
    };
  }, [card.id]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const root = e.currentTarget;
    const rect = root.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    root.style.setProperty("--mouse-x", `${x}%`);
    root.style.setProperty("--mouse-y", `${y}%`);
    root.style.setProperty("--glare-opacity", `${(Math.abs(50 - x) / 50) * 0.5}`);
  };

  const handleMouseLeave = (e: MouseEvent<HTMLDivElement>) => {
    const root = e.currentTarget;
    root.style.setProperty("--mouse-x", "50%");
    root.style.setProperty("--mouse-y", "50%");
    root.style.setProperty("--glare-opacity", "0");
  };

  return (
    <div
      ref={setRefs}
      className={`${styles.shell} ${styles.captureRoot}`}
      data-rarity={card.rarity}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.shine} aria-hidden />
      <div className={styles.glare} aria-hidden />
      <div className={styles.card}>
        <header className={styles.header}>
          <div className={styles.titleBlock}>
            <div className={styles.nickname}>{card.nickname}</div>
            <div className={styles.typeLine}>{card.type}</div>
            <span className={styles.rarityPill}>{RARITY_LABEL[card.rarity]}</span>
          </div>
          <div className={styles.hpBlock}>
            <div className={styles.hpLabel}>HP</div>
            <div className={styles.hpValue}>{card.hp}</div>
          </div>
        </header>
        <div className={styles.artZone}>
          <CardArt card={card} />
        </div>
        <section className={styles.ability}>
          <div className={styles.abilityName}>{card.ability_name}</div>
          <p className={styles.abilityDesc}>{card.ability_desc}</p>
        </section>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <div className={styles.statLabel}>Power</div>
            <div className={styles.statValue}>{card.power}</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statLabel}>Vibe</div>
            <div className={styles.statValue}>{card.vibe}</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statLabel}>Chaos</div>
            <div className={styles.statValue}>{card.chaos}</div>
          </div>
        </div>
        <footer className={styles.footer}>
          <p className={styles.flavor}>{card.flavor_text}</p>
          <div className={styles.emojiRow}>{card.emoji}</div>
        </footer>
      </div>
    </div>
  );
}

export const Card = forwardRef<HTMLDivElement, Props>(CardInner);
Card.displayName = "Card";
