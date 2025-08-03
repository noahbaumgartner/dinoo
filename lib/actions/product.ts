"use server"

import { redirect } from 'next/navigation'
import { productService } from '@/lib/services/product.service'
import type { Product } from "@/lib/prisma"
import { v4 as uuidv4 } from 'uuid'
 
export async function createProduct(formData: FormData) {
    const product: Product = {
        id: uuidv4(),
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        price: parseFloat(formData.get("price") as string),
        categoryId: formData.get("categoryId") as string,
        categoryIndex: 0
    }
    productService.create(product)

    redirect("/admin/products")
}