export type Geofence = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius: number;
  created_at: string;
};

export type Attendance = {
  id: string;
  user_id: string;
  location: string;
  checkin_time: string;
  checkout_time: string | null;
  created_at: string;
  is_test?: boolean;
};

export type LocationTracking = {
  id: string;
  user_id: string;
  lat: number;
  lng: number;
  timestamp: string;
  event_type: 'check-in' | 'check-out';
  created_at: string;
};

export type Transaction = {
  id: string;
  attendance_id: string;
  user_id: string;
  items: string[];
  quantities: number[];
  prices: number[];
  shipping_details: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  total_amount: number;
  is_test: boolean;
  transaction_date: string;
  created_at: string;
  attendance?: Attendance;
};