import { Router, Request } from "express";
import {
  SigninInput,
  SignupInput,
  signinValidation,
  signupValidation,
} from "../validations/auth.validations";
import prisma from "../utils/db";
import { BadRequestError } from "../errors/bad-request-error";
import { comparePassword, hashPassword } from "../utils";
import { validateResource } from "../middleware/validateResource";
import { signinJWT } from "../utils/jwt";

const router = Router();

router.post(
  "/signup",
  validateResource(signupValidation),
  async (req: Request<{}, {}, SignupInput>, res) => {
    const { email, password, code } = req.body;
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (user) throw new BadRequestError("Uer already exists");
    const otp = await prisma.otp.findUnique({
      where: {
        verified: false,
        code_email: {
          code: code,
          email: email,
        },
      },
    });
    if (!otp) throw new BadRequestError("Email verification code has expired");

    const hash = hashPassword(password);
    const newUser = await prisma.user.create({
      data: {
        email: email,
        password: hash,
        userPreference: {
          create: {
            username: email.split("@")[0] ?? email,
          },
        },
      },
    });
    await prisma.otp.update({
      where: { id: otp.id },
      data: {
        verified: true,
      },
    });
    return res.send({
      message: "signup success",
      user: newUser,
    });
  }
);

router.post(
  "/signin",
  validateResource(signinValidation),
  async (req: Request<{}, {}, SigninInput>, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { email: email },
    });
    if (
      user &&
      user.password &&
      (await comparePassword(user.password, password))
    ) {
      const token = signinJWT(
        {
          id: user.id,
          email: user.email,
          role: user.role,
          status: user.status,
        },
        process.env.JWT_SECRET ?? "",
        {
          expiresIn: 15 * 24 * 60 * 60,
        }
      );
      if (user.status === "BLOCK")
        throw new BadRequestError(
          "Your account has been locked please contact the administrator"
        );
      return res.send({
        message: "signin success",
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          status: user.status,
          token,
        },
      });
    }
    throw new BadRequestError("invalid email or password");
  }
);

export default router;
