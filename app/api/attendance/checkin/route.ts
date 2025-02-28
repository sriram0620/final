import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { email, location, checkin_time, is_test = false } = await request.json();

    if (!email || !location || !checkin_time) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('attendance')
      .insert([
        {
          user_id: email,
          location,
          checkin_time,
          is_test
        },
      ])
      .select();

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error during check-in:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to check in' },
      { status: 500 }
    );
  }
}