import type { AnchorHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary-on-dark" | "primary-on-light" | "ghost-on-dark";

interface ButtonProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "children"> {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: "md" | "lg";
  /** Decorative trailing icon; hidden from assistive technology. */
  icon?: ReactNode;
}

const VARIANTS: Record<ButtonVariant, string> = {
  "primary-on-dark": "bg-m3-green-200 text-m3-green-900 hover:bg-white",
  "primary-on-light": "bg-m3-green-900 text-white hover:bg-m3-green-700",
  "ghost-on-dark": "border border-m3-green-200/60 text-white hover:bg-white/10",
};

const SIZES = {
  md: "min-h-11 px-5 text-[0.9375rem]",
  lg: "min-h-12 px-7 text-base",
} as const;

export function Button({
  href,
  children,
  variant = "primary-on-light",
  size = "md",
  icon,
  className = "",
  ...rest
}: ButtonProps) {
  const classes = [
    "inline-flex items-center justify-center gap-2 rounded-full font-bold tracking-wide",
    "transition-colors duration-200",
    VARIANTS[variant],
    SIZES[size],
    className,
  ].join(" ");
  return (
    <a
      href={href}
      className={classes}
      {...rest}
    >
      {children}
      {icon ? <span aria-hidden="true" className="inline-flex">{icon}</span> : null}
    </a>
  );
}
