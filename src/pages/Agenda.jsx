import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { supabase } from '../supabaseClient.js'
import { Calendar as CalendarIcon, Plus, CheckCircle, Clock, AlertTriangle, FileText, Book, Pin } from 'lucide-react'
import { AddTaskModal } from '../components/AddTaskModal.jsx'

export function Agenda() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filter, setFilter] = useState('Pendente') // 'Pendente' ou 'Concluída'

  useEffect(() => {
    if (user) fetchTasks()
  }, [user, filter])

  async function fetchTasks() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, subjects(name)')
        .eq('user_id', user.id)
        .eq('status', filter)
        .order('due_date', { ascending: true })

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function toggleStatus(task) {
    const newStatus = task.status === 'Pendente' ? 'Concluída' : 'Pendente'
    
    // Atualização Otimista
    setTasks(tasks.filter(t => t.id !== task.id))

    await supabase.from('tasks').update({ status: newStatus }).eq('id', task.id)
  }

  // --- LÓGICA DO RELÓGIO DE PRESSÃO ---
  function getUrgencyInfo(dateString) {
    const now = new Date()
    const due = new Date(dateString)
    const diffMs = due - now
    const diffHours = diffMs / (1000 * 60 * 60)
    const diffDays = Math.ceil(diffHours / 24)

    if (diffMs < 0) return { text: 'Atrasado', color: 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900', icon: AlertTriangle }
    if (diffHours < 24) return { text: 'É Hoje!', color: 'text-rose-600 bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-900', icon: AlertTriangle }
    if (diffDays <= 3) return { text: `Faltam ${diffDays} dias`, color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-900', icon: Clock }
    
    // Padrão (Sem urgência)
    return { 
        text: new Date(dateString).toLocaleDateString('pt-BR'), 
        color: 'text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-800 border-gray-100 dark:border-slate-700', 
        icon: CalendarIcon 
    }
  }

  function getTypeIcon(type) {
    switch (type) {
        case 'Prova': return <AlertTriangle className="w-4 h-4 text-red-500" />
        case 'Trabalho': return <FileText className="w-4 h-4 text-orange-500" />
        case 'Estudo': return <Book className="w-4 h-4 text-blue-500" />
        default: return <Pin className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-24 p-4 transition-colors duration-300">
      
      <div className="flex justify-between items-center mt-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="text-[#0047AB] dark:text-blue-400" /> Agenda
        </h1>
        <div className="flex bg-white dark:bg-slate-900 p-1 rounded-lg border border-gray-200 dark:border-slate-800">
            <button 
                onClick={() => setFilter('Pendente')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition ${filter === 'Pendente' ? 'bg-[#0047AB] dark:bg-blue-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
            >
                A Fazer
            </button>
            <button 
                onClick={() => setFilter('Concluída')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition ${filter === 'Concluída' ? 'bg-green-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
            >
                Feitas
            </button>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
             <div className="text-center py-10 text-gray-400 dark:text-gray-600">Carregando...</div>
        ) : tasks.length === 0 ? (
            <div className="text-center py-20 opacity-50">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-slate-700" />
                <p className="font-medium text-gray-600 dark:text-slate-400">
                    {filter === 'Pendente' ? 'Tudo limpo por aqui!' : 'Nenhuma tarefa concluída.'}
                </p>
                {filter === 'Pendente' && <p className="text-sm text-gray-500 dark:text-slate-500">Aproveite para descansar.</p>}
            </div>
        ) : (
            tasks.map(task => {
                const urgency = getUrgencyInfo(task.due_date)
                const UrgencyIcon = urgency.icon

                return (
                    <div key={task.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 flex gap-4 items-start group transition-colors">
                        
                        {/* Checkbox Customizado */}
                        <button 
                            onClick={() => toggleStatus(task)}
                            className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${filter === 'Concluída' ? 'bg-green-500 border-green-500' : 'border-gray-300 dark:border-slate-600 hover:border-[#0047AB] dark:hover:border-blue-400'}`}
                        >
                            {filter === 'Concluída' && <CheckCircle className="w-4 h-4 text-white" />}
                        </button>

                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h3 className={`font-bold text-gray-800 dark:text-gray-100 ${filter === 'Concluída' ? 'line-through text-gray-400 dark:text-slate-600' : ''}`}>
                                    {task.title}
                                </h3>
                                
                                {/* Etiqueta de Urgência (Só mostra se pendente) */}
                                {filter === 'Pendente' && (
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 border ${urgency.color}`}>
                                        <UrgencyIcon className="w-3 h-3" />
                                        {urgency.text}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-3 mt-2">
                                <span className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-800 px-2 py-1 rounded border border-gray-100 dark:border-slate-700">
                                    {getTypeIcon(task.type)} {task.type}
                                </span>
                                
                                {task.subjects && (
                                    <span className="text-xs text-gray-400 dark:text-slate-500 flex items-center gap-1">
                                        em <span className="font-bold text-gray-600 dark:text-slate-300">{task.subjects.name}</span>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                )
            })
        )}
      </div>

      <button 
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-28 right-6 bg-[#0047AB] dark:bg-blue-600 text-white p-4 rounded-full shadow-xl shadow-blue-900/20 hover:bg-blue-800 dark:hover:bg-blue-500 transition transform hover:scale-110 active:scale-95 z-40"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Modal de Adicionar Tarefa */}
      <AddTaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchTasks} 
      />
    </div>
  )
}