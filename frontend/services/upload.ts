import { UploadPayload, UploadResponse } from "@/types/types";
import axios from "axios";
import { error } from "console";

export async function uploadRequest(payload: UploadPayload) {
    try {
        const formData = new FormData();
        formData.append("file", payload.file);
        console.log("API URL : ", process.env.NEXT_PUBLIC_API_URL);
        const res = await axios.post<UploadResponse>(`${process.env.NEXT_PUBLIC_API_URL}/api/upload?user_id=${payload.user_id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            withCredentials: true,
        });

        console.log("Upload successful");
        return res.data;
    } catch (err) {
        throw err;
    }
}
