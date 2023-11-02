import { RequestHandler as Middleware } from "express";
import { verifyJWT } from "../utils/jwt";
import prisma from "../utils/db";
type UserAuth = {
  id: string;
  email: string;
  role: "ADMIN" | "POSTER" | "SUBSCRIBER";
  status: string;
};

declare global {
  namespace Express {
    interface Locals {
      currentUser?: UserAuth;
    }
  }
}

export const deserializeUser: Middleware = async (req, res, next) => {
  const accessToken = (
    req.headers.authorization ||
    req.header("Authorization") ||
    ""
  ).replace(/^Bearer\s/, "");
  if (!accessToken) return next();
  const decoded = verifyJWT<UserAuth>(
    accessToken,
    process.env.JWT_SECRET ?? ""
  );
  if (decoded) {
    const user = await prisma.user.findFirst({
      where: { id: decoded.id, status: "ACTIVE" },
    });
    if (user) {
      res.locals.currentUser = {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
      };
    }
  }

  return next();
};
