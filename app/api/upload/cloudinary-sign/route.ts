/// Firma upload directo a Cloudinary para el wizard de propiedades.
/// El cliente pide la firma (autenticado), sube los archivos al endpoint de
/// Cloudinary, y después manda las secure_url al POST /api/properties.

import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import {
  defaultPropertyFolder,
  signUpload,
} from "@/lib/cloudinary";
import { isCloudinaryConfigured } from "@/lib/env";

export async function POST() {
  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      { error: "Cloudinary no está configurado en el servidor." },
      { status: 503 },
    );
  }
  const user = await requireSession();
  const folder = defaultPropertyFolder(user.organizationId);
  try {
    const signed = signUpload({ folder });
    return NextResponse.json(signed);
  } catch (err) {
    console.error("cloudinary-sign error", err);
    return NextResponse.json(
      { error: "No se pudo firmar el upload" },
      { status: 500 },
    );
  }
}
