import type { Unidade } from '@/lib/tipos'

export function ordenarUnidades(unidades: Unidade[]): Unidade[] {
  return [...unidades].sort(
    (a, b) =>
      a.ordem - b.ordem ||
      a.identificacao.localeCompare(b.identificacao, 'pt-BR', { numeric: true }),
  )
}
