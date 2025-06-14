import React, { useState } from "react";
import { sendMessage } from "@/services/chat";

export interface Message {
    id: string;
    type: "user" | "assistant";
    content: string;
    sources?: any[];
}

interface ChatInterfaceProps {
    // TODO: Define props interface
}

export default function ChatInterface(props: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSendMessage = async () => {
        // TODO: Implement message sending
        // 1. Add user message to chat
        // 2. Send request to backend API
        // 3. Add assistant response to chat
        // 4. Handle loading states and errors
        try {
            const userMessage: Message = {
                id: crypto.randomUUID(),
                type: "user",
                content: input,
            };
            setMessages((prevMsg) => [...prevMsg, userMessage]);

            const res = await sendMessage({ question: input, chat_history: messages });
            console.log("Chat response : ", res);

            const assResponse: Message = {
                id: crypto.randomUUID(),
                type: "assistant",
                content: res.answer,
            };
            setMessages((prevMsg) => [...prevMsg, assResponse]);
        } catch (err) {
            console.error("Error : ", err);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // TODO: Handle input changes
        setInput(e.target.value);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        // TODO: Handle enter key press
    };

    return (
        <div className="chat-interface">
            {/* TODO: Implement chat interface UI */}

            {/* Messages display area */}
            <div className="messages">
                {messages.map((msg) => (
                    <div key={msg.id} className={`max-w-[75%] p-3 rounded-lg text-sm ${msg.type === "user" ? "ml-auto bg-green-200 text-right" : "mr-auto bg-gray-200 text-left"}`}>
                        {msg.content}
                    </div>
                ))}
            </div>

            {/* Input area */}
            <div className="input-area">
                {/* TODO: Implement input field and send button */}
                <input type="text" onChange={handleInputChange} value={input} className="border rounded-md border-black w-1/2" />
            </div>
            <button onClick={handleSendMessage} className="bg-zinc-400 text-white p-2 rounded-md my-2">
                Send Message
            </button>
        </div>
    );
}
