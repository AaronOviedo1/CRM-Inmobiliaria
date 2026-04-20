"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
import { LEAD_INTENT_LABEL, LEAD_SOURCE_LABEL, PROPERTY_CATEGORY_LABEL } from "@/lib/labels";
import { HERMOSILLO_ZONES } from "@/lib/mock/fixtures";
import { MOCK_USERS } from "@/lib/mock/factories";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, title: "Datos" },
  { id: 2, title: "Intent e intereses" },
  { id: 3, title: "Presupuesto y zona" },
  { id: 4, title: "Fuente y asignación" },
];

export function LeadForm() {
  const router = useRouter();
  const [step, setStep] = React.useState(1);
  const next = () => setStep((s) => Math.min(STEPS.length, s + 1));
  const prev = () => setStep((s) => Math.max(1, s - 1));

  const finish = () => {
    // TODO(backend): POST /api/leads.
    toast.success("Lead creado");
    router.push("/leads");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <ol className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <li key={s.id} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-medium",
                step > s.id
                  ? "border-gold bg-gold text-black"
                  : step === s.id
                    ? "border-gold bg-gold-faint text-gold"
                    : "border-border bg-elevated text-muted-foreground"
              )}
            >
              {step > s.id ? <Check className="h-3 w-3" /> : s.id}
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn("h-px flex-1", step > s.id ? "bg-gold" : "bg-border")} />
            )}
          </li>
        ))}
      </ol>

      <div className="rounded-lg border border-border bg-surface p-6 min-h-[360px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
          >
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="font-serif text-xl">Datos básicos</h2>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Nombre"><Input placeholder="Fernanda" /></Field>
                  <Field label="Apellido"><Input placeholder="Corral" /></Field>
                </div>
                <Field label="Correo"><Input type="email" placeholder="fernanda@mail.com" /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Teléfono"><Input placeholder="662 123 4567" /></Field>
                  <Field label="WhatsApp"><Input placeholder="52 662 123 4567" /></Field>
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-4">
                <h2 className="font-serif text-xl">Intent e intereses</h2>
                <Field label="Qué busca">
                  <Select defaultValue="COMPRA">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(LEAD_INTENT_LABEL).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Tipo de inmueble (principal)">
                  <Select defaultValue="CASA">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(PROPERTY_CATEGORY_LABEL).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Notas iniciales">
                  <Textarea rows={4} placeholder="Lo que te contó al primer contacto…" />
                </Field>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-4">
                <h2 className="font-serif text-xl">Presupuesto y zona</h2>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Presupuesto mínimo (MXN)"><Input type="number" /></Field>
                  <Field label="Presupuesto máximo (MXN)"><Input type="number" /></Field>
                </div>
                <Field label="Zonas de interés (puedes elegir varias)">
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Elige una zona" /></SelectTrigger>
                    <SelectContent>
                      {HERMOSILLO_ZONES.map((z) => (
                        <SelectItem key={z.name} value={z.name}>{z.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Recámaras mín."><Input type="number" defaultValue={2} /></Field>
                  <Field label="Baños mín."><Input type="number" defaultValue={1} /></Field>
                  <Field label="Estac. mín."><Input type="number" defaultValue={1} /></Field>
                </div>
              </div>
            )}
            {step === 4 && (
              <div className="space-y-4">
                <h2 className="font-serif text-xl">Fuente y asignación</h2>
                <Field label="Cómo llegó">
                  <Select defaultValue="WHATSAPP">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(LEAD_SOURCE_LABEL).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Asignar a">
                  <Select defaultValue={MOCK_USERS[2]!.id}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MOCK_USERS.filter((u) => u.role !== "ASSISTANT").map((u) => (
                        <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={prev} disabled={step === 1}>
          <ArrowLeft className="h-4 w-4" /> Atrás
        </Button>
        {step < STEPS.length ? (
          <Button onClick={next}>Continuar <ArrowRight className="h-4 w-4" /></Button>
        ) : (
          <Button onClick={finish}>Crear lead <Check className="h-4 w-4" /></Button>
        )}
      </div>
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
