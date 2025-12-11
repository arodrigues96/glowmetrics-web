// AnalysisNew.jsx - Nova análise
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useQuery } from '@tanstack/react-query'
import { analyzeImages, generatePDF } from '../lib/api'
import { toast } from 'sonner'
import { ArrowLeft, Upload } from 'lucide-react'

const PROCEDURES = ['Botox', 'Preenchimento', 'Peeling']

export default function AnalysisNew() {
  const [searchParams] = useSearchParams()
  const patientIdParam = searchParams.get('patientId')
  
  const [patientId, setPatientId] = useState(patientIdParam || '')
  const [patientName, setPatientName] = useState('')
  const [beforeFile, setBeforeFile] = useState(null)
  const [afterFile, setAfterFile] = useState(null)
  const [procedures, setProcedures] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const { data: patients } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!beforeFile || !afterFile) {
      toast.error('Por favor, selecione ambas as fotos')
      return
    }
    if (procedures.length === 0) {
      toast.error('Por favor, selecione pelo menos um procedimento')
      return
    }

    setLoading(true)
    try {
      // Criar paciente se necessário
      let finalPatientId = patientId
      if (!patientId && patientName) {
        const { data: { user } } = await supabase.auth.getUser()
        const { data: newPatient, error: patientError } = await supabase
          .from('patients')
          .insert({
            name: patientName,
            user_id: user.id,
          })
          .select()
          .single()

        if (patientError) throw patientError
        finalPatientId = newPatient.id
      }

      // Verificar se backend está configurado
      const apiUrl = import.meta.env.VITE_API_URL
      console.log('🔍 VITE_API_URL:', apiUrl) // Debug
      
      if (!apiUrl || apiUrl === 'http://localhost:8000') {
        console.error('❌ VITE_API_URL não configurada ou ainda é localhost')
        toast.error('Backend não configurado. Configure VITE_API_URL no Vercel com: https://glowmetrics-backend.onrender.com')
        setLoading(false)
        return
      }
      
      const isLocalhost = apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1')
      if (isLocalhost) {
        console.error('❌ VITE_API_URL ainda aponta para localhost:', apiUrl)
        toast.error('Backend não configurado. Configure VITE_API_URL no Vercel com: https://glowmetrics-backend.onrender.com')
        setLoading(false)
        return
      }
      
      console.log('✅ Backend URL configurada:', apiUrl)

      // Analisar imagens
      toast.info('Analisando imagens...')
      const analysisResult = await analyzeImages(beforeFile, afterFile, procedures, finalPatientId)
      
      // Obter URLs das imagens do Supabase Storage para gerar PDF
      // Usar os IDs das fotos que foram retornados pela análise
      const { supabase } = await import('../lib/supabase')
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e2db86f0-3e51-4fba-8d95-27a01cf275ef',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AnalysisNew.jsx:94',message:'before fetching photos',data:{beforePhotoId:analysisResult.before_photo_id,afterPhotoId:analysisResult.after_photo_id,patientId:finalPatientId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
      // #endregion
      
      // Buscar as fotos usando os IDs retornados pela análise
      let beforePhoto, afterPhoto
      
      if (analysisResult.before_photo_id && analysisResult.after_photo_id) {
        // Buscar fotos pelos IDs
        const { data: beforePhotoData, error: beforeError } = await supabase
          .from('photos')
          .select('storage_path, photo_type')
          .eq('id', analysisResult.before_photo_id)
          .single()
        
        const { data: afterPhotoData, error: afterError } = await supabase
          .from('photos')
          .select('storage_path, photo_type')
          .eq('id', analysisResult.after_photo_id)
          .single()
        
        if (beforeError || afterError) {
          console.error('Erro ao buscar fotos:', { beforeError, afterError })
          throw new Error('Erro ao buscar fotos do banco')
        }
        
        beforePhoto = beforePhotoData
        afterPhoto = afterPhotoData
      } else {
        // Fallback: buscar as fotos mais recentes deste paciente
        const { data: photos, error: photosError } = await supabase
          .from('photos')
          .select('storage_path, photo_type')
          .eq('user_id', user.id)
          .eq('patient_id', finalPatientId)
          .order('created_at', { ascending: false })
          .limit(2)
        
        if (photosError) throw photosError
        
        beforePhoto = photos?.find(p => p.photo_type === 'before')
        afterPhoto = photos?.find(p => p.photo_type === 'after')
      }
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e2db86f0-3e51-4fba-8d95-27a01cf275ef',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AnalysisNew.jsx:125',message:'photos found',data:{hasBeforePhoto:!!beforePhoto,hasAfterPhoto:!!afterPhoto,beforeStoragePath:beforePhoto?.storage_path,afterStoragePath:afterPhoto?.storage_path},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
      // #endregion
      
      if (!beforePhoto || !afterPhoto) {
        throw new Error('Fotos não encontradas para gerar PDF')
      }
      
      if (!beforePhoto.storage_path || !afterPhoto.storage_path) {
        throw new Error('Caminhos de armazenamento das fotos não encontrados')
      }
      
      const { data: { publicUrl: beforeUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(beforePhoto.storage_path)
      
      const { data: { publicUrl: afterUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(afterPhoto.storage_path)
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e2db86f0-3e51-4fba-8d95-27a01cf275ef',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AnalysisNew.jsx:145',message:'URLs obtained',data:{beforeUrl,beforeUrlLength:beforeUrl?.length||0,afterUrl,afterUrlLength:afterUrl?.length||0,beforeUrlEmpty:!beforeUrl||beforeUrl.trim()==='',afterUrlEmpty:!afterUrl||afterUrl.trim()===''},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
      // #endregion
      
      if (!beforeUrl || !afterUrl || beforeUrl.trim() === '' || afterUrl.trim() === '') {
        console.error('URLs obtidas:', { beforeUrl, afterUrl, beforeStoragePath: beforePhoto.storage_path, afterStoragePath: afterPhoto.storage_path })
        throw new Error('URLs das fotos não encontradas ou vazias')
      }

      // Gerar PDF
      toast.info('Gerando PDF...')
      const pdfResult = await generatePDF(
        beforeUrl,
        afterUrl,
        analysisResult.analysis
      )

      // Salvar análise no banco
      // (user já foi obtido anteriormente, não precisa buscar novamente)
      if (!user) {
        throw new Error('Usuário não autenticado')
      }
      
      const { data: analysis, error: analysisError } = await supabase
        .from('analyses')
        .insert({
          patient_id: finalPatientId,
          user_id: user.id,
          before_photo_id: analysisResult.before_photo_id,
          after_photo_id: analysisResult.after_photo_id,
          procedures,
          chatgpt_response: analysisResult.analysis,
          pdf_path: pdfResult.pdf_base64,
          status: 'completed',
        })
        .select()
        .single()

      if (analysisError) throw analysisError

      toast.success('Análise concluída com sucesso!')
      navigate(`/analysis/${analysis.id}`)
    } catch (error) {
      toast.error(error.message || 'Erro ao processar análise')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-rose-50">
      <nav className="bg-white border-b border-rose-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 text-gray-600 hover:text-rose-600"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-md border border-rose-100 p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Nova Análise</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Seleção de paciente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paciente
              </label>
              <select
                value={patientId}
                onChange={(e) => {
                  setPatientId(e.target.value)
                  setPatientName('')
                }}
                className="w-full px-4 py-2 border border-rose-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              >
                <option value="">Novo paciente</option>
                {patients?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Nome do paciente (se novo) */}
            {!patientId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Paciente *
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  required={!patientId}
                  className="w-full px-4 py-2 border border-rose-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="Nome completo"
                />
              </div>
            )}

            {/* Upload fotos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Foto Antes *
                </label>
                <div className="border-2 border-dashed border-rose-200 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-rose-400 mx-auto mb-2" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setBeforeFile(e.target.files[0])}
                    required
                    className="hidden"
                    id="before-file"
                  />
                  <label
                    htmlFor="before-file"
                    className="cursor-pointer text-rose-600 hover:text-rose-700"
                  >
                    {beforeFile ? beforeFile.name : 'Selecionar foto'}
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Foto Depois *
                </label>
                <div className="border-2 border-dashed border-rose-200 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-rose-400 mx-auto mb-2" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAfterFile(e.target.files[0])}
                    required
                    className="hidden"
                    id="after-file"
                  />
                  <label
                    htmlFor="after-file"
                    className="cursor-pointer text-rose-600 hover:text-rose-700"
                  >
                    {afterFile ? afterFile.name : 'Selecionar foto'}
                  </label>
                </div>
              </div>
            </div>

            {/* Procedimentos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Procedimentos Realizados *
              </label>
              <div className="space-y-2">
                {PROCEDURES.map((proc) => (
                  <label key={proc} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={procedures.includes(proc)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setProcedures([...procedures, proc])
                        } else {
                          setProcedures(procedures.filter((p) => p !== proc))
                        }
                      }}
                      className="w-4 h-4 text-rose-500 border-rose-300 rounded focus:ring-rose-500"
                    />
                    <span className="text-gray-700">{proc}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-rose-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-rose-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Processando...' : 'Analisar'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

