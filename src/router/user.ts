import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.send({
    message: "oke",
  });
});

export default router;
