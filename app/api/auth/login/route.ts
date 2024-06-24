import { HttpStatus } from "@/lib/constants";
import { CredentialsDTO } from "@/lib/dtos/credentials.input.dto";
import { userService } from "@/lib/services/user.service";
import { getHttpStatusFromErrorState, validateDTO } from "@/lib/utils";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const jsonBody = await request.json();
  const credentialsDTO = new CredentialsDTO(jsonBody);

  const errorStates = await validateDTO(credentialsDTO);
  if (errorStates.length > 0) {
    return Response.json(
      { states: errorStates },
      { status: HttpStatus.BAD_REQUEST },
    );
  }

  try {
    const user = await userService.login(credentialsDTO);
    return Response.json(user, { status: HttpStatus.CREATED });
  } catch (error: any) {
    const errorState = error.message;
    const statusCode = getHttpStatusFromErrorState(errorState);

    return Response.json({ state: errorState }, { status: statusCode });
  }
}
