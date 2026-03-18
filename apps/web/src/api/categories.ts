const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  _count?: { tasks: number };
}

export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${API_URL}/api/categories`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Errore nel caricamento categorie");
  return res.json();
}

export async function createCategory(data: {
  name: string;
  color: string;
  icon: string;
}): Promise<Category> {
  const res = await fetch(`${API_URL}/api/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Errore nella creazione categoria");
  return res.json();
}

export async function updateCategory(
  id: string,
  data: { name?: string; color?: string; icon?: string }
): Promise<Category> {
  const res = await fetch(`${API_URL}/api/categories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Errore nell'aggiornamento categoria");
  return res.json();
}

export async function deleteCategory(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/categories/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Errore nell'eliminazione categoria");
}