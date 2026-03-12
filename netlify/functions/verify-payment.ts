import { Handler } from "@netlify/functions";
import crypto from "crypto";

export const handler: Handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = JSON.parse(event.body || "{}");

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "placeholder_secret")
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      const telegramLink = process.env.TELEGRAM_LINK || "https://t.me/joinchat/placeholder";
      console.log("Payment verified successfully. Returning link:", telegramLink);
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          success: true, 
          telegram_link: telegramLink 
        }),
      };
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, message: "Invalid signature" }),
      };
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
