# GlowMetrics - Análise de Beleza Inteligente

Aplicação web completa para análise facial estética usando ChatGPT e geração de PDFs profissionais.

## 🏗️ Arquitetura

- **Frontend**: React + Vite (JavaScript)
- **Backend**: FastAPI (Python)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage

## 📁 Estrutura do Projeto

```
glowmetrics-web/
├── frontend/          # React app
├── backend/           # FastAPI app
└── supabase/          # Database migrations
```

## 🚀 Setup

### Backend

1. Instalar dependências:
```bash
cd backend
pip install -r requirements.txt
```

2. Configurar variáveis de ambiente (`.env`):
```
OPENAI_API_KEY=your_openai_token
FRONTEND_URL=http://localhost:5173
```

3. Rodar servidor:
```bash
python -m app.main
# ou
uvicorn app.main:app --reload
```

### Frontend

1. Instalar dependências:
```bash
cd frontend
npm install
```

2. Configurar variáveis de ambiente (`.env`):
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:8000
```

3. Rodar dev server:
```bash
npm run dev
```

### Supabase

1. Criar projeto no Supabase
2. Executar migration:
```sql
-- Ver arquivo supabase/migrations/001_initial.sql
```

3. Criar Storage buckets:
   - `photos` (público)
   - `reports` (público)

4. Configurar RLS policies (já incluídas na migration)

## 📝 Funcionalidades

- ✅ Autenticação (Login/Registro)
- ✅ CRUD de Pacientes
- ✅ Upload de Fotos (Antes/Depois)
- ✅ Seleção de Procedimentos (Botox, Preenchimento, Peeling)
- ✅ Análise com ChatGPT
- ✅ Geração de PDF Profissional
- ✅ Histórico de Análises

## 🔑 Variáveis de Ambiente

### Backend
- `OPENAI_API_KEY`: Token da OpenAI
- `FRONTEND_URL`: URL do frontend (para CORS)

### Frontend
- `VITE_SUPABASE_URL`: URL do projeto Supabase
- `VITE_SUPABASE_ANON_KEY`: Chave pública do Supabase
- `VITE_API_URL`: URL do backend Python

## 📦 Deploy

### Backend (Railway/Render/Fly.io)
1. Conectar repositório
2. Configurar variáveis de ambiente
3. Deploy automático

### Frontend (Vercel/Netlify)
1. Conectar repositório
2. Configurar variáveis de ambiente
3. Build command: `npm run build`
4. Deploy automático

## 📄 Licença

MIT

