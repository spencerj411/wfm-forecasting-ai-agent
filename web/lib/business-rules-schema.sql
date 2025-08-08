-- Business Rules Database Schema
-- First Principles: Flexible, auditable, user-specific rule storage

-- 1. Rule Documents: Track uploaded documents that contain rules
CREATE TABLE rule_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  document_type VARCHAR(50) NOT NULL, -- 'employment_contract', 'union_agreement', 'company_policy', etc.
  upload_status VARCHAR(20) DEFAULT 'processing', -- 'processing', 'completed', 'failed'
  raw_text TEXT, -- Extracted PDF text
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- 2. Business Rules: Structured rule storage
CREATE TABLE business_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id UUID REFERENCES rule_documents(id) ON DELETE SET NULL, -- Can be NULL for conversational rules
  
  -- Rule categorization
  category VARCHAR(50) NOT NULL, -- 'staffing', 'overtime', 'breaks', 'scheduling', 'compliance'
  rule_type VARCHAR(100) NOT NULL, -- 'minimum_staff', 'overtime_threshold', 'break_frequency', etc.
  
  -- Rule content
  rule_name VARCHAR(200) NOT NULL, -- Human-readable name
  rule_description TEXT, -- Detailed description
  rule_value JSONB NOT NULL, -- Flexible rule data structure
  
  -- Metadata
  confidence_score DECIMAL(3,2), -- 0.00-1.00, how confident AI is in this extraction
  needs_clarification BOOLEAN DEFAULT FALSE,
  clarification_question TEXT,
  
  -- Audit trail
  source VARCHAR(20) NOT NULL DEFAULT 'document', -- 'document', 'conversation', 'manual'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- 3. Rule Conflicts: Track when rules contradict each other
CREATE TABLE rule_conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rule_1_id UUID NOT NULL REFERENCES business_rules(id) ON DELETE CASCADE,
  rule_2_id UUID NOT NULL REFERENCES business_rules(id) ON DELETE CASCADE,
  conflict_type VARCHAR(50) NOT NULL, -- 'contradiction', 'ambiguity', 'precedence'
  conflict_description TEXT NOT NULL,
  resolution_status VARCHAR(20) DEFAULT 'unresolved', -- 'unresolved', 'resolved', 'ignored'
  resolution_note TEXT,
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- 4. Rule Applications: Track when and how rules are applied
CREATE TABLE rule_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rule_id UUID NOT NULL REFERENCES business_rules(id) ON DELETE CASCADE,
  application_context VARCHAR(100) NOT NULL, -- 'staffing_calculation', 'schedule_validation', etc.
  input_data JSONB, -- What data was being processed
  rule_result JSONB, -- How the rule affected the outcome
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_business_rules_user_category ON business_rules(user_id, category);
CREATE INDEX idx_business_rules_active ON business_rules(user_id, is_active) WHERE is_active = TRUE;
CREATE INDEX idx_rule_documents_user_status ON rule_documents(user_id, upload_status);
CREATE INDEX idx_rule_conflicts_unresolved ON rule_conflicts(user_id, resolution_status) WHERE resolution_status = 'unresolved';

-- Row Level Security (RLS) for user data isolation
ALTER TABLE rule_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE rule_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE rule_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
CREATE POLICY "Users can manage their own rule documents" ON rule_documents
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own business rules" ON business_rules
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own rule conflicts" ON rule_conflicts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own rule applications" ON rule_applications
  FOR SELECT USING (auth.uid() = user_id);