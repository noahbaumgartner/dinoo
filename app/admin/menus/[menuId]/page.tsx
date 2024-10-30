"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table";
import { useParams } from "next/navigation";
import { Edit, Pencil } from "lucide-react";

const tabs = {
    GENERAL: "general",
    MENU_GROUPS: "menu-groups"
}

export default function SingleMenuPage() {
    const params = useParams();

    return (
        <div className="flex flex-col space-y-4">
            <Card className="grow-0">
                <CardHeader className="flex flex-row justify-between">
                    <div>
                        <CardTitle className="text-lg">Schauturnen 2024</CardTitle>
                        <CardDescription>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam</CardDescription>
                    </div>
                    <div className="ml-4">
                        <Button variant="ghost" size="icon" className="flex flex-row space-x-2 align-middle">
                            <Pencil className="size-4" />
                        </Button>
                    </div>
                </CardHeader>
            </Card>
            <Card className="grow">
                <CardHeader>
                    <CardTitle>Menü-Gruppen</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col space-y-0">
                    <DataTable columns={[]} data={[]} />
                </CardContent>
            </Card>
        </div>
    )
}