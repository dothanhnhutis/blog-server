import { Request, Response } from "express";
import { signJWT, verifyJWT } from "../utils/jwt";
import { OTPCreateUserInput } from "../validations/otp.validations";
import prisma from "../utils/db";
import { BadRequestError } from "../errors/bad-request-error";
import { generateOTPCode } from "../utils";
import { sendMail } from "../utils/nodemailer";

export default class OTPController {
  async send(req: Request<{}, {}, OTPCreateUserInput["body"]>, res: Response) {
    const { email } = req.body;
    const user = await prisma.user.findUnique({
      where: { email: email },
    });
    if (user) throw new BadRequestError("Uer already exists");
    const otp = await prisma.otp.findFirst({
      where: {
        email,
        verified: false,
        expireAt: { gte: new Date(Date.now()) },
      },
    });

    let code = otp
      ? verifyJWT(otp.code, process.env.JWT_SECRET!)!
      : generateOTPCode();
    const data = {
      from: 'I.C.H Verify Email" <gaconght@gmail.com>',
      to: email,
      subject: "I.C.H Verify Email",
      html: `<b>code: ${code}</b>`,
    };

    if (!otp) {
      const isSend = await sendMail(data);
      if (!isSend) throw new BadRequestError("Send email fail");
      await prisma.otp.create({
        data: {
          email,
          code: signJWT(code, process.env.JWT_SECRET!),
          expireAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        },
      });
      return res.send({
        message: "Send email success",
      });
    }

    if (otp.updateAt.getTime() + 60 * 1000 >= Date.now()) {
      throw new BadRequestError("Too many request");
    }
    const isSend = await sendMail(data);
    if (!isSend) throw new BadRequestError("Send email fail");
    await prisma.otp.update({
      where: {
        id: otp.id,
      },
      data: {
        count: { increment: 1 },
      },
    });
    return res.send({
      message: "Send email success",
    });
  }
}
