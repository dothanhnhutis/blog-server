import { z } from "zod";

export const sendOtpValidation = z.object({
  body: z
    .object({
      email: z
        .string({
          required_error: "email field is required",
          invalid_type_error: "email field must be string",
        })
        .email("Invalid email"),
      type: z.enum(["SIGNINUP", "RESETPASSWORD"] as const),
    })
    .strict(),
});

export type SendOtpInput = z.infer<typeof sendOtpValidation>["body"];
