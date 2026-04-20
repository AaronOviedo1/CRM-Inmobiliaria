"use client";

import Link from "next/link";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/types";
import { TASK_PRIORITY_LABEL, TASK_PRIORITY_TONE } from "@/lib/labels";
import { StatusPill } from "@/components/common/status-pill";
import { formatDate, formatRelative } from "@/lib/format";
import * as React from "react";
import { toast } from "sonner";

export function TasksTodayWidget({ tasks }: { tasks: Task[] }) {
  const [done, setDone] = React.useState<Record<string, boolean>>({});

  if (tasks.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No tienes tareas para hoy.</p>
    );
  }

  const toggle = (id: string) => {
    setDone((d) => ({ ...d, [id]: !d[id] }));
    toast.success("Tarea actualizada");
    // TODO(backend): mutate Task.status = COMPLETADA | PENDIENTE.
  };

  return (
    <ul className="divide-y divide-border">
      {tasks.map((t) => {
        const completed = done[t.id] || t.status === "COMPLETADA";
        const overdue = t.dueAt && t.dueAt < new Date() && !completed;
        return (
          <li key={t.id} className="flex items-start gap-3 py-3">
            <button
              type="button"
              onClick={() => toggle(t.id)}
              className="mt-0.5 text-muted-foreground hover:text-gold"
              aria-label="Marcar completada"
            >
              {completed ? (
                <CheckCircle2 className="h-5 w-5 text-success" />
              ) : (
                <Circle className="h-5 w-5" />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "text-sm text-foreground",
                  completed && "line-through text-muted-foreground"
                )}
              >
                {t.title}
              </p>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <StatusPill
                  size="sm"
                  tone={TASK_PRIORITY_TONE[t.priority]}
                >
                  {TASK_PRIORITY_LABEL[t.priority]}
                </StatusPill>
                {t.dueAt && (
                  <span className={cn("flex items-center gap-1", overdue && "text-danger")}>
                    <Clock className="h-3 w-3" />
                    {overdue ? `Vencía ${formatRelative(t.dueAt)}` : formatDate(t.dueAt)}
                  </span>
                )}
                {t.relatedLeadId && (
                  <Link
                    href={`/leads/${t.relatedLeadId}`}
                    className="hover:text-gold"
                  >
                    Lead →
                  </Link>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
