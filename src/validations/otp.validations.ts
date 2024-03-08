import { z } from "zod";
const otpTypeEnum = ["SIGNINUP", "RESETPASSWORD"] as const;
const otpTypeZod = z.enum(otpTypeEnum);
export type OTPType = z.infer<typeof otpTypeZod>;
export const otpCreateUserValidation = z.object({
  body: z
    .object({
      email: z
        .string({
          required_error: "email field is required",
          invalid_type_error: "email field must be string",
        })
        .email("invalid email"),
    })
    .strict(),
});

export type OTPCreateUserInput = z.infer<typeof otpCreateUserValidation>;
