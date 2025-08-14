"use client";

import type { Category, Product } from "@/lib/prisma/wasm";
import type { ListColumnDef } from "../list";
import List from "../list";
import Link from "next/link";
import CategoryIcon from "../category-icon";
import { updateProduct } from "@/lib/actions/product";

export default function ProductsList({ columns, categories, products }: { columns: ListColumnDef<Product>[]; categories: Category[], products: Product[] }) {
    const productsWithCategory = categories.map(category => ({
        ...category,
        products: products.filter(product => product.categoryId === category.id)
    })).filter(category => category.products.length > 0);

    const handleChangeOrder = async (products: Product[]) => {
        for (let index = 0; index < products.length; index++) {
            const product = products[index];
            const formData = new FormData();

            product.index = index + 1;

            formData.append("id", product.id);
            formData.append("name", product.name);
            formData.append("description", product.description);
            formData.append("price", product.price.toString());
            formData.append("categoryId", product.categoryId);
            formData.append("index", product.index.toString());

            await updateProduct(formData, false);
        };
    }

    return (
        <>
            {productsWithCategory.map(category => (
                <div key={category.id} className="my-4 flex flex-col space-y-4">
                    <Link href={`/admin/categories/${category.id}`} className="flex items-center space-x-2 px-2">
                        <CategoryIcon color={category.color} icon={category.icon} />
                        <h2 className="text-lg font-semibold">{category.name}</h2>
                    </Link>
                    <List columns={columns} data={category.products} onOrderChangeAction={handleChangeOrder} />
                </div>
            ))}
        </>
    );
}