import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../supabaseClient'
import { SubjectCard } from '../components/SubjectCard'
import { AddSubjectModal } from '../components/AddSubjectModal'
import { DashboardSkeleton } from '../components/Skeletons'
import { Plus, BarChart3, ChevronDown, User, Target } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

export function Dashboard() {
  const { user } = useAuth()
  
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState({ name: '', course: '', totalSemesters: 8, avatar: null, passingGrade: 7.0 })
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('') 
  const [expandedPeriods, setExpandedPeriods] = useState({}) 

  useEffect(() => {
    if (user) fetchData()
  }, [user])

  async function fetchData() {
    try {
      // Delay suave para evitar flicker muito rápido do skeleton
      const minLoadTime = new Promise(resolve => setTimeout(resolve, 400))
      
      const profilePromise = supabase.from('profiles').select('*').eq('id', user.id).single()
      const subjectsPromise = supabase.from('subjects').select('*, grades(*)').order('created_at', { ascending: true })

      const [_, { data: profileData }, { data: subjectData }] = await Promise.all([
        minLoadTime, 
        profilePromise, 
        subjectsPromise
      ])

      if (profileData) {
        setProfile({
            name: profileData.full_name?.split(' ')[0] || 'Estudante',
            course: profileData.course_name || '',
            totalSemesters: profileData.total_semesters || 8,
            avatar: profileData.avatar_url || null,
            passingGrade: profileData.passing_grade || 7.0
        })
        
        // Abre o 1º período por defeito se for o primeiro acesso
        setExpandedPeriods(prev => (Object.keys(prev).length === 0 ? { '1º Período': true } : prev))
      }
      setSubjects(subjectData || [])
    } catch (error) {
      console.error("Erro no Dashboard:", error)
    } finally {
      setLoading(false)
    }
  }

  // Lógica de Saudação Dinâmica
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return "Bom dia"
    if (hour >= 12 && hour < 18) return "Boa tarde"
    return "Boa noite"
  }

  const groupedSubjects = subjects.reduce((acc, subject) => {
    const p = subject.period || 'Extras'
    if (!acc[p]) acc[p] = []
    acc[p].push(subject)
    return acc
  }, {})

  const totalSems = Math.max(1, profile.totalSemesters || 8)
  const semesterList = Array.from({ length: totalSems }, (_, i) => `${i + 1}º Período`)
  
  function getPeriodProgress(periodName) {
    const subs = groupedSubjects[periodName] || []
    if (subs.length === 0) return 0
    
    const passedCount = subs.filter(sub => {
        const grades = sub.grades || []
        const totalW = grades.reduce((acc, g) => acc + (g.weight || 0), 0)
        const totalV = grades.reduce((acc, g) => acc + ((g.value || 0) * (g.weight || 0)), 0)
        const avg = grades.length > 0 && totalW > 0 ? (totalV / totalW) : 0
        return avg >= (profile.passingGrade)
    }).length

    return Math.round((passedCount / subs.length) * 100)
  }

  const globalProgress = Math.round(semesterList.reduce((acc, p) => acc + getPeriodProgress(p), 0) / totalSems)

  if (loading) return <DashboardSkeleton />

  return (
    <div className="min-h-screen bg-muted/30 pb-32 transition-colors duration-300 animate-in fade-in duration-500">
      
      {/* HEADER REFORMULADO (Estilo Premium SaaS) */}
      <header className="bg-background/80 border-b border-border sticky top-0 z-20 px-4 py-4 backdrop-blur-md">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 overflow-hidden flex items-center justify-center shadow-inner">
                    {profile.avatar ? (
                        <img src={profile.avatar} alt="Perfil" className="w-full h-full object-cover" />
                    ) : (
                        <User className="w-5 h-5 text-primary" />
                    )}
                </div>
                <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none mb-1">
                        {profile.course || 'Acadêmico'}
                    </p>
                    <h1 className="text-base font-bold text-foreground tracking-tight leading-none">
                        {getGreeting()}, {profile.name}.
                    </h1>
                </div>
            </div>
            
            {/* NOVO WIDGET DE PROGRESSO (Pílula de Performance) */}
            <Link to="/stats" className="flex items-center gap-2.5 px-3 py-1.5 bg-background border border-border rounded-full shadow-sm hover:border-primary/40 transition-all group active:scale-95">
                <div className="relative flex items-center justify-center">
                    {/* Gráfico circular minimalista */}
                    <svg className="w-7 h-7 transform -rotate-90">
                        <circle cx="14" cy="14" r="11" stroke="currentColor" strokeWidth="2.5" fill="transparent" className="text-muted/20" />
                        <circle cx="14" cy="14" r="11" stroke="currentColor" strokeWidth="2.5" fill="transparent" 
                            strokeDasharray={2 * Math.PI * 11} 
                            strokeDashoffset={2 * Math.PI * 11 * (1 - (globalProgress || 0) / 100)} 
                            className="text-primary transition-all duration-1000 ease-out" 
                        />
                    </svg>
                    <Target className="w-2.5 h-2.5 text-primary absolute" />
                </div>
                <div className="flex flex-col pr-1">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase leading-none">CR Global</span>
                    <span className="text-xs font-black text-foreground">{isNaN(globalProgress) ? 0 : globalProgress}%</span>
                </div>
            </Link>
        </div>
      </header>

      <main className="p-4 max-w-2xl mx-auto space-y-4 mt-2">
          {semesterList.map(period => {
            const periodSubs = groupedSubjects[period] || []
            const progress = getPeriodProgress(period)
            const isOpen = expandedPeriods[period]
            const isCompleted = progress === 100 && periodSubs.length > 0

            return (
                <div key={period} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm transition-all duration-300">
                    
                    <div 
                        onClick={() => setExpandedPeriods(prev => ({...prev, [period]: !prev[period]}))} 
                        className={`px-5 py-4 flex justify-between items-center cursor-pointer select-none transition-colors ${isOpen ? 'bg-muted/30' : 'hover:bg-muted/30'}`}
                    >
                        <div className="flex items-center gap-3">
                            <span className={`text-sm font-semibold ${isCompleted ? 'text-green-600 dark:text-green-500' : 'text-foreground'}`}>
                                {period}
                            </span>
                            <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-md border border-border">
                                {periodSubs.length}
                            </span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full transition-all duration-700 ${isCompleted ? 'bg-green-500' : 'bg-primary'}`} 
                                    style={{ width: `${progress}%` }} 
                                />
                            </div>
                            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}/>
                        </div>
                    </div>

                    {isOpen && (
                        <div className="p-4 border-t border-border animate-in slide-in-from-top-2 duration-200">
                            <div className="grid gap-0">
                                {periodSubs.length === 0 ? (
                                    <div className="text-center py-8 border-2 border-dashed border-border rounded-xl bg-muted/20">
                                        <p className="text-xs text-muted-foreground font-medium">Nenhuma disciplina registrada.</p>
                                    </div>
                                ) : (
                                    periodSubs.map(sub => (
                                        <SubjectCard key={sub.id} subject={sub} onUpdate={fetchData} />
                                    ))
                                )}

                                <button 
                                    onClick={() => { setSelectedPeriod(period); setIsModalOpen(true); }}
                                    className="w-full mt-3 py-3 rounded-xl border border-dashed border-border text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-4 h-4" /> Adicionar Disciplina
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )
          })}
      </main>

      {/* FAB (Botão de Ação Flutuante) */}
      <button 
        onClick={() => setIsModalOpen(true)} 
        className="fixed bottom-24 right-6 bg-foreground text-background p-3.5 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all z-40 border border-border/10"
      >
        <Plus className="h-6 w-6" />
      </button>

      <AddSubjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => { fetchData(); toast.success('Atualizado') }} 
        defaultPeriod={selectedPeriod} 
      />
    </div>
  )
}