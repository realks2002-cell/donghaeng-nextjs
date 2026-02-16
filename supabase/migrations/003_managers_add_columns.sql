-- managers 테이블에 누락된 컬럼 추가
ALTER TABLE managers ADD COLUMN IF NOT EXISTS ssn text;
ALTER TABLE managers ADD COLUMN IF NOT EXISTS address1 text;
ALTER TABLE managers ADD COLUMN IF NOT EXISTS address2 text;
ALTER TABLE managers ADD COLUMN IF NOT EXISTS approval_status text DEFAULT 'pending';
