import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../supabaseClient'
import { SubjectCard } from '../components/SubjectCard'
import { AddSubjectModal } from '../components/AddSubjectModal'
import { Plus, Loader2, BookOpen, GraduationCap, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react'

export function Dashboard() {
  const { user } = useAuth()
  
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState({ name: 'Estudante', course: '', totalSemesters: 8 })
  
  // Controle do Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('') // Qual período estamos adicionando?

  // Controle de quais semestres estão abertos (Visual)
  const [expandedPeriods, setExpandedPeriods] = useState({}) 

  useEffect(() => {
    if (user) fetchData()
  }, [user])

  async function fetchData() {
    try {
      // 1. Busca Perfil
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (profileData) {
        setProfile({
            name: profileData.full_name?.split(' ')[0] || 'Estudante',
            course: profileData.course_name || '',
            totalSemesters: profileData.total_semesters || 8
        })
        
        // Abre o primeiro período automaticamente na primeira vez
        setExpandedPeriods(prev => ({...prev, '1º Período': true}))
      }

      // 2. Busca Matérias COM NOTAS (grades)
      const { data: subjectData, error } = await supabase
        .from('subjects')
        .select('*, grades(*)') // Traz as notas junto para calcular média
        .order('created_at', { ascending: true })

      if (error) throw error
      setSubjects(subjectData || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Agrupa matérias
  const groupedSubjects = subjects.reduce((acc, subject) => {
    const p = subject.period || 'Extras'
    if (!acc[p]) acc[p] = []
    acc[p].push(subject)
    return acc
  }, {})

  // Gera lista de semestres (1º Período, 2º Período...)
  const semesterList = Array.from({ length: profile.totalSemesters }, (_, i) => `${i + 1}º Período`)

  // Função para abrir modal no período certo
  function openAddModal(period) {
    setSelectedPeriod(period)
    setIsModalOpen(true)
  }

  // Toggle do Accordion
  function togglePeriod(period) {
    setExpandedPeriods(prev => ({...prev, [period]: !prev[period]}))
  }

  // Calcula progresso do semestre (Aprovadas / Total)
  function getPeriodProgress(periodName) {
    const subs = groupedSubjects[periodName] || []
    if (subs.length === 0) return 0
    
    const passedCount = subs.filter(sub => {
        const grades = sub.grades || []
        const totalWeight = grades.reduce((acc, g) => acc + (g.weight || 0), 0)
        const totalValue = grades.reduce((acc, g) => acc + ((g.value || 0) * (g.weight || 0)), 0)
        const avg = grades.length > 0 ? (totalWeight > 0 ? totalValue / totalWeight : 0) : 0
        return avg >= (sub.passing_grade || 7)
    }).length

    return Math.round((passedCount / subs.length) * 100)
  }

  // Calcula Progresso Global (Semestres "vencidos" / Total)
  // Simplificação: Consideramos progresso global a média dos progressos dos períodos
  const globalProgress = Math.round(semesterList.reduce((acc, p) => acc + getPeriodProgress(p), 0) / profile.totalSemesters)

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      
      {/* CABEÇALHO */}
      <header className="bg-white shadow-sm pt-8 pb-6 px-4 sticky top-0 z-20">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Olá, {profile.name} 👋</h1>
            {profile.course ? (
                <div className="flex items-center gap-1 text-[#0047AB] font-medium text-sm mt-1">
                    <GraduationCap className="w-4 h-4" />
                    {profile.course}
                </div>
            ) : <p className="text-xs text-gray-400">Configure seu curso no perfil</p>}
          </div>
          <div className="text-right">
              <span className="text-2xl font-bold text-[#0047AB]">{globalProgress}%</span>
              <p className="text-[10px] text-gray-400 uppercase font-bold">Concluído</p>
          </div>
        </div>
        
        {/* Barra Global */}
        <div className="bg-gray-100 rounded-full h-2 w-full overflow-hidden mt-3">
          <div className="bg-[#0047AB] h-full rounded-full transition-all duration-1000" style={{ width: `${globalProgress}%` }}></div>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#0047AB] h-8 w-8" /></div>
        ) : (
          semesterList.map(period => {
            const periodSubs = groupedSubjects[period] || []
            const progress = getPeriodProgress(period)
            const isOpen = expandedPeriods[period]
            const isCompleted = progress === 100 && periodSubs.length > 0

            return (
                <div key={period} className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${isOpen ? 'shadow-md border-blue-100' : 'shadow-sm border-gray-100'}`}>
                    
                    {/* Cabeçalho do Período (Clicável) */}
                    <div onClick={() => togglePeriod(period)} className="p-4 flex justify-between items-center cursor-pointer bg-white active:bg-gray-50">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${isCompleted ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-[#0047AB]'}`}>
                                {isCompleted ? <CheckCircle className="w-5 h-5" /> : progress + '%'}
                            </div>
                            <div>
                                <h3 className={`font-bold ${isCompleted ? 'text-green-800' : 'text-gray-800'}`}>{period}</h3>
                                <p className="text-xs text-gray-400">{periodSubs.length} matérias</p>
                            </div>
                        </div>
                        {isOpen ? <ChevronUp className="text-gray-400 w-5 h-5"/> : <ChevronDown className="text-gray-400 w-5 h-5"/>}
                    </div>

                    {/* Barra de Progresso do Período */}
                    {isOpen && (
                        <div className="h-1 w-full bg-gray-100">
                             <div className={`h-full transition-all ${isCompleted ? 'bg-green-500' : 'bg-[#0047AB]'}`} style={{ width: `${progress}%` }}></div>
                        </div>
                    )}

                    {/* Conteúdo (Matérias) */}
                    {isOpen && (
                        <div className="p-4 bg-gray-50/50">
                            {periodSubs.length === 0 ? (
                                <div className="text-center py-4 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl mb-3">
                                    Nenhuma matéria neste período.
                                </div>
                            ) : (
                                periodSubs.map(sub => (
                                    <SubjectCard key={sub.id} subject={sub} onUpdate={fetchData} />
                                ))
                            )}

                            {/* Botão Adicionar (Específico deste período) */}
                            <button 
                                onClick={() => openAddModal(period)}
                                className="w-full py-3 rounded-xl border-2 border-dashed border-blue-200 text-[#0047AB] font-bold text-sm hover:bg-blue-50 transition flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Adicionar ao {period}
                            </button>
                        </div>
                    )}
                </div>
            )
          })
        )}
      </main>

      <AddSubjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchData}
        defaultPeriod={selectedPeriod} // Passa o período selecionado
      />
    </div>
  )
}