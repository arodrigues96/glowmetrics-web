// AnalysisView.jsx - Visualizar análise/PDF
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Download } from 'lucide-react'

export default function AnalysisView() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: analysis, isLoading } = useQuery({
    queryKey: ['analysis', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analyses')
        .select('*, patients(*)')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },
  })

  const handleDownload = () => {
    if (analysis?.pdf_path) {
      const link = document.createElement('a')
      link.href = `data:application/pdf;base64,${analysis.pdf_path}`
      link.download = `analise_${id}.pdf`
      link.click()
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-rose-50 flex items-center justify-center">
        <div className="text-rose-500">Carregando...</div>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-rose-50 flex items-center justify-center">
        <div className="text-gray-500">Análise não encontrada</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-rose-50">
      <nav className="bg-white border-b border-rose-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 text-gray-600 hover:text-rose-600"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </button>
            <h1 className="text-xl font-semibold text-gray-800">
              {analysis.patients?.name || 'Análise'}
            </h1>
            <button
              onClick={handleDownload}
              className="flex items-center space-x-2 bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-md border border-rose-100 p-6">
          {analysis.pdf_path && (
            <iframe
              src={`data:application/pdf;base64,${analysis.pdf_path}`}
              className="w-full h-screen border-0 rounded-lg"
              title="PDF Viewer"
            />
          )}
        </div>
      </main>
    </div>
  )
}

