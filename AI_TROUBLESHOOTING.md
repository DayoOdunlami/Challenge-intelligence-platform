# AI Chat Troubleshooting Guide

## Why GPT-4o and Temperature 0.7?

### Model: GPT-4o
- **Best quality** for complex queries about aviation data
- **Strong reasoning** for analyzing relationships and providing insights
- **Good balance** of speed and accuracy
- **Recommended** for production use

**Alternatives:**
- `gpt-4o-mini`: Faster and cheaper, good for testing
- `gpt-4-turbo`: Legacy option, still high quality
- `gpt-3.5-turbo`: Cheapest, but lower quality

### Temperature: 0.7
- **Balanced** between consistency and creativity
- **0.0-0.5**: Very focused, deterministic responses (good for data queries)
- **0.6-0.8**: Balanced (default, good for general use)
- **0.9-2.0**: More creative and varied (good for brainstorming)

**Why 0.7?**
- Consistent enough for accurate data analysis
- Creative enough for natural conversation
- Industry standard for most AI applications

## Configuration Options

### Method 1: Admin Panel (Recommended)
1. Go to `/admin/ai`
2. Scroll to "OpenAI Configuration"
3. Select model from dropdown
4. Adjust temperature slider
5. Click "Save Changes"
6. Changes take effect immediately for new chat messages

### Method 2: Environment Variables
Edit `.env.local` in the `Navigate1.0` directory:

```env
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4o
OPENAI_TEMPERATURE=0.7
```

**Note:** Restart dev server after changing `.env.local`

## Testing the API

### Step 1: Verify API Key
1. Check `.env.local` exists in `Navigate1.0` directory
2. Verify `OPENAI_API_KEY=sk-...` is set
3. Make sure key starts with `sk-` and is valid

### Step 2: Test Basic Chat
1. Go to `/navigate`
2. Open AI chat panel
3. Type "hi" or "What is NAVIGATE?"
4. Should see streaming response

### Step 3: Check Browser Console
- Open DevTools (F12)
- Go to Console tab
- Look for error messages
- Check Network tab for API call status

## Common Errors

### "Internal Server Error"
**Possible causes:**
1. **Missing API Key**
   - Check `.env.local` exists
   - Verify `OPENAI_API_KEY` is set
   - Restart dev server

2. **Invalid API Key**
   - Key may be expired
   - Key may not have credits
   - Key may be for wrong account

3. **Model Not Available**
   - Your account may not have access to GPT-4o
   - Try `gpt-4o-mini` or `gpt-3.5-turbo` instead
   - Check OpenAI dashboard for model access

4. **Rate Limit**
   - Too many requests
   - Wait a few minutes and try again
   - Check OpenAI dashboard for usage limits

5. **Insufficient Quota**
   - Account has no credits
   - Add credits to OpenAI account
   - Check billing in OpenAI dashboard

### "API error: Internal Server Error"
**Solution:**
1. Check server console (terminal where `npm run dev` is running)
2. Look for detailed error messages
3. Common issues:
   - API key format wrong (should be `sk-...`)
   - Model name typo
   - Network connectivity issues

### "OpenAI API key not configured"
**Solution:**
1. Create `.env.local` in `Navigate1.0` directory
2. Add: `OPENAI_API_KEY=sk-your-key-here`
3. Restart dev server completely
4. Make sure file is in correct location

## Debugging Steps

### 1. Verify File Location
```bash
# Should be at:
Navigate1.0/.env.local
```

### 2. Check API Key Format
```env
# Correct:
OPENAI_API_KEY=sk-proj-abc123...

# Wrong:
OPENAI_API_KEY=your_openai_api_key_here  # placeholder
OPENAI_API_KEY=sk-  # incomplete
```

### 3. Test API Key Directly
```bash
# In terminal (PowerShell):
$env:OPENAI_API_KEY="sk-your-key-here"
node -e "console.log(process.env.OPENAI_API_KEY)"
```

### 4. Check Server Logs
Look at the terminal where `npm run dev` is running:
- Should see: "Ready on http://localhost:3000"
- Should NOT see: "OPENAI_API_KEY not configured"
- Check for any error messages

### 5. Test API Endpoint
Open browser console and run:
```javascript
fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'test' }]
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

## Admin Panel Configuration

### How It Works
1. Admin panel stores settings in **browser localStorage**
2. Chat panel reads settings and sends them with each request
3. API route uses request settings if provided, otherwise falls back to `.env.local`

### Important Notes
- Admin panel changes are **per-browser** (localStorage)
- Changes take effect **immediately** for new messages
- Settings persist across page refreshes
- To reset: Click "Reset to Defaults" in admin panel

### Model Selection Guide
- **Production**: `gpt-4o` (best quality)
- **Testing**: `gpt-4o-mini` (faster, cheaper)
- **Budget**: `gpt-3.5-turbo` (lowest cost)

### Temperature Guide
- **Data Analysis**: 0.0-0.5 (very focused)
- **General Chat**: 0.6-0.8 (balanced) ← **Default**
- **Creative Tasks**: 0.9-2.0 (varied)

## Still Not Working?

1. **Check OpenAI Account**
   - Log into [platform.openai.com](https://platform.openai.com/)
   - Verify account has credits
   - Check API key is active
   - Verify model access (some accounts need approval for GPT-4)

2. **Verify Environment**
   - `.env.local` in correct location
   - File has correct format (no extra spaces)
   - Dev server restarted after changes

3. **Check Network**
   - Internet connection working
   - No firewall blocking OpenAI API
   - VPN not interfering

4. **Review Error Details**
   - Browser console for client errors
   - Server terminal for API errors
   - Network tab for HTTP status codes

## Quick Test Checklist

- [ ] `.env.local` exists in `Navigate1.0` directory
- [ ] `OPENAI_API_KEY=sk-...` is set (not placeholder)
- [ ] Dev server restarted after adding key
- [ ] Browser console shows no errors
- [ ] Network tab shows `/api/chat` returns 200 (not 500)
- [ ] OpenAI account has credits
- [ ] API key is valid (test in OpenAI dashboard)

