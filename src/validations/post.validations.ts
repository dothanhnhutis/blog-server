import { object, z } from "zod";

export const getPostValidation = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export const fieldPostValidation = z.object({
  params: z.object({
    id: z.string(),
  }),
  query: z.object({}),
});

export const createPostValidation = z.object({
  body: object({
    title: z
      .string({
        required_error: "title field is required",
        invalid_type_error: "title field must be string",
      })
      .min(1, "title field cann't empty"),
    thumnail: z.string({
      required_error: "thumnail field is required",
      invalid_type_error: "thumnail field must be string",
    }),
    slug: z
      .string({
        required_error: "slug field is required",
        invalid_type_error: "slug field must be string",
      })
      .min(1, "slug field cann't empty"),
    content: z
      .string({
        required_error: "content field is required",
        invalid_type_error: "content field must be string",
      })
      .min(1, "content field cann't empty"),
    tagId: z.string({
      required_error: "tagId field is required",
      invalid_type_error: "tagId field must be string",
    }),
    authorId: z.string({
      required_error: "authorId field is required",
      invalid_type_error: "authorId field must be string",
    }),
  }),
});

export type GetPostInput = z.infer<typeof getPostValidation>["params"];
export type CreatePostInput = z.infer<typeof createPostValidation>["body"];
