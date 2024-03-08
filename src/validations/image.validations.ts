import { z } from "zod";
import { isBase64DataURL } from "../utils/image";

export const uploadImageValidation = z.object({
  body: z.object({
    data: z.string().transform((val, ctx) => {
      const parsed = isBase64DataURL(val);
      if (!parsed) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "avatar field must be Base64 Data",
        });
        return z.NEVER;
      }
      return val;
    }),
    height: z
      .number({ invalid_type_error: "height field must be number" })
      .optional(),
    width: z
      .number({ invalid_type_error: "width field must be number" })
      .optional(),
    tags: z.string().array().min(1, "tags field cannot empty."),
  }),
});

export const deleteImageValidation = z.object({
  body: z
    .object({
      id: z.string({
        required_error: "id field is required",
        invalid_type_error: "id field must be string",
      }),
    })
    .strict(),
});

export type UploadImageInput = z.infer<typeof uploadImageValidation>;
export type DeleteImageInput = z.infer<typeof deleteImageValidation>;
