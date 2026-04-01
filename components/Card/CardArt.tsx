"use client";

import type { CardData } from "@/types/card";
import styles from "./CardArt.module.css";

type Props = {
  card: CardData;
};

export function CardArt({ card }: Props) {
  if (card.art_url) {
    return (
      <div className={styles.wrap}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={card.art_url}
          alt=""
          className={styles.img}
          crossOrigin="anonymous"
        />
      </div>
    );
  }

  return (
    <div className={styles.placeholder} aria-hidden>
      <span className={styles.emoji}>{card.emoji}</span>
      <span className={styles.hint}>Portrait pending</span>
    </div>
  );
}
