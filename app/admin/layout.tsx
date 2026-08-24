// Painel aposentado (20/08/2026): a gestão migrou para o CRM do grupo.
// Layout sem auth nem barra — só o aviso da page.
export const metadata = { title: 'Painel', robots: { index: false, follow: false } }

export default function LayoutAdmin({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
