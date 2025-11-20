import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getGuardrails } from '@/config/ai-guardrails';
import { searchKnowledgeBase, formatKnowledgeBaseForContext } from '@/lib/knowledge-base-search';
import { AI_FUNCTION_DEFINITIONS, formatAICapabilities } from '@/lib/ai-functions';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please set OPENAI_API_KEY in .env.local' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { messages, context, model: requestModel, temperature: requestTemperature } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Get guardrails configuration
    const guardrails = getGuardrails();
    
    // Priority: request body > guardrails > environment variables > defaults
    // This allows admin panel to override settings per-request
    const model = requestModel || guardrails.model || process.env.OPENAI_MODEL || 'gpt-4o';
    const temperature = requestTemperature !== undefined 
      ? parseFloat(requestTemperature.toString())
      : (guardrails.temperature ?? parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'));

    // Search knowledge base for relevant context
    const lastUserMessage = messages[messages.length - 1]?.content || '';
    const kbResults = searchKnowledgeBase(lastUserMessage);
    const kbContext = formatKnowledgeBaseForContext(kbResults.slice(0, 3), 3000);

    // Build system prompt with context
    let systemPrompt = guardrails.systemPrompt;

    // Add AI capabilities (available visualizations and controls)
    systemPrompt += `\n\n${formatAICapabilities()}`;

    // Add knowledge base context if available
    if (kbContext) {
      systemPrompt += `\n\n## Relevant Knowledge Base Content\n\n${kbContext}\n\nUse this information to provide accurate, cited responses.`;
    }

    // Add current visualization context if provided
    if (context) {
      systemPrompt += `\n\n## Current Visualization Context\n`;
      if (context.activeViz) {
        systemPrompt += `- Active Visualization: ${context.activeViz}\n`;
      }
      if (context.useNavigateData) {
        systemPrompt += `- Data Source: NAVIGATE Platform Data\n`;
      }
      if (context.selectedEntities && context.selectedEntities.length > 0) {
        systemPrompt += `- Selected Entities: ${context.selectedEntities.map((e: any) => e.name || e.id).join(', ')}\n`;
      }
    }

    // Prepare messages for OpenAI
    const openaiMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: systemPrompt,
      },
      ...messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    // Call OpenAI API with function calling enabled
    const stream = await openai.chat.completions.create({
      model: model,
      messages: openaiMessages,
      temperature: temperature,
      stream: true,
      tools: AI_FUNCTION_DEFINITIONS.map(def => ({
        type: 'function' as const,
        function: def,
      })),
      tool_choice: 'auto', // Let the model decide when to use functions
    });

    // Create a readable stream for the response
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          const toolCallAccumulator: Record<number, { name?: string; arguments: string }> = {};
          
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta;
            
            // Handle text content
            const content = delta?.content || '';
            if (content) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
            }
            
            // Handle function calls (they come in chunks, need to accumulate)
            const toolCalls = delta?.tool_calls;
            if (toolCalls && toolCalls.length > 0) {
              for (const toolCall of toolCalls) {
                const index = toolCall.index;
                if (!toolCallAccumulator[index]) {
                  toolCallAccumulator[index] = { arguments: '' };
                }
                
                if (toolCall.function) {
                  if (toolCall.function.name) {
                    toolCallAccumulator[index].name = toolCall.function.name;
                  }
                  if (toolCall.function.arguments) {
                    toolCallAccumulator[index].arguments += toolCall.function.arguments;
                  }
                }
              }
            }
          }
          
          // Send completed function calls after stream ends
          for (const [index, toolCall] of Object.entries(toolCallAccumulator)) {
            if (toolCall.name && toolCall.arguments) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                type: 'function_call',
                function: {
                  name: toolCall.name,
                  arguments: toolCall.arguments,
                }
              })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Chat API error:', error);
    
    // Provide more helpful error messages
    let errorMessage = 'Failed to process chat request';
    let errorDetails = error.message || 'Unknown error';
    
    if (error.message?.includes('API key')) {
      errorMessage = 'OpenAI API key error';
      errorDetails = 'Please check that your OPENAI_API_KEY in .env.local is valid and has not expired.';
    } else if (error.message?.includes('rate limit')) {
      errorMessage = 'Rate limit exceeded';
      errorDetails = 'You have exceeded your OpenAI API rate limit. Please try again later.';
    } else if (error.message?.includes('insufficient_quota')) {
      errorMessage = 'Insufficient quota';
      errorDetails = 'Your OpenAI account has insufficient credits. Please add credits to your account.';
    } else if (error.message?.includes('model')) {
      errorMessage = 'Model error';
      errorDetails = `The model may not be available. Try changing the model in .env.local or admin panel.`;
    }
    
    return NextResponse.json(
      {
        error: errorMessage,
        details: errorDetails,
        type: error.constructor?.name || 'Error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  const hasApiKey = Boolean(process.env.OPENAI_API_KEY)
  const model = process.env.OPENAI_MODEL || 'gpt-4o'
  const temperature = parseFloat(process.env.OPENAI_TEMPERATURE || '0.7')

  if (!hasApiKey) {
    return NextResponse.json(
      {
        status: 'missing_api_key',
        message: 'OPENAI_API_KEY is not configured in .env.local',
        hasApiKey: false,
        model,
        temperature,
      },
      { status: 500 },
    )
  }

  return NextResponse.json({
    status: 'ok',
    message: 'Chat API ready',
    hasApiKey: true,
    model,
    temperature,
  })
}

