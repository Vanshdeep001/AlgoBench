const axios = require('axios');
const { GoogleGenerativeAI } = require("@google/generative-ai");


const solveDoubt = async (req, res) => {

    try {

        const { messages, title, description, testCases, startCode } = req.body;

        console.log('=== AI Chat Debug ===');
        console.log('Messages received:', messages?.length, 'messages');
        console.log('Has OpenRouter Key:', !!process.env.OPENROUTER_API_KEY);
        console.log('Has Gemini Key:', !!process.env.GEMINI_KEY);

        let openRouterSuccess = false;

        // Try OpenRouter first if key is available
        if (process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY !== 'your_openrouter_api_key_here') {
            console.log('Attempting OpenRouter API...');

            const systemContext = `You are an expert DSA (Data Structures and Algorithms) tutor helping with this problem:

Title: ${title || 'N/A'}
Description: ${description || 'N/A'}
Examples: ${JSON.stringify(testCases) || 'N/A'}

Provide hints, explanations, and guidance focused on this DSA problem. Help the user understand the concepts and approach, but don't give away the complete solution immediately unless asked.`;

            const openRouterMessages = [
                {
                    role: 'system',
                    content: systemContext
                },
                ...messages.map(msg => ({
                    role: msg.role === 'model' ? 'assistant' : 'user',
                    content: msg.parts[0].text
                }))
            ];

            try {
                const response = await axios.post(
                    'https://openrouter.ai/api/v1/chat/completions',
                    {
                        model: 'meta-llama/llama-3.1-8b-instruct:free',
                        messages: openRouterMessages
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                            'HTTP-Referer': 'http://localhost:3000',
                            'X-Title': 'AlgoBench AI Tutor',
                            'Content-Type': 'application/json'
                        },
                        timeout: 30000
                    }
                );

                const aiMessage = response.data.choices[0].message.content;

                console.log('✅ OpenRouter Response received successfully');
                return res.status(201).json({
                    message: aiMessage
                });

            } catch (openRouterError) {
                console.error('❌ OpenRouter API Error:', openRouterError.response?.data || openRouterError.message);
                console.log('⚠️ Falling back to Gemini API...');
                // Continue to Gemini fallback below
            }
        }

        // Use Gemini API (either as fallback or primary)
        console.log('Using Gemini API');

        if (!process.env.GEMINI_KEY) {
            throw new Error('No working AI API key configured. OpenRouter failed and no Gemini key available.');
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

        // Try different model names (Google keeps changing them)
        const modelNames = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro', 'gemini-1.0-pro'];
        let model = null;
        let lastError = null;

        for (const modelName of modelNames) {
            try {
                console.log(`Trying model: ${modelName}`);
                model = genAI.getGenerativeModel({ model: modelName });

                // Test if model works by trying to generate content
                const testResult = await model.generateContent('test');
                await testResult.response;

                console.log(`✅ Successfully using model: ${modelName}`);
                break;
            } catch (err) {
                console.log(`❌ Model ${modelName} failed:`, err.message);
                lastError = err;
                model = null;
            }
        }

        if (!model) {
            throw new Error(`All Gemini models failed. Your API key might be invalid or expired. Last error: ${lastError?.message}. Please check your GEMINI_KEY in .env file or get a new key from https://makersuite.google.com/app/apikey`);
        }

        const systemContext = `You are an expert DSA tutor helping with this problem:
Title: ${title || 'N/A'}
Description: ${description || 'N/A'}
Examples: ${testCases || 'N/A'}

Provide hints, code reviews, and solutions focused on this DSA problem only.`;

        const chatHistory = messages.map(msg => ({
            role: msg.role === 'model' ? 'model' : 'user',
            parts: msg.parts
        }));

        let validHistory = chatHistory;
        while (validHistory.length > 0 && validHistory[0].role === 'model') {
            validHistory = validHistory.slice(1);
        }

        if (validHistory.length === 0) {
            return res.status(400).json({
                message: "No valid messages to process"
            });
        }

        if (validHistory.length === 1) {
            const userMessage = systemContext + "\n\nUser: " + validHistory[0].parts[0].text;
            const result = await model.generateContent(userMessage);
            const response = await result.response;
            const text = response.text();

            console.log('✅ Gemini Response sent successfully');
            return res.status(201).json({
                message: text
            });
        }

        const historyWithContext = [...validHistory];
        historyWithContext[0] = {
            role: 'user',
            parts: [{ text: systemContext + "\n\n" + validHistory[0].parts[0].text }]
        };

        const chat = model.startChat({
            history: historyWithContext.slice(0, -1)
        });

        const lastMessage = validHistory[validHistory.length - 1];
        const result = await chat.sendMessage(lastMessage.parts[0].text);
        const response = await result.response;
        const text = response.text();

        console.log('✅ Gemini Response sent successfully');
        return res.status(201).json({
            message: text
        });

    }
    catch (err) {
        console.error('=== AI Chatbot Error ===');
        console.error('Error message:', err.message);
        console.error('Error stack:', err.stack);

        // Send more detailed error to frontend
        res.status(500).json({
            message: err.message || "Internal server error",
            error: err.message,
            details: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
}

module.exports = solveDoubt;
