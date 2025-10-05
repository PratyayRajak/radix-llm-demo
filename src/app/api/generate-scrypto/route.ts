import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, previousError } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Construct system prompt with Scrypto guidelines
    const systemPrompt = `You are an expert Scrypto developer. Scrypto is RadixDLT's smart contract language based on Rust.

CRITICAL RULES:
1. Generate ONLY valid Scrypto code that compiles with cargo scrypto test
2. Use proper Scrypto syntax with blueprints, components, and methods
3. Include comprehensive test modules with #[cfg(test)]
4. Follow Radix best practices for component state management
5. Use proper imports from scrypto::prelude::*

TEMPLATE STRUCTURE:
\`\`\`rust
use scrypto::prelude::*;

#[blueprint]
mod your_blueprint {
    struct YourComponent {
        // component state
    }

    impl YourComponent {
        pub fn instantiate_component() -> Global<YourComponent> {
            Self {
                // initialize state
            }
            .instantiate()
            .prepare_to_globalize(OwnerRole::None)
            .globalize()
        }

        pub fn your_method(&mut self) {
            // method implementation
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_instantiation() {
        // test implementation
    }
}
\`\`\`

${previousError ? `PREVIOUS ERROR TO FIX:\n${previousError}\n\nGenerate corrected code that fixes this error.` : ''}

Generate complete, compile-ready Scrypto code with tests.`;

    const userPrompt = previousError 
      ? `Fix the previous error and regenerate the Scrypto code for: ${prompt}`
      : `Generate Scrypto code for: ${prompt}`;

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'openai/chatgpt-4o-latest',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: `OpenRouter API error: ${error}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const generatedCode = data.choices[0].message.content;

    // Extract code from markdown code blocks if present
    let extractedCode = generatedCode;
    const codeBlockMatch = generatedCode.match(/```rust\n([\s\S]*?)\n```/);
    if (codeBlockMatch) {
      extractedCode = codeBlockMatch[1];
    }

    return NextResponse.json({
      code: extractedCode,
      rawResponse: generatedCode,
      model: data.model,
      usage: data.usage,
    });

  } catch (error) {
    console.error('Error generating Scrypto code:', error);
    return NextResponse.json(
      { error: 'Failed to generate code' },
      { status: 500 }
    );
  }
}