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
    const { password, ...userNoPass } = user;
    return res.send(userNoPass);
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
    const { id: currentUserId, role } = req.currentUser!;

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
    if (req.currentUser?.role == "MANAGER") {
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
    const { id, role } = req.currentUser!;

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
    const { role: userRole } = req.currentUser!;
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
