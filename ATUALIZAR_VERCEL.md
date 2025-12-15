# 🔧 Atualizar Vercel com URL do Backend

## Passo a Passo

### 1. Acessar Configurações do Vercel

1. Acesse [vercel.com/dashboard](https://vercel.com/dashboard)
2. Clique no seu projeto `glowmetrics-web`
3. Vá em **Settings** (menu lateral)
4. Clique em **Environment Variables**

### 2. Atualizar VITE_API_URL

1. Procure pela variável `VITE_API_URL`
2. Clique nos **3 pontinhos** → **Edit**
3. Substitua o valor:
   - **Antes:** `http://localhost:8000`
   - **Depois:** `https://glowmetrics-backend.onrender.com`
4. Certifique-se de que está marcado para:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development
5. Clique em **Save**

### 3. Atualizar FRONTEND_URL no Render

1. Acesse [render.com](https://render.com)
2. Vá no seu serviço `glowmetrics-backend`
3. Clique em **Environment**
4. Procure `FRONTEND_URL`
5. Edite e cole a URL do seu frontend no Vercel (ex: `https://glowmetrics-web.vercel.app`)
6. Salve

### 4. Aguardar Redeploy

- O Vercel fará redeploy automático após salvar a variável
- Aguarde 1-2 minutos
- Teste novamente no site

## ✅ Pronto!

Agora o frontend conseguirá se comunicar com o backend online!

## 🧪 Testar

1. Acesse seu site no Vercel
2. Faça login
3. Crie um paciente
4. Faça upload das fotos
5. Selecione procedimentos
6. Clique em "Analisar"
7. Deve funcionar! 🎉

