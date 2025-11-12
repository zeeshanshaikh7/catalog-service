import express, { Request, Response } from "express";
import { globalErrorHandler } from "./common/middlewares/globalErrorHandler";

const app = express();

app.get("/", (req: Request, res: Response) => {
    res.send(`Running catalog service`);
});

app.use(globalErrorHandler);

export default app;
