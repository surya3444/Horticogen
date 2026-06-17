import { cn } from "@/lib/utils";

export function AdminHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-sand bg-white p-5", className)}>{children}</div>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "terracotta",
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  tone?: "terracotta" | "leaf" | "amber" | "ink";
}) {
  const tones = {
    terracotta: "bg-terracotta-100 text-terracotta-700",
    leaf: "bg-leaf-100 text-leaf-700",
    amber: "bg-amber-100 text-amber-700",
    ink: "bg-sand text-ink",
  };
  return (
    <div className="rounded-2xl border border-sand bg-white p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted">{label}</span>
        <span className={cn("grid h-9 w-9 place-items-center rounded-full", tones[tone])}>
          <Icon size={18} />
        </span>
      </div>
      <p className="mt-3 font-display text-2xl font-bold text-ink">{value}</p>
    </div>
  );
}
