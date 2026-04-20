"use client";

import { Plus, Tag as TagIcon } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { TAG_KIND_LABEL } from "@/lib/labels";

type Tag = {
  id: string;
  name: string;
  color: string;
  kind: string;
};

export function TagsClient({ tags }: { tags: Tag[] }) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Tags"
        description="Etiquetas reutilizables para leads, clientes, propietarios y propiedades."
        actions={<Button><Plus className="h-4 w-4" /> Crear tag</Button>}
      />
      {tags.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No hay tags creados aún.</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {tags.map((t) => (
            <div key={t.id} className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-md"
                style={{ backgroundColor: `${t.color}20`, color: t.color }}
              >
                <TagIcon className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">{t.name}</p>
                <p className="text-xs text-muted-foreground">
                  Aplica a {TAG_KIND_LABEL[t.kind as keyof typeof TAG_KIND_LABEL]}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
