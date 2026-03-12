import { Handler } from "@netlify/functions";
import Razorpay from "razorpay";

const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

const razorpay = new Razorpay({
  key_id: razorpayKeyId || "rzp_test_placeholder",
  key_secret: razorpayKeySecret || "placeholder_secret",
});

export const handler: Handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    if (!razorpayKeyId) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Razorpay Key ID is not configured on the server." }),
      };
    }

    const options = {
      amount: 19900, // Amount in paise (199 INR)
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        id: order.id,
        amount: order.amount,
        key_id: razorpayKeyId,
      }),
    };
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to create order. Check your Razorpay credentials." }),
    };
  }
};
