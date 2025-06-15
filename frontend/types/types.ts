import { string } from "zod";

export type UploadPayload = {
    file: File;
    user_id: number;
};

export interface SendMessage {
    question: string;
    chat_history?: Message[];
}

export interface DocumentSource {
    content: string;
    page: number;
    score: number;
    metadata?: { [key: string]: any }[];
}

export interface MessageResponse {
    answer: string;
    sources: [DocumentSource];
    processing_time: number;
}

export interface UploadResponse {
    message: string;
    filename: string;
    chunks_count: number;
    processing_time: number;
}

export interface Message {
    id: string;
    type: "user" | "assistant";
    content: string;
    sources?: any[];
    timestamp: Date;
}
