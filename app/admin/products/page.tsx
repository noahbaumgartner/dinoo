import Title1 from "@/components/ui/title1";
import { columns, type Payment } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

async function getData(): Promise<Payment[]> {
    // Fetch data from your API here.
    return [
        {
            id: "728ed52f",
            amount: 100,
            status: "pending",
            email: "m@example.com",
        },
        // ...
    ]
}

export default async function Home({ }: {}) {
    const data = await getData();

    return (
        <Card className="">
            <CardHeader>
                <CardTitle>Produkte</CardTitle>
                <CardDescription>Dies ist eine Liste der erfassten Produkte</CardDescription>
            </CardHeader>
            <CardContent>
                <DataTable columns={columns} data={data} />
            </CardContent>
        </Card>
    )
}