import { z } from "zod";
export const signinProviderValidation = z.object({
  body: z
    .object({
      token: z.string({
        required_error: "token field is required",
        invalid_type_error: "token field must be string",
      }),
    })
    .strict(),
});
export const signinValidation = z.object({
  body: z
    .object({
      email: z.string({
        required_error: "email field is required",
        invalid_type_error: "email field must be string",
      }),
      password: z.string({
        required_error: "password field is required",
        invalid_type_error: "password field must be string",
      }),
    })
    .strict(),
});
export const signupValidation = z.object({
  body: z
    .object({
      name: z
        .string({
          required_error: "Name field is required",
          invalid_type_error: "Name field must be string",
        })
        .min(1, "Name can't be empty"),
      email: z
        .string({
          required_error: "Email field is required",
          invalid_type_error: "Email field must be string",
        })
        .email("Invalid email"),
      password: z
        .string({
          required_error: "Password field is required",
          invalid_type_error: "Password field must be string",
        })
        .min(8, "Password field is too short")
        .max(40, "Password field can not be longer than 40 characters")
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]*$/,
          "Password field must include: letters, numbers and special characters"
        ),
      code: z
        .string({
          required_error: "Code field is required",
          invalid_type_error: "Code field must be string",
        })
        .length(6, "Code field include 6 characters"),
    })
    .strict(),
});
export type SignupProviderInput = z.infer<typeof signinProviderValidation>;
export type SignupInput = z.infer<typeof signupValidation>;
export type SigninInput = z.infer<typeof signinValidation>;
