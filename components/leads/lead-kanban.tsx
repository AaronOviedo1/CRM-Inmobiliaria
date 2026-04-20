"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Clock, Phone, User } from "lucide-react";
import type { Lead } from "@/lib/types";
import { LEAD_KANBAN_ORDER } from "@/lib/types";
import {
  LEAD_STATUS_LABEL,
  LEAD_STATUS_TONE,
  LEAD_INTENT_LABEL,
  LEAD_SOURCE_LABEL,
} from "@/lib/labels";
import { TONE_CLASSES } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { formatMoneyCompact, formatRelative } from "@/lib/format";
import { toast } from "sonner";

export function LeadKanban({ leads: initialLeads }: { leads: Lead[] }) {
  const [leads, setLeads] = React.useState(initialLeads);
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const leadId = active.id as string;
    const newStatus = over.id as Lead["status"];
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
    );
    toast.success(`Lead movido a ${LEAD_STATUS_LABEL[newStatus]}`);
    // TODO(backend): PATCH /api/leads/:id { status: newStatus } + AuditLog.
  };

  const activeLead = activeId ? leads.find((l) => l.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={(e) => setActiveId(e.active.id as string)}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="flex h-[calc(100vh-260px)] gap-3 overflow-x-auto snap-x pb-4">
        {LEAD_KANBAN_ORDER.map((status) => {
          const items = leads.filter((l) => l.status === status);
          return (
            <KanbanColumn
              key={status}
              status={status}
              count={items.length}
            >
              {items.map((l) => (
                <LeadCard key={l.id} lead={l} />
              ))}
            </KanbanColumn>
          );
        })}
      </div>
      <DragOverlay>
        {activeLead ? (
          <div className="rotate-3">
            <LeadCardInner lead={activeLead} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function KanbanColumn({
  status,
  count,
  children,
}: {
  status: Lead["status"];
  count: number;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const tone = LEAD_STATUS_TONE[status];

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-lg border bg-surface snap-center",
        isOver ? "border-gold shadow-gold-glow" : "border-border"
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between border-b border-border px-3 py-2.5",
          TONE_CLASSES[tone],
          "bg-opacity-40"
        )}
      >
        <span className="text-xs font-medium uppercase tracking-wider">
          {LEAD_STATUS_LABEL[status]}
        </span>
        <span className="rounded-full bg-bg/60 px-2 py-0.5 text-[10px]">{count}</span>
      </div>
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-2">
        {children}
      </div>
    </div>
  );
}

function LeadCard({ lead }: { lead: Lead }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: lead.id,
  });
  return (
    <motion.div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: isDragging ? 0.3 : 1, y: 0 }}
      className={cn("cursor-grab active:cursor-grabbing", isDragging && "opacity-30")}
    >
      <LeadCardInner lead={lead} />
    </motion.div>
  );
}

function LeadCardInner({ lead }: { lead: Lead }) {
  const overdue =
    lead.nextFollowUpAt &&
    new Date(lead.nextFollowUpAt).getTime() < Date.now();
  return (
    <Link
      href={`/leads/${lead.id}`}
      className="block rounded-md border border-border bg-elevated p-3 transition-colors hover:border-gold/40"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">
            {lead.firstName} {lead.lastName}
          </p>
          <p className="mt-0.5 truncate text-[10px] uppercase tracking-wider text-muted-foreground">
            {LEAD_INTENT_LABEL[lead.intent]} · {LEAD_SOURCE_LABEL[lead.source]}
          </p>
        </div>
        {lead.qualificationScore && (
          <span className="rounded-full border border-gold/30 bg-gold-faint px-1.5 py-0.5 text-[10px] font-semibold text-gold">
            {lead.qualificationScore}
          </span>
        )}
      </div>

      {(lead.desiredZones.length > 0 || lead.budgetMax) && (
        <div className="mt-2 flex flex-wrap items-center gap-1 text-[10px] text-muted-foreground">
          {lead.budgetMax && (
            <span className="rounded bg-muted px-1.5 py-0.5">
              hasta {formatMoneyCompact(lead.budgetMax, lead.currency)}
            </span>
          )}
          {lead.desiredZones.slice(0, 2).map((z) => (
            <span key={z} className="rounded bg-muted px-1.5 py-0.5">
              {z}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-2 text-[10px]">
        <div className="flex items-center gap-1 text-muted-foreground">
          <User className="h-3 w-3" />
          <span className="truncate">{lead.assignedAgent?.name.split(" ")[0]}</span>
        </div>
        {lead.nextFollowUpAt ? (
          <div
            className={cn(
              "flex items-center gap-1",
              overdue ? "text-danger" : "text-muted-foreground"
            )}
          >
            <Clock className="h-3 w-3" />
            <span>
              {overdue ? "Vencido " : ""}
              {formatRelative(lead.nextFollowUpAt)}
            </span>
          </div>
        ) : lead.phone ? (
          <div className="flex items-center gap-1 text-muted-foreground">
            <Phone className="h-3 w-3" />
            <span>{lead.phone}</span>
          </div>
        ) : null}
      </div>
    </Link>
  );
}
