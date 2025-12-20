import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../supabaseClient'
import { SubjectCard } from '../components/SubjectCard'
import { AddSubjectModal } from '../components/AddSubjectModal'
import { Plus, Loader2, BookOpen } from 'lucide-react'

export function Dashboard() {
  const { user } = useAuth()
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    if (user) fetchSubjects()
  }, [user])

  async function fetchSubjects() {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*, grades(*)')
        .order('created_at', { ascending: false })

      if (error) throw error
      setSubjects(data || [])
    } catch (error) {
      console.error('Erro ao buscar matérias:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24"> {/* pb-24 dá espaço para o menu não cortar o conteúdo */}
      
      {/* Cabeçalho */}
      <header className="bg-white shadow-sm pt-8 pb-6 px-4 sticky top-0 z-10">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Olá, Estudante 👋</h1>
            <p className="text-gray-500 text-sm">Foco nos estudos!</p>
          </div>
          {/* O botão de sair foi para a tela de Perfil, limpando o visual aqui */}
        </div>
        
        {/* Barra de Progresso (Exemplo visual) */}
        <div className="bg-gray-100 rounded-full h-3 w-full overflow-hidden mt-2 relative">
          <div className="bg-[#0047AB] h-full w-[45%] rounded-full absolute top-0 left-0"></div>
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-400">
            <span>Semestre</span>
            <span>45% concluído</span>
        </div>
      </header>

      <main className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[#0047AB]" />
            Minhas Matérias
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#0047AB] h-8 w-8" /></div>
        ) : subjects.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-[#0047AB]" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Nenhuma matéria ainda</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">Adicione as cadeiras que você está cursando este semestre.</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-[#0047AB] text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:bg-blue-800 transition flex items-center gap-2 mx-auto"
            >
              <Plus className="h-5 w-5" />
              Adicionar Matéria
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {subjects.map(subject => (
              <SubjectCard key={subject.id} subject={subject} />
            ))}
          </div>
        )}
      </main>

      {/* Botão Flutuante (FAB) - Ajustado para não ficar embaixo do menu */}
      {subjects.length > 0 && (
        <button 
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-24 right-6 bg-[#0047AB] text-white p-4 rounded-full shadow-xl hover:bg-blue-800 transition transform hover:scale-105 z-40"
        >
          <Plus className="h-6 w-6" />
        </button>
      )}

      <AddSubjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchSubjects} 
      />
    </div>
  )
}