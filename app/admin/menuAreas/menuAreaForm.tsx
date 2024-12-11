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

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Name muss mindestens 2 Zeichen lang sein",
    }),
    description: z.string().max(256, {
        message: "Beschreibung darf maximal 256 Zeichen lang sein",
    })
})

export function MenuAreaForm({ id, item, formAction }: {
    id: string
    item?: {
        id: string
        name: string
        description: string
    }
    formAction: (formData: FormData) => Promise<void>
}) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: item?.name || "",
            description: item?.description || "",
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
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Beschreibung</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Geben Sie die Beschreibung des Menüs an ..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </form>
        </Form>
    )
}
