import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { ArrowLeft, Send, User, Clock, Loader2, Link as LinkIcon, Trash2, Users, LogOut, Copy, Plus, ScrollText, ShieldCheck, Save, Edit3 } from 'lucide-react'
import { toast } from 'sonner'

export function ClassroomFeed() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [classroom, setClassroom] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [activeTab, setActiveTab] = useState('mural') // 'mural', 'materiais', 'info', 'regras'
  const [loading, setLoading] = useState(true)

  // Dados
  const [posts, setPosts] = useState([])
  const [materials, setMaterials] = useState([])
  const [members, setMembers] = useState([])

  // Inputs Mural
  const [newPost, setNewPost] = useState('')
  const [sending, setSending] = useState(false)
  
  // Inputs Materiais
  const [newMaterialTitle, setNewMaterialTitle] = useState('')
  const [newMaterialLink, setNewMaterialLink] = useState('')

  // Inputs Regras
  const [isEditingRules, setIsEditingRules] = useState(false)
  const [rulesText, setRulesText] = useState('')

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
      
      // Se tiver regras salvas, usa elas. Se não, deixa vazio (o render vai mostrar o padrão)
      setRulesText(classData.rules || '')

      // 2. Posts
      const { data: postsData } = await supabase
        .from('classroom_posts')
        .select('*, profiles(full_name, avatar_url)')
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
        .select('*, profiles(full_name, avatar_url)')
        .eq('classroom_id', id)
      setMembers(memData || [])

    } catch (error) {
      console.error(error)
      toast.error('Erro ao carregar turma.')
      navigate('/turmas')
    } finally {
      setLoading(false)
    }
  }

  // --- AÇÕES DO MURAL ---
  async function handleSendPost(e) {
    e.preventDefault()
    if (!newPost.trim()) return
    setSending(true)
    try {
        await supabase.from('classroom_posts').insert([{ classroom_id: id, user_id: user.id, content: newPost }])
        setNewPost('')
        fetchData()
    } catch (error) {
        toast.error('Erro ao enviar post.')
    } finally {
        setSending(false)
    }
  }

  // --- AÇÕES DE MATERIAIS ---
  async function handleAddMaterial(e) {
    e.preventDefault()
    if (!newMaterialTitle || !newMaterialLink) return
    
    let url = newMaterialLink
    if (!url.startsWith('http')) url = `https://${url}`

    try {
        await supabase.from('classroom_materials').insert([{ 
            classroom_id: id, 
            user_id: user.id, 
            title: newMaterialTitle, 
            url: url 
        }])
        setNewMaterialTitle(''); setNewMaterialLink('')
        toast.success('Material adicionado!')
        fetchData()
    } catch (error) {
        toast.error('Erro ao adicionar material.')
    }
  }

  async function handleDeleteMaterial(matId) {
    if (confirm('Apagar este material?')) {
        await supabase.from('classroom_materials').delete().eq('id', matId)
        setMaterials(materials.filter(m => m.id !== matId))
        toast.success('Material removido.')
    }
  }

  // --- AÇÕES DE REGRAS ---
  async function handleSaveRules() {
    try {
        await supabase.from('classrooms').update({ rules: rulesText }).eq('id', id)
        toast.success('Regras atualizadas!')
        setIsEditingRules(false)
        
        // Atualiza estado local
        setClassroom(prev => ({...prev, rules: rulesText}))
    } catch (error) {
        toast.error('Erro ao salvar regras.')
    }
  }

  // --- AÇÕES DE GESTÃO ---
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
    toast.success('Código copiado!')
  }

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-[#0047AB] dark:text-blue-400" /></div>

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
      
      {/* CABEÇALHO */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-20">
        <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Link to="/turmas" className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-gray-600 dark:text-slate-400 transition">
                    <ArrowLeft className="h-6 w-6" />
                </Link>
                <div>
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{classroom?.name}</h1>
                    <p className="text-xs text-gray-500 dark:text-slate-500">{members.length} membros</p>
                </div>
            </div>
            <button onClick={handleCopyCode} className="flex items-center gap-1 text-xs font-bold text-[#0047AB] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/40 transition border border-transparent dark:border-blue-900">
                <Copy className="w-3 h-3" /> {classroom?.invite_code}
            </button>
        </div>

        {/* NAVEGAÇÃO POR ABAS */}
        <div className="flex px-4 gap-6 text-sm font-medium text-gray-500 dark:text-slate-500 overflow-x-auto">
            <button onClick={() => setActiveTab('mural')} className={`pb-3 border-b-2 transition whitespace-nowrap ${activeTab === 'mural' ? 'border-[#0047AB] text-[#0047AB] dark:border-blue-500 dark:text-blue-400' : 'border-transparent hover:text-gray-700 dark:hover:text-slate-300'}`}>
                Mural
            </button>
            <button onClick={() => setActiveTab('materiais')} className={`pb-3 border-b-2 transition whitespace-nowrap ${activeTab === 'materiais' ? 'border-[#0047AB] text-[#0047AB] dark:border-blue-500 dark:text-blue-400' : 'border-transparent hover:text-gray-700 dark:hover:text-slate-300'}`}>
                Materiais
            </button>
            <button onClick={() => setActiveTab('regras')} className={`pb-3 border-b-2 transition whitespace-nowrap flex items-center gap-1 ${activeTab === 'regras' ? 'border-[#0047AB] text-[#0047AB] dark:border-blue-500 dark:text-blue-400' : 'border-transparent hover:text-gray-700 dark:hover:text-slate-300'}`}>
                <ShieldCheck className="w-4 h-4" /> Regras
            </button>
            <button onClick={() => setActiveTab('info')} className={`pb-3 border-b-2 transition whitespace-nowrap ${activeTab === 'info' ? 'border-[#0047AB] text-[#0047AB] dark:border-blue-500 dark:text-blue-400' : 'border-transparent hover:text-gray-700 dark:hover:text-slate-300'}`}>
                Info
            </button>
        </div>
      </div>

      <main className="max-w-2xl mx-auto p-4">
        
        {/* --- ABA 1: MURAL --- */}
        {activeTab === 'mural' && (
            <div className="space-y-4 animate-in fade-in duration-300">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800">
                    <form onSubmit={handleSendPost} className="relative">
                        <textarea
                            value={newPost} onChange={e => setNewPost(e.target.value)}
                            placeholder="Escreva algo para a turma..."
                            className="w-full p-3 pr-12 bg-gray-50 dark:bg-slate-800 rounded-lg border-0 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 resize-none h-24 text-sm text-gray-700 dark:text-gray-200 outline-none transition"
                        />
                        <button type="submit" disabled={sending || !newPost.trim()} className="absolute bottom-3 right-3 p-2 bg-[#0047AB] dark:bg-blue-600 text-white rounded-full hover:bg-blue-800 dark:hover:bg-blue-500 transition disabled:opacity-50 shadow-sm">
                            {sending ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4" />}
                        </button>
                    </form>
                </div>

                <div className="space-y-3">
                    {posts.length === 0 ? <p className="text-center text-gray-400 dark:text-slate-600 py-10 text-sm">Nenhum post ainda.</p> : 
                    posts.map(post => (
                        <div key={post.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-blue-50 dark:border-slate-700">
                                    {post.profiles?.avatar_url ? (
                                        <img src={post.profiles.avatar_url} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-[#0047AB] dark:text-blue-400 font-bold text-xs">
                                            {post.profiles?.full_name?.charAt(0) || 'U'}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white text-xs">{post.profiles?.full_name}</p>
                                    <p className="text-[10px] text-gray-400 dark:text-slate-500">{new Date(post.created_at).toLocaleDateString()} às {new Date(post.created_at).toLocaleTimeString().slice(0,5)}</p>
                                </div>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">{post.content}</p>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* --- ABA 2: MATERIAIS --- */}
        {activeTab === 'materiais' && (
            <div className="space-y-4 animate-in fade-in duration-300">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800">
                    <h3 className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase mb-3">Compartilhar Link</h3>
                    <form onSubmit={handleAddMaterial} className="space-y-2">
                        <input placeholder="Título (ex: PDF Livro Cálculo)" className="w-full p-2 bg-gray-50 dark:bg-slate-800 border dark:border-slate-700 rounded-lg text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0047AB] dark:focus:ring-blue-500" value={newMaterialTitle} onChange={e => setNewMaterialTitle(e.target.value)} required />
                        <div className="flex gap-2">
                            <input placeholder="https://..." className="flex-1 p-2 bg-gray-50 dark:bg-slate-800 border dark:border-slate-700 rounded-lg text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0047AB] dark:focus:ring-blue-500" value={newMaterialLink} onChange={e => setNewMaterialLink(e.target.value)} required />
                            <button type="submit" className="bg-[#0047AB] dark:bg-blue-600 text-white px-4 rounded-lg font-bold text-sm hover:bg-blue-800 dark:hover:bg-blue-500 transition"><Plus className="w-4 h-4" /></button>
                        </div>
                    </form>
                </div>

                <div className="space-y-2">
                    {materials.length === 0 ? <p className="text-center text-gray-400 dark:text-slate-600 py-10 text-sm">Nenhum material compartilhado.</p> : 
                    materials.map(mat => (
                        <div key={mat.id} className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-gray-100 dark:border-slate-800 flex justify-between items-center hover:border-blue-300 dark:hover:border-blue-700 transition group">
                            <a href={mat.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 flex-1 overflow-hidden">
                                <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded-lg text-orange-600 dark:text-orange-400"><LinkIcon className="w-5 h-5" /></div>
                                <div className="truncate">
                                    <p className="font-bold text-gray-800 dark:text-gray-200 text-sm truncate">{mat.title}</p>
                                    <p className="text-xs text-gray-400 dark:text-slate-500 truncate">{mat.url}</p>
                                </div>
                            </a>
                            {(isAdmin || mat.user_id === user.id) && (
                                <button onClick={() => handleDeleteMaterial(mat.id)} className="text-gray-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 p-2"><Trash2 className="w-4 h-4" /></button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* --- ABA 3: REGRAS (NOVA) --- */}
        {activeTab === 'regras' && (
            <div className="space-y-4 animate-in fade-in duration-300">
                <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 p-6 rounded-xl relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-yellow-600 dark:text-yellow-500">
                        <ScrollText className="w-24 h-24" />
                    </div>
                    
                    <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-500 mb-4 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5" /> Regras da Turma
                    </h3>

                    {isEditingRules ? (
                        <div className="relative z-10">
                            <textarea 
                                className="w-full h-48 p-4 rounded-xl border border-yellow-200 dark:border-yellow-900 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-200 text-sm focus:ring-2 focus:ring-yellow-400 outline-none"
                                value={rulesText}
                                onChange={e => setRulesText(e.target.value)}
                                placeholder="Digite as regras aqui..."
                            />
                            <div className="flex gap-2 mt-3">
                                <button onClick={() => setIsEditingRules(false)} className="px-4 py-2 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 text-sm font-bold rounded-lg border border-gray-200 dark:border-slate-700">Cancelar</button>
                                <button onClick={handleSaveRules} className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-bold rounded-lg flex items-center gap-2">
                                    <Save className="w-4 h-4" /> Salvar Regras
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="relative z-10 text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                            {classroom?.rules ? classroom.rules : (
                                // CONTEÚDO PADRÃO SE NÃO TIVER REGRAS DEFINIDAS
                                <ul className="space-y-3 list-disc pl-4">
                                    <li><strong>Respeito acima de tudo:</strong> Trate todos os colegas e professores com cordialidade.</li>
                                    <li><strong>Sem Spam:</strong> Evite mensagens repetidas ou conteúdo irrelevante para a matéria.</li>
                                    <li><strong>Colaboração:</strong> Este espaço é para ajudar. Compartilhe conhecimento!</li>
                                    <li><strong>Segurança:</strong> Não compartilhe senhas ou dados sensíveis no chat público.</li>
                                    <li><strong>Links:</strong> Verifique a veracidade dos links antes de postar.</li>
                                </ul>
                            )}
                        </div>
                    )}

                    {/* Botão de Editar (Só Admin) */}
                    {isAdmin && !isEditingRules && (
                        <button 
                            onClick={() => setIsEditingRules(true)}
                            className="mt-6 flex items-center gap-2 text-xs font-bold text-yellow-700 dark:text-yellow-600 hover:underline relative z-10"
                        >
                            <Edit3 className="w-3 h-3" /> Editar Regras
                        </button>
                    )}
                </div>
            </div>
        )}

        {/* --- ABA 4: MEMBROS & INFO --- */}
        {activeTab === 'info' && (
            <div className="space-y-6 animate-in fade-in duration-300">
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
                    <div className="p-4 bg-gray-50 dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
                        <h3 className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <Users className="w-4 h-4" /> Participantes ({members.length})
                        </h3>
                    </div>
                    <div className="divide-y divide-gray-50 dark:divide-slate-800">
                        {members.map(member => (
                            <div key={member.id} className="p-3 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-slate-700 flex items-center justify-center text-blue-700 dark:text-blue-400 text-xs font-bold overflow-hidden">
                                        {member.profiles?.avatar_url ? <img src={member.profiles.avatar_url} className="w-full h-full object-cover"/> : (member.profiles?.full_name?.charAt(0) || 'U')}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                        {member.profiles?.full_name || 'Usuário'} {member.user_id === user.id && '(Você)'}
                                    </span>
                                </div>
                                {member.role === 'admin' && <span className="text-[10px] bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-500 px-2 py-1 rounded-full font-bold">ADMIN</span>}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    <button onClick={handleLeaveClass} className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-400 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-slate-800 transition">
                        <LogOut className="w-4 h-4" /> Sair da Turma
                    </button>

                    {isAdmin && (
                        <div className="pt-4 border-t border-gray-200 dark:border-slate-800">
                            <p className="text-xs text-red-400 font-bold uppercase mb-2 text-center">Zona de Perigo</p>
                            <button onClick={handleDeleteClass} className="w-full bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/40 transition">
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