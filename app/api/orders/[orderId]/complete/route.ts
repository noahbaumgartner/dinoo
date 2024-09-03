import { HttpStatus } from "@/lib/constants";
import { orderService } from "@/lib/services/order.service";
import { getHttpStatusFromErrorState } from "@/lib/utils";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest, { params }: { params: { orderId: string }}) {
    try {
        const orderId = await orderService.setCompleted(params.orderId);
        return Response.json(orderId, { status: HttpStatus.OK });
    } catch (error: any) {
        const errorState = error.message;
        const statusCode = getHttpStatusFromErrorState(errorState);
    
        return Response.json({ state: errorState }, { status: statusCode });
    }
}