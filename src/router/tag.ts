import { Router, Request } from "express";
import prisma from "../utils/db";
import { validateResource } from "../middleware/validateResource";
import {
  CreateTagInput,
  EditTagInput,
  createTagValidation,
  editTagValidation,
} from "../validations/tag.validations";
import { BadRequestError } from "../errors/bad-request-error";
import { requiredAuth } from "../middleware/requiredAuth";
import { roleAccess } from "../middleware/checkRole";

const router = Router();

router.get("/", async (req, res) => {
  const tags = await prisma.tag.findMany();
  return res.send({
    message: "get all tag success",
    tags,
  });
});

router.post(
  "/",
  requiredAuth,
  roleAccess(["ADMIN", "POSTER"]),
  validateResource(createTagValidation),
  async (req: Request<{}, {}, CreateTagInput>, res) => {
    const { name, slug } = req.body;

    const tag = await prisma.tag.findUnique({
      where: { slug: slug },
    });
    if (tag) throw new BadRequestError("slug alraedy exist");
    const newTag = await prisma.tag.create({ data: { name, slug } });

    return res.send({
      message: "create tag success",
      tag: newTag,
    });
  }
);

router.patch(
  "/:id",
  requiredAuth,
  roleAccess(["ADMIN", "POSTER"]),
  validateResource(editTagValidation),
  async (
    req: Request<EditTagInput["params"], {}, EditTagInput["body"]>,
    res
  ) => {
    const { id } = req.params;

    const tag = await prisma.tag.findUnique({
      where: { id },
    });

    if (!tag) throw new BadRequestError("slug not exist");

    const newTag = await prisma.tag.update({
      where: { id },
      data: { ...req.body },
    });

    return res.send({
      message: "update tag success",
      tag: newTag,
    });
  }
);

router.delete(
  "/:id",
  requiredAuth,
  roleAccess(["ADMIN", "POSTER"]),
  async (req: Request<EditTagInput["params"]>, res) => {
    const { id } = req.params;

    const tag = await prisma.tag.findUnique({
      where: { id },
    });

    if (!tag) throw new BadRequestError("slug not exist");

    const newTag = await prisma.tag.delete({
      where: { id },
    });

    return res.send({
      message: "delete tag success",
      tag: newTag,
    });
  }
);

export default router;
