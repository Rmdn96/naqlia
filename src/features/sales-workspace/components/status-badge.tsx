import { cn } from "@/utils/cn";

type StatusBadgeProps = {
  label: string;
  status: string;
};

const statusClasses: Record<string, string> = {
  approved: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700",
  cancelled: "border-slate-500/25 bg-slate-500/10 text-slate-700",
  closed: "border-slate-500/25 bg-slate-500/10 text-slate-700",
  converted: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700",
  draft: "border-amber-500/25 bg-amber-500/10 text-amber-800",
  expired: "border-rose-500/25 bg-rose-500/10 text-rose-700",
  new: "border-sky-500/25 bg-sky-500/10 text-sky-700",
  qualified: "border-violet-500/25 bg-violet-500/10 text-violet-700",
  quoted: "border-blue-500/25 bg-blue-500/10 text-blue-700",
  rejected: "border-rose-500/25 bg-rose-500/10 text-rose-700",
  sent: "border-blue-500/25 bg-blue-500/10 text-blue-700",
  superseded: "border-slate-500/25 bg-slate-500/10 text-slate-700",
};

export function StatusBadge({ label, status }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center rounded-full border px-2.5 text-xs font-bold",
        statusClasses[status] ?? "border-border bg-muted text-muted-foreground",
      )}
    >
      {label}
    </span>
  );
}
