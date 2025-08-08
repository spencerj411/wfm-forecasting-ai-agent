// Business Rules Type Definitions
// Matches the database schema with TypeScript type safety

export interface RuleDocument {
  id?: string
  user_id: string
  filename: string
  file_size: number
  document_type: 'employment_contract' | 'union_agreement' | 'company_policy' | 'other'
  upload_status: 'processing' | 'completed' | 'failed'
  raw_text?: string
  uploaded_at?: string
  processed_at?: string
}

export interface BusinessRule {
  id?: string
  user_id: string
  document_id?: string | null
  
  // Rule categorization
  category: 'staffing' | 'overtime' | 'breaks' | 'scheduling' | 'compliance'
  rule_type: string // e.g., 'minimum_staff', 'overtime_threshold', 'break_frequency'
  
  // Rule content
  rule_name: string
  rule_description?: string
  rule_value: RuleValue // Flexible JSONB structure
  
  // Metadata
  confidence_score?: number // 0.00-1.00
  needs_clarification?: boolean
  clarification_question?: string
  
  // Audit trail
  source: 'document' | 'conversation' | 'manual'
  created_at?: string
  updated_at?: string
  is_active?: boolean
}

// Rule value structures for different rule types
export type RuleValue = 
  | StaffingRule
  | OvertimeRule
  | BreakRule
  | SchedulingRule
  | ComplianceRule

export interface StaffingRule {
  type: 'staffing'
  minimum_staff?: number
  maximum_staff?: number
  staff_per_sales_ratio?: number // e.g., 0.001 = 1 staff per $1000
  minimum_coverage_hours?: number
  required_roles?: string[]
}

export interface OvertimeRule {
  type: 'overtime'
  threshold_hours_daily?: number
  threshold_hours_weekly?: number
  overtime_multiplier?: number // e.g., 1.5 for time-and-a-half
  double_time_threshold?: number
  overtime_approval_required?: boolean
}

export interface BreakRule {
  type: 'breaks'
  break_frequency_hours?: number // e.g., every 4 hours
  break_duration_minutes?: number
  lunch_break_hours?: number // after how many hours is lunch required
  lunch_duration_minutes?: number
  paid_breaks?: boolean
}

export interface SchedulingRule {
  type: 'scheduling'
  min_rest_between_shifts_hours?: number
  max_consecutive_days?: number
  advance_notice_hours?: number
  shift_swap_allowed?: boolean
  weekend_requirements?: 'required' | 'optional' | 'prohibited'
}

export interface ComplianceRule {
  type: 'compliance'
  max_hours_per_day?: number
  max_hours_per_week?: number
  required_certifications?: string[]
  age_restrictions?: {
    minimum_age?: number
    restricted_hours?: string[]
  }
  union_requirements?: Record<string, any>
}

export interface RuleConflict {
  id?: string
  user_id: string
  rule_1_id: string
  rule_2_id: string
  conflict_type: 'contradiction' | 'ambiguity' | 'precedence'
  conflict_description: string
  resolution_status: 'unresolved' | 'resolved' | 'ignored'
  resolution_note?: string
  detected_at?: string
  resolved_at?: string
}

export interface RuleApplication {
  id?: string
  user_id: string
  rule_id: string
  application_context: string
  input_data?: Record<string, any>
  rule_result?: Record<string, any>
  applied_at?: string
}

// Common rule extraction patterns from documents
export interface ExtractedRules {
  staffing_rules: Partial<StaffingRule>[]
  overtime_rules: Partial<OvertimeRule>[]
  break_rules: Partial<BreakRule>[]
  scheduling_rules: Partial<SchedulingRule>[]
  compliance_rules: Partial<ComplianceRule>[]
  unclear_sections: string[] // Text that needs clarification
  confidence_scores: Record<string, number>
}