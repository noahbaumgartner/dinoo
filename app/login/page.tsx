import Button from "@/lib/components/button.server";
import Input from "@/lib/components/input.server";
import Title2 from "@/lib/components/title.server";

export default function Login() {
    return (
        <div>
            <div className="h-screen flex items-center justify-center">
                <div className="w-72">
                    <Title2>Log in</Title2>
                    <Input type="text" placeholder="Username" className="mt-2" />
                    <Input type="password" placeholder="Password" className="mt-2" />
                    <Button className="mt-2">Log in</Button>
                </div>
            </div>
        </div>
    );
}
