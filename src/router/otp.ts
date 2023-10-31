import { Router, Request } from "express";

import prisma from "../utils/db";
import { generateOTPCode } from "../utils";
import { sendMail } from "../utils/nodemailer";
import { BadRequestError } from "../errors/bad-request-error";
import { validateResource } from "../middleware/validateResource";
import {
  SendOtpInput,
  sendOtpValidation,
} from "../validations/otp.validations";

const router = Router();

router.post(
  "/send",
  validateResource(sendOtpValidation),
  async (req: Request<{}, {}, SendOtpInput>, res) => {
    const { email, type } = req.body;
    const user = await prisma.user.findUnique({
      where: { email: email },
    });
    if (user) throw new BadRequestError("Uer already exists");
    const otp = await prisma.otp.findFirst({
      where: {
        verified: false,
        expireAt: { gte: new Date(Date.now()) },
        email,
        type,
      },
    });
    const code = otp?.code ?? generateOTPCode();
    if (!otp) {
      await prisma.otp.create({
        data: {
          code,
          expireAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          email,
          type,
        },
      });
    }
    const data = {
      from: 'I.C.H Verify Email" <gaconght@gmail.com>',
      to: email,
      subject: "I.C.H Verify Email",
      html: `<b>code: ${code}</b>`,
    };
    const isSend = await sendMail(data);
    if (!isSend) throw new BadRequestError("Send email fail");
    return res.send({
      message: "Send email success",
    });
  }
);

export default router;
