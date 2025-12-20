import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { ArrowLeft, Send, User, Clock, Loader2 } from 'lucide-react'

export function ClassroomFeed() {
  const { id } = useParams() // Pega o ID da turma na URL
  const { user } = useAuth()
  
  const [classroom, setClassroom] = useState(null)
  const [posts, setPosts] = useState([])
  const [newPost, setNewPost] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetchData()
  }, [id])

  async function fetchData() {
    try {
      // 1. Busca dados da Turma
      const { data: classData } = await supabase
        .from('classrooms')
        .select('*')
        .eq('id', id)
        .single()
      
      setClassroom(classData)

      // 2. Busca os Posts (e quem escreveu)
      const { data: postsData } = await supabase
        .from('classroom_posts')
        .select('*, profiles(full_name)') // Traz o nome do autor junto
        .eq('classroom_id', id)
        .order('created_at', { ascending: false }) // Mais recentes primeiro

      setPosts(postsData || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSendPost(e) {
    e.preventDefault()
    if (!newPost.trim()) return

    setSending(true)
    try {
      const { error } = await supabase
        .from('classroom_posts')
        .insert([{
          classroom_id: id,
          user_id: user.id,
          content: newPost
        }])
      
      if (error) throw error

      setNewPost('')
      fetchData() // Atualiza a lista
    } catch (error) {
      alert('Erro ao enviar: ' + error.message)
    } finally {
      setSending(false)
    }
  }

  if (loading) return <div className="p-10 text-center flex justify-center"><Loader2 className="animate-spin text-blue-600"/></div>

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Cabeçalho da Turma */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <Link to="/turmas" className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{classroom?.name}</h1>
            <p className="text-xs text-gray-500 font-mono">Cód: {classroom?.invite_code}</p>
          </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Caixa de Criar Post */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <form onSubmit={handleSendPost} className="relative">
            <textarea
              value={newPost}
              onChange={e => setNewPost(e.target.value)}
              placeholder="Compartilhe algo com a turma..."
              className="w-full p-3 pr-12 bg-gray-50 rounded-lg border-0 focus:ring-2 focus:ring-blue-100 resize-none h-24 text-gray-700"
            />
            <button 
              type="submit" 
              disabled={sending || !newPost.trim()}
              className="absolute bottom-3 right-3 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition disabled:opacity-50"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4" />}
            </button>
          </form>
        </div>

        {/* Feed de Posts */}
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="text-center text-gray-400 py-10">
              <p>Nenhuma mensagem ainda.</p>
              <p className="text-sm">Seja o primeiro a postar!</p>
            </div>
          ) : (
            posts.map(post => (
              <div key={post.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-indigo-100 p-2 rounded-full">
                      <User className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">
                        {post.profiles?.full_name || 'Usuário'}
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(post.created_at).toLocaleDateString('pt-BR')} às {new Date(post.created_at).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{post.content}</p>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}