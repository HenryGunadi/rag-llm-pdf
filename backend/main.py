from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from models.schemas import ChatRequest, ChatResponse, DocumentsResponse, UploadResponse, DocumentInfo
from services.pdf_processor import PDFProcessor
from services.vector_store import VectorStoreService
from services.rag_pipeline import RAGPipeline
from config import settings
import logging
import time
import os
from validators import validators
from typing import List
import onnxruntime
print("DEVICE : ", onnxruntime.get_device())

# Configure logging
logging.basicConfig(level=settings.log_level)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="RAG-based Financial Statement Q&A System",
    description="AI-powered Q&A system for financial documents using RAG",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
# TODO: Initialize your services here

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    # TODO: Initialize your services
    logger.info("Starting RAG Q&A System...")

    try:
        app.state.pdf_processor = PDFProcessor("../data/sample.pdf")
        app.state.vector_store = VectorStoreService()
        app.state.rag_pipeline = RAGPipeline(
            api_key=settings.openai_api_key,
            vector_store_service=app.state.vector_store
        )

        logger.info("All services initialized successfully.")
    except Exception as e:
        logger.error("Error starting services : ", e)

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "RAG-based Financial Statement Q&A System is running"}

@app.post("/api/upload")
async def upload_pdf(request: Request, file: UploadFile = File(...)):
    """Upload and process PDF file"""
    # TODO: Implement PDF upload and processing
    try:
        print(f"Received file: {file.filename}, type: {file.content_type}")
        start = time.time()
        # 1. Validate file type (PDF)
        validators.validate_file(file)
        # 2. Save uploaded file
        chunks_count = 0
        upload_path = os.path.join(settings.pdf_upload_path, file.filename)
        with open(upload_path, "wb") as f:
            while chunk := await file.read(1024): # 1 KB chunks
                f.write(chunk)
                chunks_count += len(chunk)

        # 3. Process PDF and extract text
        pdf_processor: PDFProcessor = request.app.state.pdf_processor
        vector_store: VectorStoreService = request.app.state.vector_store
        processed_docs = pdf_processor.process_pdf(file_path=upload_path)

        # 4. Store documents in vector database
        vector_store.add_documents(processed_docs)

        processing_time = time.time() - start

        # 5. Return processing results
        return UploadResponse(message="File uploaded successfully",
                              filename=file.filename,
                              chunks_count=chunks_count,
                              processing_time=processing_time)
    except Exception as e:
        print(f"Error processing PDF: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process PDF : {e}")

@app.post("/api/chat")
async def chat(chat: ChatRequest, request: Request):
    """Process chat request and return AI response"""
    # TODO: Implement chat functionality
    # 1. Validate request
    # 2. Use RAG pipeline to generate answer
    # 3. Return response with sources
    try:
        rag_pipeline: RAGPipeline = request.app.state.rag_pipeline
        print("USER CHAT : ", chat.question)
        answer = await rag_pipeline.generate_answer(question=chat.question)
        
        return ChatResponse(**answer)
    except Exception as e:
        logger.error(f"Error handling chat request : {e}")

@app.get("/api/documents/{user_id}")
async def get_documents(request: Request, user_id: str):
    """Get list of processed documents"""
    # TODO: Implement document listing
    # - Return list of uploaded and processed documents
    try:
        vector_store: VectorStoreService = request.app.state.vector_store
        documents = vector_store.get_documents(user_id=user_id)
    
        all_filenames = [doc.metadata["filename"] for doc in documents]
        unique_filenames = list(set(all_filenames))
        document_infos: List[DocumentInfo] = []
        for filename in unique_filenames:
            chunks = [doc for doc in documents if doc.metadata["filename"] == filename]

            if not chunks:
                continue

            first_chunk = chunks[0]

            document_info = DocumentInfo(
                filename=filename,
                upload_date=first_chunk.metadata.get("upload_date"),
                chunks_count=len(chunks),
                status=first_chunk.metadata.get("status")
            )

            document_infos.append(document_info)

        return DocumentsResponse(documents=document_infos)
    except Exception as e:
        raise e

@app.get("/api/chunks")
async def get_chunks(request: Request):
    """Get document chunks (optional endpoint)"""
    # TODO: Implement chunk listing
    # - Return document chunks with metadata
    try:
        pass
    except Exception as e:
        raise e
    
    pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.host, port=settings.port, reload=settings.debug) 