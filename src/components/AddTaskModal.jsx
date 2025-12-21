import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient.js'
import { X, Loader2, Calendar, Clock, BookOpen } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.jsx'

export function AddTaskModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('23:59')
  const [type, setType] = useState('Estudo')
  const [subjectId, setSubjectId] = useState('')
  
  const [subjects, setSubjects] = useState([])

  useEffect(() => {
    if (user && isOpen) fetchSubjects()
  }, [user, isOpen])

  async function fetchSubjects() {
    const { data } = await supabase.from('subjects').select('id, name').eq('user_id', user.id)
    setSubjects(data || [])
  }

  if (!isOpen) return null

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    try {
      const finalDateTime = new Date(`${date}T${time}:00`).toISOString()

      const { error } = await supabase.from('tasks').insert([{
        user_id: user.id,
        subject_id: subjectId || null,
        title,
        type,
        due_date: finalDateTime,
        status: 'Pendente'
      }])

      if (error) throw error
      
      setTitle(''); setDate('')
      onSuccess(); onClose()
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-gray-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl text-gray-800 dark:text-white">Nova Tarefa</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">O que precisa fazer?</label>
                <input 
                    autoFocus
                    placeholder="Ex: Estudar Cap. 4"
                    className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#0047AB] dark:focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
                    value={title} onChange={e => setTitle(e.target.value)} required
                />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Data</label>
                    <div className="relative">
                        <input type="date" className="w-full p-3 pl-10 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none text-sm text-gray-900 dark:text-white" value={date} onChange={e => setDate(e.target.value)} required />
                        <Calendar className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3 top-3.5" />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Hora</label>
                    <div className="relative">
                        <input type="time" className="w-full p-3 pl-10 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none text-sm text-gray-900 dark:text-white" value={time} onChange={e => setTime(e.target.value)} required />
                        <Clock className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3 top-3.5" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Tipo</label>
                    <select className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none text-sm text-gray-900 dark:text-white" value={type} onChange={e => setType(e.target.value)}>
                        <option value="Prova">🚨 Prova</option>
                        <option value="Trabalho">📝 Trabalho</option>
                        <option value="Estudo">📚 Estudo</option>
                        <option value="Outro">📌 Outro</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Matéria</label>
                    <div className="relative">
                        <select className="w-full p-3 pl-9 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none text-sm text-gray-900 dark:text-white" value={subjectId} onChange={e => setSubjectId(e.target.value)}>
                            <option value="">Geral</option>
                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <BookOpen className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3 top-3.5" />
                    </div>
                </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-[#0047AB] dark:bg-blue-600 hover:bg-blue-800 dark:hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition flex justify-center mt-2">
                {loading ? <Loader2 className="animate-spin" /> : 'Agendar'}
            </button>
        </form>
      </div>
    </div>
  )
}