-- Migration: Remove APPROVED from donation_request_status enum
-- PostgreSQL does not support DROP VALUE from an enum directly,
-- so we need to recreate the enum.

-- Step 1: Migrate any existing APPROVED rows to ON_PROGRESS (just in case)
UPDATE donate_records
SET status = 'ON_PROGRESS',
    delivery_date = COALESCE(delivery_date, approval_date, NOW())
WHERE status = 'APPROVED';

-- Step 2: Rename old enum
ALTER TYPE donation_request_status RENAME TO donation_request_status_old;

-- Step 3: Create new enum WITHOUT APPROVED
CREATE TYPE donation_request_status AS ENUM (
  'PENDING',
  'REJECTED',
  'ON_PROGRESS',
  'WAITING_FOR_DOCUMENTATION',
  'COMPLETED'
);

-- Step 4: Alter the column to use the new enum (cast through text)
ALTER TABLE donate_records
  ALTER COLUMN status TYPE donation_request_status
  USING status::text::donation_request_status;

-- Step 5: Drop old enum
DROP TYPE donation_request_status_old;
