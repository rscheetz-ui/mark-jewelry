import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createBrowserClient } from '@supabase/ssr';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2026-04-22.dahlia', // Upgraded to your current SDK architecture
});

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export async function POST(request: Request) {
  try {
    // 2. Catch the data you send from your private RCSuite dashboard
    const { clientName, clientEmail, amount, description } = await request.json();

    // 3. Orchestrate Stripe: Create the Customer
    const customer = await stripe.customers.create({
      name: clientName,
      email: clientEmail,
    });

    // 4. Orchestrate Stripe: Create the Line Item (The charge)
    await stripe.invoiceItems.create({
      customer: customer.id,
      amount: amount * 100, // Stripe reads pennies, so $50.00 is 5000
      currency: 'usd',
      description: description || 'RCSuite Enterprise Orchestration',
    });

    // 5. Orchestrate Stripe: Generate and Finalize the Invoice
    const invoice = await stripe.invoices.create({
      customer: customer.id,
      collection_method: 'send_invoice',
      days_until_due: 7, // Standard luxury net-7 terms
    });

    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);

    // 6. The Ledger: Log the generated invoice into your Supabase vault
    const { error: dbError } = await supabase
      .from('invoices')
      .insert([
        {
          client_name: clientName,
          client_email: clientEmail,
          amount: amount,
          stripe_invoice_id: finalizedInvoice.id,
          stripe_payment_url: finalizedInvoice.hosted_invoice_url,
          status: 'outstanding',
        }
      ]);

    if (dbError) throw new Error('Database logging failed.');

    // 7. Return the secure payment link back to your dashboard
    return NextResponse.json({ 
      success: true, 
      paymentUrl: finalizedInvoice.hosted_invoice_url 
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}