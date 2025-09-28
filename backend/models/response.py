# models/email_models.py
from pydantic import BaseModel

class EmailAnalysisResponse(BaseModel):
    """Modelo para a resposta que nossa API envia de volta."""
    category: str
    reason: str
    response: str