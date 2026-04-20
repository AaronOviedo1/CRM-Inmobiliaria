"use client";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CONTRACT_KIND_LABEL, CURRENCY_LABEL } from "@/lib/labels";

interface Props {
  properties: Array<{ id: string; code: string; title: string }>;
  owners: Array<{ id: string; firstName: string; lastName: string }>;
  users: Array<{ id: string; name: string }>;
}

export function NuevoContratoForm({ properties, owners, users }: Props) {
  const router = useRouter();
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Alta"
        title="Nuevo contrato"
        description="Captura metadatos. El PDF firmado se adjunta luego del flujo legal externo."
      />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          toast.success("Contrato creado");
          router.push("/contratos");
        }}
        className="mx-auto max-w-3xl space-y-5 rounded-lg border border-border bg-surface p-6"
      >
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Tipo de contrato">
            <Select defaultValue="MANDATO_EXCLUSIVA">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(CONTRACT_KIND_LABEL).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Moneda">
            <Select defaultValue="MXN">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(CURRENCY_LABEL).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field label="Propiedad">
          <Select defaultValue={properties[0]?.id}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {properties.slice(0, 30).map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.code} · {p.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Propietario">
            <Select defaultValue={owners[0]?.id}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {owners.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.firstName} {o.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Agente responsable">
            <Select defaultValue={users[0]?.id}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <Field label="Fecha inicio"><Input type="date" /></Field>
          <Field label="Fecha fin"><Input type="date" /></Field>
          <Field label="Días aviso renovación"><Input type="number" defaultValue={30} /></Field>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <Field label="Precio acordado"><Input type="number" placeholder="0" /></Field>
          <Field label="Comisión %"><Input type="number" defaultValue={5} /></Field>
          <Field label="Depósito (si renta)"><Input type="number" placeholder="0" /></Field>
        </div>

        <Field label="Notas">
          <Textarea rows={3} placeholder="Cláusulas especiales, acuerdos con el propietario, etc." />
        </Field>

        <Field label="URL del PDF firmado (opcional)">
          <Input placeholder="https://drive.google.com/..." />
        </Field>

        <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
          <Button variant="ghost" type="button" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit">Crear contrato</Button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
