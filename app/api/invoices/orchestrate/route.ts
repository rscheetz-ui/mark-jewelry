import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createBrowserClient } from '@supabase/ssr';

// Initialize the Instruments
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2026-04-22.dahlia', 
});

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export async function POST() {
  try {
    // 1. Fetch the active roster from the Vault
    const { data: clients, error: fetchError } = await supabase
      .from('clients')
      .select('*')
      .eq('status', 'active');

    if (fetchError || !clients) throw new Error('Failed to access client ledger.');

    let successCount = 0;
    let errors = [];

    // 2. Begin the Orchestration Loop
    for (const client of clients) {
      try {
        // Step A: Determine the correct billing tier based on the lifecycle
        let amountToCharge = 0;
        let invoiceDescription = '';

        if (client.months_billed < client.phase_1_duration_months) {
          amountToCharge = client.phase_1_amount;
          invoiceDescription = `${client.business_division} - Phase I: Build (Month ${client.months_billed + 1} of ${client.phase_1_duration_months})`;
        } else {
          amountToCharge = client.phase_2_amount;
          invoiceDescription = `${client.business_division} - Phase II: Performance Retainer`;
        }

        // If amount is 0, skip this client (e.g., they are paused or fully paid off)
        if (amountToCharge <= 0) continue;

        // Step B: Ensure the Stripe Customer exists
        let stripeCustomerId = client.stripe_customer_id;
        
        if (!stripeCustomerId) {
          const newCustomer = await stripe.customers.create({
            name: client.entity_name,
            email: client.contact_email,
          });
          stripeCustomerId = newCustomer.id;
          
          // Save the new Stripe ID back to your vault so we never duplicate them
          await supabase
            .from('clients')
            .update({ stripe_customer_id: stripeCustomerId })
            .eq('id', client.id);
        }

        // Step C: Draft the Line Item
        await stripe.invoiceItems.create({
          customer: stripeCustomerId,
          amount: amountToCharge * 100, // Stripe reads pennies
          currency: 'usd',
          description: invoiceDescription,
        });

        // Step D: Generate, Finalize, and Send the Invoice via Stripe
        const invoice = await stripe.invoices.create({
          customer: stripeCustomerId,
          collection_method: 'send_invoice',
          days_until_due: 7, 
        });

        const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);

        // Step E: Log the generated invoice into your Supabase ledger
        await supabase
          .from('invoices')
          .insert([{
            client_name: client.entity_name,
            client_email: client.contact_email,
            amount: amountToCharge,
            stripe_invoice_id: finalizedInvoice.id,
            stripe_payment_url: finalizedInvoice.hosted_invoice_url,
            status: 'outstanding',
          }]);

        // Step F: Advance the client's timeline by 1 month
        await supabase
          .from('clients')
          .update({ months_billed: client.months_billed + 1 })
          .eq('id', client.id);

        successCount++;

      } catch (clientError: any) {
        // If one client fails, log it, but continue the loop for the others
        errors.push({ client: client.entity_name, error: clientError.message });
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Orchestration complete. ${successCount} invoices generated.`,
      errors 
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}