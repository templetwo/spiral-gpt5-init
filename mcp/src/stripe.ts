import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  // Use the latest supported apiVersion for this SDK
  apiVersion: "2025-07-30.basil",
});

export async function createCheckoutSession(userId: string): Promise<string> {
  if (!process.env.STRIPE_PRICE_ID) {
    throw new Error("Missing STRIPE_PRICE_ID");
  }
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
    success_url: process.env.CHECKOUT_SUCCESS_URL || "http://localhost:8080/success",
    cancel_url: process.env.CHECKOUT_CANCEL_URL || "http://localhost:8080/cancel",
    metadata: { userId },
  });
  return session.url!;
}
