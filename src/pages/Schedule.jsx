import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { supabase } from '../supabaseClient.js'
import { Calendar, MapPin, Clock, Plus, Loader2, Trash2, User } from 'lucide-react'
import { AddClassModal } from '../components/AddClassModal.jsx'
import { toast } from 'sonner'

export function Schedule() {
  const { user } = useAuth()
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const todayIndex = new Date().getDay()
  const [selectedDay, setSelectedDay] = useState(todayIndex === 0 ? 1 : todayIndex)

  const DAYS = [
    { id: 1, label: 'Seg', full: 'Segunda-feira' },
    { id: 2, label: 'Ter', full: 'Terça-feira' },
    { id: 3, label: 'Qua', full: 'Quarta-feira' },
    { id: 4, label: 'Qui', full: 'Quinta-feira' },
    { id: 5, label: 'Sex', full: 'Sexta-feira' },
    { id: 6, label: 'Sáb', full: 'Sábado' },
  ]

  useEffect(() => {
    if (user) fetchSchedule()
  }, [user])

  async function fetchSchedule() {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select('*, subjects(name, professor)')
        .eq('user_id', user.id)
        .order('start_time', { ascending: true })

      if (error) throw error
      setClasses(data || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function deleteClass(id) {
    if (confirm('Remover esta aula da grade?')) {
        try {
            const { error } = await supabase.from('schedules').delete().eq('id', id)
            if (error) throw error
            
            setClasses(classes.filter(c => c.id !== id))
            toast.success('Aula removida.')
        } catch (error) {
            toast.error('Erro ao remover: ' + error.message)
        }
    }
  }

  const dayClasses = classes.filter(c => c.day_of_week === selectedDay)

  const isHappeningNow = (cls) => {
    const now = new Date()
    const currentDay = now.getDay()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    
    const [startH, startM] = cls.start_time.split(':').map(Number)
    const [endH, endM] = cls.end_time.split(':').map(Number)
    const startMinutes = startH * 60 + startM
    const endMinutes = endH * 60 + endM
    
    return currentDay === cls.day_of_week && currentMinutes >= startMinutes && currentMinutes < endMinutes
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-24 transition-colors duration-300">
      
      <div className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 sticky top-0 z-10">
        <div className="p-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar className="text-[#0047AB] dark:text-blue-400" /> Horário
            </h1>
            <button 
                onClick={() => setIsModalOpen(true)} 
                className="bg-blue-50 dark:bg-blue-900/30 text-[#0047AB] dark:text-blue-400 p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 transition shadow-sm"
            >
                <Plus className="w-6 h-6" />
            </button>
        </div>

        <div className="flex justify-between px-2 pb-3 overflow-x-auto gap-1">
            {DAYS.map(day => (
                <button
                    key={day.id}
                    onClick={() => setSelectedDay(day.id)}
                    className={`flex-1 min-w-[50px] py-2 rounded-xl text-xs font-bold transition-all ${
                        selectedDay === day.id 
                        ? 'bg-[#0047AB] text-white shadow-md transform scale-105' 
                        : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400 border border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
                    }`}
                >
                    {day.label}
                </button>
            ))}
        </div>
      </div>

      <main className="p-4 max-w-lg mx-auto space-y-4">
        <h2 className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Clock className="w-3 h-3" /> {DAYS.find(d => d.id === selectedDay)?.full}
        </h2>

        {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#0047AB] dark:text-blue-400 h-8 w-8" /></div>
        ) : dayClasses.length === 0 ? (
            <div className="text-center py-20 opacity-50 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-2xl flex flex-col items-center">
                <Calendar className="w-12 h-12 text-gray-300 dark:text-slate-600 mb-2" />
                <p className="text-gray-400 dark:text-slate-500 text-sm">Sem aulas neste dia.</p>
            </div>
        ) : (
            dayClasses.map(cls => {
                const active = isHappeningNow(cls)
                return (
                    <div key={cls.id} className={`relative bg-white dark:bg-slate-900 p-5 rounded-2xl border transition-all duration-300 group ${active ? 'border-[#0047AB] dark:border-blue-500 shadow-lg ring-1 ring-blue-100 dark:ring-blue-900' : 'border-gray-100 dark:border-slate-800 shadow-sm'}`}>
                        
                        {active && (
                            <span className="absolute top-3 right-3 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#0047AB] dark:bg-blue-500"></span>
                            </span>
                        )}

                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">
                                    {cls.subjects?.name || 'Matéria'}
                                </h3>
                                {/* AQUI É A MUDANÇA: SÓ MOSTRA SE TIVER PROFESSOR */}
                                {cls.subjects?.professor && (
                                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 uppercase font-medium flex items-center gap-1">
                                        <User className="w-3 h-3" /> {cls.subjects.professor}
                                    </p>
                                )}
                            </div>
                            <div className="text-right">
                                <p className={`text-sm font-black ${active ? 'text-[#0047AB] dark:text-blue-400' : 'text-gray-700 dark:text-slate-300'}`}>
                                    {cls.start_time.slice(0,5)}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-slate-500">{cls.end_time.slice(0,5)}</p>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-slate-700">
                                <MapPin className="w-3.5 h-3.5 text-orange-500" />
                                <span className="text-xs font-bold text-gray-600 dark:text-slate-300">{cls.location || 'Sem local'}</span>
                            </div>
                            
                            <button onClick={() => deleteClass(cls.id)} className="text-gray-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )
            })
        )}
      </main>

      <AddClassModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchSchedule} 
      />
    </div>
  )
}