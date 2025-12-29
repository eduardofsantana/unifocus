import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { ArrowLeft, Trash2, Plus, Loader2, Calculator, AlertCircle, CheckSquare, Square, BookOpen, BarChart2 } from 'lucide-react'
import { toast } from 'sonner'

export function SubjectDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [subject, setSubject] = useState(null)
  const [grades, setGrades] = useState([])
  const [topics, setTopics] = useState([])
  const [activeTab, setActiveTab] = useState('performance')
  const [loading, setLoading] = useState(true)
  
  const [newName, setNewName] = useState('')
  const [newWeight, setNewWeight] = useState(1)
  const [newValue, setNewValue] = useState('')
  const [newUnit, setNewUnit] = useState('Unidade 1')
  const [adding, setAdding] = useState(false)
  const [newTopicTitle, setNewTopicTitle] = useState('')

  useEffect(() => { fetchData() }, [id])

  async function fetchData() {
    try {
      const { data: subjectData, error: subjectError } = await supabase.from('subjects').select('*').eq('id', id).single()
      if (subjectError) throw subjectError
      setSubject(subjectData)

      const { data: gradesData } = await supabase.from('grades').select('*').eq('subject_id', id).order('created_at', { ascending: true })
      setGrades(gradesData || [])

      const { data: topicsData } = await supabase.from('subject_topics').select('*').eq('subject_id', id).order('created_at', { ascending: true })
      setTopics(topicsData || [])

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
      await supabase.from('grades').insert([{ subject_id: id, name: newName, weight: parseFloat(newWeight), value: parseFloat(newValue.replace(',', '.')), unit: newUnit }])
      setNewName(''); setNewValue(''); setNewWeight(1)
      fetchData()
      toast.success('Nota adicionada')
    } catch (error) { toast.error(error.message) } finally { setAdding(false) }
  }

  async function handleDeleteGrade(gradeId) {
    if (confirm('Apagar esta nota?')) {
      await supabase.from('grades').delete().eq('id', gradeId)
      fetchData()
    }
  }

  async function handleAddTopic(e) {
    e.preventDefault()
    if (!newTopicTitle.trim()) return
    const tempTopic = { id: Math.random(), title: newTopicTitle, is_completed: false }
    setTopics([...topics, tempTopic]); setNewTopicTitle('')
    await supabase.from('subject_topics').insert([{ subject_id: id, title: tempTopic.title }])
    fetchData()
  }

  async function toggleTopic(topic) {
    const updatedTopics = topics.map(t => t.id === topic.id ? { ...t, is_completed: !t.is_completed } : t)
    setTopics(updatedTopics)
    await supabase.from('subject_topics').update({ is_completed: !topic.is_completed }).eq('id', topic.id)
  }

  async function handleDeleteTopic(topicId) {
    setTopics(topics.filter(t => t.id !== topicId))
    await supabase.from('subject_topics').delete().eq('id', topicId)
  }

  function calculateAverage(gradesList) {
    if (gradesList.length === 0) return 0
    const totalWeight = gradesList.reduce((acc, g) => acc + (g.weight || 0), 0)
    const totalValue = gradesList.reduce((acc, g) => acc + ((g.value || 0) * (g.weight || 0)), 0)
    return totalWeight > 0 ? totalValue / totalWeight : 0
  }

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-[#0047AB] dark:text-blue-400" /></div>

  const gradesU1 = grades.filter(g => g.unit === 'Unidade 1')
  const gradesU2 = grades.filter(g => g.unit === 'Unidade 2')
  const avgU1 = calculateAverage(gradesU1)
  const avgU2 = calculateAverage(gradesU2)
  const globalAverage = calculateAverage(grades)
  const completedTopics = topics.filter(t => t.is_completed).length
  const topicProgress = topics.length > 0 ? Math.round((completedTopics / topics.length) * 100) : 0

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
      
      {/* CABEÇALHO FIXO */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-20 transition-colors">
        <div className="p-4 flex items-center gap-3">
          <Link to="/dashboard" className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-gray-600 dark:text-slate-400 transition">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">{subject.name}</h1>
            <p className="text-xs text-gray-500 dark:text-slate-500 uppercase font-bold tracking-wider">{subject.period}</p>
          </div>
        </div>

        {/* ABAS */}
        <div className="flex px-4 gap-8 text-sm font-medium text-gray-500 dark:text-slate-500">
            <button onClick={() => setActiveTab('performance')} className={`pb-3 border-b-2 transition flex items-center gap-2 ${activeTab === 'performance' ? 'border-[#0047AB] dark:border-blue-500 text-[#0047AB] dark:text-blue-400' : 'border-transparent hover:text-gray-700 dark:hover:text-slate-300'}`}>
                <BarChart2 className="w-4 h-4" /> Desempenho
            </button>
            <button onClick={() => setActiveTab('topics')} className={`pb-3 border-b-2 transition flex items-center gap-2 ${activeTab === 'topics' ? 'border-[#0047AB] dark:border-blue-500 text-[#0047AB] dark:text-blue-400' : 'border-transparent hover:text-gray-700 dark:hover:text-slate-300'}`}>
                <BookOpen className="w-4 h-4" /> Conteúdos
            </button>
        </div>
      </div>

      <main className="max-w-3xl mx-auto p-4 space-y-6">
        
        {activeTab === 'performance' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                {/* KPI CARDS */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#0047AB] dark:bg-blue-600 text-white p-4 rounded-xl shadow-lg shadow-blue-200 dark:shadow-none relative overflow-hidden">
                        <div className="absolute right-[-10px] top-[-10px] opacity-20"><Calculator className="w-16 h-16" /></div>
                        <p className="text-blue-100 text-[10px] font-bold uppercase mb-1">Média Geral</p>
                        <div className="text-3xl font-black">{globalAverage.toFixed(1)}</div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden transition-colors">
                        <div className="absolute right-[-10px] top-[-10px] text-gray-100 dark:text-slate-800"><AlertCircle className="w-16 h-16" /></div>
                        <p className="text-gray-400 dark:text-slate-500 text-[10px] font-bold uppercase mb-1">Faltas</p>
                        <div className="text-3xl font-black text-gray-800 dark:text-white">
                            {subject.current_absences}<span className="text-gray-300 dark:text-slate-600 text-lg font-medium">/{subject.max_absences}</span>
                        </div>
                    </div>
                </div>

                {/* NOTAS POR UNIDADE (RESPONSIVO: 1 COLUNA MOBILE / 2 COLUNAS PC) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Unidade 1 */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center px-1">
                            <h3 className="font-bold text-gray-700 dark:text-slate-300 text-sm">Unidade 1</h3>
                            <span className="bg-blue-50 dark:bg-blue-900/30 text-[#0047AB] dark:text-blue-400 text-[10px] font-bold px-2 py-1 rounded">Média: {avgU1.toFixed(1)}</span>
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm min-h-[100px] transition-colors">
                            {gradesU1.length === 0 ? <p className="text-center text-gray-400 dark:text-slate-600 text-xs py-8">Vazio</p> : 
                            gradesU1.map(g => (
                                <div key={g.id} className="flex justify-between p-3 border-b border-gray-100 dark:border-slate-800 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                    <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{g.name}</span>
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-gray-800 dark:text-white">{g.value}</span>
                                        <button onClick={() => handleDeleteGrade(g.id)} className="text-gray-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400"><Trash2 className="w-3 h-3"/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Unidade 2 */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center px-1">
                            <h3 className="font-bold text-gray-700 dark:text-slate-300 text-sm">Unidade 2</h3>
                            <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold px-2 py-1 rounded">Média: {avgU2.toFixed(1)}</span>
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm min-h-[100px] transition-colors">
                            {gradesU2.length === 0 ? <p className="text-center text-gray-400 dark:text-slate-600 text-xs py-8">Vazio</p> : 
                            gradesU2.map(g => (
                                <div key={g.id} className="flex justify-between p-3 border-b border-gray-100 dark:border-slate-800 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                    <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{g.name}</span>
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-gray-800 dark:text-white">{g.value}</span>
                                        <button onClick={() => handleDeleteGrade(g.id)} className="text-gray-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400"><Trash2 className="w-3 h-3"/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* FORM ADD NOTA */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm transition-colors">
                    <h3 className="font-bold text-xs text-gray-400 dark:text-slate-500 uppercase mb-3">Adicionar Nota</h3>
                    <form onSubmit={handleAddGrade} className="flex flex-col gap-3">
                        <div className="flex gap-2">
                            {['Unidade 1', 'Unidade 2'].map(u => (
                                <button type="button" key={u} onClick={() => setNewUnit(u)} className={`flex-1 py-2 rounded-lg text-xs font-bold border transition ${newUnit === u ? 'bg-[#0047AB] dark:bg-blue-600 text-white border-[#0047AB] dark:border-blue-600' : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400 border-gray-200 dark:border-slate-700'}`}>{u}</button>
                            ))}
                        </div>
                        <div className="grid grid-cols-[2fr_1fr_1fr] gap-2">
                            <input placeholder="Nome (Ex: Prova)" className="p-2 bg-gray-50 dark:bg-slate-800 border dark:border-slate-700 rounded-lg text-sm text-gray-900 dark:text-white outline-none" value={newName} onChange={e => setNewName(e.target.value)} required />
                            <input type="number" placeholder="Peso" className="p-2 bg-gray-50 dark:bg-slate-800 border dark:border-slate-700 rounded-lg text-sm text-center text-gray-900 dark:text-white outline-none" value={newWeight} onChange={e => setNewWeight(e.target.value)} required />
                            <input type="number" step="0.1" placeholder="Nota" className="p-2 bg-gray-50 dark:bg-slate-800 border dark:border-slate-700 rounded-lg text-sm font-bold text-center text-gray-900 dark:text-white outline-none" value={newValue} onChange={e => setNewValue(e.target.value)} required />
                        </div>
                        <button type="submit" disabled={adding} className="bg-[#0047AB] dark:bg-blue-600 text-white py-2.5 rounded-lg font-bold text-sm flex justify-center items-center gap-2 hover:bg-blue-800 dark:hover:bg-blue-500 transition">
                            {adding ? <Loader2 className="animate-spin w-4 h-4" /> : <><Plus className="w-4 h-4"/> Salvar Nota</>}
                        </button>
                    </form>
                </div>
            </div>
        )}

        {/* --- ABA 2: CONTEÚDOS --- */}
        {activeTab === 'topics' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm transition-colors">
                    <div className="flex justify-between items-end mb-2">
                        <div>
                            <p className="text-gray-400 dark:text-slate-500 text-xs font-bold uppercase">Cobertura</p>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{topicProgress}% <span className="text-sm font-normal text-gray-500 dark:text-slate-400">concluído</span></h3>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold">
                            {completedTopics}/{topics.length} Tópicos
                        </div>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${topicProgress}%` }}></div>
                    </div>
                </div>

                <div className="space-y-2">
                    {topics.length === 0 ? (
                        <div className="text-center py-10 opacity-50 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-xl">
                            <BookOpen className="w-10 h-10 mx-auto mb-2 text-gray-300 dark:text-slate-600" />
                            <p className="text-sm text-gray-500 dark:text-slate-400">O que vai cair na prova?</p>
                        </div>
                    ) : (
                        topics.map(topic => (
                            <div key={topic.id} className={`flex items-center justify-between p-4 rounded-xl border transition ${topic.is_completed ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900/30' : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800'}`}>
                                <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => toggleTopic(topic)}>
                                    <div className={`transition ${topic.is_completed ? 'text-green-600' : 'text-gray-300 dark:text-slate-600'}`}>
                                        {topic.is_completed ? <CheckSquare className="w-6 h-6" /> : <Square className="w-6 h-6" />}
                                    </div>
                                    <span className={`font-medium ${topic.is_completed ? 'text-green-800 dark:text-green-400 line-through decoration-green-300 dark:decoration-green-800' : 'text-gray-700 dark:text-slate-300'}`}>
                                        {topic.title}
                                    </span>
                                </div>
                                <button onClick={() => handleDeleteTopic(topic.id)} className="text-gray-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 p-2"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        ))
                    )}
                </div>

                <form onSubmit={handleAddTopic} className="relative">
                    <input 
                        className="w-full p-4 pr-12 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-sm focus:ring-2 focus:ring-[#0047AB] dark:focus:ring-blue-500 outline-none text-gray-900 dark:text-white transition"
                        placeholder="Adicionar novo tópico..."
                        value={newTopicTitle}
                        onChange={e => setNewTopicTitle(e.target.value)}
                    />
                    <button type="submit" disabled={!newTopicTitle.trim()} className="absolute right-2 top-2 p-2 bg-[#0047AB] dark:bg-blue-600 text-white rounded-lg hover:bg-blue-800 dark:hover:bg-blue-500 disabled:opacity-50 transition">
                        <Plus className="w-5 h-5" />
                    </button>
                </form>
            </div>
        )}

      </main>
    </div>
  )
}