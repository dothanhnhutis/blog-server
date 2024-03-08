import { Request, Response } from "express";
import {
  CreateProductInput,
  EditProductInput,
  QueryProductInput,
} from "../validations/product.validations";
import prisma from "../utils/db";
import { BadRequestError } from "../errors/bad-request-error";
import { NotFoundError } from "../errors/not-found-error";
import { isBase64DataURL, uploadImageCloudinary } from "../utils/image";
const QUERY_PRODUCT_TAKE = 12;

class ProductController {
  async createProduct(
    req: Request<{}, {}, CreateProductInput["body"]>,
    res: Response
  ) {
    const { id } = res.locals.user!;
    const { slug, code, categoryId } = req.body;
    const checkSlug = await prisma.product.findUnique({ where: { slug } });
    if (checkSlug) throw new BadRequestError("slug is exist");
    const checkCode = await prisma.product.findUnique({ where: { code } });
    if (checkCode) throw new BadRequestError("code is exist");
    const checkCategory = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!checkCategory) throw new BadRequestError("invalid category");

    let imagesUrl: string[] = [];
    for (let image of req.body.images) {
      if (isBase64DataURL(image)) {
        const { secure_url } = await uploadImageCloudinary(image);
        imagesUrl.push(secure_url);
      }
    }
    req.body.images = imagesUrl;

    await prisma.product.create({
      data: { ...req.body, createdById: id },
    });
    return res.send({ message: "create product success" });
  }

  async getProductByIdOrSlug(
    req: Request<{ idOrSlug: string }>,
    res: Response
  ) {
    const { idOrSlug } = req.params;
    const existBlog = await prisma.product.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
      include: {
        category: {
          select: {
            slug: true,
            name: true,
          },
        },
      },
    });
    if (!existBlog) throw new NotFoundError();
    return res.send(existBlog);
  }

  async getAllProduct(req: Request, res: Response) {
    const blogs = await prisma.product.findMany({
      select: {
        id: true,
        productName: true,
        slug: true,
        code: true,
        categoryId: true,
        createdById: true,
        isActive: true,
        category: {
          select: {
            slug: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            email: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    return res.send(blogs);
  }

  async queryProduct(
    req: Request<{}, {}, {}, QueryProductInput["query"]>,
    res: Response
  ) {
    const { page, category } = req.query;
    const currPage = parseInt(page ?? "1");
    const take = QUERY_PRODUCT_TAKE;
    const skip = (currPage - 1) * take;

    const total = await prisma.product.count({
      where: {
        category: { slug: category },
        isActive: true,
      },
    });
    const products = await prisma.product.findMany({
      where: {
        category: { slug: category },
        isActive: true,
      },
      take,
      skip,
      select: {
        id: true,
        slug: true,
        images: true,
        productName: true,
        contentText: true,
        category: {
          select: {
            slug: true,
            name: true,
          },
        },
      },
      orderBy: {
        createAt: "desc",
      },
    });

    const productsRes = products.map(({ contentText, images, ...blog }) => {
      return {
        ...blog,
        thumnail: images[0],
        shortContent: contentText.substring(0, 150),
      };
    });

    return res.send({
      products: productsRes,
      metadata: {
        hasNextPage: skip + take < total,
        totalPage: Math.ceil(total / take),
      },
    });
  }

  async editProduct(
    req: Request<EditProductInput["params"], {}, EditProductInput["body"]>,
    res: Response
  ) {
    const { id } = req.params;
    const data = req.body;
    const productExist = await prisma.product.findUnique({ where: { id } });
    if (!productExist) throw new BadRequestError("Product not found");

    if (data.slug) {
      const slugExist = await prisma.product.findFirst({
        where: { slug: data.slug, id: { not: id } },
      });
      if (slugExist) throw new BadRequestError("Slug has been used");
    }

    if (data.code) {
      const slugExist = await prisma.product.findFirst({
        where: { slug: data.code, id: { not: id } },
      });
      if (slugExist) throw new BadRequestError("Code has been used");
    }

    if (data.categoryId) {
      const tagExist = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });
      if (!tagExist) throw new BadRequestError("Category not exist");
    }

    if (data.images) {
      let imagesUrl: string[] = [];
      for (let image of data.images) {
        if (isBase64DataURL(image)) {
          const { secure_url } = await uploadImageCloudinary(image);
          imagesUrl.push(secure_url);
        }
      }
      data.images = imagesUrl;
    }

    await prisma.product.update({
      where: { id },
      data,
    });
    return res.send({ message: "Edit product success" });
  }
}

export default ProductController;
