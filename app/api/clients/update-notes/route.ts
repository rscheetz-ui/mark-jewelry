import { NextResponse } from 'next/server';
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export async function POST(request: Request) {
  try {
    const { clientId, notes } = await request.json();

    const { error } = await supabase
      .from('clients')
      .update({ notes: notes })
      .eq('id', clientId);

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true, message: 'Directives saved.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}