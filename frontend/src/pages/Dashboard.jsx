// Dashboard.jsx - Dashboard principal
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useQuery } from '@tanstack/react-query'
import { LogOut, Users, FileText } from 'lucide-react'

export default function Dashboard() {
  const navigate = useNavigate()

  const { data: patients, isLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error
      return data
    },
  })

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-rose-50">
      <nav className="bg-white border-b border-rose-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-rose-600">GlowMetrics</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-rose-600"
              >
                <LogOut className="w-5 h-5" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={() => navigate('/patients/new')}
            className="bg-white rounded-xl p-6 shadow-md border border-rose-100 hover:shadow-lg transition-shadow text-left"
          >
            <Users className="w-8 h-8 text-rose-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Novo Paciente</h2>
            <p className="text-gray-600">Cadastrar um novo paciente</p>
          </button>

          <button
            onClick={() => navigate('/analysis/new')}
            className="bg-white rounded-xl p-6 shadow-md border border-rose-100 hover:shadow-lg transition-shadow text-left"
          >
            <FileText className="w-8 h-8 text-rose-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Nova Análise</h2>
            <p className="text-gray-600">Criar uma nova análise facial</p>
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-rose-100 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Pacientes Recentes</h2>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Carregando...</div>
          ) : patients && patients.length > 0 ? (
            <div className="space-y-4">
              {patients.map((patient) => (
                <div
                  key={patient.id}
                  onClick={() => navigate(`/patients`)}
                  className="p-4 border border-rose-100 rounded-lg hover:bg-rose-50 cursor-pointer transition-colors"
                >
                  <h3 className="font-medium text-gray-800">{patient.name}</h3>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Nenhum paciente cadastrado ainda
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

