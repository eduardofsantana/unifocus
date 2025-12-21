import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient.js'
import { X, Loader2, Clock, MapPin, Calendar, BookOpen } from 'lucide-react'
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

  useEffect(() => {
    if (user && isOpen) fetchSubjects()
  }, [user, isOpen])

  async function fetchSubjects() {
    try {
        const { data, error } = await supabase.from('subjects').select('id, name').eq('user_id', user.id)
        if (error) throw error
        
        setSubjects(data || [])
        // Se houver matérias e nenhum ID selecionado, seleciona a primeira automaticamente
        if (data && data.length > 0 && !subjectId) {
            setSubjectId(data[0].id)
        }
    } catch (error) {
        console.error(error)
        toast.error('Erro ao buscar matérias para a lista')
    }
  }

  if (!isOpen) return null

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    if (!subjectId) {
        toast.error('Você precisa ter matérias cadastradas primeiro!')
        setLoading(false)
        return
    }

    try {
      const { error } = await supabase.from('schedules').insert([{
        user_id: user.id,
        subject_id: subjectId,
        day_of_week: parseInt(day),
        start_time: start,
        end_time: end,
        location
      }])

      if (error) throw error
      
      toast.success('Aula adicionada à grade!')
      setLocation('')
      onSuccess()
      onClose()
    } catch (error) {
      toast.error('Erro ao salvar: ' + error.message)
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

        {subjects.length === 0 ? (
            <div className="text-center py-6">
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">Você precisa cadastrar matérias no Início antes de criar um horário.</p>
                <button onClick={onClose} className="text-[#0047AB] font-bold text-sm hover:underline">Voltar e cadastrar</button>
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
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
        )}
      </div>
    </div>
  )
}