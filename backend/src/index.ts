import express from "express";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { config } from "./config.js";
import { reportsRouter } from "./routes/reports.js";

const app = express();
app.set("trust proxy", 1);

app.use(helmet());
app.use(pinoHttp());
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/reports", reportsRouter);

// 🔑 IMPORTANT: Render provides PORT dynamically
const port = Number(process.env.PORT ?? config.PORT ?? 8080);

app.listen(port, "0.0.0.0", () => {
  console.log(`API listening on ${port}`);
});
