import axios from "axios";
import { MessageResponse, SendMessage } from "@/types/types";
import { use } from "react";

export async function sendMessage(requestBody: SendMessage) {
    try {
        const res = await axios.post<MessageResponse>(`${process.env.NEXT_PUBLIC_API_URL}/api/chat`, requestBody, {
            headers: {
                "Content-Type": "application/json",
            },
            withCredentials: true,
        });

        return res.data;
    } catch (err) {
        console.error("Error post chat request : ", err);
        throw new Error("Error sending message");
    }
}

export async function cleanUp(user_id: number) {
    try {
        const res = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/cleanup`, {
            params: { user_id: user_id },
            withCredentials: true,
        });

        return res.data;
    } catch (err) {
        console.error("Error post chat request : ", err);
        throw new Error("Error sending message");
    }
}
