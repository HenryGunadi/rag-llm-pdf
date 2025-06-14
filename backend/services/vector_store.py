from typing import List, Tuple
import asyncio
from langchain.schema import Document
from langchain.vectorstores import VectorStore
from config import settings
import chromadb
from chromadb import ClientAPI
from chromadb.config import Settings
from models.schemas import DBInitError
from uuid import uuid4
from sentence_transformers import SentenceTransformer
from models.schemas import DocumentInfo, DocumentsResponse
import logging
from utils.scheduler import delete_user_file_later

logger = logging.getLogger(__name__)

class VectorStoreService:
    def __init__(self):
        # TODO: Initialize vector store (ChromaDB, FAISS, etc.)
        try:
            self.db: ClientAPI = chromadb.PersistentClient(path=settings.vector_db_path)
        except Exception as e:
            raise DBInitError(f"Failed to initialize ChromaDB: {e}") from e

        self.collection = self.db.get_or_create_collection(name="chat_db")
        self.model = SentenceTransformer("all-MiniLM-L6-v2")

    # for demo purpose only, use dummy user id
    def add_documents(self, documents: List[Document], user_id: int = 1) -> None:
        """Add documents to the vector store"""
        # TODO: Implement document addition to vector store
        # - Generate embeddings for documents
        all_chunks = [doc.page_content for doc in documents]
        
        try:
            embeddings = self.model.encode(all_chunks)
            embeddings = embeddings.tolist() # convert numpy arrays to lists
            print(f"Embeddings : {embeddings[0]}\n Type of embedding : {type(embeddings)}")
            document_ids = [uuid4().hex[:8] for _ in range(len(all_chunks))] 
            # - Store documents with embeddings in vector database
            self.collection.add(
                documents=all_chunks,
                embeddings=embeddings,
                metadatas=[{**doc.metadata, "status": "processed"} for doc in documents],
                ids=document_ids,
            )

            asyncio.create_task(
                delete_user_file_later(user_id=user_id, file_path="", document_ids=document_ids, callback=self.delete_documents)
            )
            
        except Exception as e:
            logger.error("Error adding documents to vector db : ", e)
            raise e
    
    def similarity_search(self, user_id, query: str, k: int = None) -> List[Tuple[Document, float]]:
        try:
            """Search for similar documents"""
            # TODO: Implement similarity search
            # - Generate embedding for query
            # - Search for similar documents in vector store
            results = self.collection.query(
                query_texts=[query],
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
        except Exception as e:
            logger.error(f"Error finding similarity search : {e}")
            raise e
        
    def delete_documents(self, document_ids: List[str], user_id: int) -> None:
        """Delete documents from vector store"""
        # TODO: Implement document deletion
        try:
            if document_ids:
                self.collection.delete(ids=document_ids)
            elif user_id is not None:
                self.collection.delete(where={"user_id": user_id})
            else:
                raise ValueError("Must provide either document_ids or user_id for deletion.")
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