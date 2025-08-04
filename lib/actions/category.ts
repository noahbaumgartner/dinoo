"use server"

import { redirect } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import { categoryService } from '../services/category.service'
 
export async function createCategory(formData: FormData) {
    console.log(formData)
    const category = {
        id: uuidv4(),
        name: formData.get("name") as string,
        color: formData.get("color") as string,
        icon: formData.get("icon") as string,
    }
    categoryService.create(category)

    redirect("/admin/categories")
}