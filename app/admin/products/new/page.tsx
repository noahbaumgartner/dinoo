"use client";

import { PageWrapper } from "@/components/page-wrapper";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod";

const formSchema = z.object({
    name: z.string().min(3, {
        message: "Der Name muss mindestens 3 Zeichen lang sein.",
    }).max(30, {
        message: "Der Name darf maximal 30 Zeichen lang sein.",
    }),
    description: z.string().max(100, {
        message: "Die Beschreibung darf maximal 100 Zeichen lang sein.",
    }),
    price: z.number()
        .min(0.01, { message: "Der Preis muss mindestens 0.01 sein." })
        .max(100, { message: "Der Preis darf maximal 100.00 sein." })
        .refine(val => /^\d{1,3}(\.\d{1,2})?$/.test(val.toFixed(2)), {
            message: "Der Preis muss ein gültiger Betrag mit bis zu zwei Nachkommastellen sein.",
        }),
})

export default function AdminNewProductPage() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            price: 0,
        },
    })

    // 2. Define a submit handler.
    function onSubmit(values: z.infer<typeof formSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        console.log(values)
    }

    return (
        <PageWrapper title="Produkt erstellen">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-2">
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
                    <Button type="submit">Submit</Button>
                </form>
            </Form>
        </PageWrapper>
    );
}