import { Router } from "express";
import user from "./user";
import auth from "./auth";
import otp from "./otp";
import tag from "./tag";

const router = Router();

router.use("/users", user);
router.use("/auth", auth);
router.use("/otp", otp);
router.use("/tags", tag);

export default router;
