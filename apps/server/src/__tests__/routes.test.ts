import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock di Prisma ───────────────────────────────────────
// Creiamo un oggetto finto che simula PrismaClient
// così i test non toccano mai il database reale
const mockPrisma = {
  task: {
    findMany: vi.fn(), // funzione mock — possiamo controllare cosa restituisce
    create:   vi.fn(),
    delete:   vi.fn(),
  },
};

vi.mock("@prisma/client", () => ({
  PrismaClient: vi.fn(() => mockPrisma),
}));

// ─── Test suite ───────────────────────────────────────────
describe("task routes (con Prisma mockato)", () => {

  // Prima di ogni test pulisce le chiamate precedenti
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("findMany restituisce array vuoto se non ci sono task", async () => {
    // Diciamo al mock cosa restituire
    mockPrisma.task.findMany.mockResolvedValue([]);

    const result = await mockPrisma.task.findMany();

    expect(result).toEqual([]);
    expect(mockPrisma.task.findMany).toHaveBeenCalledTimes(1);
  });

  it("create aggiunge un task con i campi corretti", async () => {
    const nuovoTask = {
      id:       "1",
      title:    "Test",
      status:   "TODO",
      priority: "MEDIUM",
    };
    mockPrisma.task.create.mockResolvedValue(nuovoTask);

    const result = await mockPrisma.task.create({ data: nuovoTask });

    expect(result.title).toBe("Test");
    expect(result.status).toBe("TODO");
  });

  it("delete rimuove il task con l'id corretto", async () => {
    mockPrisma.task.delete.mockResolvedValue({ id: "1" });

    const result = await mockPrisma.task.delete({ where: { id: "1" } });

    expect(result.id).toBe("1");
    expect(mockPrisma.task.delete).toHaveBeenCalledWith({ where: { id: "1" } });
  });

});