export async function GET() {
  // Check if environment variables are properly set
  const apiKeyExists = !!process.env.OPENAI_API_KEY
  const orgIdExists = !!process.env.OPENAI_ORG_ID

  // Don't expose the actual keys, just confirm they exist
  return Response.json({
    success: true,
    environment: {
      OPENAI_API_KEY: apiKeyExists ? "✓ Set" : "✗ Missing",
      OPENAI_ORG_ID: orgIdExists ? "✓ Set" : "✗ Missing or Optional",
    },
    next_steps: apiKeyExists
      ? "Your OpenAI API key is configured. You can now use the AI chat features."
      : "Please add your OpenAI API key to the environment variables.",
  })
}
