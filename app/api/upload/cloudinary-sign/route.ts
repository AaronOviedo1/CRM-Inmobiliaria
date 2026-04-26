/// Firma upload directo a Cloudinary.
/// - Imágenes del wizard de propiedades (folder: crm/<org>/propiedades).
/// - Documentos de propiedad (folder: crm/<org>/propiedades/documentos).
///
/// El cliente pide la firma (autenticado), sube los archivos al endpoint de
/// Cloudinary, y después manda las secure_url al backend.

import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import {
  defaultPropertyFolder,
  signUpload,
} from "@/lib/cloudinary";
import { isCloudinaryConfigured } from "@/lib/env";

export async function POST(req: Request) {
  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      { error: "Cloudinary no está configurado en el servidor." },
      { status: 503 },
    );
  }
  const user = await requireSession();

  let kind: "image" | "document" = "image";
  try {
    const body = await req.json();
    if (body?.kind === "document") kind = "document";
  } catch {
    // body vacío → imagen (comportamiento por defecto)
  }

  const baseFolder = defaultPropertyFolder(user.organizationId);
  const folder =
    kind === "document" ? `${baseFolder}/documentos` : baseFolder;

  try {
    const signed = signUpload({ folder });
    return NextResponse.json({ ...signed, kind });
  } catch (err) {
    console.error("cloudinary-sign error", err);
    return NextResponse.json(
      { error: "No se pudo firmar el upload" },
      { status: 500 },
    );
  }
}
