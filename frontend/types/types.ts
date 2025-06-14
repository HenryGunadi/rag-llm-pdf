import { string } from "zod";
import { Message } from "@/components/ChatInterface";

export type UploadPayload = {
    file: File;
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
