import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { ArrowLeft, Plus, Trash2, Calculator, AlertTriangle, CheckCircle } from 'lucide-react'

export function SubjectDetails() {
  const { id } = useParams() // Pega o ID da URL
  const [subject, setSubject] = useState(null)
  const [grades, setGrades] = useState([])
  const [loading, setLoading] = useState(true)

  // Estados para nova nota
  const [newGradeName, setNewGradeName] = useState('')
  const [newGradeWeight, setNewGradeWeight] = useState(1)
  const [newGradeValue, setNewGradeValue] = useState('')

  useEffect(() => {
    fetchData()
  }, [id])

  async function fetchData() {
    try {
      // 1. Busca a Matéria
      const { data: sub } = await supabase.from('subjects').select('*').eq('id', id).single()
      setSubject(sub)

      // 2. Busca as Notas
      const { data: grd } = await supabase.from('grades').select('*').eq('subject_id', id)
      setGrades(grd || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // --- LÓGICA DE FALTAS ---
  async function updateAbsences(change) {
    const newValue = Math.max(0, subject.current_absences + change)
    // Atualiza na tela na hora (otimista)
    setSubject({ ...subject, current_absences: newValue })
    
    // Salva no banco
    await supabase.from('subjects').update({ current_absences: newValue }).eq('id', id)
  }

  // --- LÓGICA DE NOTAS ---
  async function addGrade(e) {
    e.preventDefault()
    if (!newGradeName || !newGradeValue) return

    const newGrade = {
      subject_id: id,
      name: newGradeName,
      weight: parseFloat(newGradeWeight),
      value: parseFloat(newGradeValue),
    }

    const { data, error } = await supabase.from('grades').insert([newGrade]).select()
    
    if (!error && data) {
      setGrades([...grades, data[0]])
      setNewGradeName('')
      setNewGradeValue('')
    }
  }

  async function deleteGrade(gradeId) {
    await supabase.from('grades').delete().eq('id', gradeId)
    setGrades(grades.filter(g => g.id !== gradeId))
  }

  // --- CÁLCULOS ---
  // Média Ponderada Atual
  const totalWeight = grades.reduce((acc, g) => acc + g.weight, 0)
  const totalPoints = grades.reduce((acc, g) => acc + (g.value * g.weight), 0)
  const currentAverage = totalWeight === 0 ? 0 : (totalPoints / totalWeight).toFixed(1)

  // Calculadora de Sobrevivência (Simples)
  // Assume que falta 1 prova com peso 1 (ou o usuário pode ajustar mentalmente)
  const target = subject?.passing_grade || 7.0
  // Fórmula: (Meta * (PesoTotal + PesoProxima) - PontosAtuais) / PesoProxima
  // Vamos assumir Peso da Próxima = 1.0 para simplificar a visualização rápida
  const nextExamWeight = 1.0 
  const neededScore = ((target * (totalWeight + nextExamWeight)) - totalPoints) / nextExamWeight

  if (loading) return <div className="p-8 text-center">Carregando...</div>

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Cabeçalho */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="flex items-center gap-4 mb-4">
          <Link to="/dashboard" className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{subject.name}</h1>
            <p className="text-sm text-gray-500">{subject.professor || 'Sem professor'}</p>
          </div>
        </div>

        {/* Status Bar */}
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <p className="text-xs text-blue-600 font-bold uppercase">Média Atual</p>
                <p className="text-2xl font-bold text-blue-800">{currentAverage}</p>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                <p className="text-xs text-orange-600 font-bold uppercase">Faltas</p>
                <div className="flex items-center justify-between">
                    <p className="text-xl font-bold text-orange-800">
                        {subject.current_absences}/{subject.max_absences}
                    </p>
                    <div className="flex gap-1">
                        <button onClick={() => updateAbsences(-1)} className="w-6 h-6 bg-white rounded border border-orange-200 flex items-center justify-center font-bold text-orange-600">-</button>
                        <button onClick={() => updateAbsences(1)} className="w-6 h-6 bg-white rounded border border-orange-200 flex items-center justify-center font-bold text-orange-600">+</button>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <main className="p-4 space-y-6">
        
        {/* CALCULADORA DE SOBREVIVÊNCIA */}
        {totalWeight > 0 && currentAverage < target && (
            <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-red-500">
                <div className="flex items-start gap-3">
                    <div className="bg-red-100 p-2 rounded-full">
                        <Calculator className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800">Modo Sobrevivência</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Para fechar com <strong>{target}</strong>, você precisa tirar aproximadamente:
                        </p>
                        <p className="text-3xl font-black text-red-600 mt-2">
                            {neededScore > 10 ? "IMPOSSÍVEL 💀" : neededScore <= 0 ? "APROVADO 🎉" : neededScore.toFixed(1)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">(Calculado considerando próxima prova com Peso 1)</p>
                    </div>
                </div>
            </div>
        )}

        {/* LISTA DE NOTAS */}
        <div>
            <h3 className="font-bold text-gray-800 mb-3">Minhas Notas</h3>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {grades.map(grade => (
                    <div key={grade.id} className="flex justify-between items-center p-4 border-b border-gray-100 last:border-0">
                        <div>
                            <p className="font-medium text-gray-900">{grade.name}</p>
                            <p className="text-xs text-gray-500">Peso {grade.weight}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="font-bold text-lg text-gray-700">{grade.value}</span>
                            <button onClick={() => deleteGrade(grade.id)} className="text-red-300 hover:text-red-500">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}
                
                {/* Formulário de Adicionar Nota */}
                <form onSubmit={addGrade} className="p-4 bg-gray-50 grid grid-cols-12 gap-2">
                    <div className="col-span-5">
                        <input 
                            placeholder="Nome (ex: P2)" 
                            className="w-full p-2 text-sm border rounded"
                            value={newGradeName}
                            onChange={e => setNewGradeName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="col-span-3">
                        <input 
                            type="number" step="0.1" placeholder="Peso" 
                            className="w-full p-2 text-sm border rounded"
                            value={newGradeWeight}
                            onChange={e => setNewGradeWeight(e.target.value)}
                        />
                    </div>
                    <div className="col-span-3">
                        <input 
                            type="number" step="0.1" placeholder="Nota" 
                            className="w-full p-2 text-sm border rounded"
                            value={newGradeValue}
                            onChange={e => setNewGradeValue(e.target.value)}
                            required
                        />
                    </div>
                    <div className="col-span-1">
                        <button type="submit" className="w-full h-full bg-blue-600 text-white rounded flex items-center justify-center">
                            <Plus className="h-4 w-4" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
      </main>
    </div>
  )
}