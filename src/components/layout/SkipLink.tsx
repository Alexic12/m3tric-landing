import { a11y } from "@/content/landing";

export function SkipLink() {
  return (
    <a
      href="#contenido"
      className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-full bg-m3-green-900 px-5 py-3 font-bold text-white focus:translate-y-0 focus-visible:outline-m3-green-400"
    >
      {a11y.skipLink}
    </a>
  );
}
