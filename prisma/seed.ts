import { Role } from "@prisma/client";
import prisma from "../src/utils/db";
import { hashData } from "../src/utils/helper";

const tagsData = [
  {
    name: "Gia Công",
    slug: "gia-cong",
  },
  {
    name: "Làm Đẹp",
    slug: "lam-dep",
  },
  {
    name: "Tuyển Dụng",
    slug: "tuyen-dung",
  },
  {
    name: "Kiến Thức Kinh Doanh",
    slug: "kien-thuc-kinh-doan",
  },
  {
    name: "Hướng Dẫn",
    slug: "huong-dan",
  },
];

const categoriesDate = [
  {
    name: "Chăm Sóc Body",
    slug: "cham-soc-body",
  },
  {
    name: "Chăm Sóc Cá Nhân",
    slug: "cham-soc-ca-nhan",
  },
  {
    name: "Chăm Sóc Da",
    slug: "cham-soc-da",
  },
  {
    name: "Chăm Sóc Tóc",
    slug: "cham-soc-toc",
  },
  {
    name: "Chăm Sóc Gia Đình",
    slug: "cham-soc-gia-dinh",
  },
  {
    name: "Nước Hoa",
    slug: "nuoc-hoa",
  },
  {
    name: "Trang Điểm",
    slug: "trang-diem",
  },
];

const usersData: {
  email: string;
  password: string;
  name: string;
  role: Role;
  isActive: boolean;
}[] = [
  {
    email: "gaconght001@gmail.com",
    password: hashData("@Abc123123"),
    name: "Admin",
    role: "ADMIN",
    isActive: true,
  },
];

async function seed() {
  // reset data
  // await prisma.otp.deleteMany();
  await prisma.image.deleteMany();
  await prisma.post.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();
  // init data
  await prisma.user.create({
    data: {
      email: "gaconght001@gmail.com",
      password: hashData("@Abc123123"),
      name: "Admin",
      role: "ADMIN",
      isActive: true,
    },
  });
  await prisma.tag.createMany({ data: tagsData });
  await prisma.category.createMany({ data: categoriesDate });
  // const user = await prisma.user.findUnique({
  //   where: { email: "gaconght001@gmail.com" },
  // });
  // const tag = await prisma.tag.findUnique({ where: { slug: "lam-dep" } });
  // await prisma.post.create({
  //   data: {
  //     title: "sss",
  //     slug: "sss",
  //     image: "",
  //     publishAt: "2023-12-19T08:05:22.897Z",
  //     authorId: user!.id,
  //     tagId: tag!.id,
  //     contentText: "",
  //     contentJson: JSON.stringify({
  //       type: "doc",
  //       content: [
  //         {
  //           type: "paragraph",
  //           attrs: {
  //             textAlign: "left",
  //           },
  //         },
  //       ],
  //     }),
  //     contentHTML: "<p></p>",
  //   },
  // });
  // const category = await prisma.category.findUnique({
  //   where: { slug: "cham-soc-co-the" },
  // });
  // await prisma.product.create({
  //   data: {
  //     productName: "sss",
  //     code: "sss",
  //     images: [],
  //     description: "",
  //     slug: "s-s-s",
  //     benefits: ["1", "2", "3"],
  //     ingredients: ["4", "5", "6"],
  //     createdById: user!.id,
  //     categoryId: category!.id,
  //     contentText: "",
  //     contentJson: JSON.stringify({
  //       type: "doc",
  //       content: [
  //         {
  //           type: "paragraph",
  //           attrs: {
  //             textAlign: "left",
  //           },
  //         },
  //       ],
  //     }),
  //     contentHTML: "<p></p>",
  //   },
  // });
}

seed();
