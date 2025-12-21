import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { ArrowLeft, Trash2, Plus, Loader2, Calculator, AlertCircle, CheckSquare, Square, BookOpen, BarChart2 } from 'lucide-react'

export function SubjectDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [subject, setSubject] = useState(null)
  const [grades, setGrades] = useState([])
  const [topics, setTopics] = useState([]) // Novos Tópicos
  const [activeTab, setActiveTab] = useState('performance') // 'performance' | 'topics'
  const [loading, setLoading] = useState(true)
  
  // Form Nova Nota
  const [newName, setNewName] = useState('')
  const [newWeight, setNewWeight] = useState(1)
  const [newValue, setNewValue] = useState('')
  const [newUnit, setNewUnit] = useState('Unidade 1')
  const [adding, setAdding] = useState(false)

  // Form Novo Tópico
  const [newTopicTitle, setNewTopicTitle] = useState('')

  useEffect(() => {
    fetchData()
  }, [id])

  async function fetchData() {
    try {
      // 1. Matéria
      const { data: subjectData, error: subjectError } = await supabase.from('subjects').select('*').eq('id', id).single()
      if (subjectError) throw subjectError
      setSubject(subjectData)

      // 2. Notas
      const { data: gradesData } = await supabase.from('grades').select('*').eq('subject_id', id).order('created_at', { ascending: true })
      setGrades(gradesData || [])

      // 3. Tópicos
      const { data: topicsData } = await supabase.from('subject_topics').select('*').eq('subject_id', id).order('created_at', { ascending: true })
      setTopics(topicsData || [])

    } catch (error) {
      console.error(error)
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  // --- LÓGICA DE NOTAS ---
  async function handleAddGrade(e) {
    e.preventDefault()
    if (!newName || !newValue) return
    setAdding(true)
    try {
      await supabase.from('grades').insert([{
        subject_id: id,
        name: newName,
        weight: parseFloat(newWeight),
        value: parseFloat(newValue.replace(',', '.')),
        unit: newUnit
      }])
      setNewName(''); setNewValue(''); setNewWeight(1)
      fetchData()
    } catch (error) {
      alert(error.message)
    } finally {
      setAdding(false)
    }
  }

  async function handleDeleteGrade(gradeId) {
    if (confirm('Apagar esta nota?')) {
      await supabase.from('grades').delete().eq('id', gradeId)
      fetchData()
    }
  }

  // --- LÓGICA DE TÓPICOS ---
  async function handleAddTopic(e) {
    e.preventDefault()
    if (!newTopicTitle.trim()) return
    
    // Optimistic Update
    const tempTopic = { id: Math.random(), title: newTopicTitle, is_completed: false }
    setTopics([...topics, tempTopic])
    setNewTopicTitle('')

    await supabase.from('subject_topics').insert([{ subject_id: id, title: tempTopic.title }])
    fetchData()
  }

  async function toggleTopic(topic) {
    // Optimistic Update
    const updatedTopics = topics.map(t => t.id === topic.id ? { ...t, is_completed: !t.is_completed } : t)
    setTopics(updatedTopics)

    await supabase.from('subject_topics').update({ is_completed: !topic.is_completed }).eq('id', topic.id)
  }

  async function handleDeleteTopic(topicId) {
    setTopics(topics.filter(t => t.id !== topicId))
    await supabase.from('subject_topics').delete().eq('id', topicId)
  }

  // --- CÁLCULOS ---
  function calculateAverage(gradesList) {
    if (gradesList.length === 0) return 0
    const totalWeight = gradesList.reduce((acc, g) => acc + (g.weight || 0), 0)
    const totalValue = gradesList.reduce((acc, g) => acc + ((g.value || 0) * (g.weight || 0)), 0)
    return totalWeight > 0 ? totalValue / totalWeight : 0
  }

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-[#0047AB]" /></div>

  const gradesU1 = grades.filter(g => g.unit === 'Unidade 1')
  const gradesU2 = grades.filter(g => g.unit === 'Unidade 2')
  const avgU1 = calculateAverage(gradesU1)
  const avgU2 = calculateAverage(gradesU2)
  const globalAverage = calculateAverage(grades)

  // Progresso dos Tópicos
  const completedTopics = topics.filter(t => t.is_completed).length
  const topicProgress = topics.length > 0 ? Math.round((completedTopics / topics.length) * 100) : 0

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* CABEÇALHO FIXO */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="p-4 flex items-center gap-3">
          <Link to="/dashboard" className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 truncate">{subject.name}</h1>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">{subject.period}</p>
          </div>
        </div>

        {/* ABAS DE NAVEGAÇÃO */}
        <div className="flex px-4 gap-8 text-sm font-medium text-gray-500">
            <button 
                onClick={() => setActiveTab('performance')} 
                className={`pb-3 border-b-2 transition flex items-center gap-2 ${activeTab === 'performance' ? 'border-[#0047AB] text-[#0047AB]' : 'border-transparent hover:text-gray-700'}`}
            >
                <BarChart2 className="w-4 h-4" /> Desempenho
            </button>
            <button 
                onClick={() => setActiveTab('topics')} 
                className={`pb-3 border-b-2 transition flex items-center gap-2 ${activeTab === 'topics' ? 'border-[#0047AB] text-[#0047AB]' : 'border-transparent hover:text-gray-700'}`}
            >
                <BookOpen className="w-4 h-4" /> Conteúdos
            </button>
        </div>
      </div>

      <main className="max-w-3xl mx-auto p-4 space-y-6">
        
        {/* --- ABA 1: DESEMPENHO (NOTAS & FALTAS) --- */}
        {activeTab === 'performance' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                {/* KPI CARDS */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#0047AB] text-white p-4 rounded-xl shadow-lg shadow-blue-200 relative overflow-hidden">
                        <div className="absolute right-[-10px] top-[-10px] opacity-20"><Calculator className="w-16 h-16" /></div>
                        <p className="text-blue-100 text-[10px] font-bold uppercase mb-1">Média Geral</p>
                        <div className="text-3xl font-black">{globalAverage.toFixed(1)}</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="absolute right-[-10px] top-[-10px] text-gray-100"><AlertCircle className="w-16 h-16" /></div>
                        <p className="text-gray-400 text-[10px] font-bold uppercase mb-1">Faltas</p>
                        <div className="text-3xl font-black text-gray-800">
                            {subject.current_absences}<span className="text-gray-300 text-lg font-medium">/{subject.max_absences}</span>
                        </div>
                    </div>
                </div>

                {/* NOTAS POR UNIDADE */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Unidade 1 */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center px-1">
                            <h3 className="font-bold text-gray-700 text-sm">Unidade 1</h3>
                            <span className="bg-blue-50 text-[#0047AB] text-[10px] font-bold px-2 py-1 rounded">Média: {avgU1.toFixed(1)}</span>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm min-h-[100px]">
                            {gradesU1.length === 0 ? <p className="text-center text-gray-400 text-xs py-8">Vazio</p> : 
                            gradesU1.map(g => (
                                <div key={g.id} className="flex justify-between p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50">
                                    <span className="text-sm font-medium text-gray-700">{g.name}</span>
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-gray-800">{g.value}</span>
                                        <button onClick={() => handleDeleteGrade(g.id)} className="text-gray-300 hover:text-red-500"><Trash2 className="w-3 h-3"/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Unidade 2 */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center px-1">
                            <h3 className="font-bold text-gray-700 text-sm">Unidade 2</h3>
                            <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-1 rounded">Média: {avgU2.toFixed(1)}</span>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm min-h-[100px]">
                            {gradesU2.length === 0 ? <p className="text-center text-gray-400 text-xs py-8">Vazio</p> : 
                            gradesU2.map(g => (
                                <div key={g.id} className="flex justify-between p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50">
                                    <span className="text-sm font-medium text-gray-700">{g.name}</span>
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-gray-800">{g.value}</span>
                                        <button onClick={() => handleDeleteGrade(g.id)} className="text-gray-300 hover:text-red-500"><Trash2 className="w-3 h-3"/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* FORM ADD NOTA */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-xs text-gray-400 uppercase mb-3">Adicionar Nota</h3>
                    <form onSubmit={handleAddGrade} className="flex flex-col gap-3">
                        <div className="flex gap-2">
                            {['Unidade 1', 'Unidade 2'].map(u => (
                                <button type="button" key={u} onClick={() => setNewUnit(u)} className={`flex-1 py-2 rounded-lg text-xs font-bold border ${newUnit === u ? 'bg-[#0047AB] text-white border-[#0047AB]' : 'bg-white text-gray-500 border-gray-200'}`}>{u}</button>
                            ))}
                        </div>
                        <div className="grid grid-cols-[2fr_1fr_1fr] gap-2">
                            <input placeholder="Nome (Ex: Prova)" className="p-2 bg-gray-50 border rounded-lg text-sm" value={newName} onChange={e => setNewName(e.target.value)} required />
                            <input type="number" placeholder="Peso" className="p-2 bg-gray-50 border rounded-lg text-sm text-center" value={newWeight} onChange={e => setNewWeight(e.target.value)} required />
                            <input type="number" step="0.1" placeholder="Nota" className="p-2 bg-gray-50 border rounded-lg text-sm font-bold text-center" value={newValue} onChange={e => setNewValue(e.target.value)} required />
                        </div>
                        <button type="submit" disabled={adding} className="bg-[#0047AB] text-white py-2.5 rounded-lg font-bold text-sm flex justify-center items-center gap-2 hover:bg-blue-800 transition">
                            {adding ? <Loader2 className="animate-spin w-4 h-4" /> : <><Plus className="w-4 h-4"/> Salvar Nota</>}
                        </button>
                    </form>
                </div>
            </div>
        )}

        {/* --- ABA 2: CONTEÚDOS (CHECKLIST) --- */}
        {activeTab === 'topics' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                
                {/* Barra de Progresso do Conteúdo */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-end mb-2">
                        <div>
                            <p className="text-gray-400 text-xs font-bold uppercase">Cobertura do Conteúdo</p>
                            <h3 className="text-2xl font-bold text-gray-800">{topicProgress}% <span className="text-sm font-normal text-gray-500">concluído</span></h3>
                        </div>
                        <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                            {completedTopics}/{topics.length} Tópicos
                        </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${topicProgress}%` }}></div>
                    </div>
                </div>

                {/* Lista de Tópicos */}
                <div className="space-y-2">
                    {topics.length === 0 ? (
                        <div className="text-center py-10 opacity-50 border-2 border-dashed border-gray-200 rounded-xl">
                            <BookOpen className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm text-gray-500">O que vai cair na prova?</p>
                        </div>
                    ) : (
                        topics.map(topic => (
                            <div key={topic.id} className={`flex items-center justify-between p-4 rounded-xl border transition ${topic.is_completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'}`}>
                                <div 
                                    className="flex items-center gap-3 cursor-pointer flex-1" 
                                    onClick={() => toggleTopic(topic)}
                                >
                                    <div className={`transition ${topic.is_completed ? 'text-green-600' : 'text-gray-300'}`}>
                                        {topic.is_completed ? <CheckSquare className="w-6 h-6" /> : <Square className="w-6 h-6" />}
                                    </div>
                                    <span className={`font-medium ${topic.is_completed ? 'text-green-800 line-through decoration-green-300' : 'text-gray-700'}`}>
                                        {topic.title}
                                    </span>
                                </div>
                                <button onClick={() => handleDeleteTopic(topic.id)} className="text-gray-300 hover:text-red-500 p-2">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Input Novo Tópico */}
                <form onSubmit={handleAddTopic} className="relative">
                    <input 
                        className="w-full p-4 pr-12 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-[#0047AB] outline-none transition"
                        placeholder="Adicionar novo tópico (ex: Integrais Duplas)..."
                        value={newTopicTitle}
                        onChange={e => setNewTopicTitle(e.target.value)}
                    />
                    <button type="submit" disabled={!newTopicTitle.trim()} className="absolute right-2 top-2 p-2 bg-[#0047AB] text-white rounded-lg hover:bg-blue-800 disabled:opacity-50 transition">
                        <Plus className="w-5 h-5" />
                    </button>
                </form>
            </div>
        )}

      </main>
    </div>
  )
}