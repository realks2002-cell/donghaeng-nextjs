-- Enable RLS on users table (if not already enabled)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Policy: Users can read their own data
CREATE POLICY "Users can read own data"
ON users
FOR SELECT
USING (auth.uid() = auth_id);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own data"
ON users
FOR UPDATE
USING (auth.uid() = auth_id)
WITH CHECK (auth.uid() = auth_id);
