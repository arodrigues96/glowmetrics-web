# main.py - FastAPI Backend
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import tempfile
import base64
import requests
from dotenv import load_dotenv

from app.services.chatgpt import analyze_with_chatgpt
from app.services.parse import parse_chatgpt_response
from app.services.pdf import make_clinic_pdf

load_dotenv()

app = FastAPI(title="GlowMetrics Analysis API")

# CORS
frontend_urls = [
    "http://localhost:5173",
    "http://localhost:3000",
    os.getenv("FRONTEND_URL", ""),
]
# Adicionar URLs do Vercel/Netlify se existirem
if os.getenv("FRONTEND_URL"):
    frontend_urls.append(os.getenv("FRONTEND_URL"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_urls,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalysisRequest(BaseModel):
    before_image_url: str
    after_image_url: str
    procedures: List[str] = []

class PDFRequest(BaseModel):
    before_url: str
    after_url: str
    analysis_results: dict

def download_image(url: str) -> str:
    """Baixa imagem de URL e salva temporariamente"""
    response = requests.get(url)
    response.raise_for_status()
    
    # Criar arquivo temporário
    with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp:
        tmp.write(response.content)
        return tmp.name

@app.post("/api/analyze")
async def analyze_images(request: AnalysisRequest):
    """Analisa imagens usando ChatGPT"""
    try:
        # Baixar imagens
        before_path = download_image(request.before_image_url)
        after_path = download_image(request.after_image_url)
        
        # Analisar com ChatGPT
        response_text = analyze_with_chatgpt(
            before_path,
            after_path,
            request.procedures
        )
        
        # Parsear resposta
        analysis_results = parse_chatgpt_response(response_text)
        
        # Limpar arquivos temporários
        os.unlink(before_path)
        os.unlink(after_path)
        
        return {
            "success": True,
            "analysis": analysis_results,
            "raw_response": response_text
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-pdf")
async def generate_pdf(request: PDFRequest):
    """Gera PDF a partir dos resultados da análise"""
    try:
        # Baixar imagens
        before_path = download_image(request.before_url)
        after_path = download_image(request.after_url)
        
        # Criar PDF temporário
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp:
            pdf_path = tmp.name
        
        # Gerar PDF
        make_clinic_pdf(
            before_path,
            after_path,
            request.analysis_results,
            pdf_path
        )
        
        # Ler PDF e converter para base64
        with open(pdf_path, 'rb') as f:
            pdf_base64 = base64.b64encode(f.read()).decode()
        
        # Limpar arquivos temporários
        os.unlink(before_path)
        os.unlink(after_path)
        os.unlink(pdf_path)
        
        return {
            "success": True,
            "pdf_base64": pdf_base64
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "GlowMetrics Analysis API", "status": "running"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

