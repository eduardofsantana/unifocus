import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { supabase } from '../supabaseClient.js'
import { SubjectCard } from '../components/SubjectCard.jsx'
import { AddSubjectModal } from '../components/AddSubjectModal.jsx'
import { DashboardSkeleton } from '../components/Skeletons.jsx'
import { Plus, Loader2, BookOpen, GraduationCap, ChevronDown, ChevronUp, CheckCircle, BarChart3, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

export function Dashboard() {
  const { user } = useAuth()
  
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState({ name: 'Estudante', course: '', totalSemesters: 8, avatar: null })
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('') 
  const [expandedPeriods, setExpandedPeriods] = useState({}) 

  useEffect(() => {
    if (user) fetchData()
  }, [user])

  async function fetchData() {
    try {
      const minLoadTime = new Promise(resolve => setTimeout(resolve, 300))
      const profilePromise = supabase.from('profiles').select('*').eq('id', user.id).single()
      const subjectsPromise = supabase.from('subjects').select('*, grades(*)').order('created_at', { ascending: true })

      const [_, { data: profileData }, { data: subjectData }] = await Promise.all([
        minLoadTime, profilePromise, subjectsPromise
      ])

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
    } catch (error) {
      console.error(error)
      // toast.error('Erro ao carregar dados.') // Opcional
    } finally {
      setLoading(false)
    }
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
        const grades = sub.grades || []
        const totalW = grades.reduce((acc, g) => acc + (g.weight || 0), 0)
        const totalV = grades.reduce((acc, g) => acc + ((g.value || 0) * (g.weight || 0)), 0)
        const avg = grades.length > 0 ? (totalW > 0 ? totalV / totalW : 0) : 0
        return avg >= (sub.passing_grade || 7)
    }).length
    return Math.round((passedCount / subs.length) * 100)
  }
  const globalProgress = Math.round(semesterList.reduce((acc, p) => acc + getPeriodProgress(p), 0) / profile.totalSemesters)

  if (loading) return <DashboardSkeleton />

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-32 transition-colors duration-300">
      
      <header className="bg-white dark:bg-slate-900 shadow-sm pt-8 pb-6 px-4 sticky top-0 z-20 border-b border-gray-100 dark:border-slate-800 transition-colors">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-800 border-2 border-white dark:border-slate-700 shadow-sm overflow-hidden flex items-center justify-center">
                {profile.avatar ? <img src={profile.avatar} className="w-full h-full object-cover" /> : <User className="w-6 h-6 text-gray-400" />}
            </div>
            <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Olá, {profile.name} 👋</h1>
                {profile.course ? (
                    <div className="flex items-center gap-1 text-[#0047AB] dark:text-blue-400 font-semibold text-xs mt-0.5">
                        <GraduationCap className="w-3 h-3" /> {profile.course}
                    </div>
                ) : <p className="text-xs text-gray-400">Configure seu curso</p>}
            </div>
          </div>
          
          <div className="text-right">
            <Link to="/stats" className="inline-flex flex-col items-end group">
                <div className="flex items-center gap-1.5 text-[#0047AB] dark:text-blue-400">
                    <span className="text-2xl font-black tracking-tighter">{isNaN(globalProgress) ? 0 : globalProgress}%</span>
                    <BarChart3 className="w-5 h-5 text-blue-300 dark:text-blue-500 group-hover:text-[#0047AB] dark:group-hover:text-blue-300 transition" />
                </div>
                <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-bold tracking-wider group-hover:text-[#0047AB] dark:group-hover:text-blue-400 transition">Conclusão</p>
            </Link>
          </div>
        </div>
        
        <div className="bg-gray-100 dark:bg-slate-800 rounded-full h-2 w-full overflow-hidden mt-4 shadow-inner">
          <div className="bg-gradient-to-r from-[#0047AB] to-blue-500 dark:from-blue-600 dark:to-blue-400 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${Math.max(2, globalProgress)}%` }}></div>
        </div>
      </header>

      <main className="p-4 space-y-4">
          {semesterList.map(period => {
            const periodSubs = groupedSubjects[period] || []
            const progress = getPeriodProgress(period)
            const isOpen = expandedPeriods[period]
            const isCompleted = progress === 100 && periodSubs.length > 0

            return (
                <div key={period} className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-300 overflow-hidden ${isOpen ? 'shadow-lg border-blue-100 dark:border-blue-900/50 ring-1 ring-blue-50 dark:ring-blue-900/30' : 'shadow-sm border-gray-100 dark:border-slate-800'}`}>
                    
                    <div onClick={() => togglePeriod(period)} className="p-4 flex justify-between items-center cursor-pointer bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition select-none">
                        <div className="flex items-center gap-4">
                            <div className="relative w-10 h-10 flex items-center justify-center">
                                <svg className="absolute w-full h-full transform -rotate-90">
                                    <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-gray-100 dark:text-slate-800" />
                                    <circle cx="20" cy="20" r="16" stroke={isCompleted ? "#22c55e" : "#0047AB"} strokeWidth="3" fill="transparent" strokeDasharray={2 * Math.PI * 16} strokeDashoffset={2 * Math.PI * 16 * (1 - progress / 100)} strokeLinecap="round" className={`transition-all duration-1000 ${isCompleted ? 'text-green-500' : 'text-[#0047AB] dark:text-blue-500'}`} />
                                </svg>
                                <span className={`text-[9px] font-bold ${isCompleted ? 'text-green-600 dark:text-green-400' : 'text-[#0047AB] dark:text-blue-400'}`}>
                                    {isCompleted ? <CheckCircle className="w-4 h-4" /> : `${progress}%`}
                                </span>
                            </div>
                            <div>
                                <h3 className={`font-bold text-base ${isCompleted ? 'text-green-700 dark:text-green-400' : 'text-gray-800 dark:text-gray-100'}`}>{period}</h3>
                                <p className="text-xs text-gray-400 dark:text-slate-500 font-medium">{periodSubs.length} matérias</p>
                            </div>
                        </div>
                        <div className={`p-1.5 rounded-full transition-transform duration-300 ${isOpen ? 'rotate-180 bg-gray-100 dark:bg-slate-800' : 'bg-transparent'}`}>
                            <ChevronDown className="text-gray-400 dark:text-slate-500 w-4 h-4"/>
                        </div>
                    </div>

                    {isOpen && (
                        <div className="px-4 pb-4 pt-2 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                            <div className="space-y-3 mt-3">
                                {periodSubs.length === 0 ? (
                                    <div className="text-center py-6 text-gray-400 dark:text-slate-500 text-sm border-2 border-dashed border-gray-100 dark:border-slate-800 rounded-xl">
                                        Nenhuma matéria aqui.
                                    </div>
                                ) : (
                                    periodSubs.map(sub => (
                                        <SubjectCard key={sub.id} subject={sub} onUpdate={fetchData} />
                                    ))
                                )}

                                <button 
                                    onClick={() => openAddModal(period)}
                                    className="w-full py-3.5 rounded-xl border-2 border-dashed border-blue-200 dark:border-blue-900 text-[#0047AB] dark:text-blue-400 font-bold text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20 transition flex items-center justify-center gap-2 group"
                                >
                                    <Plus className="w-3 h-3" /> Adicionar Matéria
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )
          })}
      </main>

      <button onClick={() => setIsModalOpen(true)} className="fixed bottom-28 right-6 bg-[#0047AB] dark:bg-blue-600 text-white p-4 rounded-full shadow-xl shadow-blue-900/20 hover:bg-blue-800 dark:hover:bg-blue-500 transition transform hover:scale-110 active:scale-95 z-40">
        <Plus className="h-7 w-7" />
      </button>

      <AddSubjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={() => { fetchData(); toast.success('Matéria adicionada!') }} defaultPeriod={selectedPeriod} />
    </div>
  )
}