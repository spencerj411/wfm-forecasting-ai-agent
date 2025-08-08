# Database Setup for Business Rules

## Required Tables

The business rules system requires additional database tables to be created in your Supabase database. Run the SQL commands from the following file:

**File:** `lib/business-rules-schema.sql`

### How to Apply the Schema

1. Go to your Supabase Dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `lib/business-rules-schema.sql`
4. Run the SQL commands

### Tables Created

1. **rule_documents** - Stores uploaded PDF documents
2. **business_rules** - Structured business rules extracted from documents
3. **rule_conflicts** - Tracks conflicts between rules
4. **rule_applications** - Audit trail of rule usage

### Row Level Security

All tables have RLS enabled to ensure users can only access their own data.

## Testing the System

After setting up the database:

1. Go to `/upload` page
2. Upload historical sales CSV (Step 1)
3. Upload business rules PDF (Step 2) 
4. Generate forecast (Step 3)
5. Chat with the AI about your business rules

The system will automatically extract rules from PDFs and apply them to staffing recommendations.