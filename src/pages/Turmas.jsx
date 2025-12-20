import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../supabaseClient'
import { Users, Plus, Hash, Loader2, LogIn } from 'lucide-react'
import { Link } from 'react-router-dom'

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
      // Busca as matrículas e pede os dados da turma junto
      const { data, error } = await supabase
        .from('classroom_members')
        .select('*, classrooms(*)')
        .eq('user_id', user.id)

      if (error) throw error
      
      // Limpa os dados para ficar só a lista de turmas
      const formattedData = data.map(item => item.classrooms)
      setClassrooms(formattedData || [])
    } catch (error) {
      console.error('Erro ao buscar turmas:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateClass(e) {
    e.preventDefault()
    setActionLoading(true)

    try {
      // 1. Gera código aleatório
      const randomCode = newClassName.substring(0,3).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900)

      // 2. Cria a Turma
      const { data: classData, error: classError } = await supabase
        .from('classrooms')
        .insert([{ 
          owner_id: user.id, 
          name: newClassName, 
          invite_code: randomCode 
        }])
        .select()
        .single()

      if (classError) throw classError

      // 3. Adiciona o criador como membro (ADMIN)
      const { error: memberError } = await supabase
        .from('classroom_members')
        .insert([{ 
          classroom_id: classData.id, 
          user_id: user.id, 
          role: 'admin' 
        }])

      if (memberError) throw memberError

      alert(`Turma criada! Código: ${randomCode}`)
      setNewClassName('')
      setShowCreateModal(false)
      fetchClassrooms()

    } catch (error) {
      alert('Erro: ' + error.message)
    } finally {
      setActionLoading(false)
    }
  }

  async function handleJoinClass(e) {
    e.preventDefault()
    setActionLoading(true)

    try {
      // 1. Acha a turma pelo código
      const { data: classData, error: searchError } = await supabase
        .from('classrooms')
        .select('id')
        .eq('invite_code', inviteCodeInput)
        .single()

      if (searchError || !classData) throw new Error('Código inválido ou turma não encontrada.')

      // 2. Tenta entrar
      const { error: joinError } = await supabase
        .from('classroom_members')
        .insert([{ 
          classroom_id: classData.id, 
          user_id: user.id, 
          role: 'student' 
        }])

      if (joinError) {
        if (joinError.code === '23505') throw new Error('Você já está nesta turma!')
        throw joinError
      }

      alert('Você entrou na turma!')
      setInviteCodeInput('')
      setShowJoinModal(false)
      fetchClassrooms()

    } catch (error) {
      alert(error.message)
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Users className="text-blue-600" /> Turmas
      </h1>

      {/* Botões de Ação */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center gap-2 hover:border-blue-500 hover:text-blue-600 transition"
        >
          <div className="bg-blue-100 p-3 rounded-full text-blue-600">
            <Plus className="h-6 w-6" />
          </div>
          <span className="font-semibold text-sm">Criar Nova</span>
        </button>

        <button 
          onClick={() => setShowJoinModal(true)}
          className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center gap-2 hover:border-indigo-500 hover:text-indigo-600 transition"
        >
          <div className="bg-indigo-100 p-3 rounded-full text-indigo-600">
            <LogIn className="h-6 w-6" />
          </div>
          <span className="font-semibold text-sm">Entrar com Código</span>
        </button>
      </div>

      {/* Lista de Turmas */}
      <h2 className="font-bold text-gray-700 mb-4">Minhas Salas</h2>
      {loading ? (
        <div className="text-center py-10"><Loader2 className="animate-spin h-8 w-8 text-blue-500 mx-auto" /></div>
      ) : classrooms.length === 0 ? (
        <div className="text-center text-gray-500 py-10 bg-white rounded-xl border border-dashed border-gray-300">
          Você não participa de nenhuma turma ainda.
        </div>
      ) : (
        <div className="space-y-3">
          {classrooms.map(cls => (
            <Link 
              to={`/turma/${cls.id}`} 
              key={cls.id} 
              className="block bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center hover:border-blue-400 transition cursor-pointer"
            >
              <div>
                <h3 className="font-bold text-gray-800 text-lg">{cls.name}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 bg-gray-100 px-2 py-1 rounded w-fit">
                  <Hash className="h-3 w-3" />
                  Cód: <span className="font-mono font-bold select-all">{cls.invite_code}</span>
                </div>
              </div>
              <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                ACESSAR
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* --- MODAL CRIAR --- */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <form onSubmit={handleCreateClass} className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-bold text-lg mb-4">Criar nova turma</h3>
            <label className="block text-sm text-gray-600 mb-1">Nome da Turma</label>
            <input 
              className="w-full border p-2 rounded mb-4" 
              placeholder="Ex: Engenharia Civil 2025"
              value={newClassName}
              onChange={e => setNewClassName(e.target.value)}
              required
            />
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-2 text-gray-600">Cancelar</button>
              <button type="submit" disabled={actionLoading} className="flex-1 bg-blue-600 text-white py-2 rounded font-bold">
                {actionLoading ? 'Criando...' : 'Criar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- MODAL ENTRAR --- */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <form onSubmit={handleJoinClass} className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-bold text-lg mb-4">Entrar em uma turma</h3>
            <label className="block text-sm text-gray-600 mb-1">Código do Convite</label>
            <input 
              className="w-full border p-2 rounded mb-4 uppercase" 
              placeholder="Ex: ENG-999"
              value={inviteCodeInput}
              onChange={e => setInviteCodeInput(e.target.value)}
              required
            />
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowJoinModal(false)} className="flex-1 py-2 text-gray-600">Cancelar</button>
              <button type="submit" disabled={actionLoading} className="flex-1 bg-indigo-600 text-white py-2 rounded font-bold">
                {actionLoading ? 'Entrando...' : 'Entrar'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}