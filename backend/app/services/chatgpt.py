# chatgpt.py - Serviço de análise com ChatGPT
import os
import time
import warnings
from dotenv import load_dotenv

warnings.filterwarnings('ignore', category=DeprecationWarning)

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
    load_dotenv()
except ImportError:
    OPENAI_AVAILABLE = False

ASSISTANT_ID = "asst_Ghy8XTQEhfpjV7eWoTP1WXKw"

def get_openai_token():
    """Carrega token da API OpenAI"""
    token = os.getenv("open_ai_token")
    if not token:
        token = os.getenv("OPENAI_API_KEY")
    return token

def analyze_with_chatgpt(before_path, after_path, procedures=None):
    """Analisa imagens antes/depois usando OpenAI Assistants API"""
    if not OPENAI_AVAILABLE:
        raise Exception("OpenAI não disponível. Instale: pip install openai python-dotenv")
    
    token = get_openai_token()
    if not token:
        raise Exception("Token OpenAI não encontrado. Configure 'open_ai_token' no arquivo .env")
    
    try:
        # Inicializar cliente OpenAI
        # Versões recentes do openai (1.0+) não aceitam 'proxies' diretamente
        # Precisamos criar um httpx.Client sem proxies para evitar conflitos
        import httpx
        
        # Limpar qualquer variável de ambiente que possa causar conflito
        proxy_vars = ['HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy', 'ALL_PROXY', 'all_proxy']
        for var in proxy_vars:
            if var in os.environ:
                print(f"   🗑️ Removendo variável de proxy: {var}")
                del os.environ[var]
        
        print(f"🔑 Inicializando cliente OpenAI...")
        print(f"   Token presente: {'Sim' if token else 'Não'}")
        print(f"   Token length: {len(token) if token else 0}")
        
        # Criar httpx.Client sem proxies explicitamente
        http_client = httpx.Client(
            timeout=60.0,
            # Não passar proxies aqui - isso causa o erro
        )
        
        # Criar cliente OpenAI com http_client customizado
        client = OpenAI(
            api_key=token,
            http_client=http_client
        )
        print("   ✓ Cliente OpenAI inicializado")
        
        # Construir prompt com procedimentos
        print("📝 Construindo prompt...")
        procedures_text = ""
        if procedures and len(procedures) > 0:
            procedures_list = ", ".join(procedures)
            procedures_text = f"\n\nProcedimentos realizados: {procedures_list}"
        print(f"   ✓ Procedimentos: {procedures}")
        
        # Prompt estruturado - explícito e objetivo
        print("   📄 Criando prompt completo...")
        prompt_text = f"""Para cada área facial, analise e descreva EXATAMENTE o que mudou da foto ANTES para a foto DEPOIS:{procedures_text}

1. REGIÃO FRONTAL (testa):
   - Conte e compare rugas/linhas horizontais: aumentaram ou diminuíram da ANTES para DEPOIS?
   - Analise textura: melhorou ou piorou da ANTES para DEPOIS?
   - Avalie suavidade: aumentou ou diminuiu da ANTES para DEPOIS?

2. REGIÃO NASAL:
   - Analise textura: melhorou ou piorou da ANTES para DEPOIS?
   - Avalie uniformidade: aumentou ou diminuiu da ANTES para DEPOIS?
   - Compare refinamento geral: melhorou ou piorou da ANTES para DEPOIS?

3. ÁREA INFRAORBITAL (abaixo dos olhos):
   - Compare luminosidade: aumentou ou diminuiu da ANTES para DEPOIS?
   - Analise uniformidade de cor: melhorou ou piorou da ANTES para DEPOIS?
   - Avalie textura: melhorou ou piorou da ANTES para DEPOIS?

Retorne a análise em formato JSON:

{{
  "areas": {{
    "forehead": {{
      "score": "A" a "F" (A=melhoria significativa DEPOIS vs ANTES, F=piora significativa DEPOIS vs ANTES),
      "description": "Descrição específica comparando ANTES vs DEPOIS: ex: 'aumento de rugas', 'redução de suavidade', 'melhoria na textura'",
      "metrics": {{
        "wrinkle_reduction": número (POSITIVO se MENOS rugas na DEPOIS vs ANTES, NEGATIVO se MAIS rugas na DEPOIS vs ANTES),
        "smoothness_improvement": número (POSITIVO se MAIS suave na DEPOIS vs ANTES, NEGATIVO se MENOS suave na DEPOIS vs ANTES)
      }}
    }},
    "nose": {{
      "score": "A" a "F",
      "description": "Descrição específica comparando ANTES vs DEPOIS: ex: 'piora na textura', 'melhoria na uniformidade'",
      "metrics": {{
        "texture_improvement": número (POSITIVO se MELHOR textura na DEPOIS vs ANTES, NEGATIVO se PIOR textura na DEPOIS vs ANTES)
      }}
    }},
    "under_eye": {{
      "score": "A" a "F",
      "description": "Descrição específica comparando ANTES vs DEPOIS: ex: 'redução de luminosidade', 'aumento de uniformidade', 'piora na textura'",
      "metrics": {{
        "brightness_improvement": número (POSITIVO se MAIS claro na DEPOIS vs ANTES, NEGATIVO se MAIS escuro na DEPOIS vs ANTES),
        "uniformity_improvement": número (POSITIVO se MAIS uniforme na DEPOIS vs ANTES, NEGATIVO se MENOS uniforme na DEPOIS vs ANTES),
        "texture_improvement": número (POSITIVO se MELHOR textura na DEPOIS vs ANTES, NEGATIVO se PIOR textura na DEPOIS vs ANTES)
      }}
    }}
  }},
  "global": {{
    "apparent_age": {{
      "after": número (idade aparente estimada da foto DEPOIS),
      "reduction": número (POSITIVO se DEPOIS parece MAIS JOVEM que ANTES, NEGATIVO se DEPOIS parece MAIS VELHA que ANTES)
    }},
    "harmony": número (0-100, harmonia facial da foto DEPOIS)
  }}
}}

REGRAS FINAIS:
- Se a foto DEPOIS estiver melhor que a foto ANTES → métricas POSITIVAS, scores A/B/C
- Se a foto ANTES estiver melhor que a foto DEPOIS → métricas NEGATIVAS, scores D/E/F
- Se não houver diferença significativa → métricas próximas de ZERO, score D

Retorne APENAS o JSON, sem texto adicional."""
        
        # 1. Upload das imagens
        print("📤 Fazendo upload das imagens para OpenAI...")
        print(f"   Before path: {before_path}")
        print(f"   After path: {after_path}")
        try:
            with open(before_path, "rb") as f_before, open(after_path, "rb") as f_after:
                print("   📎 Uploading before image...")
                file_before = client.files.create(
                    file=f_before,
                    purpose="vision"
                )
                print(f"   ✓ Before uploaded: {file_before.id}")
                
                print("   📎 Uploading after image...")
                file_after = client.files.create(
                    file=f_after,
                    purpose="vision"
                )
                print(f"   ✓ After uploaded: {file_after.id}")
        except Exception as upload_error:
            print(f"   ❌ Erro no upload: {upload_error}")
            raise
        
        # 2. Criar thread
        print("🧵 Criando thread...")
        try:
            thread = client.beta.threads.create()
            print(f"   ✓ Thread criada: {thread.id}")
        except Exception as thread_error:
            print(f"   ❌ Erro ao criar thread: {thread_error}")
            raise
        
        # 3. Enviar mensagem com imagens e prompt
        print("💬 Enviando mensagem com imagens...")
        try:
            message = client.beta.threads.messages.create(
            thread_id=thread.id,
            role="user",
            content=[
                {"type": "text", "text": prompt_text},
                {
                    "type": "image_file",
                    "image_file": {"file_id": file_before.id}
                },
                {
                    "type": "image_file",
                    "image_file": {"file_id": file_after.id}
                }
            ]
            )
            print(f"   ✓ Mensagem enviada: {message.id}")
        except Exception as message_error:
            print(f"   ❌ Erro ao enviar mensagem: {message_error}")
            raise
        
        # 4. Criar e executar run
        print("▶️ Criando e executando run...")
        try:
            run = client.beta.threads.runs.create(
                thread_id=thread.id,
                assistant_id=ASSISTANT_ID
            )
            print(f"   ✓ Run criado: {run.id}, status: {run.status}")
        except Exception as run_error:
            print(f"   ❌ Erro ao criar run: {run_error}")
            raise
        
        # 5. Aguardar conclusão do run
        max_wait_time = 300  # 5 minutos máximo
        start_time = time.time()
        
        while run.status in ["queued", "in_progress", "requires_action"]:
            if time.time() - start_time > max_wait_time:
                raise Exception("Timeout aguardando resposta do assistant")
            
            time.sleep(1)
            run = client.beta.threads.runs.retrieve(
                thread_id=thread.id,
                run_id=run.id
            )
            
            if run.status == "failed":
                error_msg = getattr(run, "last_error", "Erro desconhecido")
                raise Exception(f"Run falhou: {error_msg}")
            elif run.status == "cancelled":
                raise Exception("Run foi cancelado")
        
        if run.status != "completed":
            raise Exception(f"Run terminou com status inesperado: {run.status}")
        
        # 6. Ler resposta do assistant
        messages = client.beta.threads.messages.list(
            thread_id=thread.id,
            order="asc"
        )
        
        # A última mensagem do assistant contém a resposta
        response_text = None
        for msg in reversed(messages.data):
            if msg.role == "assistant":
                if msg.content:
                    # Extrair texto da resposta
                    for content_item in msg.content:
                        if hasattr(content_item, 'text') and content_item.text:
                            response_text = content_item.text.value
                            break
                if response_text:
                    break
        
        if not response_text:
            raise Exception("Nenhuma resposta encontrada do assistant")
        
        return response_text
        
    except Exception as e:
        raise Exception(f"ChatGPT erro: {str(e)}")

