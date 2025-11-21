/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Logger } from "winston";
import { UploadedFile } from "express-fileupload";
import { ProductService } from "./product-service";
import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { Product } from "./product-types";
import { v4 as uuidv4 } from "uuid";
import { FileStorage } from "../common/types/storage";

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
}
