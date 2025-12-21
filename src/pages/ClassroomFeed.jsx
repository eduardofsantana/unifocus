import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { ArrowLeft, Send, User, Clock, Loader2, Link as LinkIcon, Trash2, Users, LogOut, Settings, Copy, Plus } from 'lucide-react'

export function ClassroomFeed() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [classroom, setClassroom] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [activeTab, setActiveTab] = useState('mural') // 'mural', 'materiais', 'info'
  const [loading, setLoading] = useState(true)

  // Dados
  const [posts, setPosts] = useState([])
  const [materials, setMaterials] = useState([])
  const [members, setMembers] = useState([])

  // Inputs
  const [newPost, setNewPost] = useState('')
  const [sending, setSending] = useState(false)
  const [newMaterialTitle, setNewMaterialTitle] = useState('')
  const [newMaterialLink, setNewMaterialLink] = useState('')

  useEffect(() => {
    fetchData()
  }, [id])

  async function fetchData() {
    try {
      // 1. Dados da Turma
      const { data: classData, error: classError } = await supabase.from('classrooms').select('*').eq('id', id).single()
      if (classError) throw classError
      setClassroom(classData)
      setIsAdmin(classData.owner_id === user.id)

      // 2. Posts
      const { data: postsData } = await supabase
        .from('classroom_posts')
        .select('*, profiles(full_name)')
        .eq('classroom_id', id)
        .order('created_at', { ascending: false })
      setPosts(postsData || [])

      // 3. Materiais
      const { data: matData } = await supabase
        .from('classroom_materials')
        .select('*, profiles(full_name)')
        .eq('classroom_id', id)
        .order('created_at', { ascending: false })
      setMaterials(matData || [])

      // 4. Membros
      const { data: memData } = await supabase
        .from('classroom_members')
        .select('*, profiles(full_name)')
        .eq('classroom_id', id)
      setMembers(memData || [])

    } catch (error) {
      console.error(error)
      navigate('/turmas') // Se der erro (ex: foi expulso), volta
    } finally {
      setLoading(false)
    }
  }

  // --- AÇÕES DO MURAL ---
  async function handleSendPost(e) {
    e.preventDefault()
    if (!newPost.trim()) return
    setSending(true)
    await supabase.from('classroom_posts').insert([{ classroom_id: id, user_id: user.id, content: newPost }])
    setNewPost('')
    setSending(false)
    fetchData()
  }

  // --- AÇÕES DE MATERIAIS ---
  async function handleAddMaterial(e) {
    e.preventDefault()
    if (!newMaterialTitle || !newMaterialLink) return
    
    // Garante que o link tem https://
    let url = newMaterialLink
    if (!url.startsWith('http')) url = `https://${url}`

    await supabase.from('classroom_materials').insert([{ 
        classroom_id: id, 
        user_id: user.id, 
        title: newMaterialTitle, 
        url: url 
    }])
    setNewMaterialTitle(''); setNewMaterialLink('')
    fetchData()
  }

  async function handleDeleteMaterial(matId) {
    if (confirm('Apagar este material?')) {
        await supabase.from('classroom_materials').delete().eq('id', matId)
        setMaterials(materials.filter(m => m.id !== matId))
    }
  }

  // --- AÇÕES DE GESTÃO (SAIR / EXCLUIR) ---
  async function handleLeaveClass() {
    if (confirm('Tem certeza que deseja sair desta turma?')) {
        await supabase.from('classroom_members').delete().match({ classroom_id: id, user_id: user.id })
        navigate('/turmas')
    }
  }

  async function handleDeleteClass() {
    if (confirm('ATENÇÃO: Isso apagará a turma, todos os posts e materiais para TODOS. Tem certeza?')) {
        await supabase.from('classrooms').delete().eq('id', id)
        navigate('/turmas')
    }
  }

  async function handleCopyCode() {
    navigator.clipboard.writeText(classroom.invite_code)
    alert('Código copiado: ' + classroom.invite_code)
  }

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-[#0047AB]" /></div>

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* CABEÇALHO */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Link to="/turmas" className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
                    <ArrowLeft className="h-6 w-6" />
                </Link>
                <div>
                    <h1 className="text-lg font-bold text-gray-900 leading-tight">{classroom?.name}</h1>
                    <p className="text-xs text-gray-500">{members.length} membros</p>
                </div>
            </div>
            {/* Botão de Código (Atalho) */}
            <button onClick={handleCopyCode} className="flex items-center gap-1 text-xs font-bold text-[#0047AB] bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition">
                <Copy className="w-3 h-3" /> {classroom?.invite_code}
            </button>
        </div>

        {/* NAVEGAÇÃO POR ABAS */}
        <div className="flex px-4 gap-6 text-sm font-medium text-gray-500 overflow-x-auto">
            <button onClick={() => setActiveTab('mural')} className={`pb-3 border-b-2 transition ${activeTab === 'mural' ? 'border-[#0047AB] text-[#0047AB]' : 'border-transparent hover:text-gray-700'}`}>
                Mural
            </button>
            <button onClick={() => setActiveTab('materiais')} className={`pb-3 border-b-2 transition ${activeTab === 'materiais' ? 'border-[#0047AB] text-[#0047AB]' : 'border-transparent hover:text-gray-700'}`}>
                Materiais
            </button>
            <button onClick={() => setActiveTab('info')} className={`pb-3 border-b-2 transition ${activeTab === 'info' ? 'border-[#0047AB] text-[#0047AB]' : 'border-transparent hover:text-gray-700'}`}>
                Membros & Info
            </button>
        </div>
      </div>

      <main className="max-w-2xl mx-auto p-4">
        
        {/* --- ABA 1: MURAL --- */}
        {activeTab === 'mural' && (
            <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <form onSubmit={handleSendPost} className="relative">
                        <textarea
                            value={newPost} onChange={e => setNewPost(e.target.value)}
                            placeholder="Escreva algo para a turma..."
                            className="w-full p-3 pr-12 bg-gray-50 rounded-lg border-0 focus:ring-2 focus:ring-blue-100 resize-none h-20 text-sm text-gray-700"
                        />
                        <button type="submit" disabled={sending || !newPost.trim()} className="absolute bottom-3 right-3 p-2 bg-[#0047AB] text-white rounded-full hover:bg-blue-800 transition disabled:opacity-50">
                            {sending ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4" />}
                        </button>
                    </form>
                </div>

                <div className="space-y-3">
                    {posts.length === 0 ? <p className="text-center text-gray-400 py-4 text-sm">Nenhum post ainda.</p> : 
                    posts.map(post => (
                        <div key={post.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="bg-blue-100 p-1.5 rounded-full"><User className="h-3 w-3 text-blue-600" /></div>
                                <div>
                                    <p className="font-bold text-gray-900 text-xs">{post.profiles?.full_name}</p>
                                    <p className="text-[10px] text-gray-400">{new Date(post.created_at).toLocaleDateString()} às {new Date(post.created_at).toLocaleTimeString().slice(0,5)}</p>
                                </div>
                            </div>
                            <p className="text-gray-700 text-sm whitespace-pre-wrap">{post.content}</p>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* --- ABA 2: MATERIAIS --- */}
        {activeTab === 'materiais' && (
            <div className="space-y-4">
                {/* Form Adicionar Link */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Compartilhar Link</h3>
                    <form onSubmit={handleAddMaterial} className="space-y-2">
                        <input placeholder="Título (ex: PDF Livro Cálculo)" className="w-full p-2 bg-gray-50 border rounded text-sm" value={newMaterialTitle} onChange={e => setNewMaterialTitle(e.target.value)} required />
                        <div className="flex gap-2">
                            <input placeholder="https://..." className="flex-1 p-2 bg-gray-50 border rounded text-sm" value={newMaterialLink} onChange={e => setNewMaterialLink(e.target.value)} required />
                            <button type="submit" className="bg-[#0047AB] text-white px-4 rounded font-bold text-sm"><Plus className="w-4 h-4" /></button>
                        </div>
                    </form>
                </div>

                {/* Lista de Links */}
                <div className="space-y-2">
                    {materials.length === 0 ? <p className="text-center text-gray-400 py-4 text-sm">Nenhum material compartilhado.</p> : 
                    materials.map(mat => (
                        <div key={mat.id} className="bg-white p-3 rounded-xl border border-gray-100 flex justify-between items-center hover:border-blue-300 transition group">
                            <a href={mat.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 flex-1 overflow-hidden">
                                <div className="bg-orange-50 p-2 rounded-lg text-orange-600"><LinkIcon className="w-5 h-5" /></div>
                                <div className="truncate">
                                    <p className="font-bold text-gray-800 text-sm truncate">{mat.title}</p>
                                    <p className="text-xs text-gray-400 truncate">{mat.url}</p>
                                </div>
                            </a>
                            {(isAdmin || mat.user_id === user.id) && (
                                <button onClick={() => handleDeleteMaterial(mat.id)} className="text-gray-300 hover:text-red-500 p-2"><Trash2 className="w-4 h-4" /></button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* --- ABA 3: MEMBROS & CONFIG --- */}
        {activeTab === 'info' && (
            <div className="space-y-6">
                
                {/* Lista de Membros */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-100">
                        <h3 className="font-bold text-gray-700 flex items-center gap-2">
                            <Users className="w-4 h-4" /> Participantes ({members.length})
                        </h3>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {members.map(member => (
                            <div key={member.id} className="p-3 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-xs font-bold">
                                        {member.profiles?.full_name?.charAt(0) || 'U'}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">
                                        {member.profiles?.full_name || 'Usuário'} {member.user_id === user.id && '(Você)'}
                                    </span>
                                </div>
                                {member.role === 'admin' && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-bold">ADMIN</span>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Zona de Perigo / Ações */}
                <div className="space-y-3">
                    {/* Botão Sair (Para todos, menos o dono se for o único) */}
                    <button 
                        onClick={handleLeaveClass}
                        className="w-full bg-white border border-gray-200 text-gray-600 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition"
                    >
                        <LogOut className="w-4 h-4" /> Sair da Turma
                    </button>

                    {/* Botão Excluir (Só Admin) */}
                    {isAdmin && (
                        <div className="pt-4 border-t border-gray-200">
                            <p className="text-xs text-red-400 font-bold uppercase mb-2 text-center">Zona de Perigo</p>
                            <button 
                                onClick={handleDeleteClass}
                                className="w-full bg-red-50 border border-red-100 text-red-600 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-100 transition"
                            >
                                <Trash2 className="w-4 h-4" /> Excluir Turma Definitivamente
                            </button>
                        </div>
                    )}
                </div>
            </div>
        )}

      </main>
    </div>
  )
}