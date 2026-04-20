import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  Download,
  FileSignature,
  RefreshCcw,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";
import { StatusPill } from "@/components/common/status-pill";
import {
  CONTRACT_KIND_LABEL,
  CONTRACT_STATUS_LABEL,
  CONTRACT_STATUS_TONE,
} from "@/lib/labels";
import { daysUntil, formatDate, formatMoney } from "@/lib/format";
import { requireTenantContext } from "@/lib/auth/session";
import { getContractById } from "@/lib/repos/entities";

interface Props { params: Promise<{ id: string }>; }

const toN = (v: any) => v === null || v === undefined ? 0 : typeof v === "object" && "toNumber" in v ? v.toNumber() : Number(v);

export default async function ContractDetailPage({ params }: Props) {
  const { id } = await params;
  const ctx = await requireTenantContext();
  const c = await getContractById(ctx, id);
  if (!c) notFound();
  const days = daysUntil(c.endDate ?? new Date()) ?? 0;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="w-fit">
        <Link href="/contratos"><ArrowLeft className="h-4 w-4" /> Todos los contratos</Link>
      </Button>

      <PageHeader
        eyebrow={CONTRACT_KIND_LABEL[c.contractKind as keyof typeof CONTRACT_KIND_LABEL]}
        title={(c as any).property?.title ?? "Contrato"}
        description={`Vigente del ${formatDate(c.startDate)} al ${c.endDate ? formatDate(c.endDate) : "—"}`}
        actions={
          <>
            <Button variant="outline">
              <UploadCloud className="h-4 w-4" /> Subir PDF firmado
            </Button>
            <Button variant="outline">
              <RefreshCcw className="h-4 w-4" /> Renovar
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Estado">
          <StatusPill tone={CONTRACT_STATUS_TONE[c.status as keyof typeof CONTRACT_STATUS_TONE]}>
            {CONTRACT_STATUS_LABEL[c.status as keyof typeof CONTRACT_STATUS_LABEL]}
          </StatusPill>
        </Stat>
        <Stat label="Monto acordado">{formatMoney(toN(c.agreedPrice))}</Stat>
        <Stat label="Comisión">{toN(c.commissionPct)}%</Stat>
        <Stat label="Días restantes" accent={days < 15 ? "danger" : days < 60 ? "warning" : "default"}>
          {days} días
        </Stat>
      </div>

      <section className="rounded-lg border border-border bg-surface p-6">
        <h3 className="font-serif text-xl">Línea de tiempo</h3>
        <ol className="mt-4 relative space-y-4 border-l border-border pl-4 text-sm">
          <Milestone icon={<FileSignature className="h-3 w-3" />} title="Borrador creado" date={c.createdAt} />
          <Milestone icon={<Calendar className="h-3 w-3" />} title="Vigente desde" date={c.startDate} />
          <Milestone icon={<Calendar className="h-3 w-3" />} title={days < 60 ? "Próximo a vencer" : "Vence"} date={c.endDate ?? undefined} />
          <Milestone icon={<RefreshCcw className="h-3 w-3" />} title="Renovación automática sugerida" />
        </ol>
      </section>

      <section className="rounded-lg border border-border bg-surface p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-xl">Documento firmado</h3>
          {c.externalDocumentUrl && (
            <Button variant="ghost" size="sm" asChild>
              <a href={c.externalDocumentUrl} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4" /> Descargar
              </a>
            </Button>
          )}
        </div>
        {c.externalDocumentUrl ? (
          <p className="mt-2 text-sm text-muted-foreground">
            PDF externo enlazado. Última actualización {formatDate(c.updatedAt)}.
          </p>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            Aún no se ha subido el PDF del contrato firmado.
          </p>
        )}
      </section>

      {c.notes && (
        <section className="rounded-lg border border-border bg-surface p-6">
          <h3 className="font-serif text-xl">Notas</h3>
          <p className="mt-2 text-sm text-muted-foreground">{c.notes}</p>
        </section>
      )}
    </div>
  );
}

function Stat({
  label,
  children,
  accent = "default",
}: {
  label: string;
  children: React.ReactNode;
  accent?: "default" | "warning" | "danger";
}) {
  const toneClass = {
    default: "text-foreground",
    warning: "text-warning",
    danger: "text-danger",
  }[accent];
  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-2 font-serif text-2xl ${toneClass}`}>{children}</p>
    </div>
  );
}

function Milestone({
  icon,
  title,
  date,
}: {
  icon: React.ReactNode;
  title: string;
  date?: Date;
}) {
  return (
    <li className="relative">
      <div className="absolute -left-[21px] top-1 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-bg text-muted-foreground">
        {icon}
      </div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-foreground">{title}</p>
        {date && <time className="text-xs text-muted-foreground">{formatDate(date)}</time>}
        <ChevronRight className="h-3 w-3 hidden" />
      </div>
    </li>
  );
}
