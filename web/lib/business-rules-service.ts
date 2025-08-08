import { SupabaseClient } from '@supabase/supabase-js';
import { 
  RuleDocument, 
  BusinessRule, 
  RuleConflict,
  // ExtractedRules 
} from './business-rules-types';

/**
 * Business Rules Service
 * Handles all database operations for business rules management
 */
export class BusinessRulesService {
  constructor(private _supabase: SupabaseClient, private _userId: string) {}

  // Document management
  async getDocuments(): Promise<RuleDocument[]> {
    const { data, error } = await this._supabase
      .from('rule_documents')
      .select('*')
      .eq('user_id', this._userId)
      .order('uploaded_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getDocument(documentId: string): Promise<RuleDocument | null> {
    const { data, error } = await this._supabase
      .from('rule_documents')
      .select('*')
      .eq('id', documentId)
      .eq('user_id', this._userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  }

  // Business rules management
  async getRules(category?: string): Promise<BusinessRule[]> {
    let query = this._supabase
      .from('business_rules')
      .select('*')
      .eq('user_id', this._userId)
      .eq('is_active', true);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getRule(ruleId: string): Promise<BusinessRule | null> {
    const { data, error } = await this._supabase
      .from('business_rules')
      .select('*')
      .eq('id', ruleId)
      .eq('user_id', this._userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async saveRules(rules: Omit<BusinessRule, 'id' | 'user_id' | 'created_at' | 'updated_at'>[]): Promise<BusinessRule[]> {
    const rulesWithUserId = rules.map(rule => ({
      ...rule,
      user_id: this._userId
    }));

    const { data, error } = await this._supabase
      .from('business_rules')
      .insert(rulesWithUserId)
      .select();

    if (error) throw error;
    return data || [];
  }

  async updateRule(ruleId: string, updates: Partial<BusinessRule>): Promise<BusinessRule> {
    const { data, error } = await this._supabase
      .from('business_rules')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', ruleId)
      .eq('user_id', this._userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deactivateRule(ruleId: string): Promise<void> {
    const { error } = await this._supabase
      .from('business_rules')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', ruleId)
      .eq('user_id', this._userId);

    if (error) throw error;
  }

  // Conflict management
  async getUnresolvedConflicts(): Promise<RuleConflict[]> {
    const { data, error } = await this._supabase
      .from('rule_conflicts')
      .select(`
        *,
        rule_1:business_rules!rule_conflicts_rule_1_id_fkey(rule_name, category),
        rule_2:business_rules!rule_conflicts_rule_2_id_fkey(rule_name, category)
      `)
      .eq('user_id', this._userId)
      .eq('resolution_status', 'unresolved')
      .order('detected_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createConflict(conflict: Omit<RuleConflict, 'id' | 'user_id' | 'detected_at'>): Promise<RuleConflict> {
    const { data, error } = await this._supabase
      .from('rule_conflicts')
      .insert({
        ...conflict,
        user_id: this._userId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async resolveConflict(conflictId: string, resolution: string): Promise<void> {
    const { error } = await this._supabase
      .from('rule_conflicts')
      .update({
        resolution_status: 'resolved',
        resolution_note: resolution,
        resolved_at: new Date().toISOString()
      })
      .eq('id', conflictId)
      .eq('user_id', this._userId);

    if (error) throw error;
  }

  // Rule application tracking
  async trackRuleApplication(
    ruleId: string,
    context: string,
    inputData?: Record<string, unknown>,
    result?: Record<string, unknown>
  ): Promise<void> {
    const { error } = await this._supabase
      .from('rule_applications')
      .insert({
        user_id: this._userId,
        rule_id: ruleId,
        application_context: context,
        input_data: inputData,
        rule_result: result
      });

    if (error) {
      // Log but don't throw - tracking shouldn't break main functionality
      console.error('Failed to track rule application:', error);
    }
  }

  // Utility methods
  async getRulesByType(ruleType: string): Promise<BusinessRule[]> {
    const { data, error } = await this._supabase
      .from('business_rules')
      .select('*')
      .eq('user_id', this._userId)
      .eq('rule_type', ruleType)
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  }

  async getRulesNeedingClarification(): Promise<BusinessRule[]> {
    const { data, error } = await this._supabase
      .from('business_rules')
      .select('*')
      .eq('user_id', this._userId)
      .eq('needs_clarification', true)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Search and filter
  async searchRules(searchTerm: string): Promise<BusinessRule[]> {
    const { data, error } = await this._supabase
      .from('business_rules')
      .select('*')
      .eq('user_id', this._userId)
      .eq('is_active', true)
      .or(`rule_name.ilike.%${searchTerm}%,rule_description.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}

// Factory function for easy instantiation
export function createBusinessRulesService(supabase: SupabaseClient, userId: string): BusinessRulesService {
  return new BusinessRulesService(supabase, userId);
}