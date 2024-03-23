import { Router } from "express";
import ProductController from "../controllers/product.controller";
import validateResource from "../middleware/validateResource";
import {
  createProductValidation,
  editProductValidation,
} from "../validations/product.validations";
import { requiredAuth } from "../middleware/requiredAuth";
import checkPermission from "../middleware/checkPermission";

class ProductRoutes {
  routes = Router();
  private controller = new ProductController();

  constructor() {
    this.intializeRoutes();
  }

  private intializeRoutes() {
    this.routes.post(
      "/",
      requiredAuth,

      checkPermission(["ADMIN", "MANAGER"]),
      validateResource(createProductValidation),
      this.controller.createProduct
    );
    this.routes.patch(
      "/:id",
      requiredAuth,

      checkPermission(["ADMIN", "MANAGER"]),
      validateResource(editProductValidation),
      this.controller.editProduct
    );

    this.routes.get("/query", this.controller.queryProduct);
    this.routes.get("/:idOrSlug", this.controller.getProductByIdOrSlug);
    this.routes.get(
      "/",
      requiredAuth,
      checkPermission(["ADMIN", "MANAGER"]),
      this.controller.getAllProduct
    );
  }
}

export default new ProductRoutes().routes;
