import { FastifyInstance } from "fastify";
import { prisma } from "@focusflow/db";

export async function tagsRoutes(fastify: FastifyInstance) {
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

  // GET /tags — lista tag dell'utente
  fastify.get("/", async (request, reply) => {
    const userId = request.currentUser.id;

    const tags = await prisma.tag.findMany({
      where: { userId },
      include: {
        _count: { select: { taskTags: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return reply.send(tags);
  });

  // POST /tags — crea nuovo tag
  fastify.post<{
    Body: { name: string; color?: string };
  }>("/", async (request, reply) => {
    const userId = request.currentUser.id;
    const { name, color } = request.body;

    if (!name || name.trim() === "") {
      return reply.status(400).send({ error: "Il nome è obbligatorio" });
    }

    const tag = await prisma.tag.create({
      data: {
        name: name.trim(),
        color: color ?? "#8b5cf6",
        userId,
      },
    });

    return reply.status(201).send(tag);
  });

  // PUT /tags/:id — aggiorna tag
  fastify.put<{
    Params: { id: string };
    Body: { name?: string; color?: string };
  }>("/:id", async (request, reply) => {
    const userId = request.currentUser.id;
    const { id } = request.params;
    const { name, color } = request.body;

    const existing = await prisma.tag.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return reply.status(404).send({ error: "Tag non trovato" });
    }

    const updated = await prisma.tag.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(color && { color }),
      },
    });

    return reply.send(updated);
  });

  // DELETE /tags/:id — elimina tag
  fastify.delete<{
    Params: { id: string };
  }>("/:id", async (request, reply) => {
    const userId = request.currentUser.id;
    const { id } = request.params;

    const existing = await prisma.tag.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return reply.status(404).send({ error: "Tag non trovato" });
    }

    await prisma.tag.delete({ where: { id } });

    return reply.status(204).send();
  });
}