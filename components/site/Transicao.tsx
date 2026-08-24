import { ViewTransition, type ReactNode } from 'react'

export function Transicao({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter="pagina-entra" exit="pagina-sai" default="none">
      {children}
    </ViewTransition>
  )
}
