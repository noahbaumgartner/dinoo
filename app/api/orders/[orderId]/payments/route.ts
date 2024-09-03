import { HttpStatus } from "@/lib/constants";
import { PaymentInputDTO } from "@/lib/dtos/payment.input.dto";
import { paymentService } from "@/lib/services/payment.service";
import { getHttpStatusFromErrorState, validateDTO } from "@/lib/utils";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest, { params }: { params: { orderId: string }}) {
    const jsonBody = await request.json();
    const paymentDTO = new PaymentInputDTO(jsonBody);
    
    const errorStates = await validateDTO(paymentDTO);
    if (errorStates.length > 0) {
        return Response.json(
            { states: errorStates },
            { status: HttpStatus.BAD_REQUEST },
        );
    }

    try {
        const payment = await paymentService.create(paymentDTO, params.orderId);
    
        return Response.json(payment, { status: HttpStatus.CREATED });
    } catch (error: any) {
        const errorState = error.message;
        const statusCode = getHttpStatusFromErrorState(errorState);
    
        return Response.json({ state: errorState }, { status: statusCode });
    }
}