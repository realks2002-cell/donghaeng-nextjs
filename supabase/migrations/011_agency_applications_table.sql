-- 대리점 신청 테이블
CREATE TABLE IF NOT EXISTS agency_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  region TEXT NOT NULL,
  memo TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 비활성화 (관리자만 조회, 삽입은 서비스 롤로)
ALTER TABLE agency_applications ENABLE ROW LEVEL SECURITY;
