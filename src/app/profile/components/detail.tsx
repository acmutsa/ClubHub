import type { LucideIcon } from "lucide-react";

export function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string | null;
}) {
  return (
    <div className="flex gap-3">
      <Icon className="text-muted-foreground mt-0.5 size-[18px] shrink-0" aria-hidden />
      <div className="min-w-0">
        <dt className="text-muted-foreground text-xs">{label}</dt>
        <dd className={value ? "font-medium" : "text-muted-foreground font-medium"}>
          {value ?? "Not set"}
        </dd>
      </div>
    </div>
  );
}
