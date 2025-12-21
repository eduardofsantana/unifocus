import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../supabaseClient'
import { Play, Pause, RotateCcw, Save, BookOpen, Coffee, CheckCircle } from 'lucide-react'

export function Focus() {
  const { user } = useAuth()
  
  // Configurações do Timer (em segundos)
  const MODES = {
    focus: { label: 'Foco Total', time: 25 * 60, color: 'text-[#0047AB]', bg: 'bg-blue-50' },
    short: { label: 'Pausa Curta', time: 5 * 60, color: 'text-green-600', bg: 'bg-green-50' },
    long: { label: 'Pausa Longa', time: 15 * 60, color: 'text-purple-600', bg: 'bg-purple-50' }
  }

  const [mode, setMode] = useState('focus')
  const [timeLeft, setTimeLeft] = useState(MODES.focus.time)
  const [isActive, setIsActive] = useState(false)
  const [subjects, setSubjects] = useState([])
  const [selectedSubject, setSelectedSubject] = useState('')
  const [sessionSaved, setSessionSaved] = useState(false)
  
  const timerRef = useRef(null)

  // Carrega matérias
  useEffect(() => {
    if (user) {
      supabase.from('subjects').select('id, name').eq('user_id', user.id)
      .then(({ data }) => setSubjects(data || []))
    }
  }, [user])

  // Lógica do Timer
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      // Timer acabou
      clearInterval(timerRef.current)
      setIsActive(false)
      if (mode === 'focus') saveSession() // Salva automático se for foco
      else alert('Pausa finalizada! Bora voltar?')
    }
    return () => clearInterval(timerRef.current)
  }, [isActive, timeLeft])

  // Formata MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Troca de Modo
  const switchMode = (newMode) => {
    setMode(newMode)
    setTimeLeft(MODES[newMode].time)
    setIsActive(false)
    setSessionSaved(false)
  }

  // Salvar Sessão no Banco
  async function saveSession() {
    if (mode !== 'focus' || sessionSaved) return // Só salva tempo de estudo

    try {
      const minutesStudied = MODES.focus.time / 60
      await supabase.from('study_sessions').insert([{
        user_id: user.id,
        subject_id: selectedSubject || null,
        minutes: minutesStudied
      }])
      setSessionSaved(true)
      
      // Toca um som ou vibra
      if (navigator.vibrate) navigator.vibrate([200, 100, 200])
      alert(`Parabéns! +${minutesStudied} minutos registrados.`)
    } catch (error) {
      console.error(error)
    }
  }

  // Calcular progresso para círculo (0 a 100)
  const totalTime = MODES[mode].time
  const progress = ((totalTime - timeLeft) / totalTime) * 100

  return (
    <div className={`min-h-screen pb-24 p-6 transition-colors duration-500 ${MODES[mode].bg} flex flex-col items-center justify-center`}>
      
      <h1 className={`text-2xl font-bold mb-8 flex items-center gap-2 ${MODES[mode].color}`}>
        {mode === 'focus' ? <BookOpen /> : <Coffee />}
        {MODES[mode].label}
      </h1>

      {/* Seletor de Matéria (Só no modo Foco e se não estiver rodando) */}
      {mode === 'focus' && !isActive && timeLeft === MODES.focus.time && (
        <div className="w-full max-w-xs mb-8">
            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block text-center">O que vamos estudar?</label>
            <select 
                className="w-full p-3 rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm outline-none focus:ring-2 focus:ring-[#0047AB]"
                value={selectedSubject}
                onChange={e => setSelectedSubject(e.target.value)}
            >
                <option value="">📚 Estudo Geral</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
        </div>
      )}

      {/* Timer Visual */}
      <div className="relative w-64 h-64 flex items-center justify-center mb-10">
        {/* Círculo de Fundo */}
        <svg className="absolute w-full h-full transform -rotate-90">
            <circle cx="128" cy="128" r="120" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-200" />
            <circle 
                cx="128" cy="128" r="120" stroke="currentColor" strokeWidth="8" fill="transparent" 
                className={`${MODES[mode].color} transition-all duration-1000 ease-linear`}
                strokeDasharray={2 * Math.PI * 120}
                strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
                strokeLinecap="round"
            />
        </svg>
        <div className={`text-6xl font-black ${MODES[mode].color} font-mono z-10`}>
            {formatTime(timeLeft)}
        </div>
      </div>

      {/* Controles */}
      <div className="flex gap-4 mb-10">
        <button 
            onClick={() => setIsActive(!isActive)}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transform active:scale-95 transition ${isActive ? 'bg-amber-500' : 'bg-[#0047AB]'}`}
        >
            {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
        </button>
        
        <button 
            onClick={() => { setIsActive(false); setTimeLeft(MODES[mode].time); }}
            className="w-16 h-16 rounded-full flex items-center justify-center bg-white text-gray-500 border border-gray-200 shadow-sm hover:bg-gray-50 active:scale-95 transition"
        >
            <RotateCcw className="w-6 h-6" />
        </button>
      </div>

      {/* Botões de Modo */}
      <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200">
        <button onClick={() => switchMode('focus')} className={`px-4 py-2 rounded-xl text-sm font-bold transition ${mode === 'focus' ? 'bg-blue-100 text-[#0047AB]' : 'text-gray-500 hover:bg-gray-50'}`}>Foco</button>
        <button onClick={() => switchMode('short')} className={`px-4 py-2 rounded-xl text-sm font-bold transition ${mode === 'short' ? 'bg-green-100 text-green-700' : 'text-gray-500 hover:bg-gray-50'}`}>Pausa 5'</button>
        <button onClick={() => switchMode('long')} className={`px-4 py-2 rounded-xl text-sm font-bold transition ${mode === 'long' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:bg-gray-50'}`}>Pausa 15'</button>
      </div>

      {sessionSaved && (
          <div className="mt-6 flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-full text-sm font-bold animate-in fade-in slide-in-from-bottom-2">
              <CheckCircle className="w-4 h-4" /> Sessão Salva!
          </div>
      )}

    </div>
  )
}