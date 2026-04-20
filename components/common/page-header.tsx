import * as React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  eyebrow?: string;
  serif?: boolean;
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
  serif = true,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between",
        className
      )}
    >
      <div>
        {eyebrow && (
          <p className="mb-1 text-xs uppercase tracking-[0.2em] text-gold">
            {eyebrow}
          </p>
        )}
        <h1
          className={cn(
            "text-3xl font-medium text-foreground",
            serif && "font-serif"
          )}
        >
          {title}
        </h1>
        {description && (
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
