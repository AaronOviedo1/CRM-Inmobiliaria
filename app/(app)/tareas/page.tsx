import { requireTenantContext } from "@/lib/auth/session";
import { requireSession } from "@/lib/auth/session";
import { listTasks } from "@/lib/repos/entities";
import { TareasClient } from "./tareas-client";

export default async function TareasPage() {
  const [ctx, session] = await Promise.all([requireTenantContext(), requireSession()]);
  const { rows: tasks, total } = await listTasks(ctx, { pageSize: 100 });
  return <TareasClient tasks={tasks as any} currentUserId={session.id} total={total} />;
}
