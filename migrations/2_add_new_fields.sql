ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS cycle_date date,
ADD COLUMN IF NOT EXISTS next_payment_date date,
ADD COLUMN IF NOT EXISTS reminder_days integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS promise_date date;
