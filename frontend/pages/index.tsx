import Head from "next/head";
import React, { useState, useEffect, useRef } from "react";
import FileUpload from "@/components/FileUpload";
import { cleanUp, sendMessage } from "@/services/chat";
import { Upload, File, X, CheckCircle, AlertCircle, FileText, Send, Sun, Moon, Bot, User, Copy, Check } from "lucide-react";
import ChatInterface from "@/components/ChatInterface";
import { Message, MessageResponse } from "@/types/types";

export default function FinancialQASystem() {
    const [isDark, setIsDark] = useState<boolean>(false);
    const [uploadedFile, setUploadedFile] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleUploadComplete = (result: { message: string; processing_time: number; fileName: string; chunks_count: number }): void => {
        console.log("Upload completed:", result);
        setUploadedFile(result.fileName);
    };

    const handleUploadError = (error: string): void => {
        console.error("Upload error:", error);
    };

    const handleSendMessage = async (message: string, chat_history?: Message[]): Promise<MessageResponse | undefined> => {
        try {
            setIsLoading(true);

            const res = await sendMessage({ question: message, chat_history: chat_history });
            return res;
        } catch (err) {
            console.error("Error sending message : ", err);
        } finally {
            setIsLoading(false);
        }
    };

    const themeClasses = isDark ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900";

    useEffect(() => {
        const doCleanUp = async () => {
            try {
                // for demo purpose, we use dummy id
                await cleanUp(1);
            } catch (err) {
                console.error("Error cleaning up previous session");
            }
        };

        doCleanUp();
    }, []);

    return (
        <div className={`min-h-screen transition-colors duration-300 ${themeClasses}`}>
            {/* Header */}
            <header className={`border-b ${isDark ? "border-gray-700" : "border-gray-200"} p-6`}>
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">RAG-based Financial Q&A System</h1>
                        <p className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>AI-powered analysis of financial statements and documents</p>
                    </div>

                    <button
                        onClick={() => setIsDark(!isDark)}
                        className={`p-3 rounded-lg transition-colors ${isDark ? "bg-gray-800 hover:bg-gray-700 text-yellow-400" : "bg-gray-100 hover:bg-gray-200 text-gray-600"}`}
                        aria-label="Toggle theme"
                    >
                        {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Upload Section */}
                    <div className="space-y-6">
                        <FileUpload onUploadComplete={handleUploadComplete} onUploadError={handleUploadError} isDark={isDark} />

                        {/* Instructions */}
                        <div className={`p-6 rounded-2xl border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                            <h3 className="text-lg font-semibold mb-3">How to Use</h3>
                            <ol className={`space-y-2 text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                                <li className="flex items-start space-x-2">
                                    <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium">1</span>
                                    <span>Upload your financial statement or document (PDF format, max 10MB)</span>
                                </li>
                                <li className="flex items-start space-x-2">
                                    <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium">2</span>
                                    <span>Wait for the document to be processed and analyzed</span>
                                </li>
                                <li className="flex items-start space-x-2">
                                    <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium">3</span>
                                    <span>Start asking questions about the financial data in the chat</span>
                                </li>
                            </ol>
                        </div>
                    </div>

                    {/* Chat Section */}
                    <div className={`rounded-2xl border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} overflow-hidden`}>
                        <ChatInterface onSendMessage={handleSendMessage} isLoading={isLoading} isDark={isDark} uploadedFile={uploadedFile} />
                    </div>
                </div>
            </main>
        </div>
    );
}
