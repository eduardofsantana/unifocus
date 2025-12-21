import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { supabase } from '../supabaseClient.js'
import { Award, Plus, Trash2, CheckCircle, Clock, Loader2, BookOpen, Minus, X, GraduationCap, Trophy } from 'lucide-react'
import { toast } from 'sonner'

export function Courses() {
  const { user } = useAuth()
  const [certs, setCerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    if (user) fetchCertifications()
  }, [user])

  async function fetchCertifications() {
    try {
      const { data } = await supabase
        .from('certifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      setCerts(data || [])
    } catch (error) {
      console.error(error)
      toast.error('Erro ao carregar cursos')
    } finally {
      setLoading(false)
    }
  }

  // Estatísticas Rápidas
  const completedCount = certs.filter(c => c.status === 'Concluído').length
  const inProgressCount = certs.length - completedCount

  async function deleteCert(id) {
    if (confirm('Tem certeza que deseja remover este curso?')) {
        // Atualização Otimista
        const originalCerts = [...certs]
        setCerts(certs.filter(c => c.id !== id))
        
        try {
            const { error } = await supabase.from('certifications').delete().eq('id', id)
            if (error) throw error
            toast.success('Curso removido.')
        } catch (error) {
            setCerts(originalCerts) // Reverte se der erro
            toast.error('Erro ao remover.')
        }
    }
  }

  async function updateProgress(cert, change) {
    const newCompleted = Math.max(0, Math.min(cert.total_modules, cert.completed_modules + change))
    if (newCompleted === cert.completed_modules) return

    const newStatus = newCompleted >= cert.total_modules ? 'Concluído' : 'Em andamento'

    // Otimista
    const updatedCerts = certs.map(c => 
        c.id === cert.id ? { ...c, completed_modules: newCompleted, status: newStatus } : c
    )
    setCerts(updatedCerts)

    try {
        await supabase.from('certifications').update({ 
            completed_modules: newCompleted,
            status: newStatus
        }).eq('id', cert.id)
        
        if (newStatus === 'Concluído' && cert.status !== 'Concluído') {
            toast.success('Parabéns! Curso concluído! 🎓')
        }
    } catch (error) {
        console.error(error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-24 transition-colors duration-300">
      
      {/* CABEÇALHO COM RESUMO */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 p-6 sticky top-0 z-10 shadow-sm">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Award className="text-[#0047AB] dark:text-blue-400" /> Meus Cursos
            </h1>
        </div>

        {/* Big Numbers */}
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-[#0047AB] dark:text-blue-400">{inProgressCount}</span>
                <span className="text-xs font-bold text-blue-400 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Em Andamento
                </span>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-2xl border border-green-100 dark:border-green-800 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-green-600 dark:text-green-400">{completedCount}</span>
                <span className="text-xs font-bold text-green-500 dark:text-green-300 uppercase tracking-wider flex items-center gap-1">
                    <Trophy className="w-3 h-3" /> Concluídos
                </span>
            </div>
        </div>
      </div>

      <main className="p-4 max-w-lg mx-auto space-y-4">
        {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#0047AB] h-8 w-8" /></div>
        ) : certs.length === 0 ? (
            <div className="text-center py-20 opacity-50 flex flex-col items-center">
                <div className="bg-gray-100 dark:bg-slate-800 p-4 rounded-full mb-4">
                    <BookOpen className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Nenhum curso ainda</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">Adicione cursos extras, workshops ou certificações para acompanhar seu progresso.</p>
            </div>
        ) : (
            certs.map(cert => {
                const progress = Math.round((cert.completed_modules / (cert.total_modules || 1)) * 100)
                const isDone = progress >= 100

                return (
                    <div key={cert.id} className={`bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border transition-all duration-300 group ${isDone ? 'border-green-100 dark:border-green-900 bg-green-50/10' : 'border-gray-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800'}`}>
                        
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-start gap-3">
                                <div className={`p-2.5 rounded-xl ${isDone ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-50 text-[#0047AB] dark:bg-blue-900/20 dark:text-blue-400'}`}>
                                    {isDone ? <CheckCircle className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                                </div>
                                <div>
                                    <h3 className={`font-bold text-base leading-tight ${isDone ? 'text-green-800 dark:text-green-300' : 'text-gray-900 dark:text-white'}`}>{cert.name}</h3>
                                    <p className="text-xs text-gray-500 dark:text-slate-400 font-medium uppercase mt-1 flex items-center gap-1">
                                        <GraduationCap className="w-3 h-3" /> {cert.provider || 'Autodidata'}
                                    </p>
                                </div>
                            </div>
                            
                            <button onClick={() => deleteCert(cert.id)} className="text-gray-300 hover:text-red-400 dark:text-slate-600 dark:hover:text-red-400 p-1 transition opacity-0 group-hover:opacity-100">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Barra de Progresso */}
                        <div className="mb-4">
                            <div className="flex justify-between text-xs font-bold mb-1.5">
                                <span className="text-gray-400 dark:text-slate-500">{cert.completed_modules} de {cert.total_modules} aulas</span>
                                <span className={isDone ? 'text-green-600 dark:text-green-400' : 'text-[#0047AB] dark:text-blue-400'}>{progress}%</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                                <div 
                                    className={`h-full rounded-full transition-all duration-500 ${isDone ? 'bg-green-500' : 'bg-[#0047AB] dark:bg-blue-500'}`} 
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Controles */}
                        {!isDone && (
                            <div className="flex justify-end gap-2 pt-2 border-t border-gray-50 dark:border-slate-800">
                                <button 
                                    onClick={() => updateProgress(cert, -1)}
                                    className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 text-xs font-bold hover:bg-gray-50 dark:hover:bg-slate-800 active:scale-95 transition"
                                >
                                    -1 Aula
                                </button>
                                <button 
                                    onClick={() => updateProgress(cert, 1)}
                                    className="px-4 py-1.5 rounded-lg bg-[#0047AB] dark:bg-blue-600 text-white text-xs font-bold hover:bg-blue-800 dark:hover:bg-blue-500 active:scale-95 transition shadow-sm flex items-center gap-1"
                                >
                                    <Plus className="w-3 h-3" /> Registrar Aula
                                </button>
                            </div>
                        )}
                        
                        {isDone && (
                            <div className="pt-2 border-t border-green-100 dark:border-green-900/30 text-center">
                                <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wide">Curso Finalizado</p>
                            </div>
                        )}

                    </div>
                )
            })
        )}
      </main>

      {/* FAB - Botão Flutuante */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-28 right-6 bg-[#0047AB] dark:bg-blue-600 text-white p-4 rounded-full shadow-xl shadow-blue-900/20 hover:bg-blue-800 dark:hover:bg-blue-500 transition transform hover:scale-110 active:scale-95 z-40"
      >
        <Plus className="h-7 w-7" />
      </button>

      {/* MODAL DE ADICIONAR CURSO */}
      <AddCourseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => {
            fetchCertifications()
            toast.success('Curso adicionado!')
        }} 
      />
    </div>
  )
}

// --- SUB-COMPONENTE: MODAL DE ADICIONAR ---
function AddCourseModal({ isOpen, onClose, onSuccess }) {
    const { user } = useAuth()
    const [name, setName] = useState('')
    const [provider, setProvider] = useState('')
    const [totalModules, setTotalModules] = useState(10)
    const [loading, setLoading] = useState(false)

    if (!isOpen) return null

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)
        try {
            const { error } = await supabase.from('certifications').insert([{
                user_id: user.id,
                name, provider, total_modules: parseInt(totalModules), completed_modules: 0, status: 'Em andamento'
            }])
            if (error) throw error
            setName(''); setProvider(''); setTotalModules(10)
            onSuccess(); onClose()
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-slate-800">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-xl text-gray-800 dark:text-white">Novo Curso</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Nome do Curso</label>
                        <input className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#0047AB] dark:focus:ring-blue-500 dark:text-white" value={name} onChange={e => setName(e.target.value)} required placeholder="Ex: React Masterclass" autoFocus />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Plataforma</label>
                            <input className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#0047AB] dark:focus:ring-blue-500 dark:text-white" value={provider} onChange={e => setProvider(e.target.value)} placeholder="Ex: Udemy" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Total Aulas</label>
                            <input type="number" min="1" className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#0047AB] dark:focus:ring-blue-500 dark:text-white text-center font-bold" value={totalModules} onChange={e => setTotalModules(e.target.value)} required />
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-[#0047AB] dark:bg-blue-600 text-white font-bold py-3.5 rounded-xl transition flex justify-center mt-2 hover:bg-blue-800 dark:hover:bg-blue-500">
                        {loading ? <Loader2 className="animate-spin" /> : 'Começar Agora'}
                    </button>
                </form>
            </div>
        </div>
    )
}