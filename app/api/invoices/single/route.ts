import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createBrowserClient } from '@supabase/ssr';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export async function POST(request: Request) {
  try {
    const { clientId, amount, description } = await request.json();
    console.log("Vault Payload Received:", { clientId, amount, description });

    // 1. Pull the specific entity from the vault
    const { data: client, error: fetchError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (fetchError || !client) throw new Error('Entity not found in vault.');

    // 2. Ensure they exist in Stripe
    let stripeCustomerId = client.stripe_customer_id;
    
    if (!stripeCustomerId) {
      const newCustomer = await stripe.customers.create({
        name: client.entity_name,
        email: client.contact_email,
      });
      stripeCustomerId = newCustomer.id;
      
      await supabase
        .from('clients')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', clientId);
    }

    const finalAmountInCents = Math.round(Number(amount) * 100); 

    // 3. ARCHITECTURE SHIFT: Create the empty Invoice container FIRST
    const invoice = await stripe.invoices.create({
      customer: stripeCustomerId,
      collection_method: 'send_invoice',
      days_until_due: 7, 
    });

    console.log(`Invoice Container Created: ${invoice.id}. Bolting ${finalAmountInCents} cents to it.`);

    // 4. Create the Line Item and EXPLICITLY attach it to the new Invoice ID
    await stripe.invoiceItems.create({
      customer: stripeCustomerId,
      invoice: invoice.id, // <-- This is the master key. It forces the money onto the bill.
      amount: finalAmountInCents, 
      currency: 'usd',
      description: description || 'RCSuite Custom Orchestration',
    });

    // 5. Finalize the now-populated Invoice
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);

    // 6. Update your personal ledger
    const { error: insertError } = await supabase
      .from('invoices')
      .insert([{
        client_name: client.entity_name,
        client_email: client.contact_email,
        amount: Number(amount), 
        stripe_invoice_id: finalizedInvoice.id,
        stripe_payment_url: finalizedInvoice.hosted_invoice_url,
        status: 'outstanding',
      }]);

    if (insertError) throw new Error('Invoice sent, but failed to log in local ledger.');

    return NextResponse.json({ success: true, message: 'Bespoke invoice dispatched.' });

  } catch (error: any) {
    console.error("Stripe Dispatch Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}