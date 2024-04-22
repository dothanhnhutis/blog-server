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
import { BadRequestError, NotFoundError } from "../error-handler";
import { isBase64DataURL, uploadImageCloudinary } from "../utils/image";
import { omit } from "lodash";
import { hashData } from "../utils/helper";

export default class UserController {
  async currentUser(req: Request, res: Response) {
    const user = await prisma.user.findUnique({
      where: { email: req.currentUser?.email },
    });
    if (!user) throw new BadRequestError("User not found");
    return res.send(omit(user, ["password"]));
  }
  async getUserById(req: Request<GetUserInput["params"]>, res: Response) {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });
    if (!user) throw new NotFoundError();
    return res.status(200).json(omit(user, ["password"]));
  }

  async editProfile(
    req: Request<{}, {}, EditProfileInput["body"]>,
    res: Response
  ) {
    const { id } = req.currentUser!;
    const body = req.body;
    if (body.password) {
      body.password = hashData(body.password);
    }
    const { id: currentUserId } = req.currentUser!;
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
    await prisma.user.update({
      where: {
        id,
      },
      data: {
        ...req.body,
      },
    });

    return res.send({
      message: "Cập nhật thành công",
    });
  }

  async edit(
    req: Request<EditUserInput["params"], {}, EditUserInput["body"]>,
    res: Response
  ) {
    const body = req.body;
    const { id } = req.params;

    if (body.password) {
      body.password = hashData(body.password);
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new BadRequestError("Người dùng không tồn tại");
    await prisma.user.update({
      where: {
        id,
      },
      data: {
        ...body,
      },
    });
    return res.status(200).json({
      message: "Cập nhật người dùng thành công",
    });
  }

  async getAllUser(req: Request, res: Response) {
    const users = await prisma.user.findMany({
      where: {
        role: { not: "ADMIN" },
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
        createdAt: true,
        updatedAt: true,
      },
    });
    return res.status(200).json(users);
  }

  async getAuthor(req: Request<{}, {}, QueryUserInput["body"]>, res: Response) {
    const { id, role } = req.currentUser!;
    const roles: Role[] = ["WRITER"];
    if (role == "ADMIN") roles.push("MANAGER");
    const authors = await prisma.user.findMany({
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
        createdAt: true,
        updatedAt: true,
      },
    });
    return res.status(200).json(authors);
  }

  async creatUser(
    req: Request<{}, {}, CreateUserInput["body"]>,
    res: Response
  ) {
    const { email, password, role, ...other } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (user) throw new BadRequestError("Email has been used");
    const hashPass = hashData(password);
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashPass,
        ...other,
      },
    });
    return res.status(201).json({
      message: "Tạo người dùng thành công",
    });
  }
}
