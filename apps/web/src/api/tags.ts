const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export interface Tag {
  id: string;
  name: string;
  color: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  _count?: { taskTags: number };
}

export async function getTags(): Promise<Tag[]> {
  const res = await fetch(`${API_URL}/api/tags`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Errore nel caricamento tag");
  return res.json();
}

export async function createTag(data: {
  name: string;
  color: string;
}): Promise<Tag> {
  const res = await fetch(`${API_URL}/api/tags`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Errore nella creazione tag");
  return res.json();
}

export async function updateTag(
  id: string,
  data: { name?: string; color?: string }
): Promise<Tag> {
  const res = await fetch(`${API_URL}/api/tags/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Errore nell'aggiornamento tag");
  return res.json();
}

export async function deleteTag(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/tags/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Errore nell'eliminazione tag");
}