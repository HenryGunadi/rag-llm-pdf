# RAG-based Financial Statement Q&A System
## Overview
This project is a full-stack AI-powered application that allows users to ask natural language questions about financial statements (PDFs). The system retrieves relevant document chunks and uses a Large Language Model (LLM) to generate answers based on the retrieved context.

---
## Project Structure

```
coding-test-2nd/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── models/              # Data models
│   │   └── schemas.py       # Pydantic schemas
│   ├── services/            # RAG service logic
│   │   ├── pdf_processor.py # PDF processing and chunking
│   │   ├── vector_store.py  # Vector database integration
│   │   └── rag_pipeline.py  # RAG pipeline
│   ├── requirements.txt     # Python dependencies
│   └── config.py           # Configuration file
├── frontend/
│   ├── pages/              # Next.js pages
│   │   ├── index.tsx       # Main page
│   │   └── _app.tsx        # App component
│   ├── components/         # React components
│   │   ├── ChatInterface.tsx
│   │   └── FileUpload.tsx
│   ├── styles/             # CSS files
│   │   └── globals.css     # Global styles
│   ├── package.json        # Node.js dependencies
│   ├── tsconfig.json       # TypeScript configuration
│   ├── next.config.js      # Next.js configuration
│   ├── next-env.d.ts       # Next.js type definitions
│   └── .eslintrc.json      # ESLint configuration
├── data/
│   └── FinancialStatement_2025_I_AADIpdf.pdf
└── README.md
```

---

## Getting Started

### 1. **Environment Setup**
```bash
# Clone repository
git clone <your-repository-url>
cd rag-llm-pdf

# Set up Python virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

### 2. **Backend Setup**
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Set up environment variables (create .env file)
VECTOR_DB_PATH=./vector_store
PDF_UPLOAD_PATH=../data
ALLOWED_ORIGINS=[] # your cors origins
GEMINI_API_KEY=your_gemini_api_key
LLM_MODEL=your_gemini_model

# Run server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. **Frontend Setup**
```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

**Note**: If you encounter TypeScript/linting errors:
- Make sure `npm install` completed successfully
- The project includes all necessary configuration files (`tsconfig.json`, `.eslintrc.json`, `next-env.d.ts`)
- Check that all dependencies are properly installed in `node_modules`

### 4. **Initial Data Processing**
```bash
# Process and vectorize PDF file via API
curl -X POST "http://localhost:8000/api/upload" \
     -F "file=@../data/FinancialStatement_2025_I_AADIpdf.pdf"
```

---

## API Endpoints

### **POST /api/upload**
Upload PDF file and store in vector database
```json
{
  "file": "multipart/form-data"
}
```

### **POST /api/chat**
Generate RAG-based answer to question
```json
{
  "question": "What is the total revenue for 2025?",
  "chat_history": [] // optional
}
```

Response:
```json
{
  "answer": "The total revenue for 2025 is 123.4 billion won...",
  "sources": [
    {
      "content": "Related document chunk content",
      "page": 1,
      "score": 0.85
    }
  ],
  "processing_time": 2.3
}
```

### **GET /api/documents**
Retrieve processed document information
```json
{
  "documents": [
    {
      "filename": "FinancialStatement_2025_I_AADIpdf.pdf",
      "upload_date": "2024-01-15T10:30:00Z",
      "chunks_count": 125,
      "status": "processed"
    }
  ]
}
```
