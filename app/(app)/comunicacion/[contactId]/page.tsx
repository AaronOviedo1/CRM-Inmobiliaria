import { requireTenantContext } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { ComunicacionClient } from "../comunicacion-client";

export default async function ContactConversationPage({
  params,
}: {
  params: Promise<{ contactId: string }>;
}) {
  const { contactId } = await params;
  const ctx = await requireTenantContext();

  const leads = await prisma.lead.findMany({
    where: { organizationId: ctx.organizationId, deletedAt: null },
    orderBy: { updatedAt: "desc" },
    take: 30,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      whatsapp: true,
      updatedAt: true,
    },
  });

  const normalized = leads.map((l: any) => ({
    ...l,
    whatsapp: l.whatsapp ?? "+52 662 000 0000",
    interactions: [],
  }));

  return <ComunicacionClient leads={normalized as any} initialContactId={contactId} />;
}
