// api.js - Chamadas para backend Python
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function analyzeImages(beforeFile, afterFile, procedures, patientId = null) {
  // Upload imagens para Supabase Storage primeiro
  const { supabase } = await import('./supabase')
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/e2db86f0-3e51-4fba-8d95-27a01cf275ef',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.js:4',message:'analyzeImages entry',data:{patientId,proceduresCount:procedures?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
  // Verificar autenticação
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/e2db86f0-3e51-4fba-8d95-27a01cf275ef',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.js:10',message:'auth check result',data:{hasUser:!!user,userId:user?.id,authError:authError?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
  if (authError || !user) {
    throw new Error('Usuário não autenticado')
  }
  
  // Verificar sessão atual
  const { data: { session } } = await supabase.auth.getSession()
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/e2db86f0-3e51-4fba-8d95-27a01cf275ef',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.js:16',message:'session check',data:{hasSession:!!session,sessionUserId:session?.user?.id,userMatches:user.id===session?.user?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  // #endregion
  
  const beforeFileName = `photos/${Date.now()}_before.jpg`
  const afterFileName = `photos/${Date.now()}_after.jpg`
  
  // Upload antes
  const { data: beforeData, error: beforeError } = await supabase.storage
    .from('photos')
    .upload(beforeFileName, beforeFile)
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/e2db86f0-3e51-4fba-8d95-27a01cf275ef',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.js:23',message:'storage upload before',data:{success:!beforeError,error:beforeError?.message,path:beforeFileName},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  
  if (beforeError) throw beforeError
  
  // Upload depois
  const { data: afterData, error: afterError } = await supabase.storage
    .from('photos')
    .upload(afterFileName, afterFile)
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/e2db86f0-3e51-4fba-8d95-27a01cf275ef',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.js:30',message:'storage upload after',data:{success:!afterError,error:afterError?.message,path:afterFileName},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  
  if (afterError) throw afterError
  
  // Obter URLs públicas
  const { data: { publicUrl: beforeUrl } } = supabase.storage
    .from('photos')
    .getPublicUrl(beforeFileName)
  
  const { data: { publicUrl: afterUrl } } = supabase.storage
    .from('photos')
    .getPublicUrl(afterFileName)
  
  // Salvar fotos na tabela photos (para RLS)
  const insertDataBefore = {
    storage_path: beforeFileName,
    photo_type: 'before',
    user_id: user.id,
    patient_id: patientId
  }
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/e2db86f0-3e51-4fba-8d95-27a01cf275ef',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.js:48',message:'before insert data',data:{userId:insertDataBefore.user_id,patientId:insertDataBefore.patient_id,storagePath:insertDataBefore.storage_path},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  
  const { data: beforePhoto, error: beforePhotoError } = await supabase
    .from('photos')
    .insert(insertDataBefore)
    .select()
    .single()
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/e2db86f0-3e51-4fba-8d95-27a01cf275ef',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.js:55',message:'before photo insert result',data:{success:!beforePhotoError,error:beforePhotoError?.message,errorCode:beforePhotoError?.code,errorDetails:beforePhotoError?.details,photoId:beforePhoto?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
  if (beforePhotoError) {
    console.error('Erro ao salvar foto antes:', beforePhotoError)
    // Não interrompe o fluxo, mas loga o erro
  }
  
  const insertDataAfter = {
    storage_path: afterFileName,
    photo_type: 'after',
    user_id: user.id,
    patient_id: patientId
  }
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/e2db86f0-3e51-4fba-8d95-27a01cf275ef',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.js:68',message:'after insert data',data:{userId:insertDataAfter.user_id,patientId:insertDataAfter.patient_id,storagePath:insertDataAfter.storage_path},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  
  const { data: afterPhoto, error: afterPhotoError } = await supabase
    .from('photos')
    .insert(insertDataAfter)
    .select()
    .single()
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/e2db86f0-3e51-4fba-8d95-27a01cf275ef',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.js:75',message:'after photo insert result',data:{success:!afterPhotoError,error:afterPhotoError?.message,errorCode:afterPhotoError?.code,errorDetails:afterPhotoError?.details,photoId:afterPhoto?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
  if (afterPhotoError) {
    console.error('Erro ao salvar foto depois:', afterPhotoError)
    // Não interrompe o fluxo, mas loga o erro
  }
  
  // Chamar backend para análise
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/e2db86f0-3e51-4fba-8d95-27a01cf275ef',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.js:105',message:'fetch backend before',data:{apiUrl:API_URL,endpoint:'/api/analyze',beforeUrl,afterUrl,proceduresCount:procedures?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
  // #endregion
  
  let response;
  try {
    response = await fetch(`${API_URL}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        before_image_url: beforeUrl,
        after_image_url: afterUrl,
        procedures
      })
    })
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e2db86f0-3e51-4fba-8d95-27a01cf275ef',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.js:118',message:'fetch backend response',data:{ok:response?.ok,status:response?.status,statusText:response?.statusText,hasResponse:!!response},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
    // #endregion
  } catch (fetchError) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e2db86f0-3e51-4fba-8d95-27a01cf275ef',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.js:122',message:'fetch backend error',data:{error:fetchError?.message,errorName:fetchError?.name,errorStack:fetchError?.stack?.substring(0,200)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
    // #endregion
    throw fetchError
  }
  
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json()
    } catch (e) {
      errorData = { detail: `HTTP ${response.status}: ${response.statusText}` }
    }
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e2db86f0-3e51-4fba-8d95-27a01cf275ef',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.js:132',message:'fetch backend not ok',data:{status:response.status,statusText:response.statusText,errorData},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
    // #endregion
    throw new Error(errorData.detail || 'Erro na análise')
  }
  
  const result = await response.json()
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/e2db86f0-3e51-4fba-8d95-27a01cf275ef',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.js:138',message:'fetch backend success',data:{hasResult:!!result},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
  // #endregion
  
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

