-- Add support for multiple phone numbers per client
CREATE TABLE IF NOT EXISTS client_phones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  phone_number text NOT NULL,
  phone_type text DEFAULT 'mobile', -- mobile, home, work
  is_primary boolean DEFAULT false,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(client_id, phone_number)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_client_phones_client_id ON client_phones(client_id);
CREATE INDEX IF NOT EXISTS idx_client_phones_number ON client_phones(phone_number);

-- Migrate existing primary phone from clients table to client_phones
INSERT INTO client_phones (client_id, phone_number, phone_type, is_primary, verified)
SELECT id, phone, 'mobile', true, true
FROM clients
WHERE phone IS NOT NULL AND phone != ''
ON CONFLICT (client_id, phone_number) DO NOTHING;
