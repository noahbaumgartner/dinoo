"use client";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { string, z } from "zod";
import FormActions from "../form-actions";
import type { Area } from "@/lib/prisma";
import { createArea, deleteArea, updateArea } from "@/lib/actions/area";
import { useState } from "react";
import { Button } from "../ui/button";
import { SquareMinus, SquarePlus } from "lucide-react";

const formSchema = z.object({
    name: z.string().min(3, {
        message: "Der Name muss mindestens 3 Zeichen lang sein.",
    }).max(100, {
        message: "Der Name darf maximal 100 Zeichen lang sein.",
    }),
    area: z.string(),
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
    const [areaState, setAreaState] = useState<string[][]>(JSON.parse("[[\"101\"]]"));

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
                <FormField
                    control={form.control}
                    name="area"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Bereich</FormLabel>
                            <FormControl>
                                <div className="flex flex-col">
                                    <div className="flex flex-wrap space-y-2 space-x-2">
                                        <Button variant="outline">
                                            <SquarePlus className="size-4" />
                                            Reihe
                                        </Button>
                                        <Button variant="outline">
                                            <SquareMinus className="size-4" />
                                            Reihe
                                        </Button>
                                        <Button variant="outline">
                                            <SquarePlus className="size-4" />
                                            Spalte
                                        </Button>
                                        <Button variant="outline">
                                            <SquareMinus className="size-4" />
                                            Spalte
                                        </Button>
                                    </div>
                                    <div className="min-h-72 w-full bg-sidebar border p-2 rounded-md shadow-xs">
                                        {areaState.map((row, rowIndex) => (
                                            <div key={rowIndex}>
                                                {row.map((cell, cellIndex) => (
                                                    <div key={cellIndex}>
                                                        <input type="text" />
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormActions mode={mode} cancelUrl="/admin/areas" deleteAction={async () => {
                    deleteArea(area?.id || "");
                }} />
            </form>
        </Form >
    );
}