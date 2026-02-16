-- 결제 테이블에 환불 금액 컬럼 추가
ALTER TABLE payments ADD COLUMN IF NOT EXISTS refund_amount INTEGER DEFAULT 0;
