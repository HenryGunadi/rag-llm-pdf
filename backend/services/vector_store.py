from typing import List, Tuple
from langchain.schema import Document
from langchain.vectorstores import VectorStore
from config import settings
import logging
import chromadb
from chromadb import ClientAPI
from models.schemas import DBInitError
from openai import Client
from openai.types.embedding import Embedding
from uuid import uuid4
from sentence_transformers import SentenceTransformer
from models.schemas import DocumentInfo, DocumentsResponse

logger = logging.getLogger(__name__)

class VectorStoreService:
    def __init__(self):
        # TODO: Initialize vector store (ChromaDB, FAISS, etc.)
        try:
            self.db: ClientAPI = chromadb.Client()
        except Exception as e:
            raise DBInitError(f"Failed to initialize ChromaDB: {e}") from e

        self.collection = self.db.create_collection(name="chat_db")
        self.model = SentenceTransformer("all-MiniLM-L6-v2")

    def add_documents(self, documents: List[Document]) -> None:
        """Add documents to the vector store"""
        # TODO: Implement document addition to vector store
        # - Generate embeddings for documents
        all_chunks = [doc.page_content for doc in documents]
        
        try:
            embeddings = self.model.encode(all_chunks) 

            # - Store documents with embeddings in vector database
            self.collection.add(
                documents=all_chunks,
                embeddings=embeddings,
                metadatas=[{**doc.metadata, "status": "processed"} for doc in documents],
                ids=[uuid4().hex[:8] for _ in range(len(all_chunks))],
            )
        except Exception as e:
            raise e
    
    def similarity_search(self, user_id, query: str, k: int = None) -> List[Tuple[Document, float]]:
        """Search for similar documents"""
        # TODO: Implement similarity search
        # - Generate embedding for query
        embedded_query = self.model.encode(query)

        # - Search for similar documents in vector store
        results = self.collection.query(
            query_texts=[embedded_query],
            n_results=k,
            where={"user_id": user_id}
        )

        documents = [
            Document(page_content=doc, metadata=meta)
            for doc, meta in zip(results["documents"][0], results["metadatas"][0])
        ]
        scores = results["distances"][0]

        # - Return documents with similarity scores
        return list(zip(documents, scores))
        
    def delete_documents(self, document_ids: List[str], user_id) -> None:
        """Delete documents from vector store"""
        # TODO: Implement document deletion
        try:
            self.collection.delete(ids=document_ids, where={"user_id": user_id})
        except Exception as e:
            raise e
    
    def get_document_count(self, user_id: str) -> int:
        """Get total number of documents in vector store"""
        # TODO: Return document count
        return len(self.collection.get(where={"user_id": user_id}))
    
    def get_documents(self, user_id: str) -> DocumentsResponse:
        try:
            results = self.collection.get(where={"user_id": user_id})
            return [
                Document(page_content=doc, metadata=meta)
                for doc, meta in zip(results["documents"], results["metadatas"])
            ]
        

            
        except Exception as e:
            raise e