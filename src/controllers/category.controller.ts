import { Request, Response } from "express";
import prisma from "../utils/db";
import { BadRequestError } from "../error-handler";
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
    return res.status(200).json(categories);
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
    return res.status(200).json(category);
  }
  async createCategory(
    req: Request<{}, {}, CreateCategoryInput["body"]>,
    res: Response
  ) {
    const { name, slug } = req.body;
    const category = await prisma.category.findUnique({
      where: { slug: slug },
    });
    if (category) throw new BadRequestError("Slug đã được sử dụng");
    const newCategory = await prisma.category.create({ data: { name, slug } });
    return res.status(201).json({
      message: "Tạo category thành công",
      category: newCategory,
    });
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
    if (!categoryExist) throw new BadRequestError("Category không tồn tại");

    if (slug && slug !== categoryExist.slug) {
      const slugExist = await prisma.category.findUnique({
        where: { slug },
      });
      if (slugExist) throw new BadRequestError("Slug đã được sử dụng");
    }

    const newCategory = await prisma.category.update({
      where: { id },
      data: { ...req.body },
    });

    return res.status(200).json({
      message: "Sửa category thành công",
      category: newCategory,
    });
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
    if (!category) throw new BadRequestError("Slug không tồn tại");
    if (category._count.product > 0)
      throw new BadRequestError("Category đã được sử dụng");
    const deleteCategory = await prisma.category.delete({
      where: { id },
    });
    return res.status(200).json({
      message: "Xoá category thành công",
      category: deleteCategory,
    });
  }
}

export default CategoryController;
