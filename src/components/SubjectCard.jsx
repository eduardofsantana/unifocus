import { useState } from 'react'
import { supabase } from '../supabaseClient.js'
import { Plus, Minus, Settings, Save, Trash2, X, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

export function SubjectCard({ subject, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [editName, setEditName] = useState(subject.name)
  const [editMaxAbsences, setEditMaxAbsences] = useState(subject.max_absences)
  const [editPeriod, setEditPeriod] = useState(subject.period)

  const grades = subject.grades || []
  const totalWeight = grades.reduce((acc, g) => acc + (g.weight || 0), 0)
  const totalValue = grades.reduce((acc, g) => acc + ((g.value || 0) * (g.weight || 0)), 0)
  const currentAverage = grades.length > 0 ? (totalWeight > 0 ? totalValue / totalWeight : 0) : 0
  
  const isPassed = currentAverage >= (subject.passing_grade || 7)
  const absenceRatio = subject.current_absences / subject.max_absences

  async function handleAbsence(e, amount) {
    e.preventDefault()
    const newAmount = Math.max(0, subject.current_absences + amount)
    await supabase.from('subjects').update({ current_absences: newAmount }).eq('id', subject.id)
    onUpdate()
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
        onUpdate()
        toast.success('Salvo')
    } catch (error) {
        toast.error('Erro ao salvar')
    } finally {
        setLoading(false)
    }
  }

  async function handleDelete() {
    if (confirm('Tem certeza?')) {
      await supabase.from('subjects').delete().eq('id', subject.id)
      onUpdate()
    }
  }

  if (isEditing) {
    return (
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm mb-3">
        <div className="flex justify-between items-center mb-4">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Editar</h4>
            <button onClick={() => setIsEditing(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4"/></button>
        </div>
        <div className="space-y-3">
            <input className="w-full p-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground" value={editName} onChange={e => setEditName(e.target.value)} />
            <div className="flex gap-2">
                <input className="flex-1 p-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground" value={editPeriod} onChange={e => setEditPeriod(e.target.value)} />
                <input type="number" className="w-20 p-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground" value={editMaxAbsences} onChange={e => setEditMaxAbsences(e.target.value)} />
            </div>
        </div>
        <div className="flex gap-2 mt-4 pt-4 border-t border-border">
            <button onClick={handleDelete} className="px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 rounded-md transition-colors">Excluir</button>
            <div className="flex-1"></div>
            <button onClick={() => setIsEditing(false)} className="px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground">Cancelar</button>
            <button onClick={handleSaveEdit} className="px-4 py-2 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors flex items-center gap-2">
                {loading ? <Loader2 className="w-3 h-3 animate-spin"/> : 'Salvar'}
            </button>
        </div>
      </div>
    )
  }

  return (
    <Link to={`/materia/${subject.id}`} className="group relative block bg-card hover:bg-accent/50 border border-border rounded-xl p-4 transition-all duration-200 mb-3">
      
      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-col">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-0.5">{subject.period || 'Geral'}</span>
            <h3 className="font-semibold text-foreground text-base leading-tight group-hover:text-primary transition-colors">{subject.name}</h3>
        </div>
        <button 
            onClick={(e) => {e.preventDefault(); setIsEditing(true)}} 
            className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
        >
            <Settings className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6 py-2">
          {/* Média */}
          <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Média</p>
              <div className="flex items-baseline gap-1">
                  <span className={`text-xl font-bold ${isPassed ? 'text-primary' : 'text-destructive'}`}>{currentAverage.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground font-medium">/ 10</span>
              </div>
          </div>

          {/* Faltas */}
          <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Presença</p>
              <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${absenceRatio >= 0.8 ? 'text-destructive' : 'text-foreground'}`}>
                      {subject.current_absences}<span className="text-muted-foreground text-xs">/{subject.max_absences}</span>
                  </span>
                  
                  <div className="flex items-center gap-1" onClick={(e) => e.preventDefault()}>
                      <button onClick={(e) => handleAbsence(e, -1)} className="w-6 h-6 flex items-center justify-center rounded-md border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                          <Minus className="w-3 h-3" />
                      </button>
                      <button onClick={(e) => handleAbsence(e, 1)} className="w-6 h-6 flex items-center justify-center rounded-md border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                          <Plus className="w-3 h-3" />
                      </button>
                  </div>
              </div>
              
              <div className="w-full bg-muted rounded-full h-1 mt-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${absenceRatio >= 0.8 ? 'bg-destructive' : absenceRatio >= 0.5 ? 'bg-yellow-500' : 'bg-primary'}`} 
                    style={{ width: `${Math.min(100, absenceRatio * 100)}%` }}
                  />
              </div>
          </div>
      </div>
    </Link>
  )
}