import { cn } from "@/lib/utils";
import { TONE_CLASSES, type ColorTone } from "@/lib/labels";

interface StatusPillProps {
  tone: ColorTone;
  children: React.ReactNode;
  size?: "sm" | "md";
  className?: string;
}

export function StatusPill({
  tone,
  children,
  size = "md",
  className,
}: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap",
        size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2.5 py-0.5",
        TONE_CLASSES[tone],
        className
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          tone === "gold" && "bg-gold",
          tone === "success" && "bg-success",
          tone === "warning" && "bg-warning",
          tone === "danger" && "bg-danger",
          tone === "info" && "bg-info",
          tone === "neutral" && "bg-muted-foreground"
        )}
      />
      {children}
    </span>
  );
}
