import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ErrorStates } from "../constants";
import { UserInputDTO } from "../dtos/user.input.dto";
import { UserOutputDTO } from "../dtos/user.output.dto";
import { lucia } from "../auth";
import { cookies } from "next/headers";

export const authService = {
  async create(userDTO: UserInputDTO) {
    const prisma = new PrismaClient();
    const hashedPassword = bcrypt.hashSync(userDTO.password, 10);
    const userExists = await prisma.user.findUnique({
      where: {
        username: userDTO.username,
      },
    });

    if (userExists) throw new Error(ErrorStates.USER_ALREADY_EXISTS);

    try {
      const dbUser = await prisma.user.create({
        data: {
          firstName: userDTO.firstName,
          lastName: userDTO.lastName,
          username: userDTO.username,
          password_hash: hashedPassword,
        }
      });

      const session = await lucia.createSession(dbUser.id, {});
	    const sessionCookie = lucia.createSessionCookie(session.id);
	    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

      return this.mapUserToDTO(dbUser);
    } catch (error) {
      throw new Error(ErrorStates.DB_CREATE_FAILED);
    }
  }
};
