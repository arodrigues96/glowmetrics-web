# 🚀 Guia de Setup Completo - GlowMetrics

## 1. Configurar Supabase

### Passo 1.1: Criar Projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em **"New Project"**
4. Preencha:
   - **Name**: `glowmetrics` (ou qualquer nome)
   - **Database Password**: Crie uma senha forte (anote ela!)
   - **Region**: Escolha a mais próxima (ex: `South America (São Paulo)`)
5. Clique em **"Create new project"**
6. Aguarde alguns minutos enquanto o projeto é criado

### Passo 1.2: Executar Migration SQL

1. No painel do Supabase, vá em **SQL Editor** (menu lateral)
2. Clique em **"New query"**
3. Abra o arquivo `supabase/migrations/001_initial.sql` e copie TODO o conteúdo
4. Cole no editor SQL do Supabase
5. Clique em **"Run"** (ou pressione `Ctrl+Enter`)
6. Você deve ver: ✅ "Success. No rows returned"

### Passo 1.3: Criar Storage Buckets

1. No painel do Supabase, vá em **Storage** (menu lateral)
2. Clique em **"Create a new bucket"**
3. Criar bucket `photos`:
   - **Name**: `photos`
   - **Public bucket**: ✅ **MARQUE ESTA OPÇÃO** (deixe público)
   - Clique em **"Create bucket"**
4. Criar bucket `reports`:
   - Clique em **"Create a new bucket"** novamente
   - **Name**: `reports`
   - **Public bucket**: ✅ **MARQUE ESTA OPÇÃO** (deixe público)
   - Clique em **"Create bucket"**

### Passo 1.4: Obter Credenciais do Supabase

1. No painel do Supabase, vá em **Settings** (ícone de engrenagem) → **API**
2. Você verá:
   - **Project URL**: Copie esta URL (ex: `https://xxxxx.supabase.co`)
   - **anon public**: Copie esta chave (já temos: `sb_publishable_9mxekBWP1yv3OVr5b-ZvoQ_NP-6AFwj`)
   - **service_role**: Esta é a chave secreta (já temos: `sb_secret_qQFtuKso7HhC_ARWIwYAqw_if47CSES`)

## 2. Configurar Variáveis de Ambiente

### Passo 2.1: Backend (.env)

1. Navegue até a pasta do backend:
```bash
cd /mnt/c/Users/conta/Desktop/git-repos/glowmetrics-web/backend
```

2. Crie o arquivo `.env`:
```bash
touch .env
```

3. Abra o arquivo `.env` e adicione:
```env
OPENAI_API_KEY=seu_token_openai_aqui
FRONTEND_URL=http://localhost:5173
```

**Onde encontrar o token OpenAI:**
- Acesse [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- Faça login
- Clique em **"Create new secret key"**
- Copie o token e cole no `.env`

### Passo 2.2: Frontend (.env)

1. Navegue até a pasta do frontend:
```bash
cd /mnt/c/Users/conta/Desktop/git-repos/glowmetrics-web/frontend
```

2. Crie o arquivo `.env`:
```bash
touch .env
```

3. Abra o arquivo `.env` e adicione:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_9mxekBWP1yv3OVr5b-ZvoQ_NP-6AFwj
VITE_API_URL=http://localhost:8000
```

**⚠️ IMPORTANTE:** Substitua `https://seu-projeto.supabase.co` pela URL real do seu projeto Supabase (obtida no Passo 1.4)

## 3. Instalar e Rodar

### Passo 3.1: Backend (Python)

1. Navegue até a pasta do backend:
```bash
cd /mnt/c/Users/conta/Desktop/git-repos/glowmetrics-web/backend
```

2. Crie um ambiente virtual (recomendado):
```bash
python3 -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate
```

3. Instale as dependências:
```bash
pip install -r requirements.txt
```

4. Rode o servidor:
```bash
python -m app.main
```

Você deve ver algo como:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Deixe este terminal aberto!** O backend precisa estar rodando.

### Passo 3.2: Frontend (React)

1. Abra um **NOVO terminal** (deixe o backend rodando)

2. Navegue até a pasta do frontend:
```bash
cd /mnt/c/Users/conta/Desktop/git-repos/glowmetrics-web/frontend
```

3. Instale as dependências:
```bash
npm install
```

4. Rode o servidor de desenvolvimento:
```bash
npm run dev
```

Você deve ver algo como:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

5. Abra o navegador em: **http://localhost:5173**

## 4. Testar a Aplicação

1. **Criar conta:**
   - Acesse http://localhost:5173
   - Clique em "Cadastre-se"
   - Crie uma conta com email e senha

2. **Criar paciente:**
   - No dashboard, clique em "Novo Paciente"
   - Preencha o nome (obrigatório)
   - Salve

3. **Fazer análise:**
   - Clique em "Nova Análise"
   - Selecione ou crie um paciente
   - Faça upload das fotos (Antes e Depois)
   - Selecione os procedimentos (Botox, Preenchimento, Peeling)
   - Clique em "Analisar"
   - Aguarde o processamento (pode levar alguns minutos)
   - O PDF será gerado e exibido!

## 5. Troubleshooting

### Erro: "Module not found"
- Certifique-se de estar no ambiente virtual (backend)
- Reinstale: `pip install -r requirements.txt`

### Erro: "Cannot connect to Supabase"
- Verifique se a URL no `.env` está correta
- Verifique se a chave `VITE_SUPABASE_ANON_KEY` está correta

### Erro: "OpenAI API error"
- Verifique se o token no `backend/.env` está correto
- Verifique se tem créditos na conta OpenAI

### Erro: "Storage bucket not found"
- Certifique-se de criar os buckets `photos` e `reports` no Supabase
- Verifique se estão marcados como **públicos**

### Backend não inicia
- Verifique se a porta 8000 está livre
- Tente: `uvicorn app.main:app --reload --port 8000`

### Frontend não inicia
- Verifique se a porta 5173 está livre
- Tente: `npm run dev -- --port 5174`

## 6. Estrutura de Arquivos Importantes

```
glowmetrics-web/
├── backend/
│   ├── .env                    ← CRIAR AQUI
│   ├── app/
│   │   └── main.py            ← API principal
│   └── requirements.txt
├── frontend/
│   ├── .env                   ← CRIAR AQUI
│   ├── src/
│   │   ├── App.jsx
│   │   └── pages/
│   └── package.json
└── supabase/
    └── migrations/
        └── 001_initial.sql    ← Já executado no Supabase
```

## 7. Checklist Final

- [ ] Projeto Supabase criado
- [ ] Migration SQL executada
- [ ] Buckets `photos` e `reports` criados (públicos)
- [ ] `backend/.env` configurado com `OPENAI_API_KEY`
- [ ] `frontend/.env` configurado com `VITE_SUPABASE_URL`
- [ ] Backend rodando em http://localhost:8000
- [ ] Frontend rodando em http://localhost:5173
- [ ] Conta criada no app
- [ ] Primeira análise realizada com sucesso

## 🎉 Pronto!

Se tudo estiver funcionando, você deve conseguir:
- Fazer login/registro
- Criar pacientes
- Fazer upload de fotos
- Selecionar procedimentos
- Gerar análises com ChatGPT
- Ver PDFs gerados

Boa sorte! 🚀

