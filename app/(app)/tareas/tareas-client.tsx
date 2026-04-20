"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle2, Circle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";
import { StatusPill } from "@/components/common/status-pill";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TASK_PRIORITY_LABEL,
  TASK_PRIORITY_TONE,
  TASK_STATUS_LABEL,
  TASK_STATUS_TONE,
} from "@/lib/labels";
import { formatDate, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";

type Task = {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueAt?: Date | string | null;
  assignedToId?: string | null;
  relatedLeadId?: string | null;
  relatedPropertyId?: string | null;
  assignedTo?: { id: string; name: string } | null;
};

interface Props {
  tasks: Task[];
  currentUserId: string;
  total: number;
}

export function TareasClient({ tasks, currentUserId, total }: Props) {
  const [done, setDone] = React.useState<Record<string, boolean>>({});

  const pending = tasks.filter((t) => t.status !== "COMPLETADA" && !done[t.id]);
  const mine = tasks.filter((t) => t.assignedToId === currentUserId);
  const team = tasks.filter((t) => t.assignedToId !== currentUserId);
  const overdue = tasks.filter(
    (t) =>
      t.status !== "COMPLETADA" &&
      !done[t.id] &&
      t.dueAt &&
      new Date(t.dueAt) < new Date()
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`${pending.length} pendientes`}
        title="Tareas"
        description="Tus pendientes y los del equipo."
        actions={
          <Button>
            <Plus className="h-4 w-4" /> Nueva tarea
          </Button>
        }
      />
      <Tabs defaultValue="mine">
        <TabsList>
          <TabsTrigger value="mine">Mis tareas ({mine.length})</TabsTrigger>
          <TabsTrigger value="team">Equipo ({team.length})</TabsTrigger>
          <TabsTrigger value="overdue">
            Vencidas{" "}
            <span className="ml-1 rounded bg-danger/20 px-1 text-[10px] text-danger">
              {overdue.length}
            </span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="mine">
          <TaskList tasks={mine} done={done} toggle={(id) => setDone((d) => ({ ...d, [id]: !d[id] }))} />
        </TabsContent>
        <TabsContent value="team">
          <TaskList tasks={team} done={done} toggle={(id) => setDone((d) => ({ ...d, [id]: !d[id] }))} />
        </TabsContent>
        <TabsContent value="overdue">
          <TaskList tasks={overdue} done={done} toggle={(id) => setDone((d) => ({ ...d, [id]: !d[id] }))} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TaskList({
  tasks,
  done,
  toggle,
}: {
  tasks: Task[];
  done: Record<string, boolean>;
  toggle: (id: string) => void;
}) {
  if (tasks.length === 0)
    return <p className="py-4 text-sm text-muted-foreground">Sin tareas.</p>;
  return (
    <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
      {tasks.map((t) => {
        const completed = done[t.id] || t.status === "COMPLETADA";
        const dueAt = t.dueAt ? new Date(t.dueAt) : null;
        const isOverdue = dueAt && dueAt < new Date() && !completed;
        return (
          <li key={t.id} className="flex items-start gap-3 p-4">
            <button
              type="button"
              onClick={() => toggle(t.id)}
              className="mt-0.5 text-muted-foreground hover:text-gold"
              aria-label="Completar"
            >
              {completed ? (
                <CheckCircle2 className="h-5 w-5 text-success" />
              ) : (
                <Circle className="h-5 w-5" />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <p className={cn("text-sm font-medium", completed && "line-through text-muted-foreground")}>
                {t.title}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <StatusPill size="sm" tone={TASK_PRIORITY_TONE[t.priority as keyof typeof TASK_PRIORITY_TONE]}>
                  {TASK_PRIORITY_LABEL[t.priority as keyof typeof TASK_PRIORITY_LABEL]}
                </StatusPill>
                <StatusPill size="sm" tone={TASK_STATUS_TONE[t.status as keyof typeof TASK_STATUS_TONE]}>
                  {TASK_STATUS_LABEL[t.status as keyof typeof TASK_STATUS_LABEL]}
                </StatusPill>
                {t.assignedTo && <span>Asignada a {t.assignedTo.name.split(" ")[0]}</span>}
                {dueAt && (
                  <span className={isOverdue ? "text-danger" : undefined}>
                    {isOverdue ? "Vencía " : "Vence "}
                    {formatDate(dueAt)} · {formatRelative(dueAt)}
                  </span>
                )}
                {t.relatedLeadId && (
                  <Link href={`/leads/${t.relatedLeadId}`} className="hover:text-gold">
                    Lead →
                  </Link>
                )}
                {t.relatedPropertyId && (
                  <Link href={`/propiedades/${t.relatedPropertyId}`} className="hover:text-gold">
                    Propiedad →
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
