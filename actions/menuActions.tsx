"use server";

import { menuService } from "@/lib/services/menu.service";
import { redirect } from "next/navigation";

export async function createMenu(formData: FormData) {
    const response = await menuService.create(formData.get("name") as string, formData.get("description") as string);
    redirect(`/admin/menus/${response.id}`);
}