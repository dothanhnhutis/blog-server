import { Request, Response } from "express";
import prisma from "../utils/db";
import {
  CreateUserInput,
  EditProfileInput,
  EditUserInput,
  GetUserInput,
  QueryUserInput,
  Role,
} from "../validations/user.validations";
import { BadRequestError } from "../errors/bad-request-error";
import { hashData } from "../utils";
import { isBase64DataURL, uploadImageCloudinary } from "../utils/image";
import { NotFoundError } from "../errors/not-found-error";

export default class UserController {
  async currentUser(req: Request, res: Response) {
    const user = await prisma.user.findUnique({
      where: { email: res.locals.user?.email },
    });
    if (user) return res.send(user);
    return res.send(res.locals.user);
  }
  async getUserById(req: Request<GetUserInput["params"]>, res: Response) {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });
    if (!user) throw new NotFoundError();
    const { password, ...userNoPass } = user;
    return res.send(userNoPass);
  }

  async editProfile(
    req: Request<{}, {}, EditProfileInput["body"]>,
    res: Response
  ) {
    const { id } = res.locals.user!;
    const body = req.body;
    if (body.password) {
      body.password = hashData(body.password);
    }
    const userUpdate = await prisma.user.update({
      where: {
        id,
      },
      data: {
        ...req.body,
      },
    });
    const { password, ...userNoPass } = userUpdate;
    return res.send({ message: "Edit profile success." });
  }
  async edit(
    req: Request<EditUserInput["params"], {}, EditUserInput["body"]>,
    res: Response
  ) {
    const { id } = req.params;
    const { id: currentUserId, role } = res.locals.user!;

    const body = req.body;

    if (body.password) {
      body.password = hashData(body.password);
    }
    if (body.avatarUrl) {
      if (isBase64DataURL(body.avatarUrl)) {
        const { asset_id, height, public_id, secure_url, tags, width } =
          await uploadImageCloudinary(body.avatarUrl);
        await prisma.image.create({
          data: {
            id: asset_id,
            public_id,
            tags,
            width,
            height,
            url: secure_url,
            userId: currentUserId,
          },
        });
        body.avatarUrl = secure_url;
      }
    }
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new BadRequestError("use not exist");
    await prisma.user.update({
      where: {
        id,
      },
      data: {
        ...body,
      },
    });
    return res.send({ message: "Edit user success." });
  }
  async getAllUser(req: Request, res: Response) {
    const roles: Role[] = ["ADMIN"];
    if (res.locals.user?.role == "MANAGER") {
      roles.push("MANAGER");
    }
    const users = await prisma.user.findMany({
      where: {
        role: { notIn: roles },
      },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        name: true,
        bio: true,
        phone: true,
        avatarUrl: true,
        address: true,
        createAt: true,
        updateAt: true,
      },
    });
    return res.send(users);
  }

  async getAuthor(req: Request<{}, {}, QueryUserInput["body"]>, res: Response) {
    const { id, role } = res.locals.user!;

    const roles: Role[] = ["WRITER"];
    if (role == "ADMIN") roles.push("MANAGER");
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { id },
          {
            role: {
              in: roles,
            },
          },
        ],
      },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        name: true,
        bio: true,
        phone: true,
        avatarUrl: true,
        address: true,
        createAt: true,
        updateAt: true,
      },
    });

    return res.send(users);
  }

  async creatUser(
    req: Request<{}, {}, CreateUserInput["body"]>,
    res: Response
  ) {
    const { email, password, role, ...other } = req.body;
    const { role: userRole } = res.locals.user!;
    const adminRole: Role[] = ["ADMIN", "MANAGER"];
    if (userRole == "MANAGER" && adminRole.includes(role))
      throw new BadRequestError(
        "You are not allowed to place a role higher or equal to yourself"
      );
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) throw new BadRequestError("Email has been used");
    const hashPass = hashData(password);
    await prisma.user.create({
      data: {
        email,
        password: hashPass,
        ...other,
      },
    });
    return res.send({ message: "Create user success" });
  }
}
