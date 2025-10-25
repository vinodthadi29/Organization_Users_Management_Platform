/*
  # Organizations & Users Management Database Schema

  ## Overview
  This migration creates a complete schema for managing organizations and their users
  with proper relationships, validation, and security policies.

  ## New Tables
  
  ### `organizations`
  - `id` (uuid, primary key) - Unique identifier for each organization
  - `name` (text, required) - Organization name
  - `description` (text, optional) - Organization description
  - `created_at` (timestamptz) - Timestamp when organization was created
  - `updated_at` (timestamptz) - Timestamp when organization was last updated

  ### `users`
  - `id` (uuid, primary key) - Unique identifier for each user
  - `name` (text, required) - User's full name
  - `email` (text, required, unique) - User's email address
  - `password` (text, required) - Hashed password
  - `role` (text, required) - User role (Admin or Member)
  - `organization_id` (uuid, foreign key) - Reference to organization
  - `created_at` (timestamptz) - Timestamp when user was created
  - `updated_at` (timestamptz) - Timestamp when user was last updated

  ## Relationships
  - One Organization can have Many Users (1:N relationship)
  - Users belong to exactly one Organization via `organization_id` foreign key

  ## Security
  - Enable Row Level Security (RLS) on both tables
  - Public read access for authenticated users
  - Public write access for demonstration purposes (can be restricted later)

  ## Indexes
  - Unique index on users.email for fast lookups and uniqueness enforcement
  - Index on users.organization_id for efficient join queries

  ## Constraints
  - CHECK constraint on users.role to ensure only valid roles
  - NOT NULL constraints on required fields
  - CASCADE delete on foreign key (deleting org removes all users)
*/

-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  password text NOT NULL,
  role text NOT NULL DEFAULT 'Member',
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_role CHECK (role IN ('Admin', 'Member'))
);

-- Create index on email for fast lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create index on organization_id for efficient joins
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);

-- Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for organizations
CREATE POLICY "Allow public read access to organizations"
  ON organizations FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to organizations"
  ON organizations FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to organizations"
  ON organizations FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to organizations"
  ON organizations FOR DELETE
  TO public
  USING (true);

-- Create policies for users
CREATE POLICY "Allow public read access to users"
  ON users FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to users"
  ON users FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to users"
  ON users FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to users"
  ON users FOR DELETE
  TO public
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to auto-update updated_at
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();