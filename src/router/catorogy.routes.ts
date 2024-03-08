import { Router } from "express";
import CategoryController from "../controllers/category.controller";
import validateResource from "../middleware/validateResource";
import { requiredAuth } from "../middleware/requiredAuth";
import checkCSRF from "../middleware/checkCSRF";
import checkPermission from "../middleware/checkPermission";
import {
  createCategoryValidation,
  deleteCategoryValidation,
  editCategoryValidation,
  getCategoryValidation,
} from "../validations/category.validations";

class CategoryRoutes {
  routes = Router();
  private controller = new CategoryController();
  constructor() {
    this.intializeRoutes();
  }
  private intializeRoutes() {
    this.routes.patch(
      "/:id",
      validateResource(editCategoryValidation),
      requiredAuth,
      checkCSRF,
      checkPermission(["ADMIN", "MANAGER"]),
      this.controller.editCategory
    );
    this.routes.delete(
      "/:id",
      validateResource(deleteCategoryValidation),
      requiredAuth,
      checkCSRF,
      checkPermission(["ADMIN", "MANAGER"]),
      this.controller.deleteCategory
    );
    this.routes.get(
      "/:id",
      validateResource(getCategoryValidation),
      this.controller.getCategoryById
    );
    this.routes.post(
      "/",
      validateResource(createCategoryValidation),
      requiredAuth,
      checkCSRF,
      checkPermission(["ADMIN", "MANAGER"]),
      this.controller.createCategory
    );
    this.routes.get("/", this.controller.getAllCategory);
  }
}

export default new CategoryRoutes().routes;
