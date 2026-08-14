import { ViewTransition, type ReactNode } from 'react'

/**
 * Envolve o conteúdo de uma página para que a troca de rota seja um fade curto
 * em vez de um corte seco.
 *
 * Fica em cada `page.tsx`, nunca no layout: layout persiste entre navegações,
 * então entrada e saída nunca disparariam ali. O cabeçalho é ancorado por
 * `viewTransitionName` e não participa — o conteúdo se move, a moldura fica.
 *
 * Em navegador sem View Transitions a página apenas troca sem animar.
 */
export function Transicao({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter="pagina-entra" exit="pagina-sai" default="none">
      {children}
    </ViewTransition>
  )
}
