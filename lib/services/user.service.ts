import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ErrorStates } from "../constants";
import { UserInputDTO } from "../dtos/user.input.dto";
import { UserOutputDTO } from "../dtos/user.output.dto";

export const userService = {
  async getAll() {
    const prisma = new PrismaClient();
    const dbUsers = await prisma.user.findMany();

    return dbUsers.map((user) => this.mapUserToDTO(user));
  },

  async create(userDTO: UserInputDTO) {
    const prisma = new PrismaClient();
    const hashedPassword = bcrypt.hashSync(userDTO.password, 10);
    const userExists = await prisma.user.findUnique({
      where: {
        email: userDTO.email,
      },
    });

    if (userExists) throw new Error(ErrorStates.USER_ALREADY_EXISTS);

    try {
      const dbUser = await prisma.user.create({
        data: {
          firstName: userDTO.firstName,
          lastName: userDTO.lastName,
          email: userDTO.email,
          password: hashedPassword,
        },
      });

      return this.mapUserToDTO(dbUser);
    } catch (error) {
      throw new Error(ErrorStates.DB_CREATE_FAILED);
    }
  },

  mapUserToDTO(user: any) {
    return new UserOutputDTO({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  },
};
