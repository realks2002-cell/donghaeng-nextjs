-- Enable pg_net extension for HTTP requests from PostgreSQL
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

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
    -- new insert with CONFIRMED status
    NULL;
  ELSIF TG_OP = 'UPDATE' AND NEW.status = 'CONFIRMED' AND OLD.status IS DISTINCT FROM 'CONFIRMED' THEN
    -- status changed to CONFIRMED
    NULL;
  ELSE
    RETURN NEW;
  END IF;

  -- Load config from Supabase SQL settings
  webhook_url := current_setting('app.webhook_url', true);
  webhook_secret := current_setting('app.webhook_secret', true);

  IF webhook_url IS NULL OR webhook_url = '' THEN
    RAISE WARNING '[PUSH TRIGGER] app.webhook_url is not set, skipping webhook';
    RETURN NEW;
  END IF;

  IF webhook_secret IS NULL OR webhook_secret = '' THEN
    RAISE WARNING '[PUSH TRIGGER] app.webhook_secret is not set, skipping webhook';
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
