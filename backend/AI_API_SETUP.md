# AI Chatbot API Setup

The chatbot can use **Google Gemini** (recommended) and/or **OpenRouter**. Gemini’s free tier has higher rate limits, so it’s a good way to avoid “too many requests” errors.

## Option 1: Google Gemini (recommended – fewer rate limits)

1. Get a free API key: https://aistudio.google.com/apikey  
2. In `backend/.env` add:
   ```env
   GEMINI_API_KEY=your_key_here
   ```
   You can use `GOOGLE_GEMINI_API_KEY` instead if you prefer.

If Gemini is configured, it is tried **first**. If it fails or isn’t set, the app falls back to OpenRouter.

## Option 2: OpenRouter (fallback)

1. Get a key: https://openrouter.ai/keys  
2. In `backend/.env` add:
   ```env
   OPENROUTER_API_KEY=your_key_here
   ```

Free-tier OpenRouter models have stricter rate limits. You can add credits on OpenRouter for higher limits.

## Configuration summary

- **At least one** of `GEMINI_API_KEY` or `OPENROUTER_API_KEY` must be set.
- If both are set, Gemini is used first; OpenRouter is used if Gemini fails or isn’t configured.
- No API is truly “unlimited”; Gemini’s free tier is more generous and helps avoid 429 errors.

## Testing

Restart the backend after changing `.env`, then use the AI chat on a problem page. Check backend logs for “Trying Google Gemini…” or “Trying OpenRouter model: …”.

## Troubleshooting

- **AI not configured**: Set at least one of `GEMINI_API_KEY` or `OPENROUTER_API_KEY` in `backend/.env` and restart.
- **429 / Too many requests**: Prefer adding `GEMINI_API_KEY`; if using only OpenRouter, wait a minute or add credits for higher limits.
- Check backend console for detailed errors.
