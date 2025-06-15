from typing import List, Dict, Any
from langchain.schema import Document
from services.vector_store import VectorStoreService
import time
from config import settings
import logging
from services.vector_store import VectorStoreService
import google.generativeai as genai
from models.schemas import DocumentSource

genai.configure(api_key=settings.gemini_api_key)
logger = logging.getLogger(__name__)

class RAGPipeline:
    def __init__(self, api_key: str, vector_store_service: VectorStoreService):
        # TODO: Initialize RAG pipeline components
        # - Vector store service
        self.vector_store_service = vector_store_service
        # - LLM client
        self.client = genai.GenerativeModel(settings.llm_model)
        # - Prompt templates
        self.prompt_templates = """
            You are a helpful, professional assistant that analyzes financial documents.

            Follow these instructions:
            - Respond naturally and clearly
            - Use structured formatting: `#`, `##`, bullet points `-`, bold (**...**) when appropriate
            - Include document references in this format: (📄 filename, page X)
            - If relevant, enhance readability with emojis like 📊, 💰, 🧾, but only if it feels natural

            Wrap your output using the following HTML structure:
            - Use <emoji>, <text>, and <answer> tags directly.
            - Use `\\n` to separate paragraphs inside tags

            Return only the formatted HTML structure as shown below:

            <emoji>A relevant emoji matching the question’s topic or tone</emoji>
            <text>Rewritten question with correct grammar, punctuation, and clarity.</text>
            <answer>
            The answer to the question.

            Format it with:
            - Headings using `#`, `##`
            - Bullet points
            - Bolded values
            - Clear paragraph spacing using newlines

            Include source references if context is available.
            </answer>

            ---

            {context_block}

            ---

            ### ❓ Question:
            {question}

            ---

            ### ✅ Answer:
        """

    def generate_answer(self, question: str, chat_history: List[Dict[str, str]] = None) -> Dict[str, Any]:
        """Generate answer using RAG pipeline"""
        try:
        # TODO: Implement RAG pipeline
            start = time.time()            
            
            # 1. Retrieve relevant documents
            docs = self._retrieve_documents(query=question)
            print("Document retrieved : ", docs)

            # 2. Generate context from retrieved documents
            context = self._generate_context(documents=docs)
            
            # 3. Generate answer using LLM
            answer = self._generate_llm_response(question=question, context=context, chat_history=chat_history)
            processing_time = time.time() - start

            # 4. Return answer with sources
            return {
                "answer": answer,
                "sources": docs,
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
            results = self.vector_store_service.similarity_search(query=query, k=2, user_id=1)

            return [
                DocumentSource(
                    content=doc.page_content,
                    page=doc.metadata.get("page", 0),
                    score=score,
                    metadata=doc.metadata
                )
                for doc, score in results
            ]
        except Exception as e:
            logger.error(f"Error retrieving relevant documents : {e}")
            raise e

    def _generate_context(self, documents: List[DocumentSource]) -> str:
        """Generate context from retrieved documents"""
        # TODO: Generate context string from documents
        if not documents:
            return "\n_No external context provided. Please answer based on your own knowledge._"
        
        sources_section = "\n".join(
            f"- **{doc.metadata.get('filename', 'Unknown Source')}**, page {doc.page}"
            for doc in documents
        )

        context_text = "\n".join(
            f"**[Page {doc.page}]** {doc.content.strip()}"
            for doc in documents
        )
        
        return f"""
            ### 📚 Retrieved Context:
            {context_text}

            ### 📎 Sources:
            {sources_section}
        """
    
    def _generate_llm_response(self, question: str, context: str, chat_history: List[Dict[str, str]] = None) -> str:
        """Generate response using LLM"""
        try:
            # Inline format of chat history (if provided)
            chat_history_formatted = ""
            if chat_history:
                chat_history_formatted = "\n\n---\n\n### 🗂️ Previous Conversation:\n" + "\n".join(
                    f"User: {msg['content']}" if msg["type"] == "user"
                    else f"Assistant: {msg['content']}"
                    for msg in chat_history
                )

            # Inject context, question, and chat history
            system_prompt = self.prompt_templates.format(
                context_block=context or "*No document context provided.*",
                question=question
            ) + chat_history_formatted

            # Gemini call
            response = self.client.generate_content(contents=[
                {"role": "user", "parts": [system_prompt]}
            ])

            answer_text = response.candidates[0].content.parts[0].text
            print("LLM Response : ", answer_text)
            return answer_text

        except Exception as e:
            logger.error(f"Error generating llm responses : {e}")
            raise e