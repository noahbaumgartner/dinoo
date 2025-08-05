"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod";
import { createOrderTime } from "@/lib/actions/ordertime";
import Link from "next/link";
import FormActions from "../form-actions";

const formSchema = z.object({
    time: z.string().min(3, {
        message: "Die Zeit muss mindestens 3 Zeichen lang sein.",
    }).max(30, {
        message: "Die Zeit darf maximal 50 Zeichen lang sein.",
    })
})

export default function CreateOrderTimeForm() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            time: ""
        },
    })

    return (
        <Form {...form}>
            <form action={createOrderTime} className="space-y-6 px-2">
                <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Zeitpunkt</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormActions cancelUrl="/admin/ordertimes" />
            </form>
        </Form>
    );
}