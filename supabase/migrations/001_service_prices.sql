-- 서비스 가격 테이블
CREATE TABLE IF NOT EXISTS service_prices (
  service_type VARCHAR(50) PRIMARY KEY,
  price_per_hour INTEGER NOT NULL DEFAULT 20000,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 기본 서비스 가격 데이터 삽입
INSERT INTO service_prices (service_type, price_per_hour, is_active) VALUES
  ('병원 동행', 20000, true),
  ('가사돌봄', 18000, true),
  ('생활동행', 18000, true),
  ('노인 돌봄', 22000, true),
  ('아이 돌봄', 20000, true),
  ('기타', 20000, true)
ON CONFLICT (service_type) DO NOTHING;

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_service_prices_updated_at
  BEFORE UPDATE ON service_prices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS 정책 (읽기는 모두 허용, 쓰기는 인증된 사용자만)
ALTER TABLE service_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON service_prices
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to update" ON service_prices
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert" ON service_prices
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
