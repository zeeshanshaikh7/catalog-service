import paginate from "mongoose-paginate-v2";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";
// https://github.com/aravindnc/mongoose-paginate-v2
// https://github.com/aravindnc/mongoose-aggregate-paginate-v2
import mongoose from "mongoose";
import { Product } from "./product-types";

const attributeValueSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
    },
});

const priceConfigurationSchema = new mongoose.Schema({
    priceType: {
        type: String,
        enum: ["base", "aditional"],
    },
    availableOptions: {
        type: Map,
        of: Number,
    },
});

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: true,
        },
        priceConfiguration: {
            type: Map,
            of: priceConfigurationSchema,
        },
        attributes: [attributeValueSchema],
        tenantId: {
            type: String,
            required: true,
        },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
        },
        isPublish: {
            type: Boolean,
            required: false,
            default: false,
        },
    } as any,
    { timestamps: true },
);

productSchema.plugin(paginate);
productSchema.plugin(aggregatePaginate);

export default mongoose.model<
    Product,
    mongoose.AggregatePaginateModel<Product>
>("Product", productSchema);

// export default mongoose.model("Product", productSchema);
