import React, { useEffect, useState } from "react";
import { pdfFileSchema } from "@/validators/validators";
import { uploadRequest } from "@/services/upload";
import { UploadPayload } from "@/types/types";

interface FileUploadProps {
    onUploadComplete?: (result: any) => void;
    onUploadError?: (error: string) => void;
}

export default function FileUpload({ onUploadComplete, onUploadError }: FileUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        // TODO: Implement file selection
        // 1. Validate file type (PDF only)
        // 2. Validate file size
        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        try {
            const result = pdfFileSchema.safeParse(file);

            if (!result.success) {
                console.log("Error handling file selection");
                setFile(null);
                return;
            }

            setFile(file);
        } catch (err) {
            console.error("Error selecting file : ", err);
            setFile(null);
        }

        // 3. Set selected file
    };

    const handleUpload = async () => {
        // TODO: Implement file upload
        // 1. Create FormData with selected file
        // 2. Send POST request to /api/upload
        // 3. Handle upload progress
        // 4. Handle success/error responses
        if (!file) {
            return;
        }

        try {
            const payload: UploadPayload = {
                file: file,
            };

            setIsUploading(true);
            const response = await uploadRequest(payload);
            console.log("Upload response : ", response);
            // setUploadProgress(1);
        } catch (err) {
            console.error("Error uploading file : ", err);
            // setUploadProgress(0);
        } finally {
            setIsUploading(false);
        }
    };

    useEffect(() => {
        if (file) {
            console.log("File selected : ", file.name);
        }
    }, [file]);

    const handleDragOver = (e: React.DragEvent) => {
        // TODO: Handle drag over events
    };

    const handleDrop = (e: React.DragEvent) => {
        // TODO: Handle file drop events
    };

    return (
        <div className="file-upload">
            {/* TODO: Implement file upload UI */}

            {/* Drag & Drop area */}
            <div className="upload-area" onDragOver={handleDragOver} onDrop={handleDrop}>
                {/* TODO: Implement drag & drop UI */}
            </div>

            {/* File input */}
            <input type="file" accept=".pdf" onChange={handleFileSelect} />

            {/* Upload button */}
            <button onClick={handleUpload} disabled={!file || isUploading}>
                {isUploading ? "Uploading..." : "Upload PDF"}
            </button>

            {/* Progress bar */}
            {isUploading && <div className="progress-bar">{/* TODO: Implement progress bar */}</div>}
        </div>
    );
}
