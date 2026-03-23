-- 관리자 테이블
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 기본 관리자 계정 (비밀번호: admin123)
-- bcrypt 해시: $2a$10$... (실제 환경에서는 별도로 생성)
INSERT INTO admins (admin_id, password_hash) VALUES
  ('admin', '$2a$10$rQnM1z1fJ8C0CJXh0X1q0.YxCJ8k8MHMr5aL3V7pLpX1O5z6cLK5m')
ON CONFLICT (admin_id) DO NOTHING;

-- RLS 정책
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- 인증된 사용자만 조회 가능
CREATE POLICY "Allow authenticated read" ON admins
  FOR SELECT USING (auth.role() = 'authenticated');

-- 인증된 사용자만 삽입 가능
CREATE POLICY "Allow authenticated insert" ON admins
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 인증된 사용자만 삭제 가능
CREATE POLICY "Allow authenticated delete" ON admins
  FOR DELETE USING (auth.role() = 'authenticated');
