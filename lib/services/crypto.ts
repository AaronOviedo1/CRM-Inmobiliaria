/// Cifrado AES-256-GCM para secretos at-rest (tokens de WhatsApp por org).
/// Formato del ciphertext: "v1.<iv_b64>.<tag_b64>.<data_b64>".

import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { env } from "../env";

const ALG = "aes-256-gcm";

function key(): Buffer {
  if (!env.whatsappTokenEncryptionKey) {
    throw new Error("WHATSAPP_TOKEN_ENCRYPTION_KEY not configured");
  }
  const buf = Buffer.from(env.whatsappTokenEncryptionKey, "base64");
  if (buf.length !== 32) {
    throw new Error("WHATSAPP_TOKEN_ENCRYPTION_KEY must be 32 bytes base64");
  }
  return buf;
}

export function encryptSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALG, key(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1.${iv.toString("base64")}.${tag.toString("base64")}.${enc.toString("base64")}`;
}

export function decryptSecret(ct: string): string {
  const [ver, ivB64, tagB64, dataB64] = ct.split(".");
  if (ver !== "v1" || !ivB64 || !tagB64 || !dataB64) {
    throw new Error("Invalid ciphertext format");
  }
  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const data = Buffer.from(dataB64, "base64");
  const decipher = createDecipheriv(ALG, key(), iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(data), decipher.final()]);
  return dec.toString("utf8");
}

/** Enmascara teléfono para logs: +52 1 (662) 123 4567 → +52*****4567 */
export function maskPhone(raw?: string | null): string {
  if (!raw) return "";
  const digits = raw.replace(/\D+/g, "");
  if (digits.length < 6) return "***";
  return `+${digits.slice(0, 2)}*****${digits.slice(-4)}`;
}

/** Enmascara email: juan@example.com → j***@example.com */
export function maskEmail(raw?: string | null): string {
  if (!raw) return "";
  const [u, d] = raw.split("@");
  if (!u || !d) return "***";
  return `${u.charAt(0)}***@${d}`;
}
