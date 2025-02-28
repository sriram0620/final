import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeRegular = searchParams.get('includeRegular') === 'true';
    
    // Build the query
    let query = supabase
      .from('transactions')
      .select(`
        id,
        attendance_id,
        user_id,
        items,
        quantities,
        prices,
        shipping_details,
        total_amount,
        is_test,
        transaction_date,
        created_at,
        attendance:attendance_id (
          location,
          checkin_time,
          checkout_time
        )
      `);
    
    // Filter by test transactions unless includeRegular is true
    if (!includeRegular) {
      query = query.eq('is_test', true);
    }
    
    // Execute the query
    const { data, error } = await query
      .order('transaction_date', { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      count: data.length,
      testCount: data.filter(t => t.is_test).length
    });
  } catch (error) {
    console.error('Error fetching test transactions:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch test transactions' },
      { status: 500 }
    );
  }
}