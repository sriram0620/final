import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { 
      userId = 'TEST_USER_123', 
      location, 
      checkout_time = new Date().toISOString(),
      items = [],
      quantities = [],
      prices = [],
      shipping = {},
      isTest = true
    } = await request.json();

    // Validate required fields
    if (!userId || !checkout_time) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the latest check-in record without a checkout time
    // For test users, we'll create a synthetic check-in if none exists
    let latestCheckin;
    
    const { data: existingCheckin, error: fetchError } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', userId)
      .is('checkout_time', null)
      .order('checkin_time', { ascending: false })
      .limit(1);

    if (fetchError) {
      return NextResponse.json(
        { success: false, message: fetchError.message },
        { status: 500 }
      );
    }

    // If no active check-in found for test user, create one
    if ((!existingCheckin || existingCheckin.length === 0) && userId.startsWith('TEST_')) {
      const checkinTime = new Date();
      checkinTime.setHours(checkinTime.getHours() - 1); // Set check-in to 1 hour ago
      
      const { data: newCheckin, error: checkinError } = await supabase
        .from('attendance')
        .insert([
          {
            user_id: userId,
            location: location || 'Test Location',
            checkin_time: checkinTime.toISOString(),
            is_test: true
          },
        ])
        .select();

      if (checkinError) {
        return NextResponse.json(
          { success: false, message: checkinError.message },
          { status: 500 }
        );
      }
      
      latestCheckin = newCheckin[0];
    } else {
      latestCheckin = existingCheckin?.[0];
    }

    if (!latestCheckin) {
      return NextResponse.json(
        { success: false, message: 'No active check-in found and unable to create test check-in' },
        { status: 400 }
      );
    }

    // Create the test transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert([
        {
          attendance_id: latestCheckin.id,
          user_id: userId,
          items: JSON.stringify(items),
          quantities: JSON.stringify(quantities),
          prices: JSON.stringify(prices),
          shipping_details: JSON.stringify(shipping),
          is_test: isTest,
          transaction_date: new Date().toISOString()
        },
      ])
      .select();

    if (transactionError) {
      return NextResponse.json(
        { success: false, message: transactionError.message },
        { status: 500 }
      );
    }

    // Update the attendance record with checkout time
    const { data, error: updateError } = await supabase
      .from('attendance')
      .update({ 
        checkout_time,
        is_test: isTest
      })
      .eq('id', latestCheckin.id)
      .select();

    if (updateError) {
      return NextResponse.json(
        { success: false, message: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data, 
      transaction,
      message: 'Test checkout completed successfully'
    });
  } catch (error) {
    console.error('Error during test check-out:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process test checkout' },
      { status: 500 }
    );
  }
}