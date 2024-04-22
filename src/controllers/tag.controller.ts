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
            post: true,
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
            post: true,
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
    if (tag) throw new BadRequestError("slug đã được sử dụng");
    const newTag = await prisma.tag.create({ data: { name, slug } });
    return res.status(201).json({ message: "Tạo tag thành công", tag: newTag });
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
    if (!tagExist) throw new BadRequestError("Tag không tồn tại");

    if (slug && slug !== tagExist.slug) {
      const slugExist = await prisma.tag.findUnique({
        where: { slug },
      });
      if (slugExist) throw new BadRequestError("slug đã được sử dụng");
    }

    const newTag = await prisma.tag.update({
      where: { id },
      data: { ...req.body },
    });

    return res.json({ message: "Sửa tag thành công", tag: newTag });
  }
  async deleteTag(req: Request<EditTagInput["params"]>, res: Response) {
    const { id } = req.params;
    const tag = await prisma.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            post: true,
          },
        },
      },
    });
    if (!tag) throw new BadRequestError("slug không tồn tại");
    if (tag._count.post > 0) throw new BadRequestError("tag đang được sử dụng");
    const deleteTag = await prisma.tag.delete({
      where: { id },
    });
    return res
      .status(200)
      .json({ message: "Xoá tag thành công", tag: deleteTag });
  }
}
