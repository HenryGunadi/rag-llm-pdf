from typing import List, Dict, Any
from langchain.schema import Document
from services.vector_store import VectorStoreService
import time
from config import settings
import logging
from openai import Client, OpenAI
from services.vector_store import VectorStoreService

logger = logging.getLogger(__name__)

class RAGPipeline:
    def __init__(self, api_key: str, vector_store_service: VectorStoreService):
        # TODO: Initialize RAG pipeline components
        # - Vector store service
        self.vector_store_service = vector_store_service
        # - LLM client
        self.client: Client = OpenAI(api_key=api_key)
        # - Prompt templates
        self.promp_templates = """
        You are an assistant for question-answering tasks. "
        "Use the following pieces of retrieved context to answer "
        "the question. If you don't know the answer, say that you "
        "don't know. Keep the "
        "answer concise\n.
        Context:
        {context}\n

        Question:
        {question}\n

        Answer:
        \n
        """

    def generate_answer(self, question: str, chat_history: List[Dict[str, str]] = None) -> Dict[str, Any]:
        """Generate answer using RAG pipeline"""
        try:
        # TODO: Implement RAG pipeline
            start = time.time()            
            
            # 1. Retrieve relevant documents
            docs_with_scores = self._retrieve_documents(query=question)
            docs = [doc for doc, _ in docs_with_scores]
            print("Document retrieved : ", docs)

            # 2. Generate context from retrieved documents
            context = self._generate_context(documents=docs)
            
            # 3. Generate answer using LLM
            answer = self._generate_llm_response(question=question, context=context)
            processing_time = time.time() - start

            # 4. Return answer with sources
            return {
                "answer": answer.choices[0].message.content,
                "sources": [
                    {"metadata": doc.metadata, "score": score}
                    for doc, score in docs_with_scores
                ],
                "processing_time": processing_time
            }
        except Exception as e:
            logger.error(f"Error generating answer : {e}")
            raise e            
    
    def _retrieve_documents(self, query: str) -> List[Document]:
        """Retrieve relevant documents for the query"""
        # TODO: Implement document retrieval
        # - Search vector store for similar documents
        # - Filter by similarity threshold
        # - Return top-k documents
        try:
            print(f"QUERY : {query}\nQuery Type : {type(query)}")
            return self.vector_store_service.similarity_search(query=query, k=2, user_id=1)
        except Exception as e:
            logger.error(f"Error retrieving relevant documents : {e}")
            raise e

    def _generate_context(self, documents: List[Document]) -> str:
        """Generate context from retrieved documents"""
        # TODO: Generate context string from documents
        if not documents:
            logger.error("Documents is unavailable")
            return ""

        context = "\n".join(
            f"[Page {doc.metadata.get('page', '?')}] {doc.page_content}"
            for doc in documents
        )
        
        return context
    
    def _generate_llm_response(self, question: str, context: str, chat_history: List[Dict[str, str]] = None) -> str:
        """Generate response using LLM"""
        # TODO: Implement LLM response generation
        # - Create prompt with question and context
        # - Call LLM API
        # - Return generated response
        try:
            system_prompt = self.promp_templates.format(context=context, question=question)

            answer = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": question}
                ]
            )

            return answer 
        except Exception as e:
            logger.error(f"Error generating llm responses : {e}")
            raise e