import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient.js'
import { X, Loader2, Calendar, Clock, MapPin, BookOpen, User } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { toast } from 'sonner'

export function AddClassModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [subjects, setSubjects] = useState([])
  
  // Form
  const [subjectId, setSubjectId] = useState('')
  const [day, setDay] = useState('1')
  const [start, setStart] = useState('08:00')
  const [end, setEnd] = useState('10:00')
  const [location, setLocation] = useState('')
  const [professor, setProfessor] = useState('') // Novo campo

  useEffect(() => {
    if (user && isOpen) fetchSubjects()
  }, [user, isOpen])

  async function fetchSubjects() {
    try {
        const { data } = await supabase.from('subjects').select('id, name, professor').eq('user_id', user.id)
        setSubjects(data || [])
        if (data && data.length > 0) {
            setSubjectId(data[0].id)
        }
    } catch (error) {
        console.error(error)
    }
  }

  // Atualiza o campo professor se a matéria selecionada mudar
  useEffect(() => {
    const selected = subjects.find(s => s.id === subjectId)
    if (selected && selected.professor) {
        setProfessor(selected.professor)
    } else {
        setProfessor('')
    }
  }, [subjectId, subjects])

  if (!isOpen) return null

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. Cria o horário
      const { error } = await supabase.from('schedules').insert([{
        user_id: user.id,
        subject_id: subjectId,
        day_of_week: parseInt(day),
        start_time: start,
        end_time: end,
        location
      }])

      if (error) throw error
      
      // 2. Se preencheu o professor, atualiza a matéria para salvar essa info
      if (professor.trim()) {
        await supabase.from('subjects').update({ professor: professor }).eq('id', subjectId)
      }
      
      toast.success('Aula adicionada à grade!')
      setLocation('')
      setProfessor('')
      onSuccess()
      onClose()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-gray-100 dark:border-slate-800">
        <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl text-gray-800 dark:text-white">Adicionar Aula</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Seletor de Matéria */}
            <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Matéria</label>
                <div className="relative">
                    <select 
                        className="w-full p-3 pl-10 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#0047AB] dark:focus:ring-blue-500 dark:text-white appearance-none"
                        value={subjectId} onChange={e => setSubjectId(e.target.value)} required
                    >
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <BookOpen className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3 top-3.5" />
                </div>
            </div>

            {/* Professor (Opcional) */}
            <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Professor (Opcional)</label>
                <div className="relative">
                    <input 
                        placeholder="Nome do professor"
                        className="w-full p-3 pl-10 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#0047AB] dark:focus:ring-blue-500 dark:text-white"
                        value={professor} onChange={e => setProfessor(e.target.value)}
                    />
                    <User className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3 top-3.5" />
                </div>
            </div>

            {/* Dia da Semana */}
            <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Dia da Semana</label>
                <div className="relative">
                    <select 
                        className="w-full p-3 pl-10 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#0047AB] dark:focus:ring-blue-500 dark:text-white appearance-none"
                        value={day} onChange={e => setDay(e.target.value)}
                    >
                        <option value="1">Segunda-feira</option>
                        <option value="2">Terça-feira</option>
                        <option value="3">Quarta-feira</option>
                        <option value="4">Quinta-feira</option>
                        <option value="5">Sexta-feira</option>
                        <option value="6">Sábado</option>
                    </select>
                    <Calendar className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3 top-3.5" />
                </div>
            </div>

            {/* Horários */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Início</label>
                    <input type="time" className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none text-sm text-center font-bold dark:text-white" value={start} onChange={e => setStart(e.target.value)} required />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Fim</label>
                    <input type="time" className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none text-sm text-center font-bold dark:text-white" value={end} onChange={e => setEnd(e.target.value)} required />
                </div>
            </div>

            {/* Local */}
            <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Local / Sala</label>
                <div className="relative">
                    <input 
                        placeholder="Ex: Bloco B - Sala 102"
                        className="w-full p-3 pl-10 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#0047AB] dark:focus:ring-blue-500 dark:text-white"
                        value={location} onChange={e => setLocation(e.target.value)}
                    />
                    <MapPin className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3 top-3.5" />
                </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-[#0047AB] dark:bg-blue-600 text-white font-bold py-3.5 rounded-xl transition flex justify-center mt-2 hover:bg-blue-800 dark:hover:bg-blue-500">
                {loading ? <Loader2 className="animate-spin" /> : 'Salvar na Grade'}
            </button>
        </form>
      </div>
    </div>
  )
}