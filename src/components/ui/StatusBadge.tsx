import { statusLabels, type Status } from "@/content/landing";

const CLASSES: Record<Status, string> = {
  available: "bg-m3-green-900 text-white",
  evolving: "border border-dashed border-m3-green-700 bg-transparent text-m3-green-700",
};

/** Status is conveyed by text and shape (solid vs dashed outline), never by color alone. */
export function StatusBadge({ status, className = "" }: { status: Status; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tracking-[0.08em] ${CLASSES[status]} ${className}`}
    >
      <span
        aria-hidden="true"
        className={`size-2 rounded-full ${status === "available" ? "bg-m3-green-400" : "border border-current"}`}
      />
      {statusLabels[status]}
    </span>
  );
}
