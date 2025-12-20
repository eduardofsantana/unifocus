import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { X, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export function AddSubjectModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [professor, setProfessor] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    try {
      // Salva no Supabase
      const { error } = await supabase
        .from('subjects')
        .insert([
          {
            user_id: user.id,
            name: name,
            professor: professor,
            // Valores padrão:
            max_absences: 15, 
            passing_grade: 7.0 
          }
        ])

      if (error) throw error

      // Limpa tudo e avisa o Dashboard para atualizar
      setName('')
      setProfessor('')
      onSuccess() 
      onClose()
    } catch (error) {
      alert('Erro ao criar matéria: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Cabeçalho */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-lg text-gray-800">Nova Matéria</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Matéria *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Cálculo I"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Professor (Opcional)</label>
            <input
              type="text"
              value={professor}
              onChange={e => setProfessor(e.target.value)}
              placeholder="Ex: Dr. Sheldon"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex justify-center items-center"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}