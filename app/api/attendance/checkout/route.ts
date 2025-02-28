import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { email, checkout_time, is_test = false } = await request.json();

    if (!email || !checkout_time) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the latest check-in record without a checkout time
    const { data: latestCheckin, error: fetchError } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', email)
      .is('checkout_time', null)
      .order('checkin_time', { ascending: false })
      .limit(1);

    if (fetchError) {
      return NextResponse.json(
        { success: false, message: fetchError.message },
        { status: 500 }
      );
    }

    if (!latestCheckin || latestCheckin.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No active check-in found' },
        { status: 400 }
      );
    }

    // Update the record with checkout time
    const { data, error: updateError } = await supabase
      .from('attendance')
      .update({ 
        checkout_time,
        is_test: is_test || false
      })
      .eq('id', latestCheckin[0].id)
      .select();

    if (updateError) {
      return NextResponse.json(
        { success: false, message: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error during check-out:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to check out' },
      { status: 500 }
    );
  }
}