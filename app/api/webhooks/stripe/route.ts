import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createBrowserClient } from '@supabase/ssr';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature') as string;

  let event;

  try {
    // This verifies the message actually came from Stripe and not a hacker
    event = stripe.webhooks.constructEvent(
      payload, 
      signature, 
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed.", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  // If the invoice was paid, update the vault
  if (event.type === 'invoice.paid') {
    const invoice = event.data.object as Stripe.Invoice;

    console.log(`Invoice ${invoice.id} paid! Updating vault...`);

    const { error } = await supabase
      .from('invoices')
      .update({ status: 'paid' })
      .eq('stripe_invoice_id', invoice.id);

    if (error) {
      console.error("Error updating vault:", error);
    } else {
      console.log("Vault successfully updated to PAID.");
    }
  }

  return NextResponse.json({ received: true });
}