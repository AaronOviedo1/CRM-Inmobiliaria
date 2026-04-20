import { redirect } from "next/navigation";

export default async function ContactConversationPage({
  params,
}: {
  params: Promise<{ contactId: string }>;
}) {
  // TODO(backend): usar contactId para pre-seleccionar conversación en el inbox.
  await params;
  redirect("/comunicacion");
}
