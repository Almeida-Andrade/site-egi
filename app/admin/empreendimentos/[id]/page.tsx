import { redirect } from 'next/navigation'

// Gestão migrou para o CRM do grupo — aviso fica em /admin
export default function Aposentado() {
  redirect('/admin')
}
