import { Request, Response } from "express";
import prisma from "../utils/db";
import { BadRequestError } from "../errors/bad-request-error";
import {
  CreateCategoryInput,
  EditCategoryInput,
  GetCategoryInput,
} from "../validations/category.validations";
class CategoryController {
  async getAllCategory(req: Request, res: Response) {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            product: true,
          },
        },
      },
    });
    return res.send(categories);
  }
  async getCategoryById(
    req: Request<GetCategoryInput["params"]>,
    res: Response
  ) {
    const category = await prisma.category.findUnique({
      where: { id: req.params.id },
      include: {
        _count: {
          select: {
            product: true,
          },
        },
      },
    });
    return res.send(category);
  }
  async createCategory(
    req: Request<{}, {}, CreateCategoryInput["body"]>,
    res: Response
  ) {
    const { name, slug } = req.body;
    const category = await prisma.category.findUnique({
      where: { slug: slug },
    });
    if (category) throw new BadRequestError("slug has been used");
    const newCategory = await prisma.category.create({ data: { name, slug } });
    return res.send(newCategory);
  }
  async editCategory(
    req: Request<EditCategoryInput["params"], {}, EditCategoryInput["body"]>,
    res: Response
  ) {
    const { id } = req.params;
    const { slug } = req.body;

    const categoryExist = await prisma.category.findUnique({
      where: { id },
    });
    if (!categoryExist) throw new BadRequestError("category not exist");

    if (slug && slug !== categoryExist.slug) {
      const slugExist = await prisma.category.findUnique({
        where: { slug },
      });
      if (slugExist) throw new BadRequestError("slug has been used");
    }

    const newCategory = await prisma.category.update({
      where: { id },
      data: { ...req.body },
    });

    return res.send(newCategory);
  }
  async deleteCategory(
    req: Request<EditCategoryInput["params"]>,
    res: Response
  ) {
    const { id } = req.params;
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { product: true },
        },
      },
    });
    if (!category) throw new BadRequestError("slug not exist");
    if (category._count.product > 0)
      throw new BadRequestError("category has been used");
    const deleteCategory = await prisma.category.delete({
      where: { id },
    });
    return res.send(deleteCategory);
  }
}

export default CategoryController;
