import { cookies } from "next/headers";
import { lucia } from "../auth";
import { ErrorStates } from "../constants";
import { userService } from "./user.service";
import { verify } from "@node-rs/argon2";
import { CredentialsDTO } from "../dtos/credentials.input.dto";
import { PrismaClient } from "@prisma/client";

export const authService = {
  async login(credentialsDTO: CredentialsDTO) {
    const prisma = new PrismaClient();

    const dbUser = await prisma.user.findUnique({
      where: {
        username: credentialsDTO.username,
      },
    });

    if (!dbUser) throw new Error(ErrorStates.USER_NOT_FOUND);

    const validPassword = await verify(
      dbUser.password_hash,
      credentialsDTO.password,
      {
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1,
      },
    );

    if (!validPassword) throw new Error(ErrorStates.AUTH_FAILED);

    const session = await lucia.createSession(dbUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    return userService.mapUserToDTO(dbUser);
  },

  async validateRequest() {
    const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) throw new Error(ErrorStates.UNAUTHORIZED);

    const result = await lucia.validateSession(sessionId);
    try {
      if (result.session && result.session.fresh) {
        const sessionCookie = lucia.createSessionCookie(result.session.id);
        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes,
        );
      }
      if (!result.session) throw new Error(ErrorStates.UNAUTHORIZED);
    } catch {}

    return result;
  },

  async logout() {
    const { session } = await this.validateRequest();
    if (!session) throw new Error(ErrorStates.UNAUTHORIZED);

    await lucia.invalidateSession(session.id);

    const sessionCookie = lucia.createBlankSessionCookie();
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
  },
};
