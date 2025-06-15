import React, { useState, useRef, useEffect } from "react";
import { Send, Sun, Moon, Bot, User, Copy, Check } from "lucide-react";
import { Message, MessageResponse } from "@/types/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import FormattedContent from "@/lib/helpers";

interface ChatInterfaceProps {
    onSendMessage?: (message: string, chat_history?: Message[]) => Promise<MessageResponse | undefined>;
    isLoading?: boolean;
    isDark?: boolean;
    uploadedFile?: string | null;
}

export default function ChatInterface({ onSendMessage, isLoading = false, isDark = false, uploadedFile = null }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            type: "assistant",
            content: uploadedFile
                ? `Great! I've loaded your document "${uploadedFile}". You can now ask me questions about your financial document. What would you like to know?`
                : "Hello! I'm your AI assistant. I can help you analyze financial documents and answer questions. Upload a PDF and start asking!",
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState<string>("");
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = (): void => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Update welcome message when file is uploaded
    useEffect(() => {
        if (uploadedFile) {
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === "welcome"
                        ? {
                              ...msg,
                              content: `Great! I've loaded your document "${uploadedFile}". You can now ask me questions about your financial document. What would you like to know?`,
                          }
                        : msg
                )
            );
        }
    }, [uploadedFile]);

    const handleSendMessage = async (): Promise<void> => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: crypto.randomUUID(),
            type: "user",
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        const currentInput = input;
        setInput("");

        try {
            if (onSendMessage) {
                const res = await onSendMessage(currentInput, messages); // careful here

                if (res) {
                    const assMessage: Message = {
                        id: crypto.randomUUID(),
                        type: "assistant",
                        content: res.answer,
                        timestamp: new Date(),
                    };

                    setMessages((prevMsg) => [...prevMsg, assMessage]);
                    console.log("Message sent");
                }
            } else {
                setTimeout(() => {
                    const responses = [
                        "Based on the financial document, I can see several key metrics. The revenue shows a positive trend over the reporting period.",
                        "Looking at the balance sheet, the company maintains a healthy cash position and manageable debt levels.",
                        "The income statement indicates strong operational performance with improving profit margins.",
                        "From the cash flow analysis, the company demonstrates solid liquidity and operational efficiency.",
                    ];
                    const assistantMessage: Message = {
                        id: crypto.randomUUID(),
                        type: "assistant",
                        content: uploadedFile ? responses[Math.floor(Math.random() * responses.length)] : "Please upload a financial document first so I can analyze it and answer your questions.",
                        timestamp: new Date(),
                    };
                    setMessages((prev) => [...prev, assistantMessage]);
                }, 1000);
            }
        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage: Message = {
                id: crypto.randomUUID(),
                type: "assistant",
                content: "Sorry, I encountered an error. Please try again.",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const copyToClipboard = async (text: string, messageId: string): Promise<void> => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedId(messageId);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (error) {
            console.error("Failed to copy:", error);
        }
    };

    const formatTime = (date: Date): string => {
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    const cardClasses = isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200";

    return (
        <div className="flex flex-col h-[600px] w-full max-w-4xl mx-auto">
            {/* Header */}
            <div className={`flex items-center justify-between p-4 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${isDark ? "bg-blue-600" : "bg-blue-500"}`}>
                        <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold">AI Assistant</h2>
                        <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{uploadedFile ? `Analyzing: ${uploadedFile}` : "Financial Document Analysis"}</p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div key={message.id} className={`flex items-start space-x-3 ${message.type === "user" ? "flex-row-reverse space-x-reverse" : ""}`}>
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${message.type === "user" ? (isDark ? "bg-green-600" : "bg-green-500") : isDark ? "bg-blue-600" : "bg-blue-500"}`}>
                            {message.type === "user" ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                        </div>

                        <div className={`flex-1 max-w-[80%] ${message.type === "user" ? "flex justify-end" : ""}`}>
                            <div className={`group relative rounded-2xl p-4 ${message.type === "user" ? (isDark ? "bg-green-600 text-white" : "bg-green-500 text-white") : `${cardClasses} border shadow-sm`}`}>
                                <div className="prose prose-sm max-w-none">
                                    {/* <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown> */}
                                    {message.type === "assistant" && /<emoji>|<text>|<answer>/.test(message.content) ? (
                                        <FormattedContent content={message.content} />
                                    ) : (
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                                    )}
                                </div>

                                <div className={`flex items-center justify-between mt-2 pt-2 border-t ${message.type === "user" ? "border-green-400/30" : isDark ? "border-gray-600" : "border-gray-100"}`}>
                                    <span className={`text-xs ${message.type === "user" ? "text-green-100" : isDark ? "text-gray-400" : "text-gray-500"}`}>{formatTime(message.timestamp)}</span>

                                    <button
                                        onClick={() => copyToClipboard(message.content, message.id)}
                                        className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-all ${
                                            message.type === "user" ? "hover:bg-green-400/20 text-green-100" : isDark ? "hover:bg-gray-600 text-gray-400" : "hover:bg-gray-100 text-gray-500"
                                        }`}
                                    >
                                        {copiedId === message.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isDark ? "bg-blue-600" : "bg-blue-500"}`}>
                            <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className={`${cardClasses} border shadow-sm rounded-2xl p-4`}>
                            <div className="flex space-x-1">
                                <div className={`w-2 h-2 rounded-full animate-bounce ${isDark ? "bg-gray-400" : "bg-gray-500"}`} style={{ animationDelay: "0ms" }}></div>
                                <div className={`w-2 h-2 rounded-full animate-bounce ${isDark ? "bg-gray-400" : "bg-gray-500"}`} style={{ animationDelay: "150ms" }}></div>
                                <div className={`w-2 h-2 rounded-full animate-bounce ${isDark ? "bg-gray-400" : "bg-gray-500"}`} style={{ animationDelay: "300ms" }}></div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className={`p-4 border-t ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                <div className={`flex items-end space-x-3 p-3 rounded-2xl border ${isDark ? "bg-gray-800 border-gray-600" : "bg-white border-gray-200"} shadow-sm`}>
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={uploadedFile ? "Ask me anything about your financial document..." : "Upload a document first to start asking questions..."}
                        className={`flex-1 resize-none bg-transparent border-none outline-none min-h-[20px] max-h-32 ${isDark ? "text-white placeholder-gray-400" : "text-gray-900 placeholder-gray-500"}`}
                        rows={1}
                        onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = "auto";
                            target.style.height = Math.min(target.scrollHeight, 128) + "px";
                        }}
                        disabled={isLoading}
                    />

                    <button
                        onClick={handleSendMessage}
                        disabled={!input.trim() || isLoading}
                        className={`p-2 rounded-xl transition-all ${
                            !input.trim() || isLoading
                                ? isDark
                                    ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : isDark
                                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
                                : "bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl"
                        } transform hover:scale-105 active:scale-95`}
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>

                <p className={`text-xs mt-2 ${isDark ? "text-gray-400" : "text-gray-500"} text-center`}>Press Enter to send, Shift+Enter for new line</p>
            </div>
        </div>
    );
}
