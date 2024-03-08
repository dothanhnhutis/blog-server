import { z } from "zod";
import { isBase64DataURL } from "../utils/image";

const createProductBody = z.object({
  images: z
    .string({
      required_error: "images field is required",
      invalid_type_error: "images field must be string",
    })
    .array()
    .superRefine((value, ctx) => {
      for (let index in value) {
        if (!isBase64DataURL(value[index])) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["images", index],
            message: "images field must be array image base64",
          });
        }
      }
    }),
  video: z.string().url("Video must be url").nullable(),
  productName: z.string().min(1, "Product name can't be empty"),
  slug: z.string().min(1, "Slug can't be empty"),
  code: z.string().min(1, "Code can't be empty"),
  description: z.string({
    required_error: "description field is required",
    invalid_type_error: "description field must be string",
  }),
  categoryId: z.string({
    required_error: "categoryId field is required",
    invalid_type_error: "categoryId field must be string",
  }),
  benefits: z.string().array().nonempty("Benefits can't be empty"),
  ingredients: z.string().array().nonempty("Ingredients can't be empty"),
  contentJson: z.string(),
  contentHTML: z.string(),
  contentText: z.string(),
  isActive: z.boolean().optional(),
});

export const createProductValidation = z.object({
  body: createProductBody.strict(),
});

export const editProductValidation = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: createProductBody.partial().strict(),
});

export const queryProductValidation = z.object({
  query: z
    .object({
      category: z.string(),
      page: z.string(),
    })
    .strip()
    .partial(),
});

export type QueryProductInput = z.infer<typeof queryProductValidation>;

export type CreateProductInput = z.infer<typeof createProductValidation>;
export type EditProductInput = z.infer<typeof editProductValidation>;
