import { Router } from "express";
import PostController from "../controllers/post.controller";
import { requiredAuth } from "../middleware/requiredAuth";
import checkPermission from "../middleware/checkPermission";
import validateResource from "../middleware/validateResource";
import {
  createPostValidation,
  deletePostValidation,
  editPostValidation,
  queryPostValidation,
} from "../validations/post.validations";

class PostRoutes {
  routes = Router();
  private controller = new PostController();
  constructor() {
    this.intializeRoutes();
  }
  private intializeRoutes() {
    this.routes.patch(
      "/:id",
      requiredAuth,

      checkPermission(["ADMIN", "MANAGER", "WRITER"]),
      validateResource(editPostValidation),
      this.controller.editPostById
    );
    this.routes.post(
      "/",
      requiredAuth,

      checkPermission(["ADMIN", "MANAGER", "WRITER"]),
      validateResource(createPostValidation),
      this.controller.createPost
    );
    this.routes.get(
      "/query",
      validateResource(queryPostValidation),
      this.controller.queryBlog
    );
    this.routes.get("/:idOrSlug", this.controller.getBlogByIdOrSlug);
    this.routes.get(
      "/",
      requiredAuth,
      checkPermission(["ADMIN", "MANAGER", "WRITER"]),
      this.controller.getAllBlog
    );
  }
}

export default new PostRoutes().routes;
