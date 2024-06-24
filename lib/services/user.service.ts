import { PrismaClient } from "@prisma/client";
import { ErrorStates } from "../constants";
import { UserInputDTO } from "../dtos/user.input.dto";
import { UserOutputDTO } from "../dtos/user.output.dto";
import { hash } from "@node-rs/argon2";
import { lucia } from "../auth";
import { cookies } from "next/headers";

export const userService = {
  async getAll() {
    const prisma = new PrismaClient();
    const dbUsers = await prisma.user.findMany();

    return dbUsers.map((user) => this.mapUserToDTO(user));
  },

  async create(userDTO: UserInputDTO) {
    const prisma = new PrismaClient();
    const userExists = await prisma.user.findUnique({
      where: {
        username: userDTO.username,
      },
    });

    if (userExists) throw new Error(ErrorStates.USER_ALREADY_EXISTS);

    const passwordHash = await hash(userDTO.password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    try {
      const dbUser = await prisma.user.create({
        data: {
          firstName: userDTO.firstName,
          lastName: userDTO.lastName,
          username: userDTO.username,
          password_hash: passwordHash,
        },
      });

      const session = await lucia.createSession(dbUser.id, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );

      return this.mapUserToDTO(dbUser);
    } catch (error) {
      throw new Error(ErrorStates.DB_CREATE_FAILED);
    }
  },

  mapUserToDTO(user: any) {
    return new UserOutputDTO({
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  },
};
