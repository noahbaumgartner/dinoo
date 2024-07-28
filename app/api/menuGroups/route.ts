import { HttpStatus } from "@/lib/constants";
import { menuGroupService } from "@/lib/services/menuGroup.service";

export async function GET() {
    const menuGroups = await menuGroupService.getAll();
    return Response.json(menuGroups, { status: HttpStatus.OK });
}