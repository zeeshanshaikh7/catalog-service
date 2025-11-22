/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Logger } from "winston";
import { UploadedFile } from "express-fileupload";
import { ProductService } from "./product-service";
import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { Filter, PaginateQuery, Product } from "./product-types";
import { v4 as uuidv4 } from "uuid";
import { FileStorage } from "../common/types/storage";
import { AuthRequest, Roles } from "../common/types";
import mongoose from "mongoose";

export class ProductController {
    constructor(
        private productService: ProductService,
        private logger: Logger,
        private storage: FileStorage,
    ) {}

    create = async (req: Request, res: Response, next: NextFunction) => {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }

        const image = req.files!.image as UploadedFile;
        const imageName = uuidv4();

        await this.storage.upload({
            filename: imageName,
            fileData: image.data.buffer as ArrayBuffer,
        });

        const {
            name,
            description,
            priceConfiguration,
            attributes,
            tenantId,
            categoryId,
            isPublish,
        } = req.body as {
            name: string;
            description: string;
            priceConfiguration: string;
            attributes: string;
            tenantId: string;
            categoryId: string;
            isPublish: boolean;
        };

        const product: Product = {
            name,
            description,
            priceConfiguration: JSON.parse(priceConfiguration),
            attributes: JSON.parse(attributes),
            tenantId,
            categoryId,
            isPublish,
            image: imageName,
        };

        const newProduct = await this.productService.createProduct(product);

        this.logger.info(`new product has been created`, product);

        // Send product to kafka.
        // todo: move topic name to the config

        res.json({ id: newProduct._id });
    };

    update = async (req: Request, res: Response, next: NextFunction) => {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }

        const { productId } = req.params;
        const product = await this.productService.getProduct(productId);

        if (!product) {
            return next(createHttpError(404, "Product not found"));
        }

        const tenant = (req as AuthRequest).auth.tenant;

        if (
            product.tenantId !== String(tenant) &&
            (req as AuthRequest).auth.role !== Roles.ADMIN
        ) {
            return next(createHttpError(403, "Forbidden"));
        }

        let imageName: string;
        if (req.files?.image) {
            const oldImage = product.image;

            const image = req.files.image as UploadedFile;
            imageName = uuidv4();

            await this.storage.upload({
                filename: imageName,
                fileData: image.data.buffer as ArrayBuffer,
            });

            await this.storage.delete(oldImage);
        } else {
            imageName = product.image;
        }

        const {
            name,
            description,
            priceConfiguration,
            attributes,
            tenantId,
            categoryId,
            isPublish,
        } = req.body as {
            name: string;
            description: string;
            priceConfiguration: string;
            attributes: string;
            tenantId: string;
            categoryId: string;
            isPublish: boolean;
        };

        const productData: Product = {
            name,
            description,
            priceConfiguration: JSON.parse(priceConfiguration),
            attributes: JSON.parse(attributes),
            tenantId,
            categoryId,
            isPublish,
            image: imageName,
        };

        await this.productService.updateProduct(productId, productData);

        this.logger.info(`product has been updated`, product);

        // Send product to kafka.
        // todo: move topic name to the config

        res.json({ id: productId });
    };

    getAll = async (req: Request, res: Response, next: NextFunction) => {
        const { q, tenantId, categoryId, isPublish, page, limit } = req.query;

        const filters: Filter = {};

        if (isPublish === "true") {
            filters.isPublish = true;
        }

        if (tenantId) filters.tenantId = tenantId as string;

        if (
            categoryId &&
            mongoose.Types.ObjectId.isValid(categoryId as string)
        ) {
            filters.categoryId = new mongoose.Types.ObjectId(
                categoryId as string,
            );
        }

        const paginateQuery: PaginateQuery = {
            page: parseInt(page as string) || 1,
            limit: parseInt(limit as string) || 10,
        };

        const products = await this.productService.getProducts(
            q as string,
            filters,
            paginateQuery,
        );

        const finalProduct = (products.data as Product[]).map((product) => {
            return {
                ...product,
                image: this.storage.getObjectUri(product.image),
            };
        });

        this.logger.info(`products has been fetched`);
        res.json({ ...products, data: finalProduct });
    };

    getSingleProduct = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        const { productId } = req.params;
        const product = await this.productService.getProduct(productId);
        if (!product) {
            return next(createHttpError(404, "Product not found"));
        }
        this.logger.info(`product has been fetched`, product);
        res.json(product);
    };

    deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
        const { productId } = req.params;

        const product = await this.productService.getProduct(productId);

        const tenant = (req as AuthRequest).auth.tenant;

        if (
            product?.tenantId !== String(tenant) &&
            (req as AuthRequest).auth.role !== Roles.ADMIN
        ) {
            return next(createHttpError(403, "Forbidden"));
        }

        const deletedProduct =
            await this.productService.deleteProduct(productId);

        if (!deletedProduct) {
            return next(createHttpError(404, "Product not found"));
        }

        const oldImage = deletedProduct.image;
        await this.storage.delete(oldImage);

        this.logger.info(`product has been deleted`, deletedProduct);
        res.json(deletedProduct);
    };
}
