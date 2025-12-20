import { ArrowRight, AlertTriangle, CheckCircle, XCircle, Calculator } from 'lucide-react'
import { Link } from 'react-router-dom'

export function SubjectCard({ subject }) {
  // 1. Calcular Média Ponderada
  const grades = subject.grades || []
  const totalWeight = grades.reduce((acc, g) => acc + g.weight, 0)
  const totalPoints = grades.reduce((acc, g) => acc + (g.value * g.weight), 0)
  
  // Se não tiver notas, média é 0
  const average = totalWeight === 0 ? 0 : (totalPoints / totalWeight)
  const averageDisplay = totalWeight === 0 ? '--' : average.toFixed(1)

  // 2. Definir Meta (Padrão 7.0 se não tiver definido)
  const passingGrade = subject.passing_grade || 7.0

  // 3. Lógica do Semáforo (Agora baseada em NOTAS e FALTAS)
  const isFailingByGrades = totalWeight > 0 && average < passingGrade
  const dangerZoneAbsences = subject.current_absences >= (subject.max_absences * 0.8)
  const warningZoneAbsences = subject.current_absences >= (subject.max_absences * 0.5)

  let statusColor = "border-l-4 border-l-emerald-500 bg-white" // Verde
  let Icon = CheckCircle
  let iconColor = "text-emerald-500"

  // Se estiver reprovando por faltas OU com média vermelha (se já tiver nota)
  if (dangerZoneAbsences || (isFailingByGrades && totalWeight > 0)) {
    statusColor = "border-l-4 border-l-red-500 bg-red-50/30"
    Icon = XCircle
    iconColor = "text-red-500"
  } else if (warningZoneAbsences) {
    statusColor = "border-l-4 border-l-amber-400 bg-amber-50/30"
    Icon = AlertTriangle
    iconColor = "text-amber-500"
  }

  return (
    <Link to={`/materia/${subject.id}`} className={`block rounded-xl shadow-sm hover:shadow-md transition p-5 ${statusColor} mb-4 group relative overflow-hidden`}>
      <div className="flex justify-between items-start relative z-10">
        <div>
          <h3 className="font-bold text-gray-800 text-lg">{subject.name}</h3>
          <p className="text-sm text-gray-500">{subject.professor || 'Prof. não informado'}</p>
        </div>
        <Icon className={`h-6 w-6 ${iconColor}`} />
      </div>

      <div className="mt-4 flex gap-6 text-sm relative z-10">
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-1">Média</p>
          <p className={`text-2xl font-bold ${isFailingByGrades ? 'text-red-600' : 'text-gray-700'}`}>
            {averageDisplay}
          </p>
        </div>
        
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-1">Faltas</p>
          <p className={`text-2xl font-bold ${dangerZoneAbsences ? 'text-red-600' : 'text-gray-700'}`}>
            {subject.current_absences} <span className="text-sm text-gray-400 font-normal">/ {subject.max_absences}</span>
          </p>
        </div>
      </div>
      
      <div className="mt-4 text-right">
         <span className="text-xs text-blue-600 font-medium group-hover:underline flex items-center justify-end gap-1">
            Gerenciar notas <ArrowRight className="h-3 w-3" />
         </span>
      </div>
    </Link>
  )
}