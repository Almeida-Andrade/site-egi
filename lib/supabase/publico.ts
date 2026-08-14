import { createClient } from '@supabase/supabase-js'

/**
 * Cliente para leitura pública das páginas do site.
 *
 * Não lê cookies de propósito: o visitante é anônimo e não tem sessão. Ler
 * cookies obrigaria o Next a renderizar cada página por requisição, o que
 * anularia o ISR e faria todo acesso bater no banco. Sem cookies, as páginas
 * podem ser geradas estaticamente e revalidadas por tempo.
 *
 * A RLS continua sendo a única barreira: este cliente usa a chave anon e
 * enxerga apenas empreendimentos publicados e não arquivados.
 *
 * O painel administrativo NÃO usa este cliente — lá a sessão importa, e o
 * cliente com cookies de `./server` é o correto.
 */
export function criarClientePublico() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  )
}
