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
]
# Adicionar URL do frontend se configurada
frontend_url = os.getenv("FRONTEND_URL", "")
if frontend_url:
    frontend_urls.append(frontend_url)

# Permitir também qualquer origem do Vercel (padrão: *.vercel.app)
# Para debug, podemos permitir todas as origens temporariamente
allow_all = os.getenv("ALLOW_ALL_ORIGINS", "true").lower() == "true"

if allow_all:
    # Permitir todas as origens (sem credentials para funcionar)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["*"],
        expose_headers=["*"],
    )
else:
    # Usar lista específica de origens (com credentials)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=frontend_urls,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["*"],
        expose_headers=["*"],
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
    before_path = None
    after_path = None
    try:
        print(f"📥 Recebida requisição de análise")
        print(f"   Before URL: {request.before_image_url[:50]}...")
        print(f"   After URL: {request.after_image_url[:50]}...")
        print(f"   Procedimentos: {request.procedures}")
        
        # Baixar imagens
        print("⬇️ Baixando imagens...")
        before_path = download_image(request.before_image_url)
        print(f"   ✓ Before salvo em: {before_path}")
        after_path = download_image(request.after_image_url)
        print(f"   ✓ After salvo em: {after_path}")
        
        # Analisar com ChatGPT
        print("🤖 Iniciando análise com ChatGPT...")
        response_text = analyze_with_chatgpt(
            before_path,
            after_path,
            request.procedures
        )
        print(f"   ✓ Resposta recebida ({len(response_text)} chars)")
        
        # Parsear resposta
        print("📊 Parseando resposta...")
        analysis_results = parse_chatgpt_response(response_text)
        print("   ✓ Análise parseada com sucesso")
        
        return {
            "success": True,
            "analysis": analysis_results,
            "raw_response": response_text
        }
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"❌ ERRO na análise:")
        print(f"   Tipo: {type(e).__name__}")
        print(f"   Mensagem: {str(e)}")
        print(f"   Traceback:\n{error_trace}")
        raise HTTPException(status_code=500, detail=f"Erro na análise: {str(e)}")
    finally:
        # Limpar arquivos temporários
        if before_path and os.path.exists(before_path):
            try:
                os.remove(before_path)
            except:
                pass
        if after_path and os.path.exists(after_path):
            try:
                os.remove(after_path)
            except:
                pass

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

