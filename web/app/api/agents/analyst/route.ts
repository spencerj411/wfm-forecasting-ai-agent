import { Agent, Runner, AgentInputItem } from '@openai/agents';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import type { User } from '@supabase/supabase-js';
import { openai } from '@ai-sdk/openai';
import { aisdk } from '@openai/agents-extensions';
import { createGetSalesDataTool, createGetForecastDataTool, createCalculateStaffingTool, createGetBusinessRulesTool } from '../shared-tools';
import { tool } from '@openai/agents';
import { z } from 'zod';

// Store chat threads per user session
const chatThreads = new Map<string, AgentInputItem[]>();

const createCallRosteringAgentTool = (supabase: ReturnType<typeof createClient>, user: { id: string; email?: string; app_metadata?: Record<string, unknown>; user_metadata?: Record<string, unknown>; aud?: string; created_at?: string }) => {
  return tool({
    name: 'consult_rostering_agent',
    description: 'Call the rostering agent to get business rules compliance and workforce planning advice. Use this for ANY business rules, staffing policies, or compliance-related questions.',
    parameters: z.object({
      query: z.string().describe('The specific question or request to send to the rostering agent about business rules, compliance, or workforce planning')
    }),
    async execute({ query }) {
      try {
        console.log('🔄 CONSULTING ROSTERING AGENT for business rules:', query);
        
        // Create rostering agent tools directly with the same auth context
        const resolvedSupabase = await supabase;
        const getForecastDataTool = createGetForecastDataTool(resolvedSupabase, user as User);
        const calculateStaffingTool = createCalculateStaffingTool(resolvedSupabase, user as User);
        const getBusinessRulesTool = createGetBusinessRulesTool(resolvedSupabase, user as User);
        
        // Create rostering agent instance directly
        const model = aisdk(openai('gpt-4o'));
        const rosteringAgent = new Agent({
          name: 'Rostering Specialist',
          instructions: `You are a rostering agent for workforce management specializing in BUSINESS RULES COMPLIANCE and FINANCIAL IMPACT analysis. Your core responsibilities:

1. **Business Rules Compliance**: ALWAYS check uploaded business rules first and ensure all recommendations comply
2. **Financial Impact**: Provide specific dollar estimates for all staffing decisions  
3. **Optimal Staffing**: Calculate levels based on sales forecasts with compliance and cost analysis

**Workflow (MANDATORY ORDER):**
1. FIRST: get_business_rules - Check user's uploaded business rules for compliance requirements
2. THEN: get_forecast_data - Get sales forecasts  
3. FINALLY: calculate_staffing - Apply both rules and financial analysis

**Business Context:**
- Default: Min 2 staff, Max 10 staff, $15/hour (8hr shifts = $120/day/person)
- General ratio: 1 staff per $1000 daily sales
- Understaffing risk: 15-25% of lost sales
- USER RULES OVERRIDE DEFAULTS - Always prioritize uploaded business rules

**Response Requirements:**
- **Rules Compliance**: State which business rules apply and how they're met
- **Financial Impact**: Include specific dollar amounts ($X saved/lost per day/month)
- **Concise Format**: 2-3 key points maximum, use bullets when helpful

**Financial Language:**
- "Saves $X/month by reducing overstaffing while meeting [Rule Y]"  
- "Costs $X/day but ensures compliance with [Rule Z]"
- "Rule-compliant staffing: $X/day vs non-compliant risk of $Y losses"

**No Data Available:**
Guide to [upload page](/upload) for sales data and [dashboard](/dashboard) for forecasts. Provide rule-based guidance when possible.

CRITICAL: Balance business rules compliance with financial optimization. If rules conflict with cost efficiency, explain the compliance cost vs risk.`,
          
          model,
          tools: [getForecastDataTool, calculateStaffingTool, getBusinessRulesTool]
        });

        // Execute the rostering agent with the query
        const runner = new Runner({ model });
        const result = await runner.run(rosteringAgent, query);
        
        // Extract response text using comprehensive logic
        let responseText = 'No response generated from rostering agent';
        
        if (typeof result === 'string') {
          responseText = result;
        } else if (result && typeof result === 'object') {
          const resultAny = result as unknown as Record<string, unknown>;
          
          // Handle OpenAI Agents SDK response structure (same as main POST handler)
          if (resultAny.state && (resultAny.state as Record<string, unknown>)._modelResponses) {
            console.log('Found rostering agent _modelResponses, count:', ((resultAny.state as Record<string, unknown>)._modelResponses as unknown[]).length);
            const modelResponses = (resultAny.state as Record<string, unknown>)._modelResponses as unknown[];
            if (modelResponses.length > 0) {
              const lastResponse = modelResponses[modelResponses.length - 1] as Record<string, unknown>;
              console.log('Rostering agent last response structure:', Object.keys(lastResponse));
              console.log('Rostering agent last response output type:', typeof lastResponse.output);
              
              // Try different content structures - OpenAI Agents SDK uses 'output' property
              if (lastResponse.output) {
                if (Array.isArray(lastResponse.output)) {
                  console.log('Rostering agent output is array with length:', (lastResponse.output as unknown[]).length);
                  // Find the message in the output array
                  const messageItem = (lastResponse.output as unknown[]).find((item: unknown) => (item as Record<string, unknown>).type === 'message') as Record<string, unknown> | undefined;
                  if (messageItem && messageItem.content) {
                    console.log('Found rostering agent message item with content:', Array.isArray(messageItem.content));
                    if (Array.isArray(messageItem.content)) {
                      // Find the text content within the message content array
                      const textItem = messageItem.content.find((c: Record<string, unknown>) => c.type === 'text');
                      if (textItem && textItem.text) {
                        responseText = textItem.text;
                      } else {
                        // Fallback to first content item
                        responseText = messageItem.content[0]?.text || JSON.stringify(messageItem.content[0]);
                      }
                    } else if (typeof messageItem.content === 'string') {
                      responseText = messageItem.content;
                    }
                  } else {
                    // Fallback to first output item
                    responseText = lastResponse.output[0]?.text || lastResponse.output[0]?.content || JSON.stringify(lastResponse.output[0]);
                  }
                } else if (typeof lastResponse.output === 'string') {
                  responseText = lastResponse.output;
                } else {
                  responseText = JSON.stringify(lastResponse.output);
                }
              } else if (lastResponse.content) {
                // Fallback to content property
                if (Array.isArray(lastResponse.content)) {
                  const textContent = lastResponse.content.find((c: Record<string, unknown>) => c.type === 'text');
                  if (textContent && textContent.text) {
                    responseText = textContent.text;
                  } else {
                    responseText = lastResponse.content[0]?.text || lastResponse.content[0]?.content || JSON.stringify(lastResponse.content[0]);
                  }
                } else if (typeof lastResponse.content === 'string') {
                  responseText = lastResponse.content;
                } else {
                  responseText = JSON.stringify(lastResponse.content);
                }
              } else if (lastResponse.message) {
                responseText = String((lastResponse.message as Record<string, unknown>).content) || String(lastResponse.message);
              }
            }
          }
          
          // If we still don't have a response, try other fallbacks
          if (responseText === 'No response generated from rostering agent') {
            responseText = String(resultAny.value || resultAny.text || resultAny.content || resultAny.response || resultAny.message) ||
                         `Debug rostering agent result: ${JSON.stringify(resultAny).substring(0, 200)}...`;
          }
        }
        
        console.log('✅ ROSTERING AGENT CONSULTATION completed');
        
        return `🏢 ROSTERING_AGENT_CONSULTATION 🏢 ${responseText}`;
      } catch (error) {
        console.error('Error consulting rostering agent:', error);
        return `Error consulting rostering agent: ${error}. Please try again or use default staffing guidelines.`;
      }
    }
  });
};

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId } = await request.json();
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Initialize Supabase with user auth
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create user-specific session ID
    const userSessionId = sessionId || `analyst-${user.id}`;
    
    // Get or create chat thread for this user session
    if (!chatThreads.has(userSessionId)) {
      chatThreads.set(userSessionId, []);
    }
    
    const thread = chatThreads.get(userSessionId)!;

    // Create shared tools - rostering agent handles all business rules
    const resolvedSupabase = await supabase;
    const getSalesDataTool = createGetSalesDataTool(resolvedSupabase, user as User);
    const getForecastDataTool = createGetForecastDataTool(resolvedSupabase, user as User);
    const callRosteringAgentTool = createCallRosteringAgentTool(Promise.resolve(resolvedSupabase), user);

    // Create model and agent
    console.log('OpenAI API key configured:', !!process.env.OPENAI_API_KEY);
    console.log('OpenAI API key length:', process.env.OPENAI_API_KEY?.length || 0);
    const model = aisdk(openai('gpt-4o'));

    const analystAgent = new Agent({
      name: 'Business Analyst',
      instructions: `You are a business analyst agent for workforce management with a critical focus on providing SPECIFIC DOLLAR IMPACT ESTIMATES for all workforce planning recommendations. 

CURRENT DATE CONTEXT: Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} (${new Date().toISOString().split('T')[0]}).

Your role is to:
      
      1. Help managers understand their sales data and forecast predictions WITH FINANCIAL IMPACT ANALYSIS
      2. Identify patterns, trends, and insights from historical and predicted data with cost implications
      3. Answer questions about demand forecasting and business implications with specific dollar estimates
      4. Provide clear, actionable insights with concrete financial impact numbers
      5. Guide users through the data upload process when no data is available
      6. CONSULT the rostering agent for staffing requirements and business rules compliance
      
      You have access to:
      - Historical sales data (timestamps and sales values)
      - Forecast predictions (dates, forecasted sales, confidence levels)
      - Rostering agent consultation for workforce planning and business rules
      
      TOOL USAGE LOGIC:
      - Use consult_rostering_agent for ANY rostering, staffing, workforce, or business rules questions including:
        * Staff scheduling, staffing levels, workforce planning
        * Cost calculations, budget planning for staff
        * "How many staff do I need?" type questions
        * Scenario planning ("what if we add/remove staff?")
        * Business rules and policies for staffing decisions
        * General rostering advice and best practices
        * Questions about staffing ratios, minimums, maximums
        * Operational guidance for workforce management
        * IMPORTANT: The rostering agent has exclusive access to business rules and compliance requirements
      - Use get_sales_data and get_forecast_data for:
        * Data analysis, trends, patterns
        * Forecast explanations and insights
        * General business analysis
      
      IMPORTANT: If the user doesn't have data uploaded yet, be helpful and guide them:
      - Explain that they need to upload historical sales data first
      - Direct them to the [upload page](/upload) to get started
      - Explain what kind of analysis will be possible once they have data
      - Be encouraging and explain the value of the forecasting system
      - You can also reference the [dashboard](/dashboard) when talking about viewing forecasts
      
      When analyzing data, look for patterns like seasonal trends, day-of-week effects, 
      and growth patterns. 
      
      MANDATORY TOOL USAGE - NO EXCEPTIONS:
      1. If user asks ANYTHING about forecasts/predictions: 
         - IMMEDIATELY call get_forecast_data() 
         - Wait for the tool result
         - Base your response ONLY on what the tool returns
      
      2. If user asks ANYTHING about sales data/trends:
         - IMMEDIATELY call get_sales_data()
         - Wait for the tool result  
         - Base your response ONLY on what the tool returns
      
      3. If user asks about staffing, business rules, or workforce planning:
         - IMMEDIATELY call consult_rostering_agent()
         - The rostering agent will handle data checking and business rules compliance
      
      ABSOLUTELY FORBIDDEN:
      - Do NOT make assumptions about data availability
      - Do NOT mention specific dates unless returned by tools
      - Do NOT suggest uploading data without first calling tools
      - Do NOT give generic responses without tool usage
      
      The tools will tell you exactly what data exists. Trust only the tool results.
      
      DATE HANDLING APPROACH:
      - When user asks for "tomorrow" or specific days, FIRST call get_forecast_data() to see what dates are available
      - Look at the actual forecast dates returned by the tool
      - Match the user's request (like "tomorrow") to the available forecast dates
      - If no forecast exists for the requested day, say so based on the actual data
      - Let the database/tool results determine what dates are available, don't calculate dates yourself
      
      FINANCIAL IMPACT REQUIREMENTS - MANDATORY FOR ALL RESPONSES:
      - ALWAYS include specific dollar amounts for any workforce recommendations
      - Show cost comparisons: "Option A costs $X/day vs Option B at $Y/day, saving $Z"
      - Calculate financial impact: "This change saves approximately $X per month by reducing overstaffing"
      - Include opportunity costs: "Understaffing could cost $Y in lost sales vs $Z in labor savings"
      - Provide ROI analysis: "Adding staff costs $X but prevents $Y in lost revenue"
      - Show break-even points: "This approach breaks even at $X in daily sales"
      
      RESPONSE STYLE WITH FINANCIAL FOCUS:
      - Give SHORT, DIRECT answers that focus on answering the specific question WITH DOLLAR AMOUNTS
      - Include ALL essential data (numbers, dates, key insights, FINANCIAL IMPACT) but without extra explanation
      - ALWAYS include specific cost/savings figures in your initial response
      - Use bullet points only when listing multiple items
      - Include financial reasoning in brief format unless user asks for more detail
      - If the user asks for "more detail", "explain", or "why", then provide comprehensive financial analysis
      
      ANSWER PATTERN WITH FINANCIAL FOCUS:
      - User asks "What's the forecast for tomorrow?" → "Tomorrow's forecast is $2,500 with 72% confidence. Optimal staffing: 3 people at $360 cost."
      - User asks "How many staff do I need?" → "Recommend 3 staff for $360 daily cost, saving $120/day vs 4 staff while maintaining service quality."
      - User asks "Why 3 staff?" or "Explain the reasoning" → Then provide full financial and business context
      
      When consulting other agents, present their key findings concisely without repeating their full analysis.`,
      
      model,
      tools: [getSalesDataTool, getForecastDataTool, callRosteringAgentTool]
    });

    // Create runner and execute
    console.log('Creating runner with model...');
    
    let result: unknown;
    // Define tool-to-agent mapping for generic collaboration detection
    const toolToAgentMap: Record<string, string> = {
      'get_sales_data': 'analyst',
      'get_forecast_data': 'analyst', 
      'consult_rostering_agent': 'rostering'
    };
    
    // Initialize toolsUsed outside try block for proper scoping
    const toolsUsed = new Set<string>();
    
    try {
      const runner = new Runner({ model });
      const newThread = thread.concat({ role: 'user', content: message });
      
      console.log('Running agent with thread length:', newThread.length);
      result = await runner.run(analystAgent, newThread);
      console.log('Agent execution completed, result keys:', Object.keys(result || {}));
      
      // Check which tools were called (for generic collaboration detection)
      if (result && (result as Record<string, unknown>).state && ((result as Record<string, unknown>).state as Record<string, unknown>)._modelResponses) {
        const responses = ((result as Record<string, unknown>).state as Record<string, unknown>)._modelResponses as unknown[];
        console.log('🔍 Number of model responses:', responses.length);
        
        responses.forEach((response: unknown, index: number) => {
          const responseObj = response as Record<string, unknown>;
          if (responseObj.output && Array.isArray(responseObj.output)) {
            console.log(`🔍 Response ${index} output items:`, (responseObj.output as unknown[]).map((item: unknown) => {
              const itemObj = item as Record<string, unknown>;
              return {
                type: itemObj.type,
                name: itemObj.name || 'no-name',
                keys: Object.keys(itemObj)
              };
            }));
            
            const toolCalls = (responseObj.output as unknown[]).filter((item: unknown) => (item as Record<string, unknown>).type === 'tool_use');
            const messages = (responseObj.output as unknown[]).filter((item: unknown) => (item as Record<string, unknown>).type === 'message');
            console.log(`Response ${index}: ${toolCalls.length} tool calls, ${messages.length} messages`);
            
            // Check all items for tool calls, regardless of type
            (responseObj.output as unknown[]).forEach((item: unknown) => {
              const itemObj = item as Record<string, unknown>;
              const toolName = itemObj.name || (itemObj.function && (itemObj.function as Record<string, unknown>).name);
              if (toolName) {
                toolsUsed.add(String(toolName));
                console.log(`🔧 Found tool call: ${toolName}`);
              }
            });
            
            toolCalls.forEach((tool: unknown) => {
              const toolObj = tool as Record<string, unknown>;
              console.log(`🔧 Tool called: ${toolObj.name} with params:`, toolObj.input);
              if (toolObj.name) {
                toolsUsed.add(toolObj.name as string);
              }
            });
          }
        });
      }
      
      console.log('🔍 All tools used:', Array.from(toolsUsed));
      
      // Update the chat thread with the conversation history
      if (result && (result as Record<string, unknown>).history) {
        chatThreads.set(userSessionId, (result as Record<string, unknown>).history as AgentInputItem[]);
      } else {
        // Fallback - add user message to thread
        chatThreads.set(userSessionId, newThread);
      }
      
      // Remove the direct OpenAI fallback - it bypasses tool usage
      
    } catch (error) {
      console.error('Agent execution error:', error);
      throw error;
    }

    // Get the response text - the result should contain the final response
    let responseText = 'No response generated';
    let agentUsed = 'analyst'; // Default to analyst
    
    // Log basic result info for debugging
    console.log('Agent result type:', typeof result);
    console.log('Has state:', !!(result as Record<string, unknown>)?.state);
    console.log('Model responses count:', ((result as Record<string, unknown>)?.state as Record<string, unknown>)?._modelResponses ? (((result as Record<string, unknown>).state as Record<string, unknown>)._modelResponses as unknown[]).length : 0);
    
    // Try different possible response formats
    if (typeof result === 'string') {
      responseText = result;
    } else if (result && typeof result === 'object') {
      const resultAny = result as Record<string, unknown>;
      
      // Handle OpenAI Agents SDK response structure
      if (resultAny.state && (resultAny.state as Record<string, unknown>)._modelResponses) {
        console.log('Found _modelResponses, count:', ((resultAny.state as Record<string, unknown>)._modelResponses as unknown[]).length);
        // Extract the last model response content
        const modelResponses = (resultAny.state as Record<string, unknown>)._modelResponses as unknown[];
        if (modelResponses.length > 0) {
          const lastResponse = modelResponses[modelResponses.length - 1] as Record<string, unknown>;
          console.log('Last response structure:', Object.keys(lastResponse));
          console.log('Last response output type:', typeof lastResponse.output);
          
          // Try different content structures - OpenAI Agents SDK uses 'output' property
          if (lastResponse.output) {
            if (Array.isArray(lastResponse.output)) {
              console.log('Output is array with length:', lastResponse.output.length);
              // Find the message in the output array
              const messageItem = lastResponse.output.find((item: Record<string, unknown>) => item.type === 'message');
              if (messageItem && messageItem.content) {
                console.log('Found message item with content:', Array.isArray(messageItem.content));
                if (Array.isArray(messageItem.content)) {
                  // Find the text content within the message content array
                  const textItem = messageItem.content.find((c: Record<string, unknown>) => c.type === 'text');
                  if (textItem && textItem.text) {
                    responseText = textItem.text;
                  } else {
                    // Fallback to first content item
                    responseText = messageItem.content[0]?.text || JSON.stringify(messageItem.content[0]);
                  }
                } else if (typeof messageItem.content === 'string') {
                  responseText = messageItem.content;
                }
              } else {
                // Fallback to first output item
                responseText = lastResponse.output[0]?.text || lastResponse.output[0]?.content || JSON.stringify(lastResponse.output[0]);
              }
            } else if (typeof lastResponse.output === 'string') {
              responseText = lastResponse.output;
            } else {
              responseText = JSON.stringify(lastResponse.output);
            }
          } else if (lastResponse.content) {
            // Fallback to content property
            if (Array.isArray(lastResponse.content)) {
              const textContent = lastResponse.content.find((c: Record<string, unknown>) => c.type === 'text');
              if (textContent && textContent.text) {
                responseText = textContent.text;
              } else {
                responseText = lastResponse.content[0]?.text || lastResponse.content[0]?.content || JSON.stringify(lastResponse.content[0]);
              }
            } else if (typeof lastResponse.content === 'string') {
              responseText = lastResponse.content;
            } else {
              responseText = JSON.stringify(lastResponse.content);
            }
          } else if (lastResponse.message) {
            responseText = String((lastResponse.message as Record<string, unknown>).content) || String(lastResponse.message);
          }
        }
      }
      
      // If we still don't have a response, try other fallbacks
      if (responseText === 'No response generated') {
        responseText = String(resultAny.value || resultAny.text || resultAny.content || resultAny.response || resultAny.message) ||
                     `Debug: ${JSON.stringify(resultAny).substring(0, 200)}...`;
      }
    }
    
    // Determine which agents were involved based on tools used
    const agentsInvolvedSet = new Set<string>();
    agentsInvolvedSet.add('analyst'); // Analyst is always the primary agent
    
    // Map tools to their corresponding agents
    Array.from(toolsUsed).forEach(toolName => {
      const agentId = toolToAgentMap[toolName];
      if (agentId && agentId !== 'analyst') {
        agentsInvolvedSet.add(agentId);
      }
    });
    
    const agentsArray = Array.from(agentsInvolvedSet);
    console.log('🔍 Agents involved:', agentsArray);
    
    // Determine the primary agent used for legacy agentUsed field
    if (agentsArray.includes('rostering') && agentsArray.length > 1) {
      agentUsed = 'rostering'; // Show as rostering if it was consulted
    }
    
    // Create agentsInvolved array for the new collaboration UI
    let agentsInvolved = undefined;
    if (agentsArray.length > 1) {
      console.log('✅ Multiple agents were involved - setting up collaboration indicators');
      agentsInvolved = [
        { agentId: 'analyst' as const, role: 'primary' as const },
        ...agentsArray.filter(id => id !== 'analyst').map(id => ({
          agentId: id as 'rostering', // TODO: Make this more generic when we add more agents
          role: 'consulted' as const
        }))
      ];
    } else {
      console.log('❌ Only analyst agent was used - no collaboration');
    }

    return NextResponse.json({
      response: responseText,
      sessionId: userSessionId,
      agentUsed: agentUsed,
      agentsInvolved: agentsInvolved,
    });

  } catch (error) {
    console.error('Analyst agent error:', error);
    return NextResponse.json(
      { error: `Failed to process request: ${error}` },
      { status: 500 }
    );
  }
}