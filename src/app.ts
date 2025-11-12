import express, { Request, Response } from "express";
import { globalErrorHandler } from "./common/middlewares/globalErrorHandler";
import config from "config";

const app = express();

app.get("/", (req: Request, res: Response) => {
    const port: string = config.get("server.port");
    res.send(`server port: ${port}`);
});

app.use(globalErrorHandler);

export default app;
