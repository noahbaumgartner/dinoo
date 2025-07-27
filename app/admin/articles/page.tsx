import { AdminHeader } from "@/components/admin-header";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminArticlesPage() {
    return (
        <>
            <AdminHeader title="Artikel" />
            <div className=" px-4 py-4 flex flex-col space-y-4">
                <h1 className="text-2xl font-semibold px-2">Artikelverwaltung</h1>
                <Tabs defaultValue="account" className="flex flex-col space-y-2">
                    <TabsList>
                        <TabsTrigger value="articles">Artikel</TabsTrigger>
                        <TabsTrigger value="categories">Kategorien</TabsTrigger>
                        <TabsTrigger value="times">Zeiten</TabsTrigger>
                        <TabsTrigger value="outputs">Outputs</TabsTrigger>
                    </TabsList>
                    <TabsContent value="account">
                        <Card>
                            <CardHeader>
                                <CardTitle>Card Title</CardTitle>
                                <CardDescription>Card Description</CardDescription>
                                <CardAction>Card Action</CardAction>
                            </CardHeader>
                            <CardContent>
                                <p>Card Content</p>
                            </CardContent>
                            <CardFooter>
                                <p>Card Footer</p>
                            </CardFooter>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}