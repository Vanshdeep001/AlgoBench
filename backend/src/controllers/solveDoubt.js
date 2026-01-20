const { GoogleGenerativeAI } = require("@google/generative-ai");


const solveDoubt = async (req, res) => {

    try {

        const { messages, title, description, testCases, startCode } = req.body;

        console.log('=== AI Chat Debug ===');
        console.log('Messages received:', messages?.length, 'messages');
        console.log('Has API Key:', !!process.env.GEMINI_KEY);

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

        // Use gemini-pro without systemInstruction for compatibility
        const model = genAI.getGenerativeModel({
            model: "gemini-pro"
        });

        // Convert messages to Gemini format and add system context as first user message
        const systemContext = `You are an expert DSA tutor helping with this problem:
Title: ${title || 'N/A'}
Description: ${description || 'N/A'}
Examples: ${testCases || 'N/A'}

Provide hints, code reviews, and solutions focused on this DSA problem only.`;

        const chatHistory = messages.map(msg => ({
            role: msg.role === 'model' ? 'model' : 'user',
            parts: msg.parts
        }));

        // Ensure chat history starts with 'user' role (Gemini requirement)
        let validHistory = chatHistory;
        while (validHistory.length > 0 && validHistory[0].role === 'model') {
            validHistory = validHistory.slice(1);
        }

        // If we have no messages, return error
        if (validHistory.length === 0) {
            return res.status(400).json({
                message: "No valid messages to process"
            });
        }

        // For first message, prepend system context
        if (validHistory.length === 1) {
            const userMessage = systemContext + "\n\nUser: " + validHistory[0].parts[0].text;
            const result = await model.generateContent(userMessage);
            const response = await result.response;
            const text = response.text();

            return res.status(201).json({
                message: text
            });
        }

        // For chat with history, add system context to first message
        const historyWithContext = [...validHistory];
        historyWithContext[0] = {
            role: 'user',
            parts: [{ text: systemContext + "\n\n" + validHistory[0].parts[0].text }]
        };

        const chat = model.startChat({
            history: historyWithContext.slice(0, -1)
        });

        // Send the last message
        const lastMessage = validHistory[validHistory.length - 1];
        const result = await chat.sendMessage(lastMessage.parts[0].text);
        const response = await result.response;
        const text = response.text();

        res.status(201).json({
            message: text
        });
        console.log('AI Response sent successfully');

    }
    catch (err) {
        console.error('=== AI Chatbot Error ===');
        console.error('Error message:', err.message);
        console.error('Error stack:', err.stack);
        res.status(500).json({
            message: "Internal server error",
            error: err.message,
            details: err.toString()
        });
    }
}

module.exports = solveDoubt;
