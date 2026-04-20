import type { Interaction } from "@/lib/types";
import { INTERACTION_KIND_LABEL } from "@/lib/labels";
import { formatRelative } from "@/lib/format";
import {
  MessageSquare,
  Phone,
  Mail,
  Users,
  StickyNote,
  Calendar,
} from "lucide-react";

function iconFor(kind: string) {
  switch (kind) {
    case "WHATSAPP":
      return MessageSquare;
    case "LLAMADA":
      return Phone;
    case "EMAIL":
      return Mail;
    case "REUNION":
    case "VISITA_OFICINA":
    case "VISITA_PROPIEDAD":
      return Users;
    case "NOTA_INTERNA":
      return StickyNote;
    default:
      return Calendar;
  }
}

export function ActivityTimeline({
  interactions,
}: {
  interactions: Interaction[];
}) {
  return (
    <ol className="relative space-y-4 border-l border-border pl-4">
      {interactions.slice(0, 8).map((i) => {
        const Icon = iconFor(i.kind);
        return (
          <li key={i.id} className="relative">
            <div className="absolute -left-[21px] top-1 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-bg text-muted-foreground">
              <Icon className="h-3 w-3" />
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-sm text-foreground">
                <span className="font-medium">
                  {i.createdBy?.name ?? "Sistema"}
                </span>{" "}
                <span className="text-muted-foreground">
                  · {INTERACTION_KIND_LABEL[i.kind]}
                </span>
              </p>
              <time className="text-xs text-muted-foreground whitespace-nowrap">
                {formatRelative(i.occurredAt)}
              </time>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">{i.summary}</p>
          </li>
        );
      })}
    </ol>
  );
}
