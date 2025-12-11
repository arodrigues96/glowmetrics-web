// api.js - Chamadas para backend Python
// Normalizar URL (remover barra final se existir)
const getApiUrl = () => {
  const url = import.meta.env.VITE_API_URL || 'http://localhost:8000'
  return url.replace(/\/+$/, '') // Remove barras finais
}
const API_URL = getApiUrl()

export async function analyzeImages(beforeFile, afterFile, procedures, patientId = null) {
  // Upload imagens para Supabase Storage primeiro
  const { supabase } = await import('./supabase')
  
  // Verificar autenticação
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('Usuário não autenticado')
  }
  
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
  
  // Salvar fotos na tabela photos (para RLS)
  const { data: beforePhoto, error: beforePhotoError } = await supabase
    .from('photos')
    .insert({
      storage_path: beforeFileName,
      photo_type: 'before',
      user_id: user.id,
      patient_id: patientId
    })
    .select()
    .single()
  
  if (beforePhotoError) {
    console.error('Erro ao salvar foto antes:', beforePhotoError)
  }
  
  const { data: afterPhoto, error: afterPhotoError } = await supabase
    .from('photos')
    .insert({
      storage_path: afterFileName,
      photo_type: 'after',
      user_id: user.id,
      patient_id: patientId
    })
    .select()
    .single()
  
  if (afterPhotoError) {
    console.error('Erro ao salvar foto depois:', afterPhotoError)
  }
  
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
  
  const result = await response.json()
  
  // Retornar também os IDs das fotos para usar na análise
  return {
    ...result,
    before_photo_id: beforePhoto?.id,
    after_photo_id: afterPhoto?.id
  }
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

