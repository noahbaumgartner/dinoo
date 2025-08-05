"use client";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createProduct } from "@/lib/actions/product";
import type { Category, Product } from "@/lib/prisma";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CategoryIcon from "../category-icon";
import FormActions from "../form-actions";

const formSchema = z.object({
    name: z.string().min(3, {
        message: "Der Name muss mindestens 3 Zeichen lang sein.",
    }).max(30, {
        message: "Der Name darf maximal 30 Zeichen lang sein.",
    }),
    description: z.string().max(100, {
        message: "Die Beschreibung darf maximal 100 Zeichen lang sein.",
    }),
    categoryId: z.string(),
    price: z.number()
})

export default function ProductForm({ product, categories }: { product?: Product; categories: Category[] }) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: product?.name || "",
            description: product?.description || "",
            price: product?.price || 0,
            categoryId: product?.categoryId || "",
        },
    })

    return (
        <Form {...form}>
            <form action={createProduct} className="space-y-6 px-2">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Beschreibung (optional)</FormLabel>
                            <FormControl>
                                <Textarea {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="categoryId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Kategorie</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Kategorie wählen" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id} className="flex flex-row space-x-2">
                                                <CategoryIcon color={category.color} icon={category.icon} />
                                                <span>{category.name}</span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <input type="hidden" name="categoryId" value={field.value} />
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Preis</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormActions mode="create" cancelUrl="/admin/products" />
            </form>
        </Form>
    );
}