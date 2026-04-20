/// UploadThing router — define qué archivos acepta cada endpoint.
///
/// El frontend usa los hooks de @uploadthing/react para subir directo al edge.
/// Nuestro servidor recibe la URL del archivo subido y la almacena en la DB.

import { createUploadthing, type FileRouter } from "uploadthing/next";
import { requireSession } from "../auth/session";

const f = createUploadthing();

export const ourFileRouter = {
  propertyImage: f({ image: { maxFileSize: "8MB", maxFileCount: 20 } })
    .middleware(async () => {
      const u = await requireSession();
      return { userId: u.id, organizationId: u.organizationId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.url };
    }),

  propertyDocument: f({ pdf: { maxFileSize: "16MB", maxFileCount: 5 } })
    .middleware(async () => {
      const u = await requireSession();
      return { userId: u.id, organizationId: u.organizationId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.url };
    }),

  maintenancePhoto: f({ image: { maxFileSize: "8MB", maxFileCount: 10 } })
    .middleware(async () => {
      const u = await requireSession();
      return { userId: u.id, organizationId: u.organizationId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.url };
    }),

  /** Comprobante de pago subido por el inquilino desde su portal (sin sesión de staff). */
  paymentProof: f({ image: { maxFileSize: "4MB", maxFileCount: 3 }, pdf: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      return {};
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
