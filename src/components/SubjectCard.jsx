import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { MoreHorizontal, Plus, Minus, AlertTriangle, Settings, Save, Trash2, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function SubjectCard({ subject, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false)
  
  // Estados de Edição
  const [editName, setEditName] = useState(subject.name)
  const [editMaxAbsences, setEditMaxAbsences] = useState(subject.max_absences)

  // CÁLCULO DA MÉDIA (Baseado nas notas do banco)
  // O Supabase já traz as grades dentro de subject.grades graças ao select no Dashboard
  const grades = subject.grades || []
  const totalWeight = grades.reduce((acc, g) => acc + (g.weight || 0), 0)
  const totalValue = grades.reduce((acc, g) => acc + ((g.value || 0) * (g.weight || 0)), 0)
  // Se não tiver notas, média é 0. Se tiver, calcula ponderada ou aritmética simples
  const currentAverage = grades.length > 0 ? (totalWeight > 0 ? totalValue / totalWeight : 0) : 0
  
  const isPassed = currentAverage >= (subject.passing_grade || 7)
  
  // Status de Presença
  const absencePercentage = (subject.current_absences / subject.max_absences) * 100
  let attendanceColor = 'text-green-600'
  if (absencePercentage >= 50) attendanceColor = 'text-yellow-600'
  if (absencePercentage >= 80) attendanceColor = 'text-red-600'

  async function handleAbsence(e, amount) {
    e.preventDefault() // Evita abrir o link
    const newAmount = Math.max(0, subject.current_absences + amount)
    await supabase.from('subjects').update({ current_absences: newAmount }).eq('id', subject.id)
    onUpdate()
  }

  async function handleSaveEdit() {
    await supabase.from('subjects').update({
        name: editName,
        max_absences: parseInt(editMaxAbsences),
    }).eq('id', subject.id)
    setIsEditing(false)
    onUpdate()
  }

  async function handleDelete() {
    if (confirm('Excluir matéria?')) {
      await supabase.from('subjects').delete().eq('id', subject.id)
      onUpdate()
    }
  }

  if (isEditing) {
    return (
      <div className="bg-white p-4 rounded-xl border-2 border-blue-100 shadow-sm mb-3">
        <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Editar</h4>
        <div className="space-y-2">
            <input className="w-full p-2 bg-gray-50 border rounded text-sm" value={editName} onChange={e => setEditName(e.target.value)} />
            <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Max Faltas:</span>
                <input type="number" className="w-20 p-2 bg-gray-50 border rounded text-sm" value={editMaxAbsences} onChange={e => setEditMaxAbsences(e.target.value)} />
            </div>
        </div>
        <div className="flex gap-2 mt-3">
            <button onClick={() => setIsEditing(false)} className="flex-1 py-1.5 text-xs text-gray-500">Cancelar</button>
            <button onClick={handleDelete} className="px-3 py-1.5 text-xs text-red-500 bg-red-50 rounded"><Trash2 className="w-3 h-3"/></button>
            <button onClick={handleSaveEdit} className="flex-1 py-1.5 text-xs bg-[#0047AB] text-white rounded font-bold">Salvar</button>
        </div>
      </div>
    )
  }

  return (
    <Link to={`/materia/${subject.id}`} className="block bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-blue-300 transition group relative mb-3">
      
      {/* Cabeçalho do Card */}
      <div className="flex justify-between items-start mb-3">
        <div>
            <h3 className="font-bold text-gray-800">{subject.name}</h3>
            {/* Exibe a Média Aqui */}
            <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${isPassed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    Média: {currentAverage.toFixed(1)}
                </span>
                <span className="text-[10px] text-gray-400">{grades.length} notas lançadas</span>
            </div>
        </div>
        <button onClick={(e) => {e.preventDefault(); setIsEditing(true)}} className="text-gray-300 hover:text-[#0047AB] p-1">
            <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Rodapé: Faltas e Controles */}
      <div className="flex justify-between items-center border-t border-gray-50 pt-3">
        <div className="flex items-center gap-2">
            <div className={`text-xs font-bold ${attendanceColor} flex items-center gap-1`}>
               {subject.current_absences}/{subject.max_absences} Faltas
               {absencePercentage >= 80 && <AlertTriangle className="w-3 h-3" />}
            </div>
        </div>

        <div className="flex items-center gap-1" onClick={(e) => e.preventDefault()}>
            <button onClick={(e) => handleAbsence(e, -1)} className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-100">-</button>
            <button onClick={(e) => handleAbsence(e, 1)} className="w-6 h-6 flex items-center justify-center rounded bg-blue-50 text-[#0047AB] hover:bg-blue-100 font-bold">+</button>
        </div>
      </div>
    </Link>
  )
}