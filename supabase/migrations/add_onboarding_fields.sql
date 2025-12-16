-- Migration: Add onboarding quiz fields to profiles table
-- This migration adds columns to support the onboarding quiz data

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS target_weight NUMERIC,
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS workout_type TEXT,
ADD COLUMN IF NOT EXISTS workout_frequency TEXT;

-- Add comment for documentation
COMMENT ON COLUMN profiles.onboarding_complete IS 'Tracks whether user has completed the onboarding quiz';
COMMENT ON COLUMN profiles.target_weight IS 'User target weight goal in kg';
COMMENT ON COLUMN profiles.birth_date IS 'User birth date for age calculation';
COMMENT ON COLUMN profiles.workout_type IS 'Comma-separated list of workout types from quiz';
COMMENT ON COLUMN profiles.workout_frequency IS 'Workout frequency category from quiz';
