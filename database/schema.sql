-- PostgreSQL schema for 511 Homes
-- Run this script inside the target database, e.g. createdb 511_homes && psql -d 511_homes -f database/schema.sql

CREATE TABLE IF NOT EXISTS tenants (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  id_number VARCHAR(20) NOT NULL UNIQUE,
  phone VARCHAR(20),
  email VARCHAR(100) NOT NULL,
  occupation VARCHAR(100),
  next_of_kin_name VARCHAR(100),
  next_of_kin_phone VARCHAR(20),
  house_number VARCHAR(10) NOT NULL,
  id_front_path VARCHAR(255),
  id_back_path VARCHAR(255),
  agreement_pdf_path VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agreement_logs (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  pdf_path VARCHAR(255),
  email_sent BOOLEAN NOT NULL DEFAULT FALSE,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);