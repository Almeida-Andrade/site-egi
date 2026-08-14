import type { StatusUnidade } from '@/lib/tipos'
import { rotuloStatus } from '@/lib/utils/rotulos'
import estilos from './ChipStatus.module.css'

const statusEstilos: Record<StatusUnidade, string> = {
  disponivel: estilos.disponivel,
  ocupado: estilos.ocupado,
  reservado: estilos.reservado,
  manutencao: estilos.manutencao,
}

export function ChipStatus({ status }: { status: StatusUnidade }) {
  return <span className={`${estilos.chip} ${statusEstilos[status]}`}>{rotuloStatus(status)}</span>
}
