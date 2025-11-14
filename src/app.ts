import cookieParser from "cookie-parser";
import express, { Request, Response } from "express";
import { globalErrorHandler } from "./common/middlewares/globalErrorHandler";
import categoryRouter from "./categories/category-router";

const app = express();
app.use(express.json());
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
    res.send(`Running catalog service`);
});

app.use("/categories", categoryRouter);

app.use(globalErrorHandler);

export default app;
