import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LeadDetail } from "@/components/leads/lead-detail";
import { requireTenantContext } from "@/lib/auth/session";
import { getLeadById } from "@/lib/repos/leads";
import { prisma } from "@/lib/prisma";

interface Props { params: Promise<{ id: string }>; }

export default async function LeadDetailPage({ params }: Props) {
  const { id } = await params;
  const ctx = await requireTenantContext();

  const [lead, tasks] = await Promise.all([
    getLeadById(ctx, id),
    prisma.task.findMany({
      where: { organizationId: ctx.organizationId, relatedLeadId: id },
      orderBy: { dueAt: "asc" },
      take: 20,
      include: { assignedTo: { select: { id: true, name: true, avatarUrl: true } } },
    }),
  ]);

  if (!lead) notFound();

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="w-fit">
        <Link href="/leads">
          <ArrowLeft className="h-4 w-4" /> Volver al Kanban
        </Link>
      </Button>
      <LeadDetail
        lead={lead as any}
        interactions={lead.interactions as any}
        matches={lead.matches as any}
        tasks={tasks as any}
      />
    </div>
  );
}
