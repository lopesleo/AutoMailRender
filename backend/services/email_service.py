import os
from fastapi import exceptions
from google import genai
from google.genai import types
from pydantic import BaseModel

from core.prompts import EMAIL_ANALYSIS_PROMPT
from models.response import EmailAnalysisResponse

api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

def analyze_email_content(content: str) -> dict:
    """
    Analisa o conteúdo de um email usando o modelo Gemini com uma ferramenta de classificação.
    Retorna um dicionário com 'category' e 'response'.
    """
    try:
        MAX_CHARS = 8000 
    
        truncated_content = content[:MAX_CHARS]
        prompt = EMAIL_ANALYSIS_PROMPT.format(content=truncated_content)
        response = client.models.generate_content(
    model="gemini-2.5-flash-lite",
    contents=prompt,
    config={
        "response_mime_type": "application/json",
        "response_schema": EmailAnalysisResponse,
    })
    except exceptions as e:
        raise exceptions.HTTPException(status_code=500, detail=f"Erro ao analisar o email: {str(e)}")

    return response.parsed
