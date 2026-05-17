import express, { type Application, type Request, type Response } from "express";
import cors from "cors";
import morgan from "morgan";
import errorHandler from "./middlewares/error.middleware.js";

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.use(async (req, res, next) => {
  try {
    const { default: routes } = await import("./routes/index.js");

    if (req.path.startsWith("/api")) {
      req.url = req.url.replace(/^\/api(?=\/|$)/, "") || "/";
    }

    routes(req, res, next);
  } catch (error) {
    next(error);
  }
});

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Not found" });
});

app.use(errorHandler);

export default app;
