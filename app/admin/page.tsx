"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Title1 from "@/components/ui/title1";

export default function Home({ }: {}) {

    return (
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="grow flex flex-col space-y-4">
                <Card className="grow">
                    <CardHeader>
                        <Title1>Hallo, Noah 👋🏼</Title1>
                        <CardDescription>Willkommen zurück! Hier sind einige Statistiken</CardDescription>
                    </CardHeader>
                </Card>
                <Card className="grow">
                    <CardHeader>
                        <CardTitle>Letze Bestellungen</CardTitle>
                        <CardDescription>Folgendes sind die letzten 10 Bestellungen</CardDescription>
                    </CardHeader>
                </Card>
            </div>
            <div className="grow flex flex-col space-y-4">
                <Card className="grow">
                    <CardHeader>
                        <CardTitle>Wichtigste Funktionen</CardTitle>
                        <CardDescription>Dies sind Absprünge zu den wichtigsten Funktionen</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col space-y-2">
                        <Button variant="secondary" size="default" className="justify-start w-full">Menüs</Button>
                        <Button variant="secondary" size="default" className="justify-start w-full">Produkte</Button>
                        <Button variant="secondary" size="default" className="justify-start w-full">Saalpläne</Button>
                        <Button variant="secondary" size="default" className="justify-start w-full">Bestellungen</Button>
                        <Button variant="secondary" size="default" className="justify-start w-full">Produkte</Button>
                        <Button variant="secondary" size="default" className="justify-start w-full">Produkte</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}