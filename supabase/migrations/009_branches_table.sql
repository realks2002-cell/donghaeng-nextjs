-- Create branches table
CREATE TABLE IF NOT EXISTS branches (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Insert default branches
INSERT INTO branches (name) VALUES ('화성'), ('수원')
ON CONFLICT (name) DO NOTHING;
