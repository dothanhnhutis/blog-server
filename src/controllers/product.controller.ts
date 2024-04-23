import { Request, Response } from "express";
import {
  CreateProductInput,
  EditProductInput,
  QueryProductInput,
} from "../validations/product.validations";
import prisma from "../utils/db";
import { BadRequestError, NotFoundError } from "../error-handler";
import { isBase64DataURL, isUrl, uploadImageCloudinary } from "../utils/image";
const QUERY_PRODUCT_TAKE: number = 12;

class ProductController {
  async createProduct(
    req: Request<{}, {}, CreateProductInput["body"]>,
    res: Response
  ) {
    const { id } = req.currentUser!;
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

    const newProduct = await prisma.product.create({
      data: { ...req.body, createdById: id },
    });
    return res
      .status(201)
      .json({ message: "Tạo sản phẩm thành công", product: newProduct });
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
    return res.status(200).json(existBlog);
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

    return res.status(200).json(blogs);
  }

  async queryProduct(
    req: Request<{}, {}, {}, QueryProductInput["query"]>,
    res: Response
  ) {
    const { page, category, limit } = req.query;
    const currPage = parseInt(page ?? "1");
    const take = limit ? parseInt(limit) : QUERY_PRODUCT_TAKE;
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
        createdAt: "desc",
      },
    });

    const productsRes = products.map(({ contentText, images, ...blog }) => {
      return {
        ...blog,
        image: images[0],
        shortContent: contentText.substring(0, 150),
      };
    });

    return res.status(200).json({
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
    if (!productExist) throw new BadRequestError("Sản phẩm không tìm thấy");

    if (data.slug) {
      const slugExist = await prisma.product.findFirst({
        where: { slug: data.slug, id: { not: id } },
      });
      if (slugExist) throw new BadRequestError("Slug đã được sử dụng");
    }

    if (data.code) {
      const slugExist = await prisma.product.findFirst({
        where: { slug: data.code, id: { not: id } },
      });
      if (slugExist) throw new BadRequestError("Code đã được sử dụng");
    }

    if (data.categoryId) {
      const tagExist = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });
      if (!tagExist) throw new BadRequestError("Category không tồn tại");
    }

    if (data.images) {
      let imagesUrl: string[] = [];
      for (let image of data.images) {
        if (isBase64DataURL(image)) {
          const { secure_url } = await uploadImageCloudinary(image);
          imagesUrl.push(secure_url);
        } else if (isUrl(image)) {
          imagesUrl.push(image);
        }
      }
      data.images = imagesUrl;
    }

    const newProduct = await prisma.product.update({
      where: { id },
      data,
    });
    return res
      .status(200)
      .json({ message: "Sửa sản phẩm thành công", product: newProduct });
  }
}

export default ProductController;
