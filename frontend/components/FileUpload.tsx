import React, { useEffect, useState, useRef } from "react";
import { Upload, File, X, CheckCircle, AlertCircle, FileText } from "lucide-react";
import { UploadPayload } from "@/types/types";
import { uploadRequest } from "@/services/upload";

interface FileUploadProps {
    onUploadComplete?: (result: { message: string; chunks_count: number; fileName: string; processing_time: number }) => void;
    onUploadError?: (error: string) => void;
    isDark?: boolean;
}

// FileUpload Component
export default function FileUpload({ onUploadComplete, onUploadError, isDark = false }: FileUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [isDragOver, setIsDragOver] = useState<boolean>(false);
    const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dragCounterRef = useRef<number>(0);

    useEffect(() => {
        if (isUploading && uploadProgress < 100) {
            const timer = setTimeout(() => {
                setUploadProgress((prev) => Math.min(prev + Math.random() * 30, 95));
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [isUploading, uploadProgress]);

    const validateFile = (file: File): string | null => {
        if (file.type !== "application/pdf") {
            return "Please select a PDF file only.";
        }
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return "File size must be less than 10MB.";
        }
        return null;
    };

    const handleFileSelect = (selectedFile: File): void => {
        const error = validateFile(selectedFile);
        if (error) {
            setErrorMessage(error);
            setUploadStatus("error");
            if (onUploadError) onUploadError(error);
            return;
        }
        setFile(selectedFile);
        setUploadStatus("idle");
        setErrorMessage("");
        setUploadProgress(0);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) handleFileSelect(selectedFile);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>): void => {
        e.preventDefault();
        e.stopPropagation();
        dragCounterRef.current++;
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>): void => {
        e.preventDefault();
        e.stopPropagation();
        dragCounterRef.current--;
        if (dragCounterRef.current === 0) {
            setIsDragOver(false);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        dragCounterRef.current = 0;
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) handleFileSelect(droppedFile);
    };

    const handleUpload = async (): Promise<void> => {
        if (!file) return;
        try {
            setIsUploading(true);
            setUploadProgress(0);
            setUploadStatus("idle");

            const payload: UploadPayload = {
                file: file,
                user_id: 1,
            };

            // const uploadPromise = new Promise<{ success: boolean; fileId: string; fileName: string }>((resolve, reject) => {
            //     setTimeout(() => {
            //         if (Math.random() > 0.1) {
            //             resolve({ success: true, fileId: "demo-file-id", fileName: file.name });
            //         } else {
            //             reject(new Error("Upload failed. Please try again."));
            //         }
            //     }, 2000);
            // });

            const result = await uploadRequest(payload);
            setUploadProgress(100);
            setUploadStatus("success");

            // if (onUploadComplete) onUploadComplete(result);
            if (onUploadComplete) {
                onUploadComplete({
                    message: result.message,
                    fileName: result.filename,
                    chunks_count: result.chunks_count,
                    processing_time: result.processing_time,
                });
            }
        } catch (err) {
            setUploadStatus("error");
            const errorMsg = err instanceof Error ? err.message : "Upload failed. Please try again.";
            setErrorMessage(errorMsg);
            if (onUploadError) onUploadError(errorMsg);
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveFile = (): void => {
        setFile(null);
        setUploadProgress(0);
        setUploadStatus("idle");
        setErrorMessage("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const cardClasses = isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200";

    return (
        <div className={`w-full max-w-2xl mx-auto p-6 rounded-2xl border-2 transition-all duration-300 ${isDragOver ? (isDark ? "border-blue-500 bg-blue-500/10" : "border-blue-400 bg-blue-50") : cardClasses}`}>
            <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Upload Financial Document</h3>
                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>Upload a PDF file to start analyzing your financial documents</p>
            </div>

            <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                    isDragOver ? (isDark ? "border-blue-500 bg-blue-500/5" : "border-blue-400 bg-blue-50") : isDark ? "border-gray-600 hover:border-gray-500" : "border-gray-300 hover:border-gray-400"
                } ${!file && !isUploading ? "cursor-pointer" : ""}`}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !file && !isUploading && fileInputRef.current?.click()}
            >
                {!file ? (
                    <div className="space-y-4">
                        <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${isDark ? "bg-gray-700" : "bg-gray-100"}`}>
                            <Upload className={`w-8 h-8 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
                        </div>
                        <div>
                            <p className="text-lg font-medium mb-1">
                                Drop your PDF here, or <span className="text-blue-500">browse</span>
                            </p>
                            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Maximum file size: 10MB</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className={`flex items-center justify-between p-4 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-50"}`}>
                            <div className="flex items-center space-x-3">
                                <div
                                    className={`p-2 rounded ${
                                        uploadStatus === "success" ? "bg-green-100 text-green-600" : uploadStatus === "error" ? "bg-red-100 text-red-600" : isDark ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-600"
                                    }`}
                                >
                                    {uploadStatus === "success" ? <CheckCircle className="w-5 h-5" /> : uploadStatus === "error" ? <AlertCircle className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                                </div>
                                <div className="text-left">
                                    <p className="font-medium text-sm">{file.name}</p>
                                    <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>{formatFileSize(file.size)}</p>
                                </div>
                            </div>
                            {!isUploading && uploadStatus !== "success" && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveFile();
                                    }}
                                    className={`p-1 rounded-full transition-colors ${isDark ? "hover:bg-gray-600 text-gray-400" : "hover:bg-gray-200 text-gray-500"}`}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {(isUploading || uploadStatus === "success") && (
                            <div className="space-y-2">
                                <div className={`w-full rounded-full h-2 ${isDark ? "bg-gray-700" : "bg-gray-200"}`}>
                                    <div className={`h-2 rounded-full transition-all duration-300 ${uploadStatus === "success" ? "bg-green-500" : "bg-blue-500"}`} style={{ width: `${uploadProgress}%` }} />
                                </div>
                                <p className={`text-xs text-center ${isDark ? "text-gray-400" : "text-gray-500"}`}>{uploadStatus === "success" ? "Upload completed!" : `Uploading... ${Math.round(uploadProgress)}%`}</p>
                            </div>
                        )}

                        {uploadStatus === "error" && errorMessage && (
                            <div className={`p-3 rounded-lg ${isDark ? "bg-red-900/20 border border-red-800" : "bg-red-50 border border-red-200"}`}>
                                <p className={`text-sm ${isDark ? "text-red-400" : "text-red-600"}`}>{errorMessage}</p>
                            </div>
                        )}
                    </div>
                )}
                <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleInputChange} className="hidden" />
            </div>

            {file && uploadStatus !== "success" && (
                <div className="mt-6">
                    <button
                        onClick={handleUpload}
                        disabled={!file || isUploading}
                        className={`w-full py-3 px-6 rounded-xl font-medium transition-all duration-200 ${
                            !file || isUploading
                                ? isDark
                                    ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : isDark
                                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
                                : "bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl"
                        } transform hover:scale-[1.02] active:scale-[0.98]`}
                    >
                        {isUploading ? (
                            <div className="flex items-center justify-center space-x-2">
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                <span>Uploading...</span>
                            </div>
                        ) : (
                            "Upload PDF"
                        )}
                    </button>
                </div>
            )}

            {uploadStatus === "success" && (
                <div className={`mt-6 p-4 rounded-xl ${isDark ? "bg-green-900/20 border border-green-800" : "bg-green-50 border border-green-200"}`}>
                    <div className="flex items-center space-x-2">
                        <CheckCircle className={`w-5 h-5 ${isDark ? "text-green-400" : "text-green-600"}`} />
                        <p className={`font-medium ${isDark ? "text-green-400" : "text-green-700"}`}>File uploaded successfully!</p>
                    </div>
                    <p className={`text-sm mt-1 ${isDark ? "text-green-300" : "text-green-600"}`}>You can now start asking questions about your document.</p>
                </div>
            )}
        </div>
    );
}
