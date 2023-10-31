import { z } from "zod";

export const createTagValidation = z.object({
  body: z
    .object({
      name: z
        .string({
          required_error: "name field is required",
          invalid_type_error: "name field must be string",
        })
        .min(1, "name field must be at least 1 character"),
      slug: z
        .string({
          required_error: "slug field is required",
          invalid_type_error: "slug field must be string",
        })
        .min(1, "slug field must be at least 1 character"),
    })
    .strict(),
});

export const editTagValidation = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z
    .object({
      name: z
        .string({
          required_error: "name field is required",
          invalid_type_error: "name field must be string",
        })
        .min(1, "name field must be at least 1 character")
        .optional(),
      slug: z
        .string({
          required_error: "slug field is required",
          invalid_type_error: "slug field must be string",
        })
        .min(1, "slug field must be at least 1 character")
        .optional(),
    })
    .strict(),
});

export const deleteTagValidation = z.object({
  params: z
    .object({
      id: z.string(),
    })
    .strict(),
});

export type CreateTagInput = z.infer<typeof createTagValidation>["body"];
export type EditTagInput = z.infer<typeof editTagValidation>;
export type DeleteTagInput = z.infer<typeof editTagValidation>;
