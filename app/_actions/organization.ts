"use server";

import { redirect } from "next/navigation";
import { registerOrganization } from "@/lib/services/organization";
import { OrgRegisterSchema } from "@/lib/validators/user";
import { signIn } from "@/lib/auth/config";

export async function registerOrgAction(rawInput: unknown) {
  const input = OrgRegisterSchema.parse(rawInput);

  try {
    const { userId } = await registerOrganization(input);
    await signIn("credentials", {
      email: input.adminEmail,
      password: input.adminPassword,
      redirect: false,
    });
  } catch (err) {
    const msg = (err as Error).message;
    if (msg === "SLUG_TAKEN") return { ok: false, error: "El slug ya está en uso" };
    if (msg === "EMAIL_TAKEN") return { ok: false, error: "El email ya está registrado" };
    throw err;
  }

  redirect("/dashboard");
}
