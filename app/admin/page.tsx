import { Button } from "@/lib/components/button";

export default async function Home({ }: {}) {
    return (
        <>
            <Button variant="default" size="icon">Test</Button>
            <Button variant="destructive" size="default">Hallo</Button>
            <Button variant="ghost" size="default" />
            <Button variant="link" size="default" />
        </>
    )
}