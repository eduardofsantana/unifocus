import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { Plus, Minus, Settings, Save, Trash2, X, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

export function SubjectCard({ subject, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [editName, setEditName] = useState(subject?.name || '')
  const [editMaxAbsences, setEditMaxAbsences] = useState(subject?.max_absences || 15)
  const [editPeriod, setEditPeriod] = useState(subject?.period || '')

  if (!subject) return null;

  const grades = subject.grades || []
  
  const totalWeight = grades.reduce((acc, g) => acc + (g.weight || 0), 0)
  const totalValue = grades.reduce((acc, g) => acc + ((g.value || 0) * (g.weight || 0)), 0)
  const currentAverage = grades.length > 0 ? (totalWeight > 0 ? totalValue / totalWeight : 0) : 0
  
  const isPassed = currentAverage >= (subject.passing_grade || 7)
  const absenceRatio = (subject.current_absences || 0) / (subject.max_absences || 1)

  async function handleAbsence(e, amount) {
    e.preventDefault()
    const newAmount = Math.max(0, (subject.current_absences || 0) + amount)
    await supabase.from('subjects').update({ current_absences: newAmount }).eq('id', subject.id)
    if(onUpdate) onUpdate()
  }

  async function handleSaveEdit() {
    setLoading(true)
    try {
        await supabase.from('subjects').update({
            name: editName,
            max_absences: parseInt(editMaxAbsences),
            period: editPeriod
        }).eq('id', subject.id)
        setIsEditing(false)
        if(onUpdate) onUpdate()
        toast.success('Alterações salvas')
    } catch (error) {
        toast.error('Erro ao salvar')
    } finally {
        setLoading(false)
    }
  }

  async function handleDelete() {
    if (confirm('Tem certeza?')) {
      await supabase.from('subjects').delete().eq('id', subject.id)
      if(onUpdate) onUpdate()
    }
  }

  if (isEditing) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 shadow-sm mb-3">
        <div className="flex justify-between items-center mb-4">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Editar</h4>
            <button onClick={() => setIsEditing(false)} className="text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300"><X className="w-4 h-4"/></button>
        </div>
        <div className="space-y-3">
            <input className="w-full p-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#0047AB] dark:focus:ring-blue-500 text-gray-900 dark:text-white" value={editName} onChange={e => setEditName(e.target.value)} />
            <div className="flex gap-2">
                <input className="flex-1 p-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#0047AB] dark:focus:ring-blue-500 text-gray-900 dark:text-white" value={editPeriod} onChange={e => setEditPeriod(e.target.value)} />
                <input type="number" className="w-20 p-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#0047AB] dark:focus:ring-blue-500 text-gray-900 dark:text-white" value={editMaxAbsences} onChange={e => setEditMaxAbsences(e.target.value)} />
            </div>
        </div>
        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
            <button onClick={handleDelete} className="px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors">Excluir</button>
            <div className="flex-1"></div>
            <button onClick={() => setIsEditing(false)} className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white">Cancelar</button>
            <button onClick={handleSaveEdit} className="px-4 py-2 text-xs font-medium bg-[#0047AB] dark:bg-blue-600 text-white rounded-md transition-colors flex items-center gap-2">
                {loading ? <Loader2 className="w-3 h-3 animate-spin"/> : 'Salvar'}
            </button>
        </div>
      </div>
    )
  }

  return (
    <Link to={`/materia/${subject.id}`} className="group relative block bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl p-4 transition-all duration-200 mb-3">
      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-col">
            <span className="text-[10px] font-medium text-gray-500 dark:text-slate-500 uppercase tracking-wide mb-0.5">{subject.period || 'Geral'}</span>
            <h3 className="font-semibold text-gray-900 dark:text-white text-base leading-tight group-hover:text-[#0047AB] dark:group-hover:text-blue-400 transition-colors">{subject.name}</h3>
        </div>
        <button 
            onClick={(e) => {e.preventDefault(); setIsEditing(true)}} 
            className="text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
        >
            <Settings className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6 py-2">
          <div>
              <p className="text-[10px] font-medium text-gray-500 dark:text-slate-500 uppercase tracking-wider mb-1">Média</p>
              <div className="flex items-baseline gap-1">
                  <span className={`text-xl font-bold ${isPassed ? 'text-[#0047AB] dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>{currentAverage.toFixed(1)}</span>
                  <span className="text-xs text-gray-400 dark:text-slate-600 font-medium">/ 10</span>
              </div>
          </div>

          <div>
              <p className="text-[10px] font-medium text-gray-500 dark:text-slate-500 uppercase tracking-wider mb-1">Presença</p>
              <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${absenceRatio >= 0.8 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                      {subject.current_absences}<span className="text-gray-400 dark:text-slate-600 text-xs">/{subject.max_absences}</span>
                  </span>
                  
                  <div className="flex items-center gap-1" onClick={(e) => e.preventDefault()}>
                      <button onClick={(e) => handleAbsence(e, -1)} className="w-6 h-6 flex items-center justify-center rounded-md border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 transition-colors">
                          <Minus className="w-3 h-3" />
                      </button>
                      <button onClick={(e) => handleAbsence(e, 1)} className="w-6 h-6 flex items-center justify-center rounded-md border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 transition-colors">
                          <Plus className="w-3 h-3" />
                      </button>
                  </div>
              </div>
              
              <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-1 mt-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${absenceRatio >= 0.8 ? 'bg-red-500' : absenceRatio >= 0.5 ? 'bg-yellow-500' : 'bg-[#0047AB] dark:bg-blue-500'}`} 
                    style={{ width: `${Math.min(100, absenceRatio * 100)}%` }}
                  />
              </div>
          </div>
      </div>
    </Link>
  )
}