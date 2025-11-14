import { asyncWrapper } from "./../common/utils/wrapper";
import { CategoryService } from "./categoy-service";
import express from "express";
import { CategoryController } from "./category-controller";
import categoryValidator from "./category-validator";
import logger from "../config/logger";
import authenticate from "../common/middlewares/authenticate";
import { canAccess } from "../common/middlewares/canAccess";

const router = express.Router();

const categoryService = new CategoryService();

const categoryController = new CategoryController(categoryService, logger);

router.post(
    "/",
    authenticate,
    canAccess("admin"),
    categoryValidator,
    asyncWrapper(categoryController.create),
);

export default router;
