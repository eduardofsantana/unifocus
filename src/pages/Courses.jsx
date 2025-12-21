import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../supabaseClient'
import { Award, Plus, Trash2, CheckCircle, Clock, Loader2, BookOpen, Minus, School, Hash } from 'lucide-react'

export function Courses() {
  const { user } = useAuth()
  const [certs, setCerts] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Estados do formulário
  const [newCertName, setNewCertName] = useState('')
  const [newCertProvider, setNewCertProvider] = useState('')
  const [newTotalModules, setNewTotalModules] = useState(10)
  const [addingCert, setAddingCert] = useState(false)

  useEffect(() => {
    if (user) fetchCertifications()
  }, [user])

  async function fetchCertifications() {
    try {
      const { data } = await supabase
        .from('certifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      setCerts(data || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function addCertification(e) {
    e.preventDefault()
    if (!newCertName) return
    setAddingCert(true)

    try {
      const { error } = await supabase.from('certifications').insert([{
        user_id: user.id,
        name: newCertName,
        provider: newCertProvider,
        status: 'Em andamento',
        total_modules: parseInt(newTotalModules),
        completed_modules: 0
      }])

      if (error) throw error
      
      setNewCertName('')
      setNewCertProvider('')
      setNewTotalModules(10)
      fetchCertifications()
    } catch (error) {
      alert(error.message)
    } finally {
      setAddingCert(false)
    }
  }

  async function deleteCert(id) {
    setCerts(certs.filter(c => c.id !== id))
    await supabase.from('certifications').delete().eq('id', id)
  }

  async function updateProgress(cert, change) {
    const newCompleted = Math.max(0, Math.min(cert.total_modules, cert.completed_modules + change))
    if (newCompleted === cert.completed_modules) return

    const newStatus = newCompleted >= cert.total_modules ? 'Concluído' : 'Em andamento'

    const updatedCerts = certs.map(c => 
        c.id === cert.id 
            ? { ...c, completed_modules: newCompleted, status: newStatus } 
            : c
    )
    setCerts(updatedCerts)

    await supabase.from('certifications').update({ 
        completed_modules: newCompleted,
        status: newStatus
    }).eq('id', cert.id)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 p-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2 mt-4">
        <Award className="text-[#0047AB]" /> Meus Cursos Extras
      </h1>

      <div className="max-w-md mx-auto space-y-6">
        
        {/* Formulário de Adicionar - DESIGN CORRIGIDO */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Adicionar Novo Objetivo</h3>
            <form onSubmit={addCertification} className="space-y-4">
                
                {/* Nome do Curso */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Curso</label>
                    <div className="relative">
                        <input 
                            placeholder="Ex: React Avançado" 
                            className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0047AB] outline-none transition text-sm"
                            value={newCertName}
                            onChange={e => setNewCertName(e.target.value)}
                            required
                        />
                        <BookOpen className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                    </div>
                </div>

                {/* Linha Dupla: Instituição + Módulos */}
                <div className="flex gap-3">
                    <div className="flex-[2]">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Instituição</label>
                        <div className="relative">
                            <input 
                                placeholder="Ex: Udemy" 
                                className="w-full pl-9 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm"
                                value={newCertProvider}
                                onChange={e => setNewCertProvider(e.target.value)}
                            />
                            <School className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                        </div>
                    </div>
                    
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1 text-center">Aulas</label>
                        <div className="relative">
                            <input 
                                type="number"
                                min="1"
                                className="w-full pl-7 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-center text-sm font-bold text-gray-700"
                                value={newTotalModules}
                                onChange={e => setNewTotalModules(e.target.value)}
                                required
                            />
                            <Hash className="w-3 h-3 text-gray-400 absolute left-2 top-4" />
                        </div>
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={addingCert} 
                    className="w-full bg-[#0047AB] hover:bg-blue-800 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 mt-2 shadow-lg shadow-blue-200 hover:shadow-none"
                >
                    {addingCert ? <Loader2 className="animate-spin w-5 h-5"/> : <><Plus className="w-5 h-5"/> Começar Curso</>}
                </button>
            </form>
        </div>

        {/* Lista de Cursos */}
        <div className="space-y-4">
            {loading ? (
                <div className="text-center py-10"><Loader2 className="animate-spin text-[#0047AB] mx-auto" /></div>
            ) : certs.length === 0 ? (
                <div className="text-center py-10 opacity-50">
                    <BookOpen className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>Cadastre um curso para acompanhar seu progresso.</p>
                </div>
            ) : (
                certs.map(cert => {
                    const progress = Math.round((cert.completed_modules / (cert.total_modules || 1)) * 100)
                    const isDone = progress >= 100

                    return (
                        <div key={cert.id} className={`bg-white p-5 rounded-xl shadow-sm border-2 transition-all ${isDone ? 'border-green-100 bg-green-50/20' : 'border-gray-100'}`}>
                            
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-bold text-gray-800 text-lg leading-tight">{cert.name}</h3>
                                    <p className="text-xs text-gray-500 font-medium uppercase mt-1">{cert.provider || 'Autodidata'}</p>
                                </div>
                                <button onClick={() => deleteCert(cert.id)} className="text-gray-300 hover:text-red-400 p-1">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="mb-4">
                                <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                                    <span>Progresso</span>
                                    <span className={isDone ? 'text-green-600' : 'text-[#0047AB]'}>{progress}%</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-500 ${isDone ? 'bg-green-500' : 'bg-[#0047AB]'}`} 
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <div className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                                    {cert.completed_modules} / {cert.total_modules} aulas
                                </div>

                                <div className="flex items-center gap-2">
                                    {isDone ? (
                                        <span className="flex items-center gap-1 text-green-700 font-bold text-sm bg-green-100 px-3 py-1.5 rounded-lg border border-green-200">
                                            <CheckCircle className="w-4 h-4" /> Concluído
                                        </span>
                                    ) : (
                                        <>
                                            <button 
                                                onClick={() => updateProgress(cert, -1)}
                                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 active:scale-95 transition"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => updateProgress(cert, 1)}
                                                className="w-10 h-8 flex items-center justify-center rounded-lg bg-[#0047AB] text-white hover:bg-blue-800 active:scale-95 transition shadow-sm"
                                            >
                                                <Plus className="w-5 h-5" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                        </div>
                    )
                })
            )}
        </div>
      </div>
    </div>
  )
}