"use server";

import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/services/email";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { env } from "@/lib/env";

const RESET_TOKEN_TTL_MS = 1000 * 60 * 60; // 1 hora

export async function forgotPasswordAction(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { ok: true }; // no revelar si el correo existe

  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id, usedAt: null },
  });

  const token = crypto.randomUUID();
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    },
  });

  const resetUrl = `${env.authUrl}/reset-password?token=${token}`;

  await sendEmail({
    to: user.email,
    subject: "Recupera tu contraseña — CRM",
    text: `Hola ${user.name},\n\nRecibimos una solicitud para restablecer tu contraseña.\n\nUsa este enlace (válido 1 hora):\n${resetUrl}\n\nSi no lo solicitaste, ignora este correo.`,
    html: `<p>Hola <b>${user.name}</b>,</p><p>Recibimos una solicitud para restablecer tu contraseña.</p><p><a href="${resetUrl}">Restablecer contraseña</a></p><p><small>El enlace es válido por 1 hora. Si no lo solicitaste, ignora este correo.</small></p>`,
  });

  return { ok: true };
}

export async function resetPasswordAction(token: string, newPassword: string) {
  if (!token || newPassword.length < 8) {
    return { ok: false, error: "INVALID_INPUT" };
  }

  const record = await prisma.passwordResetToken.findUnique({ where: { token } });

  if (!record) return { ok: false, error: "TOKEN_INVALID" };
  if (record.usedAt) return { ok: false, error: "TOKEN_USED" };
  if (record.expiresAt < new Date()) return { ok: false, error: "TOKEN_EXPIRED" };

  const passwordHash = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { token },
      data: { usedAt: new Date() },
    }),
  ]);

  return { ok: true };
}
