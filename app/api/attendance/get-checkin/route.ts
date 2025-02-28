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

    const { data, error } = await supabase
      .from('attendance')
      .select('checkin_time')
      .eq('user_id', email)
      .order('checkin_time', { ascending: false })
      .limit(1);

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    const latestCheckin = data && data.length > 0 ? data[0].checkin_time : null;

    return NextResponse.json({ latestCheckin });
  } catch (error) {
    console.error('Error fetching check-in time:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch check-in time' },
      { status: 500 }
    );
  }
}