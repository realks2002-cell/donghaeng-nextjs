-- Enable pg_net extension for HTTP requests from PostgreSQL
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Config table for webhook settings
CREATE TABLE IF NOT EXISTS app_config (
  key text PRIMARY KEY,
  value text NOT NULL
);

-- Insert webhook config
INSERT INTO app_config (key, value) VALUES
  ('webhook_url', 'https://donghaeng77.co.kr'),
  ('webhook_secret', 'ffa31fe5638874719a9bd53acdd6a7e3b177cc8e614e12670e03b1f621187512')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Trigger function: notify managers when service_request status becomes CONFIRMED
CREATE OR REPLACE FUNCTION notify_managers_on_confirmed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  webhook_url text;
  webhook_secret text;
  payload jsonb;
BEGIN
  -- Only fire when status is (or becomes) CONFIRMED
  IF TG_OP = 'INSERT' AND NEW.status = 'CONFIRMED' THEN
    NULL;
  ELSIF TG_OP = 'UPDATE' AND NEW.status = 'CONFIRMED' AND OLD.status IS DISTINCT FROM 'CONFIRMED' THEN
    NULL;
  ELSE
    RETURN NEW;
  END IF;

  -- Load config from app_config table
  SELECT value INTO webhook_url FROM app_config WHERE key = 'webhook_url';
  SELECT value INTO webhook_secret FROM app_config WHERE key = 'webhook_secret';

  IF webhook_url IS NULL OR webhook_url = '' THEN
    RAISE WARNING '[PUSH TRIGGER] webhook_url is not set, skipping';
    RETURN NEW;
  END IF;

  IF webhook_secret IS NULL OR webhook_secret = '' THEN
    RAISE WARNING '[PUSH TRIGGER] webhook_secret is not set, skipping';
    RETURN NEW;
  END IF;

  -- Build payload
  payload := jsonb_build_object(
    'id', NEW.id,
    'service_type', NEW.service_type,
    'estimated_price', NEW.estimated_price,
    'service_date', NEW.service_date,
    'start_time', NEW.start_time
  );

  -- Send HTTP POST via pg_net
  PERFORM net.http_post(
    url := webhook_url || '/api/webhooks/push-on-confirmed',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', webhook_secret
    ),
    body := payload
  );

  RETURN NEW;
END;
$$;

-- Create trigger on service_requests table
DROP TRIGGER IF EXISTS trg_push_on_confirmed ON service_requests;
CREATE TRIGGER trg_push_on_confirmed
  AFTER INSERT OR UPDATE ON service_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_managers_on_confirmed();
