"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createCategory, deleteCategory, updateCategory } from "@/db/queries";

const NAME_MAX = 30;
const DESC_MAX = 200;

async function requireUserId() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

function readFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim().slice(0, NAME_MAX);
  const description = String(formData.get("description") ?? "")
    .trim()
    .slice(0, DESC_MAX);
  return { name, description };
}

function refreshAll() {
  revalidatePath("/categories");
  revalidatePath("/dashboard");
}

export async function addCategoryAction(formData: FormData) {
  const userId = await requireUserId();
  const { name, description } = readFields(formData);
  if (!name) return;
  await createCategory(userId, name, description);
  refreshAll();
}

export async function updateCategoryAction(formData: FormData) {
  const userId = await requireUserId();
  const id = Number(formData.get("id"));
  const { name, description } = readFields(formData);
  if (!Number.isInteger(id) || !name) return;
  await updateCategory(userId, id, name, description);
  refreshAll();
}

export async function deleteCategoryAction(formData: FormData) {
  const userId = await requireUserId();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;
  await deleteCategory(userId, id);
  refreshAll();
}
