"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FileUp, Loader2, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROPERTY_DOCUMENT_TYPE_LABEL } from "@/lib/labels";
import { PropertyDocumentType } from "@/lib/enums";
import { addDocumentAction } from "@/app/_actions/properties";
import { cn } from "@/lib/utils";

const MAX_DOC_MB = 20;
const ACCEPTED =
  ".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,image/*";

type SignedUploadParams = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
};

async function fetchSignedDocumentUpload(): Promise<SignedUploadParams | null> {
  const res = await fetch("/api/upload/cloudinary-sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind: "document" }),
  });
  if (!res.ok) return null;
  return (await res.json()) as SignedUploadParams;
}

function uploadToCloudinary(
  file: File,
  params: SignedUploadParams,
  onProgress: (pct: number) => void,
): Promise<{ url: string }> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("file", file);
    form.append("api_key", params.apiKey);
    form.append("timestamp", String(params.timestamp));
    form.append("signature", params.signature);
    form.append("folder", params.folder);

    const xhr = new XMLHttpRequest();
    // `auto` deja que Cloudinary decida image/raw según el mime del archivo.
    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${params.cloudName}/auto/upload`,
    );
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const json = JSON.parse(xhr.responseText);
          resolve({ url: json.secure_url });
        } catch (e) {
          reject(e);
        }
      } else {
        reject(new Error(`Cloudinary ${xhr.status}: ${xhr.responseText}`));
      }
    };
    xhr.onerror = () => reject(new Error("Error de red al subir a Cloudinary"));
    xhr.send(form);
  });
}

export function UploadDocumentDialog({
  propertyId,
  size = "default",
}: {
  propertyId: string;
  size?: "default" | "sm";
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [label, setLabel] = React.useState("");
  const [type, setType] = React.useState<string>(PropertyDocumentType.OTRO);
  const [isPublicToOwnerPortal, setIsPublic] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const reset = () => {
    setFile(null);
    setLabel("");
    setType(PropertyDocumentType.OTRO);
    setIsPublic(false);
    setProgress(0);
    setUploading(false);
  };

  const handleFileChosen = (f: File | null) => {
    if (!f) return;
    if (f.size > MAX_DOC_MB * 1024 * 1024) {
      toast.error(`El archivo supera ${MAX_DOC_MB} MB`);
      return;
    }
    setFile(f);
    if (!label) {
      // Usa el nombre sin extensión como label por defecto.
      const base = f.name.replace(/\.[^.]+$/, "");
      setLabel(base.slice(0, 120));
    }
  };

  const submit = async () => {
    if (!file) {
      toast.error("Selecciona un archivo");
      return;
    }
    if (!label.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    setUploading(true);
    setProgress(0);
    try {
      const signed = await fetchSignedDocumentUpload();
      if (!signed) {
        throw new Error(
          "Cloudinary no está configurado. Agrega CLOUDINARY_* a tu .env.",
        );
      }
      const { url } = await uploadToCloudinary(file, signed, setProgress);
      const res = await addDocumentAction({
        propertyId,
        label: label.trim(),
        url,
        type,
        isPublicToOwnerPortal,
      });
      if (!res?.ok) {
        throw new Error(
          res?.error === "FORBIDDEN"
            ? "No tienes acceso a esta propiedad"
            : "No se pudo registrar el documento",
        );
      }
      toast.success("Documento subido");
      reset();
      setOpen(false);
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No se pudo subir";
      toast.error(msg);
      setUploading(false);
    }
  };

  return (
    <>
      <Button variant="outline" size={size} onClick={() => setOpen(true)}>
        <Upload className="h-4 w-4" /> Subir documento
      </Button>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!uploading) {
            setOpen(v);
            if (!v) reset();
          }
        }}
      >
        <DialogContent>
        <DialogHeader>
          <DialogTitle>Subir documento</DialogTitle>
          <DialogDescription>
            PDF, Word, Excel o imagen. Máximo {MAX_DOC_MB} MB.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Archivo</Label>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED}
              className="hidden"
              onChange={(e) => handleFileChosen(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className={cn(
                "flex w-full items-center gap-3 rounded-md border border-dashed border-border bg-bg p-3 text-left text-sm transition-colors",
                "hover:border-gold/40 hover:text-foreground",
                "disabled:opacity-50",
              )}
            >
              <FileUp className="h-5 w-5 text-gold shrink-0" />
              {file ? (
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <span className="text-muted-foreground">
                  Haz click para seleccionar un archivo
                </span>
              )}
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="p.ej. Escritura pública"
                disabled={uploading}
                maxLength={120}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={type} onValueChange={setType} disabled={uploading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PROPERTY_DOCUMENT_TYPE_LABEL).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <label className="flex items-center justify-between rounded-md border border-border bg-elevated p-3 cursor-pointer">
            <div>
              <p className="text-sm font-medium">Visible al propietario</p>
              <p className="text-xs text-muted-foreground">
                Aparecerá en el portal del propietario.
              </p>
            </div>
            <Switch
              checked={isPublicToOwnerPortal}
              onCheckedChange={setIsPublic}
              disabled={uploading}
            />
          </label>

          {uploading && (
            <div className="space-y-1">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                <div
                  className="h-full bg-gold transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Subiendo… {progress}%
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => {
              setOpen(false);
              reset();
            }}
            disabled={uploading}
          >
            Cancelar
          </Button>
          <Button onClick={submit} disabled={uploading || !file}>
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Subiendo…
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" /> Subir
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
      </Dialog>
    </>
  );
}
