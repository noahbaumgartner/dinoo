import Title1 from "@/components/ui/title1";
import { columns, type Payment } from "./columns";
import { DataTable } from "@/components/ui/data-table";

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
        <div className="px-4 sm:px-8 md:px-12">
            <div className="py-8">
                <Title1>Produkte</Title1>
                <p className="text-gray-500 text-sm">Dies ist eine Liste der erfassten Produkte</p>
            </div>
            <DataTable columns={columns} data={data} />
        </div>
    )
}