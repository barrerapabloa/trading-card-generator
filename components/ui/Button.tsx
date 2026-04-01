import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export function Button({
  className = "",
  children,
  type = "button",
  ...rest
}: Props) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-none border border-white/25 bg-white/[0.08] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-none transition hover:border-white/40 hover:bg-white/[0.12] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 disabled:pointer-events-none disabled:opacity-50 ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
