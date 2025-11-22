import express from "express";
import logger from "../config/logger";
import { ProductController } from "./product-controller";
import { ProductService } from "./product-service";
import authenticate from "../common/middlewares/authenticate";
import { canAccess } from "../common/middlewares/canAccess";
import { Roles } from "../common/types";
import createProductValidator from "./create-product-validator";
import { asyncWrapper } from "../common/utils/wrapper";
import { CloudinaryStorage } from "../common/services/cloudinary";
import fileUpload from "express-fileupload";
import createHttpError from "http-errors";
import updateProductValidator from "./update-product-validator";

const router = express.Router();

const productService = new ProductService();
const cloudinaryService = new CloudinaryStorage();

const productController = new ProductController(
    productService,
    logger,
    cloudinaryService,
);

router.post(
    "/",
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    fileUpload({
        limits: { fileSize: 1024 * 500 },
        abortOnLimit: true,
        limitHandler: (req, res, next) => {
            const error = createHttpError(400, "File size exceeds the limit");
            next(error);
        },
    }),
    createProductValidator,
    asyncWrapper(productController.create),
);

router.put(
    "/:productId",
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    fileUpload({
        limits: { fileSize: 1024 * 500 },
        abortOnLimit: true,
        limitHandler: (req, res, next) => {
            const error = createHttpError(400, "File size exceeds the limit");
            next(error);
        },
    }),
    updateProductValidator,
    asyncWrapper(productController.update),
);

router.get("/" , asyncWrapper(productController.getAll));

export default router;
