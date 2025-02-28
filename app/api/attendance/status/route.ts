import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    // Get the latest check-in
    const { data: checkinData, error: checkinError } = await supabase
      .from('attendance')
      .select('checkin_time')
      .eq('user_id', email)
      .order('checkin_time', { ascending: false })
      .limit(1);

    if (checkinError) {
      return NextResponse.json(
        { success: false, message: checkinError.message },
        { status: 500 }
      );
    }

    // Get the latest check-out
    const { data: checkoutData, error: checkoutError } = await supabase
      .from('attendance')
      .select('checkout_time')
      .eq('user_id', email)
      .not('checkout_time', 'is', null)
      .order('checkout_time', { ascending: false })
      .limit(1);

    if (checkoutError) {
      return NextResponse.json(
        { success: false, message: checkoutError.message },
        { status: 500 }
      );
    }

    const latestCheckin = checkinData && checkinData.length > 0 ? new Date(checkinData[0].checkin_time) : null;
    const latestCheckout = checkoutData && checkoutData.length > 0 ? new Date(checkoutData[0].checkout_time) : null;

    // Determine check-in status
    const isCheckedIn = latestCheckin && (!latestCheckout || latestCheckin > latestCheckout);

    return NextResponse.json({
      success: true,
      isCheckedIn,
      latestCheckin: latestCheckin ? latestCheckin.toISOString() : null,
      latestCheckout: latestCheckout ? latestCheckout.toISOString() : null,
    });
  } catch (error) {
    console.error('Error fetching attendance status:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch attendance status' },
      { status: 500 }
    );
  }
}