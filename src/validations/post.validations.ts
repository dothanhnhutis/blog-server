import { z } from "zod";
const MAX_FILE_SIZE = 5000000;

export const base64Regex =
  /^data:image\/(?:png|gif|png|jpg|jpeg|bmp|webp)(?:;charset=utf-8)?;base64,(?:[A-Za-z0-9]|[+/])+={0,2}/g;

const postParams = z.object({
  id: z.string(),
});

const postBody = z.object({
  title: z
    .string({
      required_error: "title field is required",
      invalid_type_error: "title field must be string",
    })
    .min(1, "title field cann't empty"),
  image: z
    .string({
      required_error: "image field is required",
      invalid_type_error: "image field must be url or image base64",
    })
    .superRefine((value, ctx) => {
      if (value.length == 0) {
        return ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "image not empty",
        });
      }

      if (
        !z.string().url().safeParse(value).success &&
        !z.string().regex(base64Regex).safeParse(value).success
      )
        return ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "thumnail field must be url or image base64",
        });
    }),
  slug: z
    .string({
      required_error: "slug field is required",
      invalid_type_error: "slug field must be string",
    })
    .min(1, "slug field cann't empty")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "invalid slug"),
  contentJson: z.string({
    required_error: "contentJson field is required",
    invalid_type_error: "contentJson field must be string",
  }),
  contentText: z.string({
    required_error: "contentText field is required",
    invalid_type_error: "contentText field must be string",
  }),
  contentHTML: z.string({
    required_error: "contentHTML field is required",
    invalid_type_error: "contentHTML field must be string",
  }),
  tagId: z.string({
    required_error: "tagId field is required",
    invalid_type_error: "tagId field must be string",
  }),
  authorId: z.string({
    required_error: "authorId field is required",
    invalid_type_error: "authorId field must be string",
  }),
  isActive: z.boolean({
    required_error: "isActive field is required",
    invalid_type_error: "isActive field must be boolean",
  }),
  publishAt: z.string().datetime("invalid date"),
});

export const getPostValidation = z.object({
  query: z
    .object({
      title: z.string().optional(),
      tagName: z.string().optional(),
      authorName: z.string().optional(),
    })
    .optional(),
});

export const createPostValidation = z.object({
  body: postBody.strict(),
});
export const editPostValidation = z.object({
  params: postParams.strict(),
  body: postBody.partial().strict(),
});

export const deletePostValidation = z.object({
  params: postParams.strict(),
});

export const queryPostValidation = z.object({
  query: z
    .object({
      tag: z.string(),
      page: z.string(),
    })
    .strip()
    .partial(),
});

export type QueryPostInput = z.infer<typeof queryPostValidation>;
export type CreatePostInput = z.infer<typeof createPostValidation>;
export type EditPostInput = z.infer<typeof editPostValidation>;
export type DeletePostInput = z.infer<typeof deletePostValidation>;
