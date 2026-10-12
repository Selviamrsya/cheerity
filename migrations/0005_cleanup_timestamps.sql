-- Migration: Cleanup donation record timestamps
-- Remove excess date columns and add updatedAt for automatic tracking

-- Step 1: Add updated_at column if it doesn't exist
ALTER TABLE donate_records
  ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Step 2: Copy values from approval_date to updated_at for existing records
UPDATE donate_records
SET updated_at = COALESCE(
  CASE
    WHEN status = 'COMPLETED' THEN completed_date
    WHEN status = 'WAITING_FOR_DOCUMENTATION' THEN delivery_date
    WHEN status = 'ON_PROGRESS' THEN approval_date
    WHEN status = 'REJECTED' THEN approval_date
    ELSE request_date
  END,
  request_date,
  now()
)
WHERE updated_at IS NULL OR updated_at = '1970-01-01 00:00:00+00';

-- Step 3: Drop excess date columns
ALTER TABLE donate_records
  DROP COLUMN IF EXISTS approval_date,
  DROP COLUMN IF EXISTS delivery_date,
  DROP COLUMN IF EXISTS arrived_date,
  DROP COLUMN IF EXISTS completed_date;
