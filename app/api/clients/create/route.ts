import { NextResponse } from 'next/server';
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const { error } = await supabase
      .from('clients')
      .insert([
        {
          entity_name: data.entityName,
          contact_email: data.contactEmail,
          contact_name: data.contactName || 'Primary Contact', // Default if not provided
          business_division: data.division,
          phase_1_amount: data.phase1Amount || 0,
          phase_1_duration_months: data.phase1Duration || 0,
          phase_2_amount: data.phase2Amount || 0,
          status: 'active'
        }
      ]);

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}