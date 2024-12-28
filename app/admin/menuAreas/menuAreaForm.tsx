"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import ColorPicker from "@/components/admin/color-picker"

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Name muss mindestens 2 Zeichen lang sein",
    }),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, {
        message: "Ungültige Farbe"
    })
})

export function MenuAreaForm({ id, item, formAction }: {
    id: string
    item?: {
        id: string
        name: string
        color: string
    }
    formAction: (formData: FormData) => Promise<void>
}) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: item?.name || "",
            color: item?.color || ""
        },
    });

    return (
        <Form {...form}>
            <form id={id} action={formAction} className="space-y-4">
                <Input name="id" type="hidden" value={item?.id} />
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Color</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Geben Sie die Beschreibung des Menüs an ..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </form>
            <ColorPicker />
        </Form>
    )
}
