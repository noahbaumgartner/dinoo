"use server"

import { redirect } from 'next/navigation'
import { productService } from '@/lib/services/product.service'
import type { Product } from "@/lib/prisma"
import { v4 as uuidv4 } from 'uuid'
 
export async function createProduct(formData: FormData) {
    console.log(formData)
    const product: Product = {
        id: uuidv4(),
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        price: parseFloat(formData.get("price") as string),
        categoryId: formData.get("categoryId") as string,
        index: 0
    }
    productService.create(product)

    redirect("/admin/products")
}

export async function updateProduct(formData: FormData, redirectToList = true) {
    const product: Product = {
        id: formData.get("id") as string,
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        price: parseFloat(formData.get("price") as string),
        categoryId: formData.get("categoryId") as string,
        index: parseInt(formData.get("index") as string, 10)
    }
    productService.update(product)

    if (redirectToList) redirect("/admin/products")
}

export async function deleteProduct(id: string) {
    await productService.delete(id)
    redirect("/admin/products")
}