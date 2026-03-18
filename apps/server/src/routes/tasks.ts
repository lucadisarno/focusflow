import type { FastifyInstance } from "fastify";
import { prisma } from "@focusflow/db";

export async function taskRoutes(app: FastifyInstance) {
  // Middleware: tutte le route qui sotto richiedono autenticazione
  app.addHook("preHandler", async (request, reply) => {
    const session = await request.server.auth.api.getSession({
      headers: request.headers as any,
    });

    if (!session?.user) {
      return reply.status(401).send({ error: "Non autorizzato" });
    }

    // Rendiamo l'utente disponibile nelle route
    request.currentUser = session.user;
  });

  // ─── GET /api/tasks ───────────────────────────────────────
  app.get("/", async (request, reply) => {
    const tasks = await prisma.task.findMany({
      where: { userId: request.currentUser.id },
      orderBy: { createdAt: "desc" },
    });
    return reply.send(tasks);
  });

  // ─── POST /api/tasks ──────────────────────────────────────
  app.post<{
    Body: { title: string; description?: string };
  }>("/", async (request, reply) => {
    const { title, description } = request.body;

    if (!title || title.trim() === "") {
      return reply.status(400).send({ error: "Il titolo è obbligatorio" });
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim(),
        userId: request.currentUser.id,
      },
    });

    return reply.status(201).send(task);
  });

  // ─── PATCH /api/tasks/:id ─────────────────────────────────
  app.patch<{
    Params: { id: string };
    Body: { title?: string; description?: string; completed?: boolean };
  }>("/:id", async (request, reply) => {
    const { id } = request.params;
    const { title, description, completed } = request.body;

    // Verifica che il task appartenga all'utente
    const existing = await prisma.task.findFirst({
      where: { id, userId: request.currentUser.id },
    });

    if (!existing) {
      return reply.status(404).send({ error: "Task non trovato" });
    }

    const updated = await prisma.task.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        ...(completed !== undefined && { completed }),
      },
    });

    return reply.send(updated);
  });

// ─── DELETE /api/tasks/:id ────────────────────────────────
app.delete<{
  Params: { id: string };
}>("/:id", async (request, reply) => {
  const { id } = request.params;

  console.log("DELETE request for id:", id);
  console.log("currentUser:", request.currentUser?.id);

  const existing = await prisma.task.findFirst({
    where: { id, userId: request.currentUser.id },
  });

  console.log("existing task:", existing);

  if (!existing) {
    return reply.status(404).send({ error: "Task non trovato" });
  }

  await prisma.task.delete({ where: { id } });

  return reply.status(204).send();
});
}
