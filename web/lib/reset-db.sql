-- Development/Testing Database Reset Script
-- WARNING: This will remove ALL data from ALL tables
-- Use only in development environment

-- Truncate all application tables
-- Order matters due to foreign key relationships
TRUNCATE TABLE 
  rule_applications,
  rule_conflicts, 
  business_rules,
  rule_documents,
  uploaded_files, 
  forecasts, 
  sales_data 
RESTART IDENTITY CASCADE;

-- Note: This preserves the table structure and resets auto-incrementing IDs
-- Auth users table is not truncated to preserve login sessions