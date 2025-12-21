import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { X, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export function AddSubjectModal({ isOpen, onClose, onSuccess, defaultPeriod }) {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [maxAbsences, setMaxAbsences] = useState(15)
  const [period, setPeriod] = useState('')
  const [loading, setLoading] = useState(false)

  // Atualiza o período quando o modal abre
  useEffect(() => {
    if (defaultPeriod) setPeriod(defaultPeriod)
  }, [defaultPeriod, isOpen])

  if (!isOpen) return null

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.from('subjects').insert([{
        user_id: user.id,
        name,
        max_absences: parseInt(maxAbsences),
        period: period // Usa o período que veio do Dashboard
      }])

      if (error) throw error
      setName('')
      onSuccess()
      onClose()
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl text-gray-800">Nova Matéria</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Matéria</label>
                <input autoFocus placeholder="Ex: Cálculo I" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0047AB] outline-none" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
                    <input 
                        className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl outline-none text-gray-500 cursor-not-allowed"
                        value={period} 
                        readOnly // Travado para não editar errado
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max. Faltas</label>
                    <input type="number" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" value={maxAbsences} onChange={e => setMaxAbsences(e.target.value)} required />
                </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-[#0047AB] hover:bg-blue-800 text-white font-bold py-3.5 rounded-xl transition flex justify-center mt-2">
                {loading ? <Loader2 className="animate-spin" /> : 'Adicionar'}
            </button>
        </form>
      </div>
    </div>
  )
}