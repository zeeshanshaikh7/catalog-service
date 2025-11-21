import mongoose from "mongoose";

export interface AttributeValue {
    name?: string;
    value?: any;
}

export interface PriceConfiguration {
    priceType?: "base" | "aditional";
    availableOptions?: Map<string, number>;
}

export interface Product {
    _id?: mongoose.Types.ObjectId;
    name: string;
    description: string;
    priceConfiguration?: Map<string, PriceConfiguration>;
    attributes?: AttributeValue[];
    tenantId: string;
    categoryId?: string;
    image: string;
    isPublish?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface Filter {
    tenantId?: string;
    categoryId?: mongoose.Types.ObjectId;
    isPublish?: boolean;
}

export interface PaginateQuery {
    page: number;
    limit: number;
}

export enum ProductEvents {
    PRODUCT_CREATE = "PRODUCT_CREATE",
    PRODUCT_UPDATE = "PRODUCT_UPDATE",
    PRODUCT_DELETE = "PRODUCT_DELETE",
}
