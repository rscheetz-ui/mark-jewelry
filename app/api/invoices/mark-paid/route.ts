import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// Standard vault connection for backend API
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export async function POST(request: Request) {
  try {
    const { vaultInvoiceId, stripeInvoiceId } = await request.json();

    // 1. Command Stripe to close the ledger manually (Stops all reminder emails)
    await stripe.invoices.pay(stripeInvoiceId, {
      paid_out_of_band: true,
    });

    // 2. Immediately update your local Relational Card to green
    const { error } = await supabase
      .from('invoices')
      .update({ status: 'paid' })
      .eq('id', vaultInvoiceId);

    if (error) throw new Error('Stripe closed the invoice, but the local vault failed to update.');

    return NextResponse.json({ success: true, message: 'Ledger reconciled manually.' });

  } catch (error: any) {
    console.error("Manual Override Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}