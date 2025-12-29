import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { supabase } from '../supabaseClient.js'
import { SubjectCard } from '../components/SubjectCard.jsx'
import { AddSubjectModal } from '../components/AddSubjectModal.jsx'
import { DashboardSkeleton } from '../components/Skeletons.jsx'
import { Plus, BarChart3, ChevronDown, ChevronUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

export function Dashboard() {
  const { user } = useAuth()
  
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState({ name: '', course: '', totalSemesters: 8, avatar: null })
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('') 
  const [expandedPeriods, setExpandedPeriods] = useState({}) 

  useEffect(() => { if (user) fetchData() }, [user])

  async function fetchData() {
    try {
      const minLoadTime = new Promise(resolve => setTimeout(resolve, 300))
      const profilePromise = supabase.from('profiles').select('*').eq('id', user.id).single()
      const subjectsPromise = supabase.from('subjects').select('*, grades(*)').order('created_at', { ascending: true })

      const [_, { data: profileData }, { data: subjectData }] = await Promise.all([minLoadTime, profilePromise, subjectsPromise])

      if (profileData) {
        setProfile({
            name: profileData.full_name?.split(' ')[0] || 'Estudante',
            course: profileData.course_name || '',
            totalSemesters: profileData.total_semesters || 8,
            avatar: profileData.avatar_url || null
        })
        setExpandedPeriods(prev => (Object.keys(prev).length === 0 ? { '1º Período': true } : prev))
      }
      setSubjects(subjectData || [])
    } catch (error) { console.error(error) } finally { setLoading(false) }
  }

  const groupedSubjects = subjects.reduce((acc, subject) => {
    const p = subject.period || 'Extras'; if (!acc[p]) acc[p] = []; acc[p].push(subject); return acc
  }, {})
  const semesterList = Array.from({ length: profile.totalSemesters }, (_, i) => `${i + 1}º Período`)
  
  function togglePeriod(period) { setExpandedPeriods(prev => ({...prev, [period]: !prev[period]})) }
  function openAddModal(period) { setSelectedPeriod(period); setIsModalOpen(true) }
  
  function getPeriodProgress(periodName) {
    const subs = groupedSubjects[periodName] || []
    if (subs.length === 0) return 0
    const passedCount = subs.filter(sub => {
        const grades = sub.grades || []; const totalW = grades.reduce((acc, g) => acc + (g.weight || 0), 0); const totalV = grades.reduce((acc, g) => acc + ((g.value || 0) * (g.weight || 0)), 0)
        const avg = grades.length > 0 ? (totalWeight > 0 ? totalValue / totalWeight : 0) : 0
        return avg >= (sub.passing_grade || 7)
    }).length
    return Math.round((passedCount / subs.length) * 100)
  }
  const globalProgress = Math.round(semesterList.reduce((acc, p) => acc + getPeriodProgress(p), 0) / profile.totalSemesters)

  if (loading) return <DashboardSkeleton />

  return (
    <div className="min-h-screen bg-muted/30 pb-32 transition-colors duration-300">
      
      {/* Header Minimalista */}
      <header className="bg-background border-b border-border sticky top-0 z-20 px-6 py-5 flex justify-between items-end backdrop-blur-sm bg-opacity-90">
        <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Visão Geral</h1>
        </div>
        
        <Link to="/stats" className="flex items-center gap-3 px-3 py-1.5 bg-secondary/50 hover:bg-secondary rounded-lg border border-border transition-colors group">
            <div className="flex flex-col items-end">
                <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground uppercase tracking-wide">Progresso</span>
                <span className="text-sm font-bold text-primary">{isNaN(globalProgress) ? 0 : globalProgress}%</span>
            </div>
            <BarChart3 className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </Link>
      </header>

      <main className="p-4 max-w-2xl mx-auto space-y-4 mt-2">
          {semesterList.map(period => {
            const periodSubs = groupedSubjects[period] || []
            const progress = getPeriodProgress(period)
            const isOpen = expandedPeriods[period]
            const isCompleted = progress === 100 && periodSubs.length > 0

            return (
                <div key={period} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm transition-all duration-300">
                    
                    {/* Header do Acordeão */}
                    <div 
                        onClick={() => togglePeriod(period)} 
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
                            <div className="w-20 h-1 bg-muted rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${isCompleted ? 'bg-green-500' : 'bg-primary'}`} style={{ width: `${progress}%` }} />
                            </div>
                            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}/>
                        </div>
                    </div>

                    {/* Conteúdo */}
                    {isOpen && (
                        <div className="p-4 border-t border-border animate-in slide-in-from-top-2 duration-200">
                            <div className="grid gap-0">
                                {periodSubs.length === 0 ? (
                                    <div className="text-center py-8 border-2 border-dashed border-border rounded-xl bg-muted/20">
                                        <p className="text-xs text-muted-foreground font-medium">Sem disciplinas cadastradas.</p>
                                    </div>
                                ) : (
                                    periodSubs.map(sub => (
                                        <SubjectCard key={sub.id} subject={sub} onUpdate={fetchData} />
                                    ))
                                )}

                                <button 
                                    onClick={() => openAddModal(period)}
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

      {/* FAB Limpo */}
      <button 
        onClick={() => setIsModalOpen(true)} 
        className="fixed bottom-24 right-6 bg-foreground text-background p-3.5 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all z-40 border border-border/10"
      >
        <Plus className="h-6 w-6" />
      </button>

      <AddSubjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={() => { fetchData(); toast.success('Adicionado') }} defaultPeriod={selectedPeriod} />
    </div>
  )
}