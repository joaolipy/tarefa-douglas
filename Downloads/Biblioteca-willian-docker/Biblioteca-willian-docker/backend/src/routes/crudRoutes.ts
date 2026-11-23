import { Router } from "express";
import type { CrudController } from "../controllers/CrudController";

export function crudRoutes<TRecord, TCreate, TUpdate>(
  controller: CrudController<TRecord, TCreate, TUpdate>,
): Router {
  const router = Router();
  router.get("/", controller.list);
  router.get("/:id", controller.getById);
  router.post("/", controller.create);
  router.put("/:id", controller.update);
  router.delete("/:id", controller.remove);
  return router;
}
