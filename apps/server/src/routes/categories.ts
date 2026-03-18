import { FastifyInstance } from "fastify";
import { prisma } from "@focusflow/db";

export async function categoriesRoutes(fastify: FastifyInstance) {
  // Middleware auth
  fastify.addHook("preHandler", async (request, reply) => {
    const session = await request.server.auth.api.getSession({
      headers: request.headers as any,
    });
    if (!session?.user) {
      return reply.status(401).send({ error: "Non autorizzato" });
    }
    request.currentUser = session.user;
  });

  // GET /categories — lista categorie dell'utente
  fastify.get("/", async (request, reply) => {
    const userId = request.currentUser.id;

    const categories = await prisma.category.findMany({
      where: { userId },
      include: {
        _count: { select: { tasks: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return reply.send(categories);
  });

  // POST /categories — crea nuova categoria
  fastify.post<{
    Body: { name: string; color?: string; icon?: string };
  }>("/", async (request, reply) => {
    const userId = request.currentUser.id;
    const { name, color, icon } = request.body;

    if (!name || name.trim() === "") {
      return reply.status(400).send({ error: "Il nome è obbligatorio" });
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        color: color ?? "#6366f1",
        icon: icon ?? "folder",
        userId,
      },
    });

    return reply.status(201).send(category);
  });

  // PUT /categories/:id — aggiorna categoria
  fastify.put<{
    Params: { id: string };
    Body: { name?: string; color?: string; icon?: string };
  }>("/:id", async (request, reply) => {
    const userId = request.currentUser.id;
    const { id } = request.params;
    const { name, color, icon } = request.body;

    const existing = await prisma.category.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return reply.status(404).send({ error: "Categoria non trovata" });
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(color && { color }),
        ...(icon && { icon }),
      },
    });

    return reply.send(updated);
  });

  // DELETE /categories/:id — elimina categoria
  fastify.delete<{
    Params: { id: string };
  }>("/:id", async (request, reply) => {
    const userId = request.currentUser.id;
    const { id } = request.params;

    const existing = await prisma.category.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return reply.status(404).send({ error: "Categoria non trovata" });
    }

    await prisma.category.delete({ where: { id } });

    return reply.status(204).send();
  });
}