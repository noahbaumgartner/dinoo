import { HttpStatus } from "@/lib/constants";
import { OrderInputDTO } from "@/lib/dtos/order.input.dto";
import { orderService } from "@/lib/services/order.service";
import { getHttpStatusFromErrorState, validateDTO } from "@/lib/utils";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    const jsonBody = await request.json();
    const orderDTO = new OrderInputDTO(jsonBody);
    
    const errorStates = await validateDTO(orderDTO);
    if (errorStates.length > 0) {
        console.log(errorStates);
        return Response.json(
            { states: errorStates },
            { status: HttpStatus.BAD_REQUEST },
        );
    }

    try {
        const order = await orderService.create(orderDTO);
    
        return Response.json(order, { status: HttpStatus.CREATED });
    } catch (error: any) {
        const errorState = error.message;
        const statusCode = getHttpStatusFromErrorState(errorState);
    
        return Response.json({ state: errorState }, { status: statusCode });
    }
}