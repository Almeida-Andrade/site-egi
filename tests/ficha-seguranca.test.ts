import { describe, expect, it } from 'vitest'
import { mascaraCep, mascaraCnpj, mascaraCpf, mascaraDinheiro, mascaraTelefone } from '@/lib/ficha/mascaras'
import { CABECALHOS_DA_FICHA, politicaDaFicha } from '@/lib/ficha/seguranca'

describe('política de conteúdo da ficha', () => {
  const p = politicaDaFicha('abc', 'https://yamjyyidqtkbwujnaiec.supabase.co', false)
  it('só roda script com o nonce e o Turnstile', () => {
    expect(p).toContain("script-src 'self' 'nonce-abc' 'strict-dynamic' https://challenges.cloudflare.com;")
    expect(p).not.toContain('unsafe-eval')
  })
  it('conecta só ao Supabase, ao ViaCEP e ao Turnstile; não deixa ser posta em iframe', () => {
    expect(p).toContain("connect-src 'self' https://yamjyyidqtkbwujnaiec.supabase.co https://viacep.com.br https://challenges.cloudflare.com")
    expect(p).toContain("frame-ancestors 'none'")
    expect(p).toContain("object-src 'none'")
  })
  it('em desenvolvimento libera o eval e o websocket do recarregamento', () => {
    const d = politicaDaFicha('abc', 'https://x.supabase.co', true)
    expect(d).toContain("'unsafe-eval'")
    expect(d).toContain('ws:')
    expect(d).not.toContain('upgrade-insecure-requests')
  })
  it('não indexa, não guarda em cache e não manda o endereço (com o token) a outro site', () => {
    expect(CABECALHOS_DA_FICHA['X-Robots-Tag']).toBe('noindex, nofollow')
    expect(CABECALHOS_DA_FICHA['Cache-Control']).toBe('no-store')
    expect(CABECALHOS_DA_FICHA['Referrer-Policy']).toBe('no-referrer')
  })
})

describe('máscaras', () => {
  it('formatam enquanto digita', () => {
    expect(mascaraCpf('52998224725')).toBe('529.982.247-25')
    expect(mascaraCpf('5299')).toBe('529.9')
    expect(mascaraCnpj('11222333000181')).toBe('11.222.333/0001-81')
    expect(mascaraCep('65075000')).toBe('65075-000')
    expect(mascaraTelefone('98999991234')).toBe('(98) 99999-1234')
    expect(mascaraTelefone('9832345678')).toBe('(98) 3234-5678')
    expect(mascaraDinheiro('R$ 5.000,00abc')).toBe('5.000,00')
  })
})

describe('scripts embutidos do layout', () => {
  it('entram na CSP da ficha pelo hash do texto', async () => {
    const { hashesDosScripts } = await import('@/lib/ficha/seguranca')
    const { SCRIPT_MARCA_JS } = await import('@/lib/scripts-iniciais')
    const [h] = await hashesDosScripts([SCRIPT_MARCA_JS])
    // o hash que o Chrome pediu para o script da marca "js" quando ele estava bloqueado
    expect(h).toBe("'sha256-Du+OJKJSbdUgz5nrHeWWINvez6XKDDU/tyj/5c2uvwo='")
    expect(politicaDaFicha('n', '', false, [h])).toContain(`'nonce-n' ${h} 'strict-dynamic'`)
  })
})
