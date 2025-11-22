import cookieParser from "cookie-parser";
import express, { Request, Response } from "express";
import config from "config";
import { globalErrorHandler } from "./common/middlewares/globalErrorHandler";
import categoryRouter from "./categories/category-router";
import productRouter from "./product/product-router";
import toppingRouter from "./topping/topping-router";

const app = express();
app.use(express.json());
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
    res.send(`Running catalog service: PORT ${config.get("server.port")}`);
});

app.use("/categories", categoryRouter);
app.use("/product", productRouter);
app.use("/topping", toppingRouter);

app.use(globalErrorHandler);

export default app;
