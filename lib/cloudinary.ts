/// Helpers server-side para Cloudinary.
///
/// Usamos upload directo desde el navegador con una firma generada aquí:
/// el cliente pide la firma → sube a Cloudinary → nos manda la secure_url.
/// Así los bytes nunca pasan por Next y no quemamos el API secret.

import { v2 as cloudinary } from "cloudinary";
import { env, isCloudinaryConfigured } from "./env";

let configured = false;
function ensureConfigured() {
  if (configured) return;
  if (!isCloudinaryConfigured()) return;
  cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
    secure: true,
  });
  configured = true;
}

export type SignedUploadParams = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
};

/**
 * Firma parámetros de upload para que el cliente pueda subir directamente a
 * Cloudinary vía `POST https://api.cloudinary.com/v1_1/<cloud>/image/upload`.
 * La firma expira en ~1h (ttl de Cloudinary para timestamps).
 */
export function signUpload(opts: { folder: string }): SignedUploadParams {
  ensureConfigured();
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary no está configurado");
  }
  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder: opts.folder },
    env.cloudinaryApiSecret!,
  );
  return {
    cloudName: env.cloudinaryCloudName!,
    apiKey: env.cloudinaryApiKey!,
    timestamp,
    signature,
    folder: opts.folder,
  };
}

export function defaultPropertyFolder(organizationId: string): string {
  const base = env.cloudinaryUploadFolder || "crm";
  return `${base}/${organizationId}/propiedades`;
}
