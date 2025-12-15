// PatientDetail.jsx - Detalhes do paciente com histórico de análises
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, FileText, Plus } from 'lucide-react'

function formatDate(dateString) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date)
}

export default function PatientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: patient, isLoading: patientLoading } = useQuery({
    queryKey: ['patient', id],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (error) throw error
      return data
    },
  })

  const { data: analyses, isLoading: analysesLoading } = useQuery({
    queryKey: ['analyses', id],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .eq('patient_id', id)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!id,
  })

  if (patientLoading || analysesLoading) {
    return (
      <div className="min-h-screen bg-rose-50 flex items-center justify-center">
        <div className="text-rose-500">Carregando...</div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-rose-50 flex items-center justify-center">
        <div className="text-gray-500">Paciente não encontrado</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-rose-50">
      <nav className="bg-white border-b border-rose-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => navigate('/patients')}
              className="flex items-center space-x-2 text-gray-600 hover:text-rose-600"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </button>
            <h1 className="text-2xl font-bold text-rose-600">{patient.name}</h1>
            <button
              onClick={() => navigate(`/analysis/new?patientId=${id}`)}
              className="flex items-center space-x-2 bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Nova Análise</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Informações do Paciente */}
        <div className="bg-white rounded-xl shadow-md border border-rose-100 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Informações do Paciente</h2>
          <div className="space-y-2">
            <p className="text-gray-700">
              <span className="font-medium">Nome:</span> {patient.name}
            </p>
            {patient.gender && (
              <p className="text-gray-700">
                <span className="font-medium">Sexo:</span> {patient.gender === 'masculino' ? 'Masculino' : 'Feminino'}
              </p>
            )}
          </div>
        </div>

        {/* Histórico de Análises */}
        <div className="bg-white rounded-xl shadow-md border border-rose-100 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Histórico de Análises</h2>
          
          {analyses && analyses.length > 0 ? (
            <div className="space-y-4">
              {analyses.map((analysis) => (
                <div
                  key={analysis.id}
                  className="border border-rose-100 rounded-lg p-4 hover:bg-rose-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {formatDate(analysis.created_at)}
                      </p>
                      {analysis.procedures && analysis.procedures.length > 0 && (
                        <p className="text-sm text-gray-500 mt-1">
                          {analysis.procedures.join(', ')}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => navigate(`/analysis/${analysis.id}`)}
                      className="flex items-center space-x-2 bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 transition-colors text-sm"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Visualizar relatório</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhuma análise ainda</p>
              <button
                onClick={() => navigate(`/analysis/new?patientId=${id}`)}
                className="mt-4 bg-rose-500 text-white px-6 py-2 rounded-lg hover:bg-rose-600 transition-colors"
              >
                Criar primeira análise
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

