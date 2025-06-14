import axios from "axios";
import { MessageResponse, SendMessage } from "@/types/types";

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
