import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    // Get all tracking events for the user on the specified date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('location_tracking')
      .select('*')
      .eq('user_id', email)
      .gte('timestamp', startOfDay.toISOString())
      .lte('timestamp', endOfDay.toISOString())
      .order('timestamp', { ascending: true });

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    // Calculate total time spent inside geofence
    let totalTimeInside = 0;
    let lastCheckIn = null;

    for (let i = 0; i < data.length; i++) {
      if (data[i].event_type === 'check-in') {
        lastCheckIn = new Date(data[i].timestamp);
      } else if (data[i].event_type === 'check-out' && lastCheckIn) {
        const checkOut = new Date(data[i].timestamp);
        totalTimeInside += checkOut.getTime() - lastCheckIn.getTime();
        lastCheckIn = null;
      }
    }

    // If still checked in, calculate time until now
    if (lastCheckIn) {
      totalTimeInside += new Date().getTime() - lastCheckIn.getTime();
    }

    // Convert to minutes
    const totalMinutes = Math.floor(totalTimeInside / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return NextResponse.json({
      success: true,
      data,
      totalTimeInside: `${hours}h ${minutes}m`,
      totalMinutes
    });
  } catch (error) {
    console.error('Error fetching location history:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch location history' },
      { status: 500 }
    );
  }
}