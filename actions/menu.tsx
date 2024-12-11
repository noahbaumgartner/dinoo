"use server";

import { menuService } from "@/lib/services/menu.service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function openMenu(id: string) {
    redirect(`/admin/menus/${id}`);
}

export async function createMenu(formData: FormData) {
    const response = await menuService.create(formData.get("name") as string, formData.get("description") as string);
    redirect(`/admin/menus/${response.id}`);
}

export async function updateMenu(formData: FormData) {
    const id = formData.get("id") as string;
    await menuService.update(id, formData.get("name") as string, formData.get("description") as string);
    revalidatePath(`/admin/menus/${id}`);
}

export async function deleteMenu(id: string) {
    await menuService.delete(id);
    revalidatePath("/admin/menus");
}