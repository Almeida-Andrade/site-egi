'use client'

import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { ESTADOS_CIVIS, UFS } from '@/lib/ficha-cadastral'
import { AJUDAS, type ChaveAjuda } from '@/lib/ficha/ajudas'
import type { ConjugeR, EnderecoR, PessoaR, TrabalhoR } from '@/lib/ficha/etapas'
import { mascaraCep, mascaraCpf, mascaraDinheiro, mascaraTelefone } from '@/lib/ficha/mascaras'
import estilos from './Ficha.module.css'

export type Erros = Record<string, string>

/** O (?) ao lado do rótulo abre a explicação ali mesmo, sem sair da tela. */
export function TituloComAjuda({ chave, titulo }: { chave: ChaveAjuda; titulo: string }) {
  const id = useId()
  const [aberta, setAberta] = useState(false)
  return (
    <div className={estilos.campo}>
      <div className={estilos.rotuloLinha}>
        <span className={estilos.rotulo}>{titulo}</span>
        <button type="button" className={estilos.botaoAjuda} aria-expanded={aberta} aria-controls={id} onClick={() => setAberta(!aberta)}>
          <span aria-hidden="true">?</span>
          <span className="sr-only">Ajuda: {titulo}</span>
        </button>
      </div>
      {aberta && (
        <p id={id} className={estilos.painelAjuda}>
          {AJUDAS[chave]}
        </p>
      )}
    </div>
  )
}

interface PropsCampo {
  rotulo: string
  valor: string
  aoMudar: (v: string) => void
  erro?: string
  ajuda?: ChaveAjuda
  opcional?: boolean
  tipo?: 'text' | 'email' | 'tel' | 'date' | 'number'
  modo?: 'text' | 'numeric' | 'tel' | 'email' | 'decimal'
  autocompletar?: string
  maximo?: number
  mascara?: (v: string) => string
  multilinha?: boolean
  inteiro?: boolean
  dica?: string
}

export function Campo(p: PropsCampo) {
  const id = useId()
  const [ajudaAberta, setAjudaAberta] = useState(false)
  const idAjuda = `${id}-ajuda`
  const idErro = `${id}-erro`
  const descritores = [p.ajuda && ajudaAberta ? idAjuda : '', p.erro ? idErro : ''].filter(Boolean).join(' ') || undefined
  const comum = {
    id,
    className: `${estilos.entrada} ${p.erro ? estilos.entradaErro : ''}`,
    value: p.valor,
    'aria-invalid': p.erro ? true : undefined,
    'aria-describedby': descritores,
    autoComplete: p.autocompletar ?? 'off',
    maxLength: p.maximo ?? 120,
  }
  return (
    <div className={`${estilos.campo} ${p.inteiro ? estilos.inteiro : ''}`}>
      <div className={estilos.rotuloLinha}>
        <label htmlFor={id} className={estilos.rotulo}>
          {p.rotulo} {p.opcional && <span className={estilos.opcional}>(opcional)</span>}
        </label>
        {p.ajuda && (
          <button type="button" className={estilos.botaoAjuda} aria-expanded={ajudaAberta} aria-controls={idAjuda} onClick={() => setAjudaAberta(!ajudaAberta)}>
            <span aria-hidden="true">?</span>
            <span className="sr-only">O que pôr em {p.rotulo}</span>
          </button>
        )}
      </div>
      {p.ajuda && ajudaAberta && (
        <p id={idAjuda} className={estilos.painelAjuda}>
          {AJUDAS[p.ajuda]}
        </p>
      )}
      {p.multilinha ? (
        <textarea {...comum} onChange={(e) => p.aoMudar(e.target.value)} />
      ) : (
        <input
          {...comum}
          type={p.tipo ?? 'text'}
          inputMode={p.modo}
          onChange={(e) => p.aoMudar(p.mascara ? p.mascara(e.target.value) : e.target.value)}
        />
      )}
      {p.dica && !p.erro && <span className={estilos.opcional}>{p.dica}</span>}
      {p.erro && (
        <span id={idErro} className={estilos.mensagemErro} role="alert">
          {p.erro}
        </span>
      )}
    </div>
  )
}

export function Lista({ rotulo, valor, aoMudar, opcoes, erro, ajuda }: { rotulo: string; valor: string; aoMudar: (v: string) => void; opcoes: [string, string][]; erro?: string; ajuda?: ChaveAjuda }) {
  const id = useId()
  const [ajudaAberta, setAjudaAberta] = useState(false)
  return (
    <div className={estilos.campo}>
      <div className={estilos.rotuloLinha}>
        <label htmlFor={id} className={estilos.rotulo}>
          {rotulo}
        </label>
        {ajuda && (
          <button type="button" className={estilos.botaoAjuda} aria-expanded={ajudaAberta} aria-controls={`${id}-ajuda`} onClick={() => setAjudaAberta(!ajudaAberta)}>
            <span aria-hidden="true">?</span>
            <span className="sr-only">O que pôr em {rotulo}</span>
          </button>
        )}
      </div>
      {ajuda && ajudaAberta && (
        <p id={`${id}-ajuda`} className={estilos.painelAjuda}>
          {AJUDAS[ajuda]}
        </p>
      )}
      <select id={id} className={`${estilos.entrada} ${erro ? estilos.entradaErro : ''}`} value={valor} onChange={(e) => aoMudar(e.target.value)} aria-invalid={erro ? true : undefined}>
        <option value="">Escolha…</option>
        {opcoes.map(([v, t]) => (
          <option key={v} value={v}>
            {t}
          </option>
        ))}
      </select>
      {erro && (
        <span className={estilos.mensagemErro} role="alert">
          {erro}
        </span>
      )}
    </div>
  )
}

/** Escolha em cartões grandes (um toque), no lugar de botão de rádio pequeno. */
export function Opcoes<T extends string>({ valor, aoMudar, opcoes, duas, rotulo }: { valor: string; aoMudar: (v: T) => void; opcoes: { valor: T; titulo: string; texto?: string }[]; duas?: boolean; rotulo: string }) {
  return (
    <div className={`${estilos.opcoes} ${duas ? estilos.opcoesDuas : ''}`} role="group" aria-label={rotulo}>
      {opcoes.map((o) => (
        <button key={o.valor} type="button" className={estilos.opcao} aria-pressed={valor === o.valor} onClick={() => aoMudar(o.valor)}>
          <b>{o.titulo}</b>
          {o.texto && <span>{o.texto}</span>}
        </button>
      ))}
    </div>
  )
}

export function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className={estilos.secao}>
      <h3 className={estilos.secaoTitulo}>{titulo}</h3>
      {children}
    </section>
  )
}

/** O CEP preenche rua, bairro, cidade e estado pelo ViaCEP; só o CEP sai do aparelho. */
async function buscarCep(cep: string): Promise<Partial<EnderecoR> | null> {
  try {
    const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
    const j = (await r.json()) as { erro?: boolean; logradouro?: string; bairro?: string; localidade?: string; uf?: string }
    if (j.erro) return null
    return { logradouro: j.logradouro ?? '', bairro: j.bairro ?? '', cidade: j.localidade ?? '', uf: j.uf ?? '' }
  } catch {
    return null
  }
}

const UFS_OPCOES: [string, string][] = UFS.map((u) => [u, u])

export function BlocoEndereco({ valor, aoMudar, prefixo, erros }: { valor: EnderecoR; aoMudar: (v: EnderecoR) => void; prefixo: string; erros: Erros }) {
  // A busca do CEP volta depois: aplica sobre o que está na tela AGORA, nunca sobre o de quando digitou.
  const atual = useRef({ valor, aoMudar })
  useEffect(() => {
    atual.current = { valor, aoMudar }
  })
  const mudar = (campo: keyof EnderecoR) => (v: string) => aoMudar({ ...valor, [campo]: v })
  const mudarCep = async (v: string) => {
    aoMudar({ ...valor, cep: v })
    const d = v.replace(/\D/g, '')
    if (d.length !== 8) return
    const achado = await buscarCep(d)
    const agora = atual.current.valor
    if (!achado || agora.cep.replace(/\D/g, '') !== d) return
    atual.current.aoMudar({
      ...agora,
      logradouro: agora.logradouro || achado.logradouro || '',
      bairro: agora.bairro || achado.bairro || '',
      cidade: achado.cidade || agora.cidade,
      uf: achado.uf || agora.uf,
    })
  }
  const e = (c: string) => erros[`${prefixo}.${c}`]
  return (
    <div className={estilos.grade}>
      <Campo rotulo="CEP" valor={valor.cep} aoMudar={mudarCep} mascara={mascaraCep} modo="numeric" maximo={9} ajuda="cep" erro={e('cep')} autocompletar="postal-code" />
      <div />
      <Campo rotulo="Rua / avenida" valor={valor.logradouro} aoMudar={mudar('logradouro')} erro={e('logradouro')} inteiro maximo={250} autocompletar="address-line1" />
      <Campo rotulo="Número" valor={valor.numero} aoMudar={mudar('numero')} erro={e('numero')} maximo={20} dica="Sem número? Escreva S/N." />
      <Campo rotulo="Complemento" valor={valor.complemento} aoMudar={mudar('complemento')} opcional autocompletar="address-line2" />
      <Campo rotulo="Bairro" valor={valor.bairro} aoMudar={mudar('bairro')} erro={e('bairro')} />
      <Campo rotulo="Cidade" valor={valor.cidade} aoMudar={mudar('cidade')} erro={e('cidade')} autocompletar="address-level2" />
      <Lista rotulo="Estado" valor={valor.uf} aoMudar={mudar('uf')} opcoes={UFS_OPCOES} erro={e('uf')} />
    </div>
  )
}

const ESTADOS: [string, string][] = Object.entries(ESTADOS_CIVIS)

export function BlocoPessoa({
  valor,
  aoMudar,
  prefixo,
  erros,
  contatoOpcional,
  comNaturalidade,
}: {
  valor: PessoaR
  aoMudar: (v: PessoaR) => void
  prefixo: string
  erros: Erros
  contatoOpcional?: boolean
  comNaturalidade?: boolean
}) {
  const mudar = (campo: keyof PessoaR) => (v: string) => aoMudar({ ...valor, [campo]: v })
  const e = (c: string) => erros[`${prefixo}.${c}`]
  return (
    <div className={estilos.corpo}>
      <div className={estilos.grade}>
        <Campo rotulo="Nome completo" valor={valor.nome} aoMudar={mudar('nome')} erro={e('nome')} inteiro autocompletar="name" maximo={120} />
        <Campo rotulo="CPF" valor={valor.cpf} aoMudar={mudar('cpf')} mascara={mascaraCpf} modo="numeric" maximo={14} ajuda="cpf" erro={e('cpf')} />
        <Campo rotulo="Data de nascimento" valor={valor.nascimento} aoMudar={mudar('nascimento')} tipo="date" ajuda="nascimento" erro={e('nascimento')} autocompletar="bday" />
        <Campo rotulo="RG" valor={valor.rg} aoMudar={mudar('rg')} maximo={30} ajuda="rg" erro={e('rg')} />
        <Campo rotulo="Órgão que emitiu o RG" valor={valor.rgOrgao} aoMudar={mudar('rgOrgao')} maximo={30} ajuda="rgOrgao" erro={e('rgOrgao')} />
        <Lista rotulo="Estado civil" valor={valor.estadoCivil} aoMudar={mudar('estadoCivil')} opcoes={ESTADOS} ajuda="estadoCivil" erro={e('estadoCivil')} />
        <Campo rotulo="Nacionalidade" valor={valor.nacionalidade} aoMudar={mudar('nacionalidade')} maximo={60} ajuda="nacionalidade" erro={e('nacionalidade')} />
        <Campo rotulo="Profissão" valor={valor.profissao} aoMudar={mudar('profissao')} ajuda="profissao" erro={e('profissao')} />
        {comNaturalidade && <Campo rotulo="Cidade onde nasceu" valor={valor.naturalidade} aoMudar={mudar('naturalidade')} opcional />}
        <Campo rotulo="Celular (WhatsApp)" valor={valor.celular} aoMudar={mudar('celular')} mascara={mascaraTelefone} tipo="tel" modo="tel" maximo={16} ajuda="celular" erro={e('celular')} opcional={contatoOpcional} autocompletar="tel" />
        <Campo rotulo="E-mail" valor={valor.email} aoMudar={mudar('email')} tipo="email" modo="email" maximo={160} ajuda="email" erro={e('email')} opcional={contatoOpcional} autocompletar="email" />
      </div>
      <Secao titulo="Endereço onde mora">
        <BlocoEndereco valor={valor.endereco} aoMudar={(endereco) => aoMudar({ ...valor, endereco })} prefixo={`${prefixo}.endereco`} erros={erros} />
      </Secao>
    </div>
  )
}

export function BlocoConjuge({ valor, aoMudar, prefixo, erros }: { valor: ConjugeR; aoMudar: (v: ConjugeR) => void; prefixo: string; erros: Erros }) {
  const mudar = (campo: keyof ConjugeR) => (v: string) => aoMudar({ ...valor, [campo]: v })
  const e = (c: string) => erros[`${prefixo}.${c}`]
  return (
    <div className={estilos.grade}>
      <Campo rotulo="Nome completo" valor={valor.nome} aoMudar={mudar('nome')} erro={e('nome')} inteiro />
      <Campo rotulo="CPF" valor={valor.cpf} aoMudar={mudar('cpf')} mascara={mascaraCpf} modo="numeric" maximo={14} ajuda="cpf" erro={e('cpf')} />
      <Campo rotulo="Data de nascimento" valor={valor.nascimento} aoMudar={mudar('nascimento')} tipo="date" opcional erro={e('nascimento')} />
      <Campo rotulo="RG" valor={valor.rg} aoMudar={mudar('rg')} maximo={30} ajuda="rg" erro={e('rg')} />
      <Campo rotulo="Órgão que emitiu o RG" valor={valor.rgOrgao} aoMudar={mudar('rgOrgao')} maximo={30} ajuda="rgOrgao" opcional />
      <Campo rotulo="Nacionalidade" valor={valor.nacionalidade} aoMudar={mudar('nacionalidade')} maximo={60} erro={e('nacionalidade')} />
      <Campo rotulo="Profissão" valor={valor.profissao} aoMudar={mudar('profissao')} erro={e('profissao')} />
    </div>
  )
}

export function BlocoTrabalho({ valor, aoMudar, prefixo, erros, opcional }: { valor: TrabalhoR; aoMudar: (v: TrabalhoR) => void; prefixo: string; erros: Erros; opcional?: boolean }) {
  const mudar = (campo: keyof TrabalhoR) => (v: string) => aoMudar({ ...valor, [campo]: v })
  const e = (c: string) => erros[`${prefixo}.${c}`]
  return (
    <div className={estilos.grade}>
      <Campo rotulo="Onde trabalha" valor={valor.empresa} aoMudar={mudar('empresa')} ajuda="empresaTrabalho" erro={e('empresa')} opcional={opcional} />
      <Campo rotulo="Função / cargo" valor={valor.funcao} aoMudar={mudar('funcao')} erro={e('funcao')} opcional={opcional} />
      <Campo rotulo="Renda por mês (R$)" valor={valor.renda} aoMudar={mudar('renda')} mascara={mascaraDinheiro} modo="decimal" maximo={16} ajuda="renda" erro={e('renda')} opcional={opcional} dica="Ex.: 3.500,00" />
      <Campo rotulo="Telefone do trabalho" valor={valor.telefone} aoMudar={mudar('telefone')} mascara={mascaraTelefone} tipo="tel" modo="tel" maximo={16} erro={e('telefone')} opcional />
      <Campo rotulo="Endereço do trabalho" valor={valor.endereco} aoMudar={mudar('endereco')} maximo={250} opcional inteiro />
    </div>
  )
}
