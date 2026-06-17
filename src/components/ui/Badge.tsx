import { cn } from "@/lib/utils";

export function Badge({
  children,
  className,
  tone = "leaf",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "leaf" | "terracotta" | "neutral" | "amber" | "red";
}) {
  const tones = {
    leaf: "bg-leaf-100 text-leaf-700",
    terracotta: "bg-terracotta-100 text-terracotta-700",
    neutral: "bg-sand text-ink",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
