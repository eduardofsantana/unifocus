import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { ArrowLeft, Trash2, Plus, Loader2, Calculator, AlertCircle } from 'lucide-react'

export function SubjectDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [subject, setSubject] = useState(null)
  const [grades, setGrades] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Formulário de Nova Nota
  const [newName, setNewName] = useState('')
  const [newWeight, setNewWeight] = useState(1)
  const [newValue, setNewValue] = useState('')
  const [newUnit, setNewUnit] = useState('Unidade 1') // Unidade selecionada
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    fetchSubject()
  }, [id])

  async function fetchSubject() {
    try {
      // Busca a matéria
      const { data: subjectData, error: subjectError } = await supabase
        .from('subjects')
        .select('*')
        .eq('id', id)
        .single()
      
      if (subjectError) throw subjectError
      setSubject(subjectData)

      // Busca as notas
      const { data: gradesData, error: gradesError } = await supabase
        .from('grades')
        .select('*')
        .eq('subject_id', id)
        .order('created_at', { ascending: true })

      if (gradesError) throw gradesError
      setGrades(gradesData || [])

    } catch (error) {
      console.error(error)
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  async function handleAddGrade(e) {
    e.preventDefault()
    if (!newName || !newValue) return
    setAdding(true)

    try {
      const { error } = await supabase.from('grades').insert([{
        subject_id: id,
        name: newName,
        weight: parseFloat(newWeight),
        value: parseFloat(newValue.replace(',', '.')),
        unit: newUnit // Salva qual unidade é
      }])

      if (error) throw error
      
      setNewName('')
      setNewValue('')
      setNewWeight(1)
      fetchSubject() // Recarrega tudo
    } catch (error) {
      alert(error.message)
    } finally {
      setAdding(false)
    }
  }

  async function handleDeleteGrade(gradeId) {
    if (confirm('Apagar esta nota?')) {
      await supabase.from('grades').delete().eq('id', gradeId)
      fetchSubject()
    }
  }

  // --- CÁLCULOS ---
  function calculateAverage(gradesList) {
    if (gradesList.length === 0) return 0
    const totalWeight = gradesList.reduce((acc, g) => acc + (g.weight || 0), 0)
    const totalValue = gradesList.reduce((acc, g) => acc + ((g.value || 0) * (g.weight || 0)), 0)
    return totalWeight > 0 ? totalValue / totalWeight : 0
  }

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-[#0047AB]" /></div>

  // Filtra as notas por unidade
  const gradesU1 = grades.filter(g => g.unit === 'Unidade 1')
  const gradesU2 = grades.filter(g => g.unit === 'Unidade 2')
  
  // Médias
  const avgU1 = calculateAverage(gradesU1)
  const avgU2 = calculateAverage(gradesU2)
  const globalAverage = calculateAverage(grades) // Média Geral

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* CABEÇALHO */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{subject.name}</h1>
            {/* Removido o "Sem Professor" daqui */}
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto p-4 space-y-6">
        
        {/* RESUMO GERAL */}
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-600 text-white p-4 rounded-xl shadow-lg shadow-blue-200">
                <p className="text-blue-100 text-xs font-bold uppercase mb-1">Média Geral</p>
                <div className="text-3xl font-bold flex items-center gap-2">
                    {globalAverage.toFixed(1)}
                    <Calculator className="w-5 h-5 text-blue-300" />
                </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-gray-400 text-xs font-bold uppercase mb-1">Faltas</p>
                <div className="text-3xl font-bold text-gray-800">
                    {subject.current_absences}<span className="text-gray-300 text-lg">/{subject.max_absences}</span>
                </div>
            </div>
        </div>

        {/* --- ÁREA DAS UNIDADES --- */}
        <div className="grid md:grid-cols-2 gap-6">
            
            {/* UNIDADE 1 */}
            <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                    <h3 className="font-bold text-gray-700 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span> Unidade 1
                    </h3>
                    <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded">
                        Média: {avgU1.toFixed(1)}
                    </span>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm min-h-[100px]">
                    {gradesU1.length === 0 ? (
                        <p className="text-center text-gray-400 text-xs py-8 italic">Nenhuma nota lançada.</p>
                    ) : (
                        gradesU1.map(grade => (
                            <div key={grade.id} className="flex justify-between items-center p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50">
                                <div>
                                    <span className="font-medium text-gray-800 text-sm">{grade.name}</span>
                                    {grade.weight !== 1 && <span className="text-[10px] text-gray-400 ml-2">(Peso {grade.weight})</span>}
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-gray-700">{grade.value.toFixed(1)}</span>
                                    <button onClick={() => handleDeleteGrade(grade.id)} className="text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* UNIDADE 2 */}
            <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                    <h3 className="font-bold text-gray-700 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Unidade 2
                    </h3>
                    <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2 py-1 rounded">
                        Média: {avgU2.toFixed(1)}
                    </span>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm min-h-[100px]">
                    {gradesU2.length === 0 ? (
                        <p className="text-center text-gray-400 text-xs py-8 italic">Nenhuma nota lançada.</p>
                    ) : (
                        gradesU2.map(grade => (
                            <div key={grade.id} className="flex justify-between items-center p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50">
                                <div>
                                    <span className="font-medium text-gray-800 text-sm">{grade.name}</span>
                                    {grade.weight !== 1 && <span className="text-[10px] text-gray-400 ml-2">(Peso {grade.weight})</span>}
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-gray-700">{grade.value.toFixed(1)}</span>
                                    <button onClick={() => handleDeleteGrade(grade.id)} className="text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

        </div>

        {/* --- FORMULÁRIO DE ADICIONAR --- */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 mt-6">
            <h3 className="font-bold text-sm text-gray-700 uppercase mb-4">Lançar Nova Nota</h3>
            <form onSubmit={handleAddGrade} className="flex flex-col gap-3">
                
                <div className="flex gap-2">
                    {/* Botões de Seleção de Unidade */}
                    <button 
                        type="button" 
                        onClick={() => setNewUnit('Unidade 1')}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold border transition ${newUnit === 'Unidade 1' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-200 text-gray-500'}`}
                    >
                        Unidade 1
                    </button>
                    <button 
                        type="button" 
                        onClick={() => setNewUnit('Unidade 2')}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold border transition ${newUnit === 'Unidade 2' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-gray-200 text-gray-500'}`}
                    >
                        Unidade 2
                    </button>
                </div>

                <div className="grid grid-cols-[2fr_1fr_1fr] gap-2">
                    <input 
                        placeholder="Nome (Ex: Prova 1)" 
                        className="p-3 bg-gray-50 border rounded-xl outline-none text-sm"
                        value={newName} onChange={e => setNewName(e.target.value)}
                        required
                    />
                    <input 
                        type="number" placeholder="Peso" 
                        className="p-3 bg-gray-50 border rounded-xl outline-none text-sm text-center"
                        value={newWeight} onChange={e => setNewWeight(e.target.value)}
                        required
                    />
                    <input 
                        type="number" step="0.1" placeholder="Nota" 
                        className="p-3 bg-gray-50 border rounded-xl outline-none text-sm font-bold text-center"
                        value={newValue} onChange={e => setNewValue(e.target.value)}
                        required
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={adding}
                    className="bg-[#0047AB] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-800 transition shadow-lg shadow-blue-200 hover:shadow-none"
                >
                    {adding ? <Loader2 className="animate-spin w-5 h-5" /> : <><Plus className="w-5 h-5"/> Adicionar Nota</>}
                </button>
            </form>
        </div>

      </main>
    </div>
  )
}