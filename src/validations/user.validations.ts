import { z } from "zod";
export const roles = [
  "MANAGER",
  // "Accountance",
  // "ResearchAndDevelopment",
  // "Paperworker",
  "WRITER",
  "CUSTOMER",
] as const;
const roleZod = z.enum(roles);

export type Role = z.infer<typeof roleZod> | "ADMIN";

const userParams = z.object({
  id: z.string(),
});

const userBody = z.object({
  email: z
    .string({
      required_error: "email field is required",
      invalid_type_error: "email field must be string",
    })
    .email("Invalid email"),
  password: z
    .string({
      required_error: "password field is required",
      invalid_type_error: "password field must be string",
    })
    .min(8, "password field is too short")
    .max(40, "password field can not be longer than 40 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]*$/,
      "password field must include: letters, numbers and special characters"
    ),
  role: roleZod,
  isActive: z.boolean({
    required_error: "isActive field is required",
    invalid_type_error: "isActive field must be boolean",
  }),
  name: z.string({
    required_error: "name field is required",
    invalid_type_error: "name field must be string",
  }),
  avatarUrl: z
    .string({
      required_error: "avatarUrl field is required",
      invalid_type_error: "avatarUrl field must be string",
    })
    .nullable(),
  bio: z.string({
    required_error: "bio field is required",
    invalid_type_error: "bio field must be string",
  }),
  phone: z.string({
    required_error: "phone field is required",
    invalid_type_error: "phone field must be string",
  }),
  address: z.string({
    required_error: "address field is required",
    invalid_type_error: "address field must be string",
  }),
});

export const editUserValidation = z.object({
  params: userParams.strict(),
  body: userBody.omit({ email: true }).partial().strict(),
});

export const createUserValidation = z.object({
  body: userBody
    .partial()
    .required({
      email: true,
      password: true,
      name: true,
      role: true,
      isActive: true,
    })
    .strict(),
});

export const getUserValidation = z.object({
  params: userParams.strict(),
});

export const editProfileValidation = z.object({
  body: userBody
    .omit({
      role: true,
      email: true,
      isActive: true,
    })
    .partial()
    .strict(),
});

export const queryUserValidation = z.object({
  body: z
    .object({
      roles: roleZod.array().nonempty("can't empty roles"),
    })
    .strip()
    .partial(),
});

export const deleteUserValidation = getUserValidation;
export type QueryUserInput = z.infer<typeof queryUserValidation>;
export type EditUserInput = z.infer<typeof editUserValidation>;
export type CreateUserInput = z.infer<typeof createUserValidation>;
export type GetUserInput = z.infer<typeof getUserValidation>;
export type DeleteUserInput = z.infer<typeof deleteUserValidation>;
export type EditProfileInput = z.infer<typeof editProfileValidation>;
