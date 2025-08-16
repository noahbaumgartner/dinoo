"use client";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod";
import FormActions from "../form-actions";
import type { Area } from "@/lib/prisma";
import { createArea, deleteArea, updateArea } from "@/lib/actions/area";

const formSchema = z.object({
    name: z.string().min(3, {
        message: "Der Name muss mindestens 3 Zeichen lang sein.",
    }).max(100, {
        message: "Der Name darf maximal 100 Zeichen lang sein.",
    }),
    index: z.number().min(0, {
        message: "Der Index muss mindestens 0 sein.",
    })
})

export default function AreaForm({ mode, area }: { mode: "create" | "edit"; area?: Area }) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: area?.name || "",
            index: area?.index || 0,
        },
    })

    return (
        <Form {...form}>
            <form action={mode === "create" ? createArea : updateArea} className="space-y-6 px-2">
                <input type="hidden" name="id" value={area?.id || ""} />
                <input type="hidden" name="index" value={area?.index || 0} />
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
                <FormActions mode={mode} cancelUrl="/admin/areas" deleteAction={async () => {
                    deleteArea(area?.id || "");
                }} />
            </form>
        </Form>
    );
}