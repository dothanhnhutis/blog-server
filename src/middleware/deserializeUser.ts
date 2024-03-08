import { RequestHandler as Middleware } from "express";
import prisma from "../utils/db";

const deserializeUser: Middleware = async (req, res, next) => {
  const csrfToken = (
    req.get("Authorization") ||
    req.headers.authorization ||
    req.header("Authorization") ||
    ""
  ).replace(/^Bearer\s/, "");

  if (!csrfToken && !req.session.user) return next();
  if (csrfToken) {
    res.locals.csrf = csrfToken;
  }

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
    res.locals.user = currentUser;
  }
  return next();
};
export default deserializeUser;
