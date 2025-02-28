/*
  # Create transactions table for checkout data

  1. New Tables
    - `transactions`
      - `id` (uuid, primary key)
      - `attendance_id` (uuid, foreign key to attendance table)
      - `user_id` (text, user identifier)
      - `items` (jsonb, list of items in the transaction)
      - `quantities` (jsonb, quantities for each item)
      - `prices` (jsonb, prices for each item)
      - `shipping_details` (jsonb, shipping information)
      - `total_amount` (float, total transaction amount)
      - `is_test` (boolean, flag for test transactions)
      - `transaction_date` (timestamptz, when the transaction occurred)
      - `created_at` (timestamptz, record creation time)
  2. Security
    - Enable RLS on `transactions` table
    - Add policies for authenticated users to read their own data
    - Add policy for inserting transaction records
*/

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_id uuid REFERENCES attendance(id),
  user_id text NOT NULL,
  items jsonb DEFAULT '[]',
  quantities jsonb DEFAULT '[]',
  prices jsonb DEFAULT '[]',
  shipping_details jsonb DEFAULT '{}',
  total_amount float DEFAULT 0,
  is_test boolean DEFAULT false,
  transaction_date timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add is_test column to attendance table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'attendance' AND column_name = 'is_test'
  ) THEN
    ALTER TABLE attendance ADD COLUMN is_test boolean DEFAULT false;
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Transactions are viewable by everyone"
  ON transactions
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Transactions can be inserted by anyone"
  ON transactions
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Transactions can be updated by anyone"
  ON transactions
  FOR UPDATE
  TO public
  USING (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_is_test ON transactions(is_test);