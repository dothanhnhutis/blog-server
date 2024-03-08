import { Response, Request } from "express";
import {
  CreateBlogInput,
  EditBlogInput,
  QueryBlogInput,
} from "../validations/blog.validations";
import prisma from "../utils/db";
import { BadRequestError } from "../errors/bad-request-error";
import { isBase64DataURL, uploadImageCloudinary } from "../utils/image";
import { NotFoundError } from "../errors/not-found-error";
import { Role } from "../validations/user.validations";
const QUERY_POST_TAKE = 12;

export default class PostController {
  // async deleteBlogByID(req: Request<DeleteBlogInput["params"]>, res: Response) {
  //   const { slug } = req.params;
  //   const blog = await prisma.blog.delete({
  //     where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
  //   });
  //   return res.send(blog);
  // }

  async editBlogById(
    req: Request<EditBlogInput["params"], {}, EditBlogInput["body"]>,
    res: Response
  ) {
    const { role } = res.locals.user!;
    const { id } = req.params;
    const { slug, tagId, authorId, thumnail } = req.body;

    const existBlog = await prisma.blog.findUnique({ where: { id } });
    if (!existBlog) throw new BadRequestError("Blog not found");

    if (slug) {
      const slugExist = await prisma.blog.findFirst({
        where: { slug: slug, id: { not: id } },
      });
      if (slugExist) throw new BadRequestError("Slug has been used");
    }

    if (tagId) {
      const tagExist = await prisma.tag.findUnique({ where: { id: tagId } });
      if (!tagExist) throw new BadRequestError("Tagid invalid");
    }

    if (authorId) {
      const roles: Role[] = ["ADMIN", "MANAGER", "WRITER"];
      const authorExist = await prisma.user.findUnique({
        where: { id: authorId },
      });
      if (!authorExist) throw new BadRequestError("authorId invalid");
      if (role == "MANAGER" && authorExist.role == "ADMIN")
        throw new BadRequestError(
          "You do not have the right to edit the author for someone with higher authority than you"
        );
      if (!roles.includes(authorExist.role))
        throw new BadRequestError("Author not permission");
    }

    if (thumnail && isBase64DataURL(thumnail)) {
      const { secure_url } = await uploadImageCloudinary(thumnail);
      req.body.thumnail = secure_url;
    }

    await prisma.blog.update({
      where: { id },
      data: req.body,
    });
    return res.send({ message: "Edit blog success" });
  }

  async createPost(
    req: Request<{}, {}, CreateBlogInput["body"]>,
    res: Response
  ) {
    const { slug, tagId, authorId, thumnail } = req.body;

    const slugExist = await prisma.blog.findUnique({ where: { slug } });
    if (slugExist) throw new BadRequestError("slug has been used");

    const tagExist = await prisma.tag.findUnique({ where: { id: tagId } });
    if (!tagExist) throw new BadRequestError("tagId invalid");

    const authorExist = await prisma.user.findUnique({
      where: { id: authorId },
    });

    if (isBase64DataURL(thumnail)) {
      const { secure_url } = await uploadImageCloudinary(thumnail);
      req.body.thumnail = secure_url;
    }

    if (!authorExist) throw new BadRequestError("authorId invalid");

    await prisma.blog.create({ data: req.body });

    return res.status(201).send({ message: "Create blog success" });
  }

  async queryBlog(
    req: Request<{}, {}, {}, QueryBlogInput["query"]>,
    res: Response
  ) {
    const { page, tag } = req.query;
    const currPage = parseInt(page ?? "1");
    const take = QUERY_POST_TAKE;
    const skip = (currPage - 1) * QUERY_POST_TAKE;

    const total = await prisma.blog.count({
      where: {
        tag: { slug: tag },
        isActive: true,
        publishAt: {
          lte: new Date(),
        },
      },
    });

    const blogs = await prisma.blog.findMany({
      where: {
        tag: { slug: tag },
        isActive: true,
        publishAt: {
          lte: new Date(),
        },
      },
      take,
      skip,
      select: {
        id: true,
        slug: true,
        thumnail: true,
        title: true,
        publishAt: true,
        contentText: true,
        tag: {
          select: {
            slug: true,
            name: true,
          },
        },
      },
      orderBy: {
        publishAt: "desc",
      },
    });

    const blogsRes = blogs.map(({ contentText, ...blog }) => {
      return {
        ...blog,
        shortContent: contentText.substring(0, 150),
      };
    });

    return res.send({
      blogs: blogsRes,
      metadata: {
        hasNextPage: skip + take < total,
        totalPage: Math.ceil(total / take),
      },
    });
  }

  async getAllBlog(req: Request, res: Response) {
    const { id, role } = res.locals.user!;
    if (role == "ADMIN") {
      const blogs = await prisma.blog.findMany({
        select: {
          id: true,
          thumnail: true,
          slug: true,
          title: true,
          tagId: true,
          authorId: true,
          isActive: true,
          publishAt: true,
          author: {
            select: {
              name: true,
              avatarUrl: true,
            },
          },
          tag: {
            select: {
              slug: true,
              name: true,
            },
          },
        },
      });
      return res.send(blogs);
    } else if (role == "MANAGER") {
      const blogs = await prisma.blog.findMany({
        where: {
          OR: [
            {
              author: {
                id,
              },
            },
            {
              author: {
                role: "WRITER",
              },
            },
          ],
        },
        select: {
          id: true,
          thumnail: true,
          slug: true,
          title: true,
          tagId: true,
          authorId: true,
          isActive: true,
          publishAt: true,
          author: {
            select: {
              name: true,
              avatarUrl: true,
            },
          },
          tag: {
            select: {
              slug: true,
              name: true,
            },
          },
        },
      });
      return res.send(blogs);
    } else {
      const blogs = await prisma.blog.findMany({
        where: {
          author: {
            id,
          },
        },
        select: {
          id: true,
          slug: true,
          thumnail: true,
          title: true,
          tagId: true,
          authorId: true,
          isActive: true,
          publishAt: true,
          author: {
            select: {
              name: true,
              avatarUrl: true,
            },
          },
          tag: {
            select: {
              slug: true,
              name: true,
            },
          },
        },
      });
      return res.send(blogs);
    }
  }

  async getBlogByIdOrSlug(req: Request<{ idOrSlug: string }>, res: Response) {
    const { idOrSlug } = req.params;
    const existBlog = await prisma.blog.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
      include: {
        author: {
          select: {
            name: true,
            avatarUrl: true,
          },
        },
        tag: {
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
}
