import "dotenv/config";
import express from "express";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import { answerQuestion } from "./answer.js";

const app = express();
const PORT = Number(process.env.PORT ?? 3001);
const ORIGIN = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";

app.use(cors({ origin: ORIGIN }));
app.use(express.json({ limit: "10kb" }));
app.use("/api/", rateLimit({ windowMs: 60_000, limit: 20 }));

const AskBody = z.object({
  question: z.string().trim().min(3).max(500),
  types: z.array(z.enum(["doc", "ticket", "chat"])).optional(),
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/ask", async (req, res) => {
  const parsed = AskBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request: question must be 3-500 characters." });
  }
  try {
    res.json(await answerQuestion(parsed.data.question, parsed.data.types));
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: "The answer service failed. Try again." });
  }
});

app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));