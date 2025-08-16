"use server"

import { redirect } from 'next/navigation'
import type { Area } from "@/lib/prisma"
import { v4 as uuidv4 } from 'uuid'
import { areaService } from '../services/area.service'
 
export async function createArea(formData: FormData) {
    const area: Area = {
        id: uuidv4(),
        name: formData.get("name") as string,
        area: formData.get("area") as string || "[]",
        index: 0,
    }
    areaService.create(area)

    redirect("/admin/areas")
}

export async function updateArea(formData: FormData, redirectToList = true) {
    const area: Area = {
        id: formData.get("id") as string,
        name: formData.get("name") as string,
        area: formData.get("area") as string,
        index: parseInt(formData.get("index") as string, 10),
    }
    areaService.update(area)

    if (redirectToList) redirect("/admin/areas")
}

export async function deleteArea(id: string) {
    await areaService.delete(id)
    redirect("/admin/areas")
}