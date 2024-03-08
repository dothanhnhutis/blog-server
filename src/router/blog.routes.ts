import { Router } from "express";
import PostController from "../controllers/blog.controller";
import { requiredAuth } from "../middleware/requiredAuth";
import checkPermission from "../middleware/checkPermission";
import validateResource from "../middleware/validateResource";
import {
  createBlogValidation,
  deleteBlogValidation,
  editBlogValidation,
  queryBlogValidation,
} from "../validations/blog.validations";
import checkCSRF from "../middleware/checkCSRF";

class BlogRoutes {
  routes = Router();
  private controller = new PostController();
  constructor() {
    this.intializeRoutes();
  }
  private intializeRoutes() {
    this.routes.patch(
      "/:id",
      requiredAuth,
      checkCSRF,
      checkPermission(["ADMIN", "MANAGER", "WRITER"]),
      validateResource(editBlogValidation),
      this.controller.editBlogById
    );
    this.routes.post(
      "/",
      requiredAuth,
      checkCSRF,
      checkPermission(["ADMIN", "MANAGER", "WRITER"]),
      validateResource(createBlogValidation),
      this.controller.createPost
    );
    this.routes.get(
      "/query",
      validateResource(queryBlogValidation),
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

export default new BlogRoutes().routes;
