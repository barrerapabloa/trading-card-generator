import styles from "./LoadingCard.module.css";

export function LoadingCard() {
  return (
    <div className={styles.root} aria-hidden>
      <div className={styles.shimmer} />
      <div className={styles.bar} />
      <div className={styles.barShort} />
      <div className={styles.art} />
      <div className={styles.bar} />
      <div className={styles.stats}>
        <div className={styles.stat} />
        <div className={styles.stat} />
        <div className={styles.stat} />
      </div>
    </div>
  );
}
