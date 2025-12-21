import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../supabaseClient'
import { Users, Plus, Hash, Loader2, LogIn } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

export function Turmas() {
  const { user } = useAuth()
  const [classrooms, setClassrooms] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Estados dos Modais
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  
  // Inputs
  const [newClassName, setNewClassName] = useState('')
  const [inviteCodeInput, setInviteCodeInput] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (user) fetchClassrooms()
  }, [user])

  async function fetchClassrooms() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('classroom_members')
        .select(`
          id,
          classrooms (
            id,
            name,
            invite_code,
            owner_id
          )
        `)
        .eq('user_id', user.id)

      if (error) throw error
      
      // Tratamento defensivo para evitar tela branca
      const validClassrooms = (data || []).map(item => {
        if (!item.classrooms) return null
        return Array.isArray(item.classrooms) ? item.classrooms[0] : item.classrooms
      }).filter(Boolean)

      setClassrooms(validClassrooms)
    } catch (error) {
      console.error(error)
      toast.error('Erro ao carregar turmas')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateClass(e) {
    e.preventDefault()
    if (!newClassName.trim()) return
    setActionLoading(true)

    try {
      const randomCode = newClassName.substring(0,3).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900)

      // 1. Cria a Turma
      const { data: classData, error: classError } = await supabase.from('classrooms').insert([{ 
        owner_id: user.id, 
        name: newClassName, 
        invite_code: randomCode 
      }]).select().single()
      
      if (classError) throw classError

      // 2. Adiciona o criador como Admin (Agora seguro pelas novas políticas)
      const { error: memberError } = await supabase.from('classroom_members').insert([{ 
        classroom_id: classData.id, 
        user_id: user.id, 
        role: 'admin' 
      }])
      
      if (memberError) throw memberError

      toast.success(`Turma criada! Código: ${randomCode}`)
      setNewClassName('')
      setShowCreateModal(false)
      fetchClassrooms()

    } catch (error) {
      toast.error('Erro: ' + error.message)
    } finally {
      setActionLoading(false)
    }
  }

  async function handleJoinClass(e) {
    e.preventDefault()
    if (!inviteCodeInput.trim()) return
    setActionLoading(true)

    try {
      // --- USO DA NOVA FUNÇÃO SEGURA (RPC) ---
      // Isso chama a função SQL que criamos para validar tudo no servidor
      const { data, error } = await supabase.rpc('join_classroom', {
        classroom_invite_code: inviteCodeInput.trim()
      })

      if (error) throw error

      // Verifica a resposta da função
      if (data && !data.success) {
        throw new Error(data.message)
      }

      toast.success('Você entrou na turma!')
      setInviteCodeInput('')
      setShowJoinModal(false)
      fetchClassrooms()

    } catch (error) {
      toast.error(error.message || 'Erro ao entrar na turma')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-4 pb-24 transition-colors duration-300">
      
      <div className="flex justify-between items-center mb-6 mt-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="text-[#0047AB] dark:text-blue-400" /> Turmas
        </h1>
      </div>

      {/* Botões de Ação */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 flex flex-col items-center justify-center gap-2 hover:border-blue-500 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition group"
        >
          <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full text-blue-600 dark:text-blue-400 group-hover:scale-110 transition">
            <Plus className="h-6 w-6" />
          </div>
          <span className="font-semibold text-sm text-gray-700 dark:text-gray-200">Criar Nova</span>
        </button>

        <button 
          onClick={() => setShowJoinModal(true)}
          className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 flex flex-col items-center justify-center gap-2 hover:border-indigo-500 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition group"
        >
          <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-full text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition">
            <LogIn className="h-6 w-6" />
          </div>
          <span className="font-semibold text-sm text-gray-700 dark:text-gray-200">Entrar com Código</span>
        </button>
      </div>

      {/* Lista de Turmas */}
      <h2 className="font-bold text-gray-700 dark:text-slate-400 mb-4 text-sm uppercase tracking-wider">Minhas Salas</h2>
      
      {loading ? (
        <div className="text-center py-10"><Loader2 className="animate-spin h-8 w-8 text-[#0047AB] dark:text-blue-400 mx-auto" /></div>
      ) : classrooms.length === 0 ? (
        <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-gray-300 dark:border-slate-700">
          <p className="text-gray-500 dark:text-gray-400">Você não participa de nenhuma turma ainda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {classrooms.map(cls => (
            <Link 
              to={`/turma/${cls.id}`} 
              key={cls.id} 
              className="block bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 flex justify-between items-center hover:border-blue-400 dark:hover:border-blue-600 transition cursor-pointer group"
            >
              <div>
                <h3 className="font-bold text-gray-800 dark:text-white text-lg group-hover:text-[#0047AB] dark:group-hover:text-blue-400 transition">{cls.name}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400 mt-1 bg-gray-50 dark:bg-slate-800 px-2 py-1 rounded w-fit">
                  <Hash className="h-3 w-3" />
                  Cód: <span className="font-mono font-bold select-all">{cls.invite_code}</span>
                </div>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold">
                ACESSAR
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* --- MODAL CRIAR --- */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
          <form onSubmit={handleCreateClass} className="bg-white dark:bg-slate-900 rounded-xl p-6 w-full max-w-sm shadow-xl border border-gray-100 dark:border-slate-800">
            <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Criar nova turma</h3>
            <label className="block text-sm text-gray-600 dark:text-slate-400 mb-1">Nome da Turma</label>
            <input 
              className="w-full border dark:border-slate-700 p-3 rounded-lg mb-4 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0047AB] dark:focus:ring-blue-500" 
              placeholder="Ex: Engenharia Civil 2025"
              value={newClassName}
              onChange={e => setNewClassName(e.target.value)}
              required
              autoFocus
            />
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-2 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition">Cancelar</button>
              <button type="submit" disabled={actionLoading} className="flex-1 bg-[#0047AB] dark:bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-800 dark:hover:bg-blue-500 transition">
                {actionLoading ? <Loader2 className="animate-spin w-5 h-5 mx-auto"/> : 'Criar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- MODAL ENTRAR --- */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
          <form onSubmit={handleJoinClass} className="bg-white dark:bg-slate-900 rounded-xl p-6 w-full max-w-sm shadow-xl border border-gray-100 dark:border-slate-800">
            <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Entrar em uma turma</h3>
            <label className="block text-sm text-gray-600 dark:text-slate-400 mb-1">Código do Convite</label>
            <input 
              className="w-full border dark:border-slate-700 p-3 rounded-lg mb-4 uppercase bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" 
              placeholder="Ex: ENG-999"
              value={inviteCodeInput}
              onChange={e => setInviteCodeInput(e.target.value)}
              required
              autoFocus
            />
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowJoinModal(false)} className="flex-1 py-2 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition">Cancelar</button>
              <button type="submit" disabled={actionLoading} className="flex-1 bg-indigo-600 dark:bg-indigo-500 text-white py-2 rounded-lg font-bold hover:bg-indigo-700 transition">
                {actionLoading ? <Loader2 className="animate-spin w-5 h-5 mx-auto"/> : 'Entrar'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}