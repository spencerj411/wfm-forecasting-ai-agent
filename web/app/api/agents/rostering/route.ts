import { Agent, Runner } from '@openai/agents';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { openai } from '@ai-sdk/openai';
import { aisdk } from '@openai/agents-extensions';
import { createGetForecastDataTool, createCalculateStaffingTool, createGetBusinessRulesTool } from '../shared-tools';

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

    // Create shared tools
    const getForecastDataTool = createGetForecastDataTool(supabase, user);
    const calculateStaffingTool = createCalculateStaffingTool(supabase, user);
    const getBusinessRulesTool = createGetBusinessRulesTool(supabase, user);

    // Create model and agent
    console.log('OpenAI API key configured:', !!process.env.OPENAI_API_KEY);
    console.log('OpenAI API key length:', process.env.OPENAI_API_KEY?.length || 0);
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

    // Create runner and execute
    const runner = new Runner({ model });
    const result = await runner.run(rosteringAgent, message);

    // Get the response text - the result should contain the final response
    let responseText = 'No response generated';
    
    // Log basic result info for debugging
    console.log('Rostering agent result type:', typeof result);
    console.log('Has state:', !!(result as any)?.state);
    console.log('Model responses count:', (result as any)?.state?._modelResponses?.length || 0);
    
    // Try different possible response formats
    if (typeof result === 'string') {
      responseText = result;
    } else if (result && typeof result === 'object') {
      // Cast to any to access properties dynamically
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const resultAny = result as any;
      
      // Handle OpenAI Agents SDK response structure
      if (resultAny.state && resultAny.state._modelResponses) {
        console.log('Found _modelResponses, count:', resultAny.state._modelResponses.length);
        // Extract the last model response content
        const modelResponses = resultAny.state._modelResponses;
        if (modelResponses.length > 0) {
          const lastResponse = modelResponses[modelResponses.length - 1];
          console.log('Last response structure:', Object.keys(lastResponse));
          console.log('Last response output type:', typeof lastResponse.output);
          
          // Try different content structures - OpenAI Agents SDK uses 'output' property
          if (lastResponse.output) {
            if (Array.isArray(lastResponse.output)) {
              console.log('Output is array with length:', lastResponse.output.length);
              // Find the message in the output array
              const messageItem = lastResponse.output.find((item: any) => item.type === 'message');
              if (messageItem && messageItem.content) {
                console.log('Found message item with content:', Array.isArray(messageItem.content));
                if (Array.isArray(messageItem.content)) {
                  // Find the text content within the message content array
                  const textItem = messageItem.content.find((c: any) => c.type === 'text');
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
              const textContent = lastResponse.content.find((c: any) => c.type === 'text');
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
            responseText = lastResponse.message.content || lastResponse.message;
          }
        }
      }
      
      // If we still don't have a response, try other fallbacks
      if (responseText === 'No response generated') {
        responseText = resultAny.value ||
                     resultAny.text || 
                     resultAny.content || 
                     resultAny.response || 
                     resultAny.message ||
                     (resultAny.choices && resultAny.choices[0]?.message?.content) ||
                     (resultAny.messages && resultAny.messages[resultAny.messages.length - 1]?.content) ||
                     (Array.isArray(resultAny) && resultAny[resultAny.length - 1]?.content) ||
                     `Debug: ${JSON.stringify(resultAny).substring(0, 200)}...`;
      }
    }

    return NextResponse.json({
      response: responseText,
      sessionId: sessionId || `rostering-${user.id}`,
      agentUsed: 'rostering',
    });

  } catch (error) {
    console.error('Rostering agent error:', error);
    return NextResponse.json(
      { error: `Failed to process request: ${error}` },
      { status: 500 }
    );
  }
}