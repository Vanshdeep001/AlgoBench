import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../utils/axiosClient";
import { Send, Bot, User } from 'lucide-react';

function ChatAi({ problem }) {
    const [messages, setMessages] = useState([
        { role: 'model', parts: [{ text: "Hi! I'm your AI assistant. Feel free to ask me anything about this problem, and I'll help you understand it better." }] }
    ]);
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const onSubmit = async (data) => {
        if (!data.message.trim()) return;

        const userMessage = { role: 'user', parts: [{ text: data.message }] };
        setMessages(prev => [...prev, userMessage]);
        reset();
        setIsLoading(true);

        try {
            const response = await axiosClient.post("/ai/chat", {
                messages: [...messages, userMessage],
                title: problem.title,
                description: problem.description,
                testCases: problem.visibleTestCases,
                startCode: problem.startCode
            });

            setMessages(prev => [...prev, {
                role: 'model',
                parts: [{ text: response.data.message }]
            }]);
        } catch (error) {
            console.error("AI Chat Error:", error);
            const status = error.response?.status;
            const data = error.response?.data;
            let errorMessage = "I'm having trouble connecting right now. Please try again.";
            if (status === 401) {
                errorMessage = "Please log in to use the AI assistant.";
            } else if (status === 429) {
                errorMessage = data?.message || "Too many requests. Please wait a minute and try again.";
            } else if (data) {
                errorMessage = typeof data === "string" ? data : (data.message || errorMessage);
            } else if (error.message) {
                errorMessage = error.message;
            }
            setMessages(prev => [...prev, {
                role: 'model',
                parts: [{ text: `⚠️ ${errorMessage}` }]
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen max-h-[70vh] min-h-[500px]">
            <div
                className="flex-1 overflow-y-auto p-4 space-y-4"
                style={{ backgroundColor: '#0B0B0E' }}
            >
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                    >
                        <div
                            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                            style={{
                                backgroundColor: msg.role === "user" ? 'rgba(212, 175, 55, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                                border: msg.role === "user" ? '1px solid rgba(212, 175, 55, 0.4)' : '1px solid rgba(59, 130, 246, 0.4)'
                            }}
                        >
                            {msg.role === "user" ? (
                                <User className="w-4 h-4" style={{ color: '#D4AF37' }} />
                            ) : (
                                <Bot className="w-4 h-4" style={{ color: '#60a5fa' }} />
                            )}
                        </div>
                        <div
                            className="max-w-[80%] p-3 rounded-lg"
                            style={{
                                backgroundColor: msg.role === "user"
                                    ? 'rgba(212, 175, 55, 0.15)'
                                    : 'rgba(20, 20, 25, 0.95)',
                                border: msg.role === "user"
                                    ? '1px solid rgba(212, 175, 55, 0.3)'
                                    : '1px solid rgba(59, 130, 246, 0.2)',
                                color: '#EDEDED'
                            }}
                        >
                            <div className="text-sm whitespace-pre-wrap leading-relaxed">
                                {msg.parts[0].text}
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex gap-3">
                        <div
                            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                            style={{
                                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                                border: '1px solid rgba(59, 130, 246, 0.4)'
                            }}
                        >
                            <Bot className="w-4 h-4" style={{ color: '#60a5fa' }} />
                        </div>
                        <div
                            className="p-3 rounded-lg"
                            style={{
                                backgroundColor: 'rgba(20, 20, 25, 0.95)',
                                border: '1px solid rgba(59, 130, 246, 0.2)'
                            }}
                        >
                            <div className="flex gap-1">
                                <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#60a5fa', animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#60a5fa', animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#60a5fa', animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="sticky bottom-0 p-4"
                style={{
                    background: 'linear-gradient(135deg, rgba(20, 20, 25, 0.95) 0%, rgba(15, 15, 20, 0.98) 100%)',
                    borderTop: '1px solid rgba(212, 175, 55, 0.1)'
                }}
            >
                <div className="flex items-center gap-2">
                    <input
                        placeholder="Ask me anything about this problem..."
                        className="flex-1 px-4 py-2 rounded-lg text-sm transition-all"
                        style={{
                            backgroundColor: 'rgba(20, 20, 25, 0.8)',
                            border: '1px solid rgba(212, 175, 55, 0.2)',
                            color: '#EDEDED',
                            outline: 'none'
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = 'rgba(212, 175, 55, 0.5)';
                            e.target.style.boxShadow = '0 0 0 3px rgba(212, 175, 55, 0.1)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = 'rgba(212, 175, 55, 0.2)';
                            e.target.style.boxShadow = 'none';
                        }}
                        {...register("message", { required: true, minLength: 1 })}
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                        style={{
                            backgroundColor: 'rgba(212, 175, 55, 0.2)',
                            color: '#D4AF37',
                            border: '1px solid rgba(212, 175, 55, 0.4)'
                        }}
                        disabled={errors.message || isLoading}
                        onMouseEnter={(e) => {
                            if (!errors.message && !isLoading) {
                                e.target.style.backgroundColor = 'rgba(212, 175, 55, 0.3)';
                                e.target.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0.3)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'rgba(212, 175, 55, 0.2)';
                            e.target.style.boxShadow = 'none';
                        }}
                    >
                        <Send size={16} />
                        {isLoading ? 'Sending...' : 'Send'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ChatAi;