import { z } from "zod";

export const createContactValidation = z.object({
  body: z
    .object({
      sessionId: z.string({
        required_error: "sessionId field is required",
        invalid_type_error: "sessionId field must be string",
      }),
      name: z.string({
        required_error: "name field is required",
        invalid_type_error: "name field must be string",
      }),
      isReaded: z
        .boolean({
          invalid_type_error: "isReaded field must be boolean",
        })
        .default(false),
      contactTag: z
        .enum(["NORMAL", "ARCHIVE", "JUNK", "TRASH"])
        .default("NORMAL"),
      email: z
        .string({
          required_error: "email field is required",
          invalid_type_error: "email field must be string",
        })
        .optional(),
      phone: z.string({
        required_error: "phone field is required",
        invalid_type_error: "phone field must be string",
      }),
      productName: z.string({
        required_error: "productName field is required",
        invalid_type_error: "productName field must be string",
      }),
      description: z.string({
        required_error: "description field is required",
        invalid_type_error: "description field must be string",
      }),
    })
    .strict(),
});
export const editContactValidation = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: createContactValidation.shape.body
    .pick({
      isReaded: true,
      contactTag: true,
      isDeleted: true,
    })
    .partial()
    .strict(),
});

export const queryContactValidation = z.object({
  query: z
    .object({
      isReaded: z.string(),
      contactTag: z.string(),
      isDeleted: z.string(),
    })
    .strip()
    .partial(),
});
export type CreateContact = z.infer<typeof createContactValidation>;
export type EditContact = z.infer<typeof editContactValidation>;
export type QueryContact = z.infer<typeof queryContactValidation>;

export type Contact = CreateContact & {
  id: string;
  createdAt: string;
  updatedAt: string;
};
