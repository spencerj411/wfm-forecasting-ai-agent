import { tool } from '@openai/agents';
import { z } from 'zod';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/server';
// import { createBusinessRulesService } from '@/lib/business-rules-service';

export const createGetSalesDataTool = (supabase: SupabaseClient, user: User) => {
  return tool({
    name: 'get_sales_data',
    description: 'Get historical sales data for analysis and pattern identification. Use this tool FIRST when analyzing trends.',
    parameters: z.object({
      days: z.number().nullable().optional().default(100).describe('Number of recent days to fetch (default: 100 for better trend analysis)')
    }),
    async execute({ days }) {
      try {
        const actualDays = days || 100; // Use more days for better trend analysis
        console.log(`Fetching sales data for last ${actualDays} days...`);
        
        const { data, error } = await supabase
          .from('sales_data')
          .select('timestamp, sales')
          .eq('user_id', user.id)
          .order('timestamp', { ascending: false })
          .limit(actualDays);

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }
        
        console.log(`Retrieved ${data?.length || 0} sales records`);
        
        if (!data || data.length === 0) {
          return `No sales data found in the database. The user hasn't uploaded any sales data yet. Please inform them that they need to upload their historical sales data first using the [upload page](/upload) to get meaningful analysis and forecasts.`;
        }
        
        return `Retrieved ${data.length} sales records from the last ${actualDays} days for trend analysis: ${JSON.stringify(data)}`;
      } catch (error) {
        console.error('Error in getSalesDataTool:', error);
        return `Error fetching sales data: ${error}`;
      }
    }
  });
};

export const createGetForecastDataTool = (supabase: SupabaseClient, user: User) => {
  return tool({
    name: 'get_forecast_data',
    description: 'Get forecast predictions for upcoming dates',
    parameters: z.object({
      date: z.string().nullable().optional().describe('Specific date (YYYY-MM-DD) or leave empty for all forecasts')
    }),
    async execute({ date }) {
      try {
        console.log(`Fetching forecast data for user ${user.id}, date: ${date || 'all dates'}`);
        
        let query = supabase
          .from('forecasts')
          .select('date, forecast, confidence')
          .eq('user_id', user.id);

        if (date && date !== null) {
          query = query.eq('date', date);
        }

        const { data, error } = await query.order('date', { ascending: true });

        if (error) {
          console.error('Supabase error in forecast tool:', error);
          throw error;
        }
        
        console.log(`Retrieved ${data?.length || 0} forecast records`);
        if (data && data.length > 0) {
          console.log('Sample forecast data:', data[0]);
        }
        
        if (!data || data.length === 0) {
          if (date) {
            return `No forecast data found for date ${date}. The user hasn't generated forecasts for this specific date yet. Please inform them that they need to upload sales data using the [upload page](/upload) and generate forecasts first to get predictions and analysis.`;
          } else {
            return `No forecast data found in the database. The user hasn't generated any forecasts yet. Please inform them that they need to upload their sales data using the [upload page](/upload) and generate forecasts first to get predictions and analysis.`;
          }
        }
        
        return `Retrieved ${data.length} forecast records: ${JSON.stringify(data)}`;
      } catch (error) {
        console.error('Error in getForecastDataTool:', error);
        return `Error fetching forecast data: ${error}`;
      }
    }
  });
};

export const createCalculateStaffingTool = (_supabase: SupabaseClient, _user: User) => {
  return tool({
    name: 'calculate_staffing',
    description: 'Calculate optimal staffing based on forecasted sales with detailed financial impact analysis',
    parameters: z.object({
      forecasted_sales: z.number().describe('Forecasted sales amount'),
      confidence: z.number().describe('Confidence level (0-100)'),
      date: z.string().nullable().optional().describe('Date for the staffing calculation')
    }),
    async execute({ forecasted_sales, confidence, date }) {
      try {
        // Business rules for staffing calculation
        const baseStaffPerSale = 0.001; // 1 staff per $1000 sales
        const minStaff = 2; // Minimum staff at all times
        const maxStaff = 10; // Maximum staff limit
        
        // Adjust for confidence - lower confidence = add buffer staff
        const confidenceAdjustment = confidence < 70 ? 1.2 : confidence < 85 ? 1.1 : 1.0;
        
        // Calculate required staff
        const calculatedStaff = Math.max(
          minStaff,
          Math.min(maxStaff, Math.ceil(forecasted_sales * baseStaffPerSale * confidenceAdjustment))
        );
        
        // Calculate optimal staff without confidence buffer for comparison
        const optimalWithoutBuffer = Math.max(minStaff, Math.min(maxStaff, Math.ceil(forecasted_sales * baseStaffPerSale)));

        // Calculate cost (assuming $15/hour, 8 hour shifts)
        const hourlyRate = 15;
        const shiftHours = 8;
        const dailyCost = calculatedStaff * hourlyRate * shiftHours;
        
        // Financial impact calculations
        const underStaffCost = Math.max(1, calculatedStaff - 1) * hourlyRate * shiftHours;
        const overStaffCost = Math.min(maxStaff, calculatedStaff + 1) * hourlyRate * shiftHours;
        const potentialLostSales = forecasted_sales * 0.20; // 20% risk from understaffing
        
        // Monthly/Annual projections
        const monthlyCost = dailyCost * 30;
        const annualCost = dailyCost * 365;
        
        // Cost efficiency metrics
        const laborCostPercentage = Math.round((dailyCost / forecasted_sales) * 100);
        const costPer1000Sales = Math.round((dailyCost / forecasted_sales) * 1000);
        
        // Financial scenario analysis
        const understaffingRisk = calculatedStaff > minStaff ? `Understaffing by 1 person saves $${dailyCost - underStaffCost}/day but risks up to $${Math.round(potentialLostSales).toLocaleString()} in lost sales.` : 'Already at minimum staffing - cannot reduce further.';
        const overstaffingCost = calculatedStaff < maxStaff ? `Overstaffing by 1 person costs an extra $${overStaffCost - dailyCost}/day with no revenue benefit.` : 'Already at maximum staffing capacity.';
        
        // ROI calculation for confidence buffer
        const bufferCost = (calculatedStaff - optimalWithoutBuffer) * hourlyRate * shiftHours;
        const bufferROI = bufferCost > 0 ? `\nConfidence buffer: Extra $${bufferCost}/day ($${bufferCost * 30}/month) prevents up to $${Math.round(potentialLostSales).toLocaleString()} in lost sales - ROI: ${Math.round((potentialLostSales / bufferCost) * 100)}% return if buffer prevents 1% sales loss.` : '';

        return `**STAFFING CALCULATION WITH FINANCIAL IMPACT for ${date || 'requested date'}:**

**CORE METRICS:**
• Forecasted sales: $${forecasted_sales.toLocaleString()}
• Confidence: ${confidence}%
• Recommended staff: ${calculatedStaff} people
• Daily labor cost: $${dailyCost.toLocaleString()}
• Monthly cost: $${monthlyCost.toLocaleString()}
• Annual cost: $${annualCost.toLocaleString()}
• Labor cost: ${laborCostPercentage}% of sales ($${costPer1000Sales} per $1,000)

**FINANCIAL SCENARIO ANALYSIS:**
• ${understaffingRisk}
• ${overstaffingCost}${bufferROI}

**FINANCIAL REASONING:** Based on $${forecasted_sales.toLocaleString()} forecasted sales with ${confidence}% confidence, recommending ${calculatedStaff} staff at $${dailyCost}/day optimizes the cost-risk balance. ${laborCostPercentage < 15 ? 'Efficient labor cost ratio under 15%.' : laborCostPercentage > 25 ? 'High labor cost ratio - consider sales optimization.' : 'Moderate labor cost ratio within acceptable range.'}`;
      } catch (error) {
        return `Error calculating staffing: ${error}`;
      }
    }
  });
};

export const createGetBusinessRulesTool = (supabase: SupabaseClient, user: User) => {
  return tool({
    name: 'get_business_rules',
    description: 'Get user-uploaded business documents (employment contracts, policies) to understand their specific workforce rules',
    parameters: z.object({}),
    async execute() {
      try {
        console.log('Fetching user business documents...');
        
        const { data: documents, error } = await supabase
          .from('rule_documents')
          .select('filename, raw_text, document_type, uploaded_at')
          .eq('user_id', user.id)
          .eq('upload_status', 'completed')
          .order('uploaded_at', { ascending: false });
        
        if (error) throw error;
        
        console.log(`Retrieved ${documents?.length || 0} business documents`);
        
        if (!documents || documents.length === 0) {
          return `No business documents found. Using default business rules with financial implications:

**STAFFING RULES:**
- Minimum staff: 2 people at all times ($240/day base cost)
- Maximum staff: 10 people (space constraints - $1,200/day max cost)  
- Staff ratio: 1 person per $1000 in daily sales
- Hourly rate: $15/hour for 8-hour shifts ($120/day per person)

**OVERTIME RULES:**
- Overtime: Time and a half after 8 hours/day or 40 hours/week ($22.50/hour)
- Weekend premium: May apply based on business needs

**FINANCIAL BENCHMARKS:**
- Target labor cost: 12-18% of daily sales
- Understaffing risk: Up to 20% of sales could be lost
- Overstaffing waste: Full hourly rate with no revenue offset
- Break-even staff efficiency: $125 sales per staff hour

**COST SCENARIOS:**
- Low sales day ($2,000): 2-3 staff = $240-360/day (12-18% labor cost)
- Medium sales day ($5,000): 4-5 staff = $480-600/day (10-12% labor cost)
- High sales day ($8,000): 6-8 staff = $720-960/day (9-12% labor cost)

The user can upload business documents (employment contracts, union agreements, company policies) via the [upload page](/upload) to define custom business rules with specific cost structures.`;
        }

        // Return raw document text for the agent to analyze
        const documentsText = documents.map(doc => 
          `Document: ${doc.filename} (uploaded: ${doc.uploaded_at})
Content: ${doc.raw_text?.substring(0, 2000)}...`
        ).join('\n\n');

        return `Found ${documents.length} business document(s). Analyze these documents to extract relevant workforce management rules for staffing calculations:

${documentsText}

Extract and apply relevant rules for:
- Minimum/maximum staffing requirements
- Overtime policies and thresholds  
- Break and scheduling requirements
- Any other workforce constraints

Use these rules to override defaults when making staffing recommendations.`;
      } catch (error) {
        console.error('Error fetching business documents:', error);
        return `Error fetching business documents: ${error}. Using default business rules for calculations.`;
      }
    }
  });
};