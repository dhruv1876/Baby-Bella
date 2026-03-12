import express from "express";
import { createServer as createViteServer } from "vite";
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

if (!razorpayKeyId || !razorpayKeySecret) {
  console.warn("⚠️ RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing. Payment will not work.");
}

const razorpay = new Razorpay({
  key_id: razorpayKeyId || "rzp_test_placeholder",
  key_secret: razorpayKeySecret || "placeholder_secret",
});

// API Routes
app.post("/api/create-order", async (req, res) => {
  try {
    if (!razorpayKeyId) {
      return res.status(500).json({ error: "Razorpay Key ID is not configured on the server." });
    }

    const options = {
      amount: 19900, // Amount in paise (199 INR)
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json({
      id: order.id,
      amount: order.amount,
      key_id: razorpayKeyId,
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ error: "Failed to create order. Check your Razorpay credentials." });
  }
});

app.post("/api/verify-payment", async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSign = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "placeholder_secret")
    .update(sign.toString())
    .digest("hex");

  if (razorpay_signature === expectedSign) {
    // Payment verified
    res.json({ 
      success: true, 
      telegram_link: process.env.TELEGRAM_LINK || "https://t.me/joinchat/placeholder" 
    });
  } else {
    res.status(400).json({ success: false, message: "Invalid signature" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
