import React from "react";
import Head from "next/head";
import FileUpload from "@/components/FileUpload";
import ChatInterface from "@/components/ChatInterface";

export default function Home() {
    return (
        <div className="w-full h-full flex justify-center items-center">
            <Head>
                <title>RAG-based Financial Q&A System</title>
                <meta name="description" content="AI-powered Q&A system for financial documents" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main>
                <h1 className="text-red-500">RAG-based Financial Statement Q&A System</h1>

                {/* TODO: Implement your components here */}
                {/* 
          Suggested components to implement:
          - FileUpload component for PDF upload
          - ChatInterface component for Q&A
          - DocumentViewer component for document display
        */}
                <ChatInterface></ChatInterface>
                <FileUpload></FileUpload>

                <div>
                    <p>Welcome to the RAG-based Q&A System!</p>
                    <p>Upload a financial statement PDF and start asking questions.</p>
                </div>
            </main>
        </div>
    );
}
