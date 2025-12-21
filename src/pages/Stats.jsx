import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { supabase } from '../supabaseClient.js'
import { ArrowLeft, TrendingUp, Clock, Award, Loader2, PieChart as PieIcon, BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

export function Stats() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  
  // Dados processados para os gráficos
  const [gradesData, setGradesData] = useState([])
  const [studyData, setStudyData] = useState([])
  const [globalAverage, setGlobalAverage] = useState(0)
  const [totalStudyMinutes, setTotalStudyMinutes] = useState(0)

  useEffect(() => {
    if (user) fetchData()
  }, [user])

  async function fetchData() {
    try {
      // 1. Buscar Matérias e Notas
      const { data: subjects } = await supabase
        .from('subjects')
        .select('name, grades(*)')
      
      // 2. Buscar Sessões de Estudo
      const { data: sessions } = await supabase
        .from('study_sessions')
        .select('minutes, subjects(name)')

      processGrades(subjects || [])
      processStudyTime(sessions || [])
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error)
    } finally {
      setLoading(false)
    }
  }

  // Função auxiliar para criar siglas (Ex: "Engenharia de Software" -> "EDS")
  function getAcronym(name) {
    if (!name) return '?'
    const ignoreWords = ['de', 'da', 'do', 'e', 'para', 'com']
    const words = name.trim().split(/\s+/).filter(w => !ignoreWords.includes(w.toLowerCase()))
    
    if (words.length === 1) {
        // Se for só uma palavra (ex: "Cálculo"), pega as 4 primeiras letras
        return words[0].substring(0, 4).toUpperCase()
    }
    
    // Se for composto, pega a primeira letra de cada palavra (max 4 letras)
    return words.map(w => w[0]).join('').substring(0, 4).toUpperCase()
  }

  function processGrades(subjects) {
    let totalSum = 0
    let totalCount = 0

    const chartData = subjects.map(sub => {
      const grades = sub.grades || []
      // Calcula média da matéria (Ponderada)
      const totalW = grades.reduce((acc, g) => acc + (g.weight || 0), 0)
      const totalV = grades.reduce((acc, g) => acc + ((g.value || 0) * (g.weight || 0)), 0)
      const avg = totalW > 0 ? totalV / totalW : 0
      
      if (grades.length > 0) {
        totalSum += avg
        totalCount++
      }

      return {
        sigla: getAcronym(sub.name), // Usa a sigla no eixo X
        fullName: sub.name,          // Nome completo para o Tooltip
        media: parseFloat(avg.toFixed(1))
      }
    }).filter(item => item.media > 0) // Só mostra matérias que têm nota

    setGradesData(chartData)
    setGlobalAverage(totalCount > 0 ? (totalSum / totalCount).toFixed(1) : 0)
  }

  function processStudyTime(sessions) {
    const timeBySubject = {}
    let total = 0

    sessions.forEach(sess => {
      const subName = sess.subjects?.name || 'Geral'
      if (!timeBySubject[subName]) timeBySubject[subName] = 0
      timeBySubject[subName] += sess.minutes
      total += sess.minutes
    })

    const chartData = Object.keys(timeBySubject).map(key => ({
      name: key,
      value: timeBySubject[key]
    })).sort((a, b) => b.value - a.value) // Ordena do maior para o menor

    setStudyData(chartData)
    setTotalStudyMinutes(total)
  }

  // Cores para gráficos
  const COLORS = ['#0047AB', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // Componente Customizado para o Tooltip do Gráfico de Barras
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-xl border border-gray-100 ring-1 ring-black/5">
          <p className="font-bold text-gray-800 text-sm mb-1">{payload[0].payload.fullName}</p>
          <p className="text-xs text-[#0047AB] font-medium bg-blue-50 px-2 py-1 rounded w-fit">
            Média: <span className="font-bold text-base ml-1">{payload[0].value}</span>
          </p>
        </div>
      )
    }
    return null
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#0047AB]" /></div>

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* Cabeçalho */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Relatórios & Insights</h1>
        </div>
      </div>

      <main className="p-4 space-y-6 max-w-lg mx-auto">
        
        {/* KPI CARDS (Indicadores) */}
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden group hover:border-blue-200 transition">
                <div className="absolute top-0 left-0 w-full h-1 bg-[#0047AB]"></div>
                <div className="bg-blue-50 p-2.5 rounded-full mb-2 text-[#0047AB] group-hover:scale-110 transition">
                    <Award className="w-6 h-6" />
                </div>
                <span className="text-4xl font-black text-gray-800 tracking-tight">{globalAverage}</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Coeficiente (CR)</span>
            </div>
            
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden group hover:border-green-200 transition">
                <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
                <div className="bg-green-50 p-2.5 rounded-full mb-2 text-green-600 group-hover:scale-110 transition">
                    <Clock className="w-6 h-6" />
                </div>
                <span className="text-4xl font-black text-gray-800 tracking-tight">{(totalStudyMinutes / 60).toFixed(1)}<span className="text-lg text-gray-400 font-medium">h</span></span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Foco Total</span>
            </div>
        </div>

        {/* GRÁFICO 1: NOTAS POR MATÉRIA */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#0047AB]" /> Desempenho
                </h3>
            </div>
            
            {gradesData.length > 0 ? (
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={gradesData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                            <XAxis 
                                dataKey="sigla" 
                                fontSize={10} 
                                tickLine={false} 
                                axisLine={false} 
                                interval={0} // Força mostrar todos os nomes
                                dy={10}
                                tick={{ fill: '#6b7280', fontWeight: 500 }}
                            />
                            <YAxis 
                                domain={[0, 10]} 
                                fontSize={10} 
                                tickLine={false} 
                                axisLine={false}
                                tickCount={6}
                                tick={{ fill: '#9ca3af' }}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb', opacity: 0.8 }} />
                            <Bar 
                                dataKey="media" 
                                fill="#0047AB" 
                                radius={[6, 6, 0, 0]} 
                                barSize={40}
                                activeBar={{ fill: '#1e3a8a' }} 
                            >
                                {gradesData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.media >= 7 ? '#0047AB' : '#ef4444'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <Award className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm font-medium">Adicione notas para ver o gráfico.</p>
                </div>
            )}
        </div>

        {/* GRÁFICO 2: TEMPO DE ESTUDO */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                <PieIcon className="w-5 h-5 text-[#0047AB]" /> Onde você gasta seu tempo?
            </h3>
            {studyData.length > 0 ? (
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={studyData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={85}
                                paddingAngle={4}
                                dataKey="value"
                                cornerRadius={6}
                            >
                                {studyData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip 
                                formatter={(value) => [`${value} min`, 'Tempo']}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                            />
                            <Legend 
                                verticalAlign="bottom" 
                                height={36} 
                                iconType="circle"
                                formatter={(value) => <span className="text-xs text-gray-600 font-medium ml-1">{value}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm font-medium">Use o modo Foco para gerar dados.</p>
                </div>
            )}
        </div>

      </main>
    </div>
  )
}