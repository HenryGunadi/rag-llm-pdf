import os
from typing import List, Dict, Any, Optional
import PyPDF2
import pdfplumber
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document
from config import settings
import logging
from langchain_community.document_loaders import PyPDFLoader
from models.schemas import PDFLoadError, DocumentSource, DocumentInfo
from pathlib import Path
from datetime import datetime

logger = logging.getLogger(__name__)

class PDFProcessor:
    def __init__(self, file_path: str):
        # TODO: Initialize text splitter with chunk size and overlap settings
        self.text_splitter = RecursiveCharacterTextSplitter(
            separators=["\n\n", "\n", ".", "!", "?", ",", " "],
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
            is_separator_regex=False,
        )

    def extract_text_from_pdf(self, file_path: str, user_id: str = 1) -> List[Dict[str, Any]]:
        """Extract text from PDF and return page-wise content"""
        # TODO: Implement PDF text extraction
        # - Use pdfplumber or PyPDF2 to extract text from each page
        # - Return list of dictionaries with page content and metadata
        try:
            loader = PyPDFLoader(file_path=file_path)
            documents = loader.load_and_split()

            for doc in documents:
                doc.metadata["user_id"] = user_id
                doc.metadata["filename"] = Path(file_path).name
                doc.metadata["upload_date"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            return documents
        except FileNotFoundError:
            raise PDFLoadError("PDF file not found")
        except Exception as e:
            raise PDFLoadError(f"Failed to load PDF: {e}") from e
    
    def split_into_chunks(self, pages_content: List[Dict[str, Any]]) -> List[Document]:
        """Split page content into chunks"""
        try:
            # TODO: Implement text chunking`
            # - Split each page content into smaller chunks
            all_splits = self.text_splitter.split_documents(pages_content)
            # - Create Document objects with proper metadata
            print("SPLIT 0 : ", all_splits[0])
            return all_splits
            # - Return list of Document objects`
        except Exception as e:
            raise e
        
    def process_pdf(self, file_path: str) -> List[Document]:
        """Process PDF file and return list of Document objects"""
        # TODO: Implement complete PDF processing pipeline
        # 1. Extract text from PDF
        try:
            raw_docs = self.extract_text_from_pdf(file_path=file_path)
            # 2. Split text into chunks
            processed_docs = self.split_into_chunks(raw_docs)
            # 3. Return processed documents
            return processed_docs
        except Exception as e:
            raise e