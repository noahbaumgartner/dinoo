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
        index: 0,
    }
    await categoryService.create(category)

    redirect("/admin/categories")
}

export async function updateCategory(formData: FormData, redirectToList = true) {
    const category = {
        id: formData.get("id") as string,
        name: formData.get("name") as string,
        color: formData.get("color") as string,
        icon: formData.get("icon") as string,
        index: formData.get("index") ? parseInt(formData.get("index") as string, 10) : 0,
    }
    await categoryService.update(category)

    if (redirectToList) redirect("/admin/categories");
}

export async function updateCategories(formData: FormData) {
    const categories = formData.getAll("categories") as string[];
    for (const category of categories) {
        const categoryData = JSON.parse(category);
        await categoryService.update(categoryData);
    }
}

export async function deleteCategory(id: string) {
    await categoryService.delete(id)
    redirect("/admin/categories")
}