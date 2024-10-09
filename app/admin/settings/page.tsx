"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage({ }: {}) {

    return (
        <Card className="">
            <CardHeader>
                <CardTitle>Einstellungen</CardTitle>
                <CardDescription>Konfigurieren Sie hier die allgemeinen App-Einstellungen</CardDescription>
            </CardHeader>
            <CardContent>
                Hello
            </CardContent>
        </Card>
    )
}