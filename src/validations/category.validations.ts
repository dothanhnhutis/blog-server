import { z } from "zod";
const paramsCategory = z
  .object({
    id: z.string(),
  })
  .strict();
const bodyCategory = z
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
      .min(1, "slug field must be at least 1 character")
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "invalid slug"),
  })
  .strict();
export const getCategoryValidation = z.object({
  params: paramsCategory,
});
export const createCategoryValidation = z.object({
  body: bodyCategory,
});
export const editCategoryValidation = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: bodyCategory.partial(),
});
export const deleteCategoryValidation = getCategoryValidation;
export type GetCategoryInput = z.infer<typeof getCategoryValidation>;
export type CreateCategoryInput = z.infer<typeof createCategoryValidation>;
export type EditCategoryInput = z.infer<typeof editCategoryValidation>;
export type DeleteCategoryInput = GetCategoryInput;
