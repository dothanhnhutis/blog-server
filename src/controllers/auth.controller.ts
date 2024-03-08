import { Request, Response } from "express";
import { SignupInput } from "../validations/auth.validations";
import prisma from "../utils/db";
import { BadRequestError } from "../errors/bad-request-error";
import { compareData, hashData } from "../utils";
import { signJWT } from "../utils/jwt";
import { signCSRF } from "../utils/csrf";

export default class AuthController {
  async signIn(req: Request, res: Response) {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { email: email },
    });
    if (!user) throw new BadRequestError("Invalid email or password");
    if (!user.isActive)
      throw new BadRequestError(
        "Your account has been locked please contact the administrator"
      );

    if (!user.password || !(await compareData(user.password, password)))
      throw new BadRequestError("Invalid email or password");
    req.session.user = {
      id: user.id,
      csrf: signCSRF(),
    };
    const {
      createAt,
      updateAt,
      bio,
      password: passwordNew,
      phone,
      address,
      ...other
    } = user;
    return res.send({
      csrf: req.session.user.csrf,
      ...other,
    });
  }

  async signUp(req: Request<{}, {}, SignupInput["body"]>, res: Response) {
    const { email, password, code, name } = req.body;
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (user) throw new BadRequestError("Uer already exists");
    const otp = await prisma.otp.findFirst({
      where: {
        verified: false,
        code: signJWT(code, process.env.JWT_SECRET!),
        email,
      },
    });
    if (!otp) throw new BadRequestError("Email verification code has expired");

    const hash = hashData(password);
    await prisma.user.create({
      data: {
        email: email,
        password: hash,
        name,
      },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        name: true,
      },
    });
    await prisma.otp.update({
      where: { id: otp.id },
      data: {
        verified: true,
      },
    });
    return res.send({ message: "Sign up success" });
  }

  async signOut(req: Request, res: Response) {
    req.session.destroy(function (err) {});
    res.clearCookie("session");
    return res.send({ message: "Sign out success. See you again" });
  }
}
