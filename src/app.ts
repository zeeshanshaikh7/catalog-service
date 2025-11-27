import cookieParser from "cookie-parser";
import express, { Request, Response } from "express";
import config from "config";
import { globalErrorHandler } from "./common/middlewares/globalErrorHandler";
import categoryRouter from "./categories/category-router";
import productRouter from "./product/product-router";
import toppingRouter from "./topping/topping-router";
// import cors from "cors";

const app = express();
app.use(express.json());
// const ALLOWED_DOMAINS = [
//     config.get("frontend.clientUI"),
//     config.get("frontend.adminUI"),
// ];
// app.use(
//     cors({
//         origin: ALLOWED_DOMAINS as string[],
//         credentials: true,
//     }),
// );
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
    res.send(`Running catalog service: PORT ${config.get("server.port")}`);
});

app.use("/categories", categoryRouter);
app.use("/products", productRouter);
app.use("/toppings", toppingRouter);

app.use(globalErrorHandler);

export default app;
