# 🔍 Verificar Variável VITE_API_URL no Vercel

## Passo 1: Verificar no Vercel

1. Acesse [vercel.com/dashboard](https://vercel.com/dashboard)
2. Seu projeto → **Settings** → **Environment Variables**
3. Procure por `VITE_API_URL`
4. Verifique:
   - ✅ **Name:** `VITE_API_URL` (exatamente assim, com VITE_ no início)
   - ✅ **Value:** `https://glowmetrics-backend.onrender.com`
   - ✅ **Environments:** Deve estar marcado para:
     - ✅ Production
     - ✅ Preview
     - ✅ Development

## Passo 2: Se a variável não existe ou está errada

1. Clique em **Add New**
2. **Key:** `VITE_API_URL`
3. **Value:** `https://glowmetrics-backend.onrender.com`
4. Marque **todas** as opções (Production, Preview, Development)
5. Clique em **Save**

## Passo 3: Forçar Redeploy

1. Vá em **Deployments** (menu lateral)
2. Clique nos **3 pontinhos** do último deploy
3. Clique em **Redeploy**
4. Aguarde o deploy terminar (1-2 minutos)

## Passo 4: Verificar no Console do Navegador

1. Acesse seu site no Vercel
2. Abra o Console (F12 → Console)
3. Tente fazer uma análise
4. Procure por: `🔍 VITE_API_URL:`
5. Deve mostrar: `🔍 VITE_API_URL: https://glowmetrics-backend.onrender.com`

## ⚠️ Problemas Comuns

### Problema 1: Variável não aparece no console
- **Causa:** Variável não está definida ou não foi feito redeploy
- **Solução:** Adicione a variável e faça redeploy

### Problema 2: Mostra `undefined` ou `http://localhost:8000`
- **Causa:** Variável não está configurada corretamente
- **Solução:** Verifique o nome da variável (deve ser `VITE_API_URL` com VITE_)

### Problema 3: Variável existe mas não funciona
- **Causa:** Variável pode estar apenas para Production, mas você está em Preview
- **Solução:** Marque todas as opções (Production, Preview, Development)

## ✅ Checklist

- [ ] Variável `VITE_API_URL` existe no Vercel
- [ ] Valor é `https://glowmetrics-backend.onrender.com`
- [ ] Está marcada para Production, Preview e Development
- [ ] Foi feito redeploy após adicionar/editar
- [ ] Console do navegador mostra a URL correta

