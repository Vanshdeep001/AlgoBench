const axios = require('axios');

// Per-user rate limit: 1 AI request every 20 seconds (avoids burning provider quota)
const AI_COOLDOWN_MS = 20 * 1000;
const lastRequestByUser = new Map();

// Google Gemini via @google/genai SDK (model: gemini-3-flash-preview)
const GEMINI_MODEL = 'gemini-3-flash-preview';

// OpenRouter free models (fallback)
const OPENROUTER_FREE_MODELS = [
    'google/gemini-2.0-flash-exp:free',
    'google/gemma-3-27b-it:free',
    'meta-llama/llama-3.2-3b-instruct:free',
];

function getApiError(err) {
    const data = err.response?.data;
    if (!data) return err.message;
    return data.error?.message ?? data.message ?? (typeof data === 'string' ? data : err.message);
}

function getGeminiKey() {
    const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY;
    return key && key !== 'your_gemini_api_key_here' ? key : null;
}

/** Call Google Gemini API using @google/genai SDK. */
async function tryGemini(systemContext, mappedMessages) {
    const apiKey = getGeminiKey();
    if (!apiKey) return null;

    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });

    // Build contents: array of { role: 'user'|'model', parts: [{ text }] }
    const contents = mappedMessages.map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
    }));

    const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents,
        systemInstruction: { parts: [{ text: systemContext }] }
    });

    const text = response?.text;
    return text != null && text !== '' ? String(text) : null;
}

const solveDoubt = async (req, res) => {
    try {
        const { messages, title, description, testCases, startCode } = req.body;

        // Per-user cooldown so one question doesn't trigger multiple provider calls in a row
        const userId = req.result?._id?.toString();
        if (userId) {
            const now = Date.now();
            const last = lastRequestByUser.get(userId);
            if (last != null && (now - last) < AI_COOLDOWN_MS) {
                return res.status(429).json({
                    message: 'Please wait a few seconds before sending another message.'
                });
            }
            lastRequestByUser.set(userId, now);
        }

        const hasGemini = !!getGeminiKey();
        const hasOpenRouter = !!(process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY !== 'your_openrouter_api_key_here');

        console.log('=== AI Chat Debug ===');
        console.log('Messages received:', messages?.length, 'messages');
        console.log('Has Gemini Key:', hasGemini, '| Has OpenRouter Key:', hasOpenRouter);

        if (!hasGemini && !hasOpenRouter) {
            return res.status(503).json({
                message: 'AI is not configured. Set GEMINI_API_KEY (recommended, generous free tier) or OPENROUTER_API_KEY in backend/.env. Gemini: https://aistudio.google.com/apikey | OpenRouter: https://openrouter.ai/keys'
            });
        }

        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({
                message: 'No messages to process.'
            });
        }

        const systemContext = `You are an expert DSA (Data Structures and Algorithms) tutor on AlgoBench. Your role is to help the user with the problem they are currently working on.

## Strict rules
- Answer ONLY Data Structures and Algorithms (DSA) questions. If the user asks something off-topic (e.g. general knowledge, other subjects), politely say: "I'm here to help with DSA and this problem only. Please ask about the problem, approach, or code related to it."
- Always base your answers on the **current problem** below. When replying, reference the problem when relevant (e.g. "For this problem...", "Given the problem statement...").

## Current problem context (use this in every answer when relevant)

**Title:** ${title || 'N/A'}

**Description:**
${description || 'N/A'}

**Examples / Test cases:**
${typeof testCases === 'string' ? testCases : JSON.stringify(testCases || [], null, 2)}

**Starter code (if any):**
${startCode ? (typeof startCode === 'string' ? startCode : JSON.stringify(startCode)) : 'None'}

## How to help
- When the user asks for a solution, explanation, debug, or optimization, first briefly acknowledge the problem (e.g. "For **${title || 'this problem'}**, ...") then respond.
- If they ask for debugging or a solution but haven't pasted their code, ask them to paste the code they're working on so you can help. Otherwise use the problem description and examples to guide your answer.
- Provide hints and explanations focused on DSA (complexity, approach, data structures). You may give the full solution if they explicitly ask for it; otherwise prefer guiding them step by step.
- Keep answers clear, concise, and relevant to this problem and DSA only.`;

        const mapped = messages
            .map(msg => {
                const text = msg.parts?.[0]?.text ?? (typeof msg.content === 'string' ? msg.content : null);
                if (text == null || text === '') return null;
                return {
                    role: msg.role === 'model' ? 'assistant' : 'user',
                    content: String(text)
                };
            })
            .filter(Boolean);

        if (mapped.length === 0) {
            return res.status(400).json({
                message: 'No valid messages to process.'
            });
        }

        // 1) Try Google Gemini first
        if (hasGemini) {
            try {
                console.log('Trying Google Gemini...');
                const geminiText = await tryGemini(systemContext, mapped);
                if (geminiText) {
                    console.log('✅ Gemini success');
                    return res.status(201).json({ message: geminiText });
                }
            } catch (err) {
                const status = err.response?.status ?? err.status;
                if (status === 429) {
                    return res.status(429).json({
                        message: 'Too many requests. Please wait a minute and try again.'
                    });
                }
                console.error('❌ Gemini failed:', getApiError(err));
            }
        }

        // 2) Fallback: OpenRouter
        const openRouterMessages = [
            { role: 'system', content: systemContext },
            ...mapped
        ];
        const requestConfig = {
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'HTTP-Referer': 'http://localhost:5173',
                'X-Title': 'AlgoBench AI Tutor',
                'Content-Type': 'application/json'
            },
            timeout: 60000
        };

        let lastError = null;
        for (const model of OPENROUTER_FREE_MODELS) {
            if (!hasOpenRouter) break;
            try {
                console.log(`Trying OpenRouter model: ${model}`);
                const response = await axios.post(
                    'https://openrouter.ai/api/v1/chat/completions',
                    { model, messages: openRouterMessages },
                    requestConfig
                );
                const choice = response.data?.choices?.[0];
                const aiMessage = choice?.message?.content ?? choice?.text;
                if (aiMessage != null && aiMessage !== '') {
                    console.log(`✅ OpenRouter success with model: ${model}`);
                    return res.status(201).json({
                        message: typeof aiMessage === 'string' ? aiMessage : String(aiMessage)
                    });
                }
            } catch (err) {
                lastError = err;
                console.error(`❌ Model ${model} failed:`, getApiError(err));
            }
        }

        let message = lastError
            ? getApiError(lastError)
            : 'AI returned an empty response. Please try again.';
        let status = lastError?.response?.status || 502;
        if (status === 429) {
            message = 'Too many requests. Please wait a minute and try again.';
        }
        return res.status(status).json({
            message,
            error: message,
            details: process.env.NODE_ENV === 'development' && lastError?.stack ? lastError.stack : undefined
        });
    } catch (err) {
        console.error('=== AI Chatbot Error ===', err.message);
        const status = err.response?.status || 500;
        const message = getApiError(err) || err.message || 'Internal server error';
        res.status(status).json({
            message,
            error: message,
            details: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};

module.exports = solveDoubt;
// Development-only key check endpoint (exports for route)
async function checkKeys(req, res) {
    try {
        const results = {
            gemini: null,
            openrouter: []
        };

        // Test Gemini if key present
        const geminiKey = getGeminiKey();
        if (geminiKey) {
            try {
                const text = await tryGemini('Health check: respond with "ok".', [
                    { role: 'user', content: 'Please reply with ok' }
                ]);
                results.gemini = text ?? 'No response';
            } catch (err) {
                results.gemini = getApiError(err);
            }
        } else {
            results.gemini = 'No Gemini key configured';
        }

        // Test OpenRouter if configured
        const hasOpenRouter = !!(process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY !== 'your_openrouter_api_key_here');
        if (hasOpenRouter) {
            const openRouterMessages = [
                { role: 'system', content: 'Health check' },
                { role: 'user', content: 'Please reply with ok' }
            ];
            for (const model of OPENROUTER_FREE_MODELS) {
                try {
                    const response = await axios.post(
                        'https://openrouter.ai/api/v1/chat/completions',
                        { model, messages: openRouterMessages },
                        {
                            headers: {
                                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                                'Content-Type': 'application/json'
                            },
                            timeout: 10000
                        }
                    );
                    const choice = response.data?.choices?.[0];
                    const aiMessage = choice?.message?.content ?? choice?.text;
                    results.openrouter.push({ model, ok: true, message: aiMessage ?? 'No response', raw: process.env.NODE_ENV === 'development' ? response.data : undefined });
                } catch (err) {
                    results.openrouter.push({ model, ok: false, error: getApiError(err) });
                }
            }
        } else {
            results.openrouter = 'No OpenRouter key configured';
        }

        return res.status(200).json(results);
    } catch (err) {
        return res.status(500).json({ error: getApiError(err) });
    }
}

module.exports = { solveDoubt, checkKeys };
