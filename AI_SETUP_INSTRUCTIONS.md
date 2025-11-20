# AI Assistant Setup Instructions

## Quick Start

1. **Create `.env.local` file** in the `Navigate1.0` directory (same level as `package.json`)

2. **Add your OpenAI API key:**
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Optional: Configure model and temperature:**
   ```env
   OPENAI_MODEL=gpt-4o
   OPENAI_TEMPERATURE=0.7
   ```

4. **Restart your development server** after adding the `.env.local` file

## Getting Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign in or create an account
3. Navigate to API Keys section
4. Click "Create new secret key"
5. Copy the key and paste it into `.env.local`

## Testing the Setup

1. Navigate to `/navigate` page
2. Open the AI chat panel (should be visible in the right sidebar or bottom panel depending on layout)
3. Send a test message like "What is the NAVIGATE platform?"
4. You should receive a streaming response from the AI

## Admin Configuration

To customize the AI assistant's behavior:

1. Navigate to `/admin/ai`
2. Edit the **System Prompt** to change how the AI responds
3. Add/remove **Allowed Topics** and **Restricted Topics**
4. Adjust **Settings** (tone, context length, citation requirements)
5. Click **Save Changes**

Changes are stored in browser localStorage and will persist across sessions.

## Knowledge Base

The AI assistant has access to knowledge base content stored in:
- `src/data/knowledge-base/policies/`
- `src/data/knowledge-base/stakeholders/`
- `src/data/knowledge-base/technologies/`
- `src/data/knowledge-base/statistics/`

To add new knowledge base entries:
1. Create a new markdown file in the appropriate directory
2. Export it in `src/data/knowledge-base/index.ts`
3. The AI will automatically search and include relevant content in responses

## Troubleshooting

### "OpenAI API key not configured" error
- Make sure `.env.local` exists in the `Navigate1.0` directory
- Verify the file contains `OPENAI_API_KEY=sk-...`
- Restart your dev server after creating/editing `.env.local`

### "Failed to process chat request" error
- Check that your API key is valid and has credits
- Verify your OpenAI account has access to the model (gpt-4o)
- Check the browser console for detailed error messages

### AI responses are slow
- The assistant uses streaming responses, so you'll see text appear gradually
- If responses are very slow, check your internet connection
- Consider using a faster model like `gpt-4o-mini` for testing

## Next Steps

Once the text chat is working:
- Voice integration will use the same API endpoint
- Function calling for UI control can be added to the system prompt
- Knowledge base can be expanded with more content

