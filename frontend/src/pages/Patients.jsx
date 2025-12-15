// Patients.jsx - Lista de pacientes
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, ArrowLeft, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export default function Patients() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: patients, isLoading } = useQuery({
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

  const deleteMutation = useMutation({
    mutationFn: async (patientId) => {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', patientId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
      toast.success('Paciente removido com sucesso!')
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao remover paciente')
    },
  })

  const handleDelete = async (patientId, patientName) => {
    if (window.confirm(`Tem certeza que deseja remover o paciente "${patientName}"?\n\nEsta ação não pode ser desfeita e também removerá todas as análises e fotos relacionadas.`)) {
      deleteMutation.mutate(patientId)
    }
  }

  return (
    <div className="min-h-screen bg-rose-50">
      <nav className="bg-white border-b border-rose-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 text-gray-600 hover:text-rose-600"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </button>
            <h1 className="text-2xl font-bold text-rose-600">Pacientes</h1>
            <button
              onClick={() => navigate('/patients/new')}
              className="flex items-center space-x-2 bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Novo</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Carregando...</div>
        ) : patients && patients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {patients.map((patient) => (
              <div
                key={patient.id}
                className="bg-white rounded-xl p-6 shadow-md border border-rose-100 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">{patient.name}</h3>
                  <button
                    onClick={() => handleDelete(patient.id, patient.name)}
                    disabled={deleteMutation.isPending}
                    className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                    title="Remover paciente"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <button
                  onClick={() => navigate(`/analysis/new?patientId=${patient.id}`)}
                  className="w-full bg-rose-500 text-white py-2 px-4 rounded-lg hover:bg-rose-600 transition-colors"
                >
                  Nova Análise
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Nenhum paciente cadastrado ainda</p>
            <button
              onClick={() => navigate('/patients/new')}
              className="bg-rose-500 text-white px-6 py-2 rounded-lg hover:bg-rose-600 transition-colors"
            >
              Cadastrar Primeiro Paciente
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

