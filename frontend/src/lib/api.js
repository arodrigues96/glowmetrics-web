// api.js - Chamadas para backend Python
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function analyzeImages(beforeFile, afterFile, procedures) {
  // Upload imagens para Supabase Storage primeiro
  const { supabase } = await import('./supabase')
  
  const beforeFileName = `photos/${Date.now()}_before.jpg`
  const afterFileName = `photos/${Date.now()}_after.jpg`
  
  // Upload antes
  const { data: beforeData, error: beforeError } = await supabase.storage
    .from('photos')
    .upload(beforeFileName, beforeFile)
  
  if (beforeError) throw beforeError
  
  // Upload depois
  const { data: afterData, error: afterError } = await supabase.storage
    .from('photos')
    .upload(afterFileName, afterFile)
  
  if (afterError) throw afterError
  
  // Obter URLs públicas
  const { data: { publicUrl: beforeUrl } } = supabase.storage
    .from('photos')
    .getPublicUrl(beforeFileName)
  
  const { data: { publicUrl: afterUrl } } = supabase.storage
    .from('photos')
    .getPublicUrl(afterFileName)
  
  // Chamar backend para análise
  const response = await fetch(`${API_URL}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      before_image_url: beforeUrl,
      after_image_url: afterUrl,
      procedures
    })
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Erro na análise')
  }
  
  return await response.json()
}

export async function generatePDF(beforeUrl, afterUrl, analysisResults) {
  const response = await fetch(`${API_URL}/api/generate-pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      before_url: beforeUrl,
      after_url: afterUrl,
      analysis_results: analysisResults
    })
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Erro ao gerar PDF')
  }
  
  return await response.json()
}

