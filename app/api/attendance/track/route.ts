import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { email, lat, lng, timestamp, event_type } = await request.json();

    if (!email || !lat || !lng || !timestamp || !event_type) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert tracking record
    const { data, error } = await supabase
      .from('location_tracking')
      .insert([
        {
          user_id: email,
          lat,
          lng,
          timestamp,
          event_type
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
    console.error('Error tracking location:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to track location' },
      { status: 500 }
    );
  }
}