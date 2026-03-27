CREATE TABLE IF NOT EXISTS loans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  loan_number text,
  loan_type text NOT NULL,
  emi numeric DEFAULT 0,
  bucket numeric DEFAULT 0,
  balance numeric DEFAULT 0,
  amount_due numeric DEFAULT 0,
  account_type text DEFAULT 'Active',
  cycle_date date,
  next_payment_date date,
  reminder_days integer DEFAULT 1,
  promise_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Migrate existing loan data from clients table to loans table
INSERT INTO loans (
  client_id, loan_number, loan_type, emi, bucket, balance, 
  amount_due, account_type, cycle_date, next_payment_date, 
  reminder_days, promise_date, created_at, updated_at
)
SELECT 
  id, loan_number, COALESCE(loan_type, 'Personal Loan'), COALESCE(emi, 0), COALESCE(bucket, 0), COALESCE(balance, 0),
  COALESCE(amount_due, 0), COALESCE(account_type, 'Active'), cycle_date, next_payment_date,
  COALESCE(reminder_days, 1), promise_date, created_at, updated_at
FROM clients;
