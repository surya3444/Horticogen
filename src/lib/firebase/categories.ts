import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { db } from "./client";
import type { Category, CategoryNode } from "@/lib/types";
import { slugify } from "@/lib/utils";

const col = () => collection(db, "categories");

export async function listCategories(): Promise<Category[]> {
  const snap = await getDocs(query(col(), orderBy("order", "asc")));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Category, "id">) }));
}

export async function getCategory(id: string): Promise<Category | null> {
  const snap = await getDoc(doc(db, "categories", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<Category, "id">) };
}

export async function getCategoryBySlugPath(
  slugPath: string[]
): Promise<{ category: Category; trail: Category[] } | null> {
  const all = await listCategories();
  const bySlug = (parentId: string | null, slug: string) =>
    all.find((c) => c.parentId === parentId && c.slug === slug);

  let parentId: string | null = null;
  const trail: Category[] = [];
  for (const slug of slugPath) {
    const match = bySlug(parentId, slug);
    if (!match) return null;
    trail.push(match);
    parentId = match.id;
  }
  if (!trail.length) return null;
  return { category: trail[trail.length - 1], trail };
}

export function buildTree(categories: Category[]): CategoryNode[] {
  const map = new Map<string, CategoryNode>();
  categories.forEach((c) => map.set(c.id, { ...c, children: [], slugPath: [] }));

  const roots: CategoryNode[] = [];
  map.forEach((node) => {
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  const assignPaths = (node: CategoryNode, parentPath: string[]) => {
    node.slugPath = [...parentPath, node.slug];
    node.children.sort((a, b) => a.order - b.order);
    node.children.forEach((child) => assignPaths(child, node.slugPath));
  };
  roots.sort((a, b) => a.order - b.order);
  roots.forEach((r) => assignPaths(r, []));
  return roots;
}

// Return ids of a category and all its descendants.
export function descendantIds(categories: Category[], rootId: string): string[] {
  const ids = [rootId];
  const stack = [rootId];
  while (stack.length) {
    const cur = stack.pop()!;
    categories
      .filter((c) => c.parentId === cur)
      .forEach((c) => {
        ids.push(c.id);
        stack.push(c.id);
      });
  }
  return ids;
}

export async function createCategory(
  input: Omit<Category, "id" | "slug" | "ancestors" | "depth" | "createdAt" | "order"> & {
    order?: number;
  }
): Promise<string> {
  const parent = input.parentId ? await getCategory(input.parentId) : null;
  const ancestors = parent ? [...parent.ancestors, parent.id] : [];
  const payload: Omit<Category, "id"> = {
    name: input.name,
    slug: slugify(input.name),
    parentId: input.parentId,
    ancestors,
    depth: ancestors.length,
    image: input.image || "",
    description: input.description || "",
    scientificDescription: input.scientificDescription || "",
    researchPaperLink: input.researchPaperLink || "",
    order: input.order ?? Date.now(),
    productCount: 0,
    createdAt: Date.now(),
  };
  const ref = await addDoc(col(), payload);
  return ref.id;
}

export async function updateCategory(id: string, data: Partial<Category>) {
  const patch: Partial<Category> = { ...data };
  if (data.name) patch.slug = slugify(data.name);
  await updateDoc(doc(db, "categories", id), patch);
}

export async function deleteCategory(id: string) {
  await deleteDoc(doc(db, "categories", id));
}

export async function hasChildren(id: string): Promise<boolean> {
  const snap = await getDocs(query(col(), where("parentId", "==", id)));
  return !snap.empty;
}
