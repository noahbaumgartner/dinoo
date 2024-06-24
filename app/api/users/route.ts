import { HttpStatus } from "@/lib/constants";
import { userService } from "@/lib/services/user.service";
import { NextRequest } from "next/server";
import { UserInputDTO } from "@/lib/dtos/user.input.dto";
import { getHttpStatusFromErrorState, validateDTO } from "@/lib/utils";
import { lucia } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
  const users = await userService.getAll();
  return Response.json(users, { status: HttpStatus.OK });
}

export async function POST(request: NextRequest) {
  const jsonBody = await request.json();
  const userDTO = new UserInputDTO(jsonBody);

  const errorStates = await validateDTO(userDTO);
  if (errorStates.length > 0) {
    return Response.json(
      { states: errorStates },
      { status: HttpStatus.BAD_REQUEST },
    );
  }

  try {
    const user = await userService.create(userDTO);

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

    return Response.json(user, { status: HttpStatus.CREATED });
  } catch (error: any) {
    const errorState = error.message;
    const statusCode = getHttpStatusFromErrorState(errorState);

    return Response.json({ state: errorState }, { status: statusCode });
  }
}
