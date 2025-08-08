"use client";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CategoryIcon from "../category-icon";
import { CATEGORY_COLOR, CATEGORY_ICON_NAME } from "@/lib/constants";
import { createCategory, deleteCategory, updateCategory } from "@/lib/actions/category";
import FormActions from "../form-actions";
import type { Category } from "@/lib/prisma";

const formSchema = z.object({
    name: z.string().min(3, {
        message: "Der Name muss mindestens 3 Zeichen lang sein.",
    }).max(30, {
        message: "Der Name darf maximal 30 Zeichen lang sein.",
    }),
    color: z.string(),
    icon: z.string(),
})

export default function CategoryForm({ mode, category }: { mode: "create" | "edit"; category?: Category }) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: category?.name || "",
            color: category?.color || "",
            icon: category?.icon || "",
        },
    })

    return (
        <Form {...form}>
            <form action={mode === "create" ? createCategory : updateCategory} className="space-y-6 px-2">
                <input type="hidden" name="id" value={category?.id || ""} />
                <input type="hidden" name="index" value={category?.index || 0} />
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
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="color"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Farbe</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Kategorie wählen" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {Object.values(CATEGORY_COLOR).map((color) => (
                                            <SelectItem key={color} value={color} className="flex flex-row space-x-2">
                                                <CategoryIcon color={color} icon="" />
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <input type="hidden" name="color" value={field.value} />
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="icon"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Icon</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Kategorie wählen" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {Object.values(CATEGORY_ICON_NAME).map((icon) => (
                                            <SelectItem key={icon} value={icon} className="flex flex-row space-x-2">
                                                <CategoryIcon color={form.getValues().color} icon={icon} />
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <input type="hidden" name="icon" value={field.value} />
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormActions mode={mode} cancelUrl="/admin/categories" deleteAction={async () => {
                    deleteCategory(category?.id || "");
                }} />
            </form>
        </Form>
    );
}