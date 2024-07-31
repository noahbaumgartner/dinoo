import { HttpStatus } from "@/lib/constants";
import { orderService } from "@/lib/services/order.service";
import { getHttpStatusFromErrorState } from "@/lib/utils";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { id: string }}) {
    try {
        const order = await orderService.getById(params.id);
    
        return Response.json(order, { status: HttpStatus.OK });
    } catch (error: any) {
        const errorState = error.message;
        const statusCode = getHttpStatusFromErrorState(errorState);
    
        return Response.json({ state: errorState }, { status: statusCode });
    }
}