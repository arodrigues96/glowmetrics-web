# ⚡ Quick Start - GlowMetrics

## Setup Rápido (5 minutos)

### 1️⃣ Supabase (2 min)

1. Acesse [supabase.com](https://supabase.com) → **New Project**
2. **SQL Editor** → Cole o conteúdo de `supabase/migrations/001_initial.sql` → **Run**
3. **Storage** → Criar buckets:
   - `photos` (público ✅)
   - `reports` (público ✅)
4. **Settings → API** → Copiar **Project URL**

### 2️⃣ Variáveis de Ambiente (1 min)

**Backend** (`backend/.env`):
```bash
cd backend
cp .env.example .env
# Edite .env e adicione seu OPENAI_API_KEY
```

**Frontend** (`frontend/.env`):
```bash
cd frontend
cp .env.example .env
# Edite .env e adicione sua VITE_SUPABASE_URL
```

### 3️⃣ Rodar (2 min)

**Terminal 1 - Backend:**
```bash
cd backend
pip install -r requirements.txt
python -m app.main
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### 4️⃣ Acessar

Abra: **http://localhost:5173**

---

📖 **Guia completo:** Veja `SETUP.md` para instruções detalhadas

