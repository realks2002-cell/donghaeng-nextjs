-- manager_applications 테이블 생성
CREATE TABLE IF NOT EXISTS manager_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_id UUID NOT NULL REFERENCES managers(id) ON DELETE CASCADE,
  service_request_id UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED')),
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_manager_applications_manager_id ON manager_applications(manager_id);
CREATE INDEX idx_manager_applications_service_request_id ON manager_applications(service_request_id);
CREATE INDEX idx_manager_applications_status ON manager_applications(status);

-- 중복 지원 방지 (같은 매니저가 같은 요청에 중복 지원 불가)
CREATE UNIQUE INDEX idx_manager_applications_unique ON manager_applications(manager_id, service_request_id);

-- RLS 정책 (서비스 역할 키는 모든 접근 가능)
ALTER TABLE manager_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON manager_applications
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_manager_applications_updated_at
  BEFORE UPDATE ON manager_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
