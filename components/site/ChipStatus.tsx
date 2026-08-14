import type { StatusUnidade } from '@/lib/tipos'
import { rotuloStatus } from '@/lib/utils/rotulos'
import estilos from './ChipStatus.module.css'

export function ChipStatus({ status }: { status: StatusUnidade }) {
  return <span className={`${estilos.chip} ${estilos[status]}`}>{rotuloStatus(status)}</span>
}
