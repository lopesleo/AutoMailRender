import os
import io
from typing import Optional

from fastapi import FastAPI, HTTPException, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pypdf import PdfReader 

load_dotenv()

from models.response import EmailAnalysisResponse
from services.email_service import analyze_email_content

app = FastAPI(title="AutoU Email Analysis API")

origins = [
    os.getenv("FRONTEND_URL", "http://localhost:3000"),
    "https://*.onrender.com", 
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "AutoU Email Analysis API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "email-analysis"}

@app.post("/api/email/analyze", response_model=EmailAnalysisResponse)
async def analyze_email(
    content: Optional[str] = Form(None), 
    file: Optional[UploadFile] = None
):
    """
    Analisa o conteúdo de um email, que pode vir de um campo de texto 'content'
    ou de um arquivo 'file' (.txt ou .pdf).
    """
    email_text = ""

    if file:
        if file.filename.endswith('.txt'):
            contents_bytes = await file.read()
            email_text = contents_bytes.decode('utf-8')
        elif file.filename.endswith('.pdf'):
            try:
                pdf_bytes = await file.read()
                pdf_reader = PdfReader(io.BytesIO(pdf_bytes))
                text_parts = [page.extract_text() for page in pdf_reader.pages]
                email_text = " ".join(filter(None, text_parts))
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Erro ao ler o arquivo PDF: {e}")
        else:
            raise HTTPException(status_code=400, detail="Formato de arquivo não suportado. Use .txt ou .pdf.")
    
    elif content:
        email_text = content
    
    else:
        raise HTTPException(status_code=400, detail="Nenhum conteúdo de email ou arquivo foi enviado.")

    if not email_text or not email_text.strip():
        raise HTTPException(status_code=400, detail="O conteúdo do email está vazio após o processamento.")

    try:
        return analyze_email_content(email_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Ocorreu um erro interno ao analisar o conteúdo.")