import { RequestHandler as Middleware } from "express";
import prisma from "../utils/db";

const deserializeUser: Middleware = async (req, res, next) => {
  if (!req.session.user) return next();

  if (req.session.user) {
    const currentUser = await prisma.user.findUnique({
      where: { id: req.session.user.id, isActive: true },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        role: true,
        avatarUrl: true,
      },
    });
    if (currentUser) req.currentUser = currentUser;
  }
  return next();
};
export default deserializeUser;
