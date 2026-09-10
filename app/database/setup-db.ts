import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

// Create tables directly
const createTables = async () => {
  try {
    console.log('Starting database setup...');

    // Create enums (without IF NOT EXISTS since it's not supported for types in PostgreSQL)
    try {
      await sql`CREATE TYPE "donation_campaign_status" AS ENUM('ACTIVE', 'COMPLETED')`;
    } catch (e) {
      console.log('donation_campaign_status type already exists');
    }

    try {
      await sql`CREATE TYPE "donation_request_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'ON_PROGRESS', 'ARRIVED', 'COMPLETED')`;
    } catch (e) {
      console.log('donation_request_status type already exists');
    }

    try {
      await sql`CREATE TYPE "role" AS ENUM('USER', 'INSTITUTION', 'ADMIN')`;
    } catch (e) {
      console.log('role type already exists');
    }

    try {
      await sql`CREATE TYPE "status" AS ENUM('PENDING', 'APPROVED', 'REJECTED')`;
    } catch (e) {
      console.log('status type already exists');
    }

    console.log('Enums checked/created successfully');

    // Create tables
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        full_name varchar(255) NOT NULL,
        email text NOT NULL UNIQUE,
        password text NOT NULL,
        birthdate date,
        phone_number varchar(20),
        city varchar(100),
        state varchar(100),
        zip_code varchar(20),
        address text,
        latitude double precision,
        longitude double precision,
        role "role" DEFAULT 'USER',
        status "status" DEFAULT 'APPROVED',
        created_at timestamp with time zone DEFAULT now()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS institutions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        institution_name varchar(255) NOT NULL,
        email text NOT NULL UNIQUE,
        password text NOT NULL,
        phone_number varchar(20),
        city varchar(100),
        state varchar(100),
        zip_code varchar(20),
        address text,
        latitude double precision,
        longitude double precision,
        verification_evidence text,
        website_or_social text,
        description text,
        status "status" DEFAULT 'PENDING',
        created_at timestamp with time zone DEFAULT now()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS donations (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        institution_id uuid NOT NULL,
        title varchar(255) NOT NULL,
        category varchar(100) NOT NULL,
        description text,
        cover text,
        target integer NOT NULL,
        collected integer DEFAULT 0 NOT NULL,
        delivery_methods text[] NOT NULL,
        has_pickup_service boolean DEFAULT false,
        pickup_max_distance_km integer,
        status "donation_campaign_status" DEFAULT 'ACTIVE',
        created_at timestamp with time zone DEFAULT now(),
        FOREIGN KEY (institution_id) REFERENCES institutions(id)
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS donate_records (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        user_id uuid NOT NULL,
        donation_id uuid NOT NULL,
        donor_name varchar(255),
        is_anonymous boolean DEFAULT false NOT NULL,
        phone_number varchar(20),
        city varchar(100),
        state varchar(100),
        zip_code varchar(20),
        address text,
        quantity integer NOT NULL,
        notes text,
        donor_photo text,
        delivery_method varchar(50) NOT NULL,
        estimated_pickup_date date,
        estimated_pickup_time varchar(20),
        status "donation_request_status" DEFAULT 'PENDING' NOT NULL,
        arrival_proof_photo text,
        rejection_reason text,
        request_date timestamp with time zone DEFAULT now(),
        approval_date timestamp with time zone,
        delivery_date timestamp with time zone,
        arrived_date timestamp with time zone,
        completed_date timestamp with time zone,
        created_at timestamp with time zone DEFAULT now(),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (donation_id) REFERENCES donations(id)
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        recipient_id uuid NOT NULL,
        recipient_type varchar(20) NOT NULL,
        title varchar(255) NOT NULL,
        message text NOT NULL,
        type varchar(50) NOT NULL,
        is_read boolean DEFAULT false NOT NULL,
        related_id uuid,
        created_at timestamp with time zone DEFAULT now()
      )
    `;

    console.log('All tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    process.exit(1);
  }
};

createTables();