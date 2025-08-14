"use client";

import type { Category } from "@/lib/prisma/wasm";
import type { ListColumnDef } from "../list";
import List from "../list";
import { updateCategory } from "@/lib/actions/category";

export default function CategoriesList({ columns, categories }: { columns: ListColumnDef<Category>[]; categories: Category[] }) {
    const handleChangeOrder = async (categories: Category[]) => {
        for (let index = 0; index < categories.length; index++) {
            const category = categories[index];
            const formData = new FormData();

            category.index = index + 1;

            formData.append("id", category.id);
            formData.append("name", category.name);
            formData.append("color", category.color);
            formData.append("icon", category.icon);
            formData.append("index", category.index.toString());

            await updateCategory(formData, false);
        };
    }

    return (
        <List columns={columns} data={categories} onOrderChangeAction={handleChangeOrder} />
    );
}