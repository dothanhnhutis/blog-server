import { Response, Request } from "express";
import {
  CreatePostInput,
  EditPostInput,
  QueryPostInput,
} from "../validations/post.validations";
import prisma from "../utils/db";
import { isBase64DataURL, uploadImageCloudinary } from "../utils/image";
import {
  NotFoundError,
  BadRequestError,
  PermissionError,
} from "../error-handler";
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

  async editPostById(
    req: Request<EditPostInput["params"], {}, EditPostInput["body"]>,
    res: Response
  ) {
    const { role } = req.currentUser!;
    const { id } = req.params;
    const { slug, tagId, authorId, image } = req.body;

    const existPost = await prisma.post.findUnique({ where: { id } });
    if (!existPost) throw new BadRequestError("Bài viết không tồn tại");

    if (slug) {
      const slugExist = await prisma.post.findFirst({
        where: { slug: slug, id: { not: id } },
      });
      if (slugExist) throw new BadRequestError("Slug đã được sử dụng");
    }

    if (tagId) {
      const tagExist = await prisma.tag.findUnique({ where: { id: tagId } });
      if (!tagExist) throw new BadRequestError("Tag không tồn tại");
    }

    if (authorId) {
      const roles: Role[] = ["ADMIN", "MANAGER", "WRITER"];
      const authorExist = await prisma.user.findUnique({
        where: { id: authorId },
      });
      if (!authorExist) throw new BadRequestError("Author không tồn tại");
      if (
        !roles.includes(authorExist.role) ||
        (role == "MANAGER" && authorExist.role == "ADMIN")
      )
        throw new PermissionError();
    }

    if (image && isBase64DataURL(image)) {
      const { secure_url } = await uploadImageCloudinary(image);
      req.body.image = secure_url;
    }

    await prisma.post.update({
      where: { id },
      data: req.body,
    });
    return res.send({ message: "Sửa bài viết thành công" });
  }

  async createPost(
    req: Request<{}, {}, CreatePostInput["body"]>,
    res: Response
  ) {
    const { slug, tagId, authorId, image } = req.body;

    const slugExist = await prisma.post.findUnique({ where: { slug } });
    if (slugExist) throw new BadRequestError("Slug đã được sử dụng");

    const tagExist = await prisma.tag.findUnique({ where: { id: tagId } });
    if (!tagExist) throw new BadRequestError("Tag không tồn tại");

    const authorExist = await prisma.user.findUnique({
      where: { id: authorId },
    });

    if (isBase64DataURL(image)) {
      const { secure_url } = await uploadImageCloudinary(image);
      req.body.image = secure_url;
    }

    if (!authorExist) throw new BadRequestError("Author không tồn tại");

    await prisma.post.create({ data: req.body });

    return res.status(201).send({ message: "Tạo bài viết thành công" });
  }

  async queryBlog(
    req: Request<{}, {}, {}, QueryPostInput["query"]>,
    res: Response
  ) {
    const { page, tag } = req.query;
    const currPage = parseInt(page ?? "1");
    const take = QUERY_POST_TAKE;
    const skip = (currPage - 1) * QUERY_POST_TAKE;

    const total = await prisma.post.count({
      where: {
        tag: { slug: tag },
        isActive: true,
        publishAt: {
          lte: new Date(),
        },
      },
    });

    const posts = await prisma.post.findMany({
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
        image: true,
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

    const postsRes = posts.map(({ contentText, ...blog }) => {
      return {
        ...blog,
        shortContent: contentText.substring(0, 150),
      };
    });

    return res.send({
      posts: postsRes,
      metadata: {
        hasNextPage: skip + take < total,
        totalPage: Math.ceil(total / take),
      },
    });
  }

  async getAllBlog(req: Request, res: Response) {
    const { id, role } = req.currentUser!;
    if (role == "ADMIN") {
      const posts = await prisma.post.findMany({
        select: {
          id: true,
          image: true,
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
      return res.send(posts);
    } else if (role == "MANAGER") {
      const posts = await prisma.post.findMany({
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
          image: true,
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
      return res.send(posts);
    } else {
      const posts = await prisma.post.findMany({
        where: {
          author: {
            id,
          },
        },
        select: {
          id: true,
          slug: true,
          image: true,
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
      return res.send(posts);
    }
  }

  async getBlogByIdOrSlug(req: Request<{ idOrSlug: string }>, res: Response) {
    const { idOrSlug } = req.params;
    const existBlog = await prisma.post.findFirst({
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
