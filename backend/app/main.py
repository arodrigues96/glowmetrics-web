# main.py - FastAPI Backend
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import tempfile
import base64
import requests
import json
import time
from dotenv import load_dotenv

from app.services.chatgpt import analyze_with_chatgpt
from app.services.parse import parse_chatgpt_response
from app.services.pdf import make_clinic_pdf

load_dotenv()

# #region agent log
def debug_log(location, message, data, hypothesis_id=None):
    try:
        log_entry = {
            "location": location,
            "message": message,
            "data": data,
            "timestamp": int(time.time() * 1000),
            "sessionId": "debug-session",
            "runId": "run1",
            "hypothesisId": hypothesis_id
        }
        with open("/mnt/c/Users/conta/Desktop/git-repos/.cursor/debug.log", "a") as f:
            f.write(json.dumps(log_entry) + "\n")
    except:
        pass
# #endregion

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
    # #region agent log
    debug_log("main.py:65", "download_image entry", {"url": url, "url_length": len(url) if url else 0, "url_empty": not url or url.strip() == ""}, "F")
    # #endregion
    
    if not url or url.strip() == "":
        # #region agent log
        debug_log("main.py:69", "download_image empty URL error", {"url": url}, "F")
        # #endregion
        raise ValueError(f"URL vazia ou inválida: '{url}'")
    
    # #region agent log
    debug_log("main.py:73", "before requests.get", {"url": url, "url_type": type(url).__name__}, "F")
    # #endregion
    
    try:
        response = requests.get(url)
        # #region agent log
        debug_log("main.py:77", "requests.get response", {"status_code": response.status_code, "content_length": len(response.content) if response.content else 0}, "F")
        # #endregion
        response.raise_for_status()
        
        # Criar arquivo temporário
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp:
            tmp.write(response.content)
            file_path = tmp.name
            # #region agent log
            debug_log("main.py:84", "download_image success", {"file_path": file_path, "file_size": len(response.content)}, "F")
            # #endregion
            return file_path
    except Exception as e:
        # #region agent log
        debug_log("main.py:88", "download_image error", {"error": str(e), "error_type": type(e).__name__, "url": url}, "F")
        # #endregion
        raise

@app.post("/api/analyze")
async def analyze_images(request: AnalysisRequest):
    """Analisa imagens usando ChatGPT"""
    before_path = None
    after_path = None
    try:
        # #region agent log
        debug_log("main.py:95", "analyze_images entry", {
            "before_url": request.before_image_url,
            "after_url": request.after_image_url,
            "before_url_length": len(request.before_image_url) if request.before_image_url else 0,
            "after_url_length": len(request.after_image_url) if request.after_image_url else 0,
            "before_url_empty": not request.before_image_url or request.before_image_url.strip() == "",
            "after_url_empty": not request.after_image_url or request.after_image_url.strip() == "",
            "procedures": request.procedures
        }, "F")
        # #endregion
        
        print(f"📥 Recebida requisição de análise")
        print(f"   Before URL: {request.before_image_url[:50] if request.before_image_url else 'VAZIA'}...")
        print(f"   After URL: {request.after_image_url[:50] if request.after_image_url else 'VAZIA'}...")
        print(f"   Procedimentos: {request.procedures}")
        
        # Baixar imagens
        print("⬇️ Baixando imagens...")
        # #region agent log
        debug_log("main.py:112", "before download_image before", {"url": request.before_image_url}, "F")
        # #endregion
        before_path = download_image(request.before_image_url)
        print(f"   ✓ Before salvo em: {before_path}")
        # #region agent log
        debug_log("main.py:116", "before download_image after", {"url": request.after_image_url}, "F")
        # #endregion
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
    # #region agent log
    debug_log("main.py:198", "generate_pdf entry", {
        "before_url": request.before_url,
        "after_url": request.after_url,
        "before_url_length": len(request.before_url) if request.before_url else 0,
        "after_url_length": len(request.after_url) if request.after_url else 0,
        "before_url_empty": not request.before_url or request.before_url.strip() == "",
        "after_url_empty": not request.after_url or request.after_url.strip() == "",
        "has_analysis_results": bool(request.analysis_results)
    }, "F")
    # #endregion
    try:
        # Baixar imagens
        # #region agent log
        debug_log("main.py:210", "before download_image in generate_pdf", {"before_url": request.before_url, "after_url": request.after_url}, "F")
        # #endregion
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

