import { z } from "zod";
import { UserRole, PropertyCategory } from "../enums";
import { email, phoneMx } from "./common";

const ev = <T extends object>(e: T) => Object.values(e) as [string, ...string[]];

export const UserCreateSchema = z.object({
  email,
  name: z.string().min(1).max(120),
  phone: phoneMx.optional(),
  password: z.string().min(8).max(200),
  role: z.enum(ev(UserRole)).default("AGENT"),
  commissionDefaultPct: z.coerce.number().min(0).max(100).default(50),
  specialties: z.array(z.enum(ev(PropertyCategory))).max(20).default([]),
  workingZones: z.array(z.string().max(80)).max(30).default([]),
});

export const UserUpdateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  phone: phoneMx.optional(),
  role: z.enum(ev(UserRole)).optional(),
  isActive: z.boolean().optional(),
  commissionDefaultPct: z.coerce.number().min(0).max(100).optional(),
  specialties: z.array(z.enum(ev(PropertyCategory))).max(20).optional(),
  workingZones: z.array(z.string().max(80)).max(30).optional(),
});

export const UserPasswordChangeSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(200),
});

export const OrgRegisterSchema = z.object({
  orgName: z.string().min(2).max(120),
  orgSlug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "slug inválido"),
  adminEmail: email,
  adminName: z.string().min(2).max(120),
  adminPassword: z.string().min(8).max(200),
});

export const LoginSchema = z.object({
  email,
  password: z.string().min(1),
});
