"use server";

import { redirect } from "next/navigation";

export async function openMenuArea(id: string) {
    redirect(`/admin/menuAreas/${id}`);
}