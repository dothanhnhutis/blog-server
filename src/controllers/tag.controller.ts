import prisma from "../utils/db";
import { Request, Response } from "express";
import {
  CreateTagInput,
  EditTagInput,
  GetTagInput,
} from "../validations/tag.validations";
import { BadRequestError } from "../error-handler";
export default class TagController {
  async getAllTag(req: Request, res: Response) {
    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: {
            blog: true,
          },
        },
      },
    });
    return res.send(tags);
  }
  async getTagById(req: Request<GetTagInput["params"]>, res: Response) {
    const tag = await prisma.tag.findUnique({
      where: { id: req.params.id },
      include: {
        _count: {
          select: {
            blog: true,
          },
        },
      },
    });
    return res.send(tag);
  }
  async createTag(req: Request<{}, {}, CreateTagInput["body"]>, res: Response) {
    const { name, slug } = req.body;
    const tag = await prisma.tag.findUnique({
      where: { slug: slug },
    });
    if (tag) throw new BadRequestError("slug has been used");
    const newTag = await prisma.tag.create({ data: { name, slug } });
    return res
      .status(201)
      .json({ message: "Create tag successful.", tag: newTag });
  }
  async editTag(
    req: Request<EditTagInput["params"], {}, EditTagInput["body"]>,
    res: Response
  ) {
    const { id } = req.params;
    const { slug } = req.body;

    const tagExist = await prisma.tag.findUnique({
      where: { id },
    });
    if (!tagExist) throw new BadRequestError("tag not exist");

    if (slug && slug !== tagExist.slug) {
      const slugExist = await prisma.tag.findUnique({
        where: { slug },
      });
      if (slugExist) throw new BadRequestError("slug has been used");
    }

    const newTag = await prisma.tag.update({
      where: { id },
      data: { ...req.body },
    });

    return res.json({ message: "Edit tag success", tag: newTag });
  }
  async deleteTag(req: Request<EditTagInput["params"]>, res: Response) {
    const { id } = req.params;
    const tag = await prisma.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            blog: true,
          },
        },
      },
    });
    if (!tag) throw new BadRequestError("slug not exist");
    if (tag._count.blog > 0) throw new BadRequestError("tag has been used");
    const deleteTag = await prisma.tag.delete({
      where: { id },
    });
    return res
      .status(200)
      .json({ message: "Delete tag successful.", tag: deleteTag });
  }
}
