# Environment Variables Template

Copy this content into a file named `.env.local` in the `Navigate1.0` directory.

```env
# ============================================================================
# OpenAI Configuration (Required for Text Chat)
# ============================================================================
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Model selection (defaults to gpt-4o if not specified)
OPENAI_MODEL=gpt-4o

# Optional: Temperature for responses (0.0-2.0, defaults to 0.7)
OPENAI_TEMPERATURE=0.7

# ============================================================================
# Pipecat Voice Integration (Optional - for future voice features)
# ============================================================================

# Deepgram API Key (Speech-to-Text)
DEEPGRAM_API_KEY=your_deepgram_api_key_here

# Anthropic Claude API Key (Alternative LLM for voice)
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# ElevenLabs API Key (Text-to-Speech)
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# ElevenLabs Voice ID (optional, defaults to 'Bella' if not specified)
ELEVENLABS_VOICE_ID=Bella

# ============================================================================
# Pipecat Configuration (Optional)
# ============================================================================

# WebSocket port for Pipecat voice server (defaults to 3001)
PIPECAT_PORT=3001

# Enable/disable voice features (set to 'true' when ready)
PIPECAT_ENABLED=false
```

## Quick Setup

1. **Create `.env.local` file** in the `Navigate1.0` directory
2. **Copy the template above** into the file
3. **Replace placeholders** with your actual API keys:
   - `your_openai_api_key_here` → Your OpenAI API key (required for text chat)
   - `your_deepgram_api_key_here` → Deepgram API key (for voice STT)
   - `your_anthropic_api_key_here` → Anthropic API key (for voice LLM)
   - `your_elevenlabs_api_key_here` → ElevenLabs API key (for voice TTS)

## Required for Text Chat

- ✅ **OPENAI_API_KEY** - Required to use the text chat feature

## Required for Voice (Future)

- **DEEPGRAM_API_KEY** - Speech-to-text
- **ANTHROPIC_API_KEY** or **OPENAI_API_KEY** - LLM for voice
- **ELEVENLABS_API_KEY** - Text-to-speech

## Getting API Keys

### OpenAI
1. Visit [platform.openai.com](https://platform.openai.com/)
2. Sign in → API Keys → Create new secret key

### Deepgram (for voice)
1. Visit [deepgram.com](https://deepgram.com/)
2. Sign up → Dashboard → API Keys

### Anthropic (for voice)
1. Visit [console.anthropic.com](https://console.anthropic.com/)
2. Sign in → API Keys → Create Key

### ElevenLabs (for voice)
1. Visit [elevenlabs.io](https://elevenlabs.io/)
2. Sign up → Profile → API Keys

## Security Note

⚠️ **Never commit `.env.local` to git!** It's already in `.gitignore` to protect your API keys.

