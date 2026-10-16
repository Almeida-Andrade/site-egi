// As etapas do formulário e o rascunho que o cliente vai preenchendo. Puro: sem React, sem rede.
// A regra de cada campo mora em lib/ficha-cadastral.ts (cópia byte a byte do OMNIS); aqui só se diz
// em que etapa cada campo aparece e como o rascunho vira a ficha que vai ao servidor.

import { validarFicha, type ErroCampo, type TipoPessoaFicha, type GarantiaFicha } from '@/lib/ficha-cadastral'

export interface EnderecoR {
  cep: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  uf: string
}

export interface PessoaR {
  nome: string
  cpf: string
  rg: string
  rgOrgao: string
  nascimento: string
  naturalidade: string
  nacionalidade: string
  estadoCivil: string
  profissao: string
  endereco: EnderecoR
  celular: string
  telefone: string
  email: string
}

export interface ConjugeR {
  nome: string
  cpf: string
  rg: string
  rgOrgao: string
  nascimento: string
  nacionalidade: string
  profissao: string
}

export interface TrabalhoR {
  empresa: string
  funcao: string
  endereco: string
  telefone: string
  /** como a pessoa digitou ("5.000,00") */
  renda: string
}

export interface SocioR {
  pessoa: PessoaR
  trabalho: TrabalhoR
  assina: boolean
}

export interface Rascunho {
  uso: { finalidade: string; imovelDesejado: string; entradaDesejada: string; prazoMeses: string }
  tipo: TipoPessoaFicha | ''
  pessoa: PessoaR
  conjuge: ConjugeR
  trabalho: TrabalhoR
  empresa: { razaoSocial: string; cnpj: string; endereco: EnderecoR; telefone: string; email: string }
  socios: SocioR[]
  garantia: GarantiaFicha | ''
  fiador: { pessoa: PessoaR; conjuge: ConjugeR; trabalho: TrabalhoR; patrimonio: string }
  referencias: { bancos: string; locacoes: string }
  aceite: boolean
}

export const enderecoVazio = (): EnderecoR => ({ cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: 'MA' })

export const pessoaVazia = (): PessoaR => ({
  nome: '',
  cpf: '',
  rg: '',
  rgOrgao: '',
  nascimento: '',
  naturalidade: '',
  nacionalidade: 'brasileira',
  estadoCivil: '',
  profissao: '',
  endereco: enderecoVazio(),
  celular: '',
  telefone: '',
  email: '',
})

export const conjugeVazio = (): ConjugeR => ({ nome: '', cpf: '', rg: '', rgOrgao: '', nascimento: '', nacionalidade: 'brasileira', profissao: '' })
export const trabalhoVazio = (): TrabalhoR => ({ empresa: '', funcao: '', endereco: '', telefone: '', renda: '' })
export const socioVazio = (assina: boolean): SocioR => ({ pessoa: pessoaVazia(), trabalho: trabalhoVazio(), assina })

export function rascunhoVazio(): Rascunho {
  return {
    uso: { finalidade: '', imovelDesejado: '', entradaDesejada: '', prazoMeses: '' },
    tipo: '',
    pessoa: pessoaVazia(),
    conjuge: conjugeVazio(),
    trabalho: trabalhoVazio(),
    empresa: { razaoSocial: '', cnpj: '', endereco: enderecoVazio(), telefone: '', email: '' },
    socios: [socioVazio(true)],
    garantia: '',
    fiador: { pessoa: pessoaVazia(), conjuge: conjugeVazio(), trabalho: trabalhoVazio(), patrimonio: '' },
    referencias: { bancos: '', locacoes: '' },
    aceite: false,
  }
}

/** O que a EGI já sabia (o link personalizado): entra no rascunho só onde ainda está vazio. */
export function comPreenchido(r: Rascunho, p: { tipo: string | null; nome: string; celular: string; email: string } | null): Rascunho {
  if (!p) return r
  const tipo = r.tipo || (p.tipo === 'fisica' || p.tipo === 'juridica' ? p.tipo : '')
  if (tipo === 'juridica') {
    return {
      ...r,
      tipo,
      empresa: { ...r.empresa, razaoSocial: r.empresa.razaoSocial || p.nome, email: r.empresa.email || p.email, telefone: r.empresa.telefone || p.celular },
    }
  }
  return {
    ...r,
    tipo,
    pessoa: { ...r.pessoa, nome: r.pessoa.nome || p.nome, celular: r.pessoa.celular || p.celular, email: r.pessoa.email || p.email },
  }
}

/** "5.000,00", "5000", "R$ 5.000" → 5000. Vazio → null. Texto que não é número → NaN (a validação recusa). */
export function lerDinheiro(texto: string): number | null {
  const limpo = texto.replace(/[R$\s]/g, '')
  if (!limpo) return null
  const normal = limpo.includes(',') ? limpo.replace(/\./g, '').replace(',', '.') : limpo.replace(/\.(?=\d{3}(\D|$))/g, '')
  return /^\d+(\.\d{1,2})?$/.test(normal) ? Number(normal) : Number.NaN
}

const casado = (estado: string) => estado === 'casado' || estado === 'uniao_estavel'

function trabalhoParaEnvio(t: TrabalhoR) {
  return { ...t, renda: lerDinheiro(t.renda) }
}

/** O rascunho no formato que o servidor lê: só o que vale para as escolhas feitas. */
export function paraEnvio(r: Rascunho): Record<string, unknown> {
  const prazo = r.uso.prazoMeses.trim()
  const base: Record<string, unknown> = {
    uso: { ...r.uso, prazoMeses: prazo ? Number(prazo) : null },
    tipo: r.tipo,
    garantia: r.garantia,
    referencias: r.referencias,
    aceite: r.aceite,
  }
  if (r.tipo === 'fisica') {
    base.pessoa = r.pessoa
    if (casado(r.pessoa.estadoCivil)) base.conjuge = r.conjuge
    base.trabalho = trabalhoParaEnvio(r.trabalho)
  }
  if (r.tipo === 'juridica') {
    base.empresa = r.empresa
    base.socios = r.socios.map((s) => ({ ...s, trabalho: trabalhoParaEnvio(s.trabalho) }))
  }
  if (r.garantia === 'fiador') {
    base.fiador = {
      pessoa: r.fiador.pessoa,
      conjuge: casado(r.fiador.pessoa.estadoCivil) ? r.fiador.conjuge : null,
      trabalho: trabalhoParaEnvio(r.fiador.trabalho),
      patrimonio: r.fiador.patrimonio,
    }
  }
  return base
}

export type ChaveEtapa = 'imovel' | 'quem' | 'dados' | 'conjuge' | 'trabalho' | 'garantia' | 'referencias' | 'documentos' | 'enviar'

export interface Etapa {
  chave: ChaveEtapa
  titulo: string
  pergunta: string
  /** os campos (prefixo do caminho do erro) que esta etapa mostra */
  campos: string[]
}

/** As etapas mudam com as escolhas: cônjuge só para quem é casado, trabalho só para pessoa física. */
export function etapasDoRascunho(r: Rascunho): Etapa[] {
  const lista: Etapa[] = [
    { chave: 'imovel', titulo: 'O imóvel', pergunta: 'Para que você vai usar o imóvel?', campos: ['uso'] },
    { chave: 'quem', titulo: 'Quem vai alugar', pergunta: 'Quem vai assinar o contrato?', campos: ['tipo'] },
    {
      chave: 'dados',
      titulo: r.tipo === 'juridica' ? 'Dados da empresa' : 'Seus dados',
      pergunta: r.tipo === 'juridica' ? 'Os dados da empresa e dos sócios' : 'Os seus dados, como estão nos documentos',
      campos: r.tipo === 'juridica' ? ['empresa', 'socios'] : ['pessoa'],
    },
  ]
  if (r.tipo === 'fisica' && casado(r.pessoa.estadoCivil)) {
    lista.push({ chave: 'conjuge', titulo: 'Cônjuge', pergunta: 'Os dados do marido, da esposa ou do companheiro(a)', campos: ['conjuge'] })
  }
  if (r.tipo === 'fisica') {
    lista.push({ chave: 'trabalho', titulo: 'Trabalho e renda', pergunta: 'Onde você trabalha e quanto ganha por mês', campos: ['trabalho'] })
  }
  lista.push(
    { chave: 'garantia', titulo: 'Garantia', pergunta: 'Que garantia você oferece para a locação?', campos: ['garantia', 'fiador'] },
    { chave: 'referencias', titulo: 'Referências', pergunta: 'Banco e aluguéis anteriores (se tiver)', campos: ['referencias'] },
    { chave: 'documentos', titulo: 'Documentos', pergunta: 'Envie uma foto ou PDF de cada documento', campos: ['arquivos'] },
    { chave: 'enviar', titulo: 'Conferir e enviar', pergunta: 'Confira tudo antes de enviar', campos: ['aceite'] },
  )
  return lista
}

const pertence = (campo: string, prefixos: string[]) => prefixos.some((p) => campo === p || campo.startsWith(`${p}.`))

/** Os erros do rascunho que são desta etapa. Documentos e aceite têm a própria conferência. */
export function errosDaEtapa(r: Rascunho, etapa: Etapa, hoje: string): ErroCampo[] {
  const resultado = validarFicha({ ...paraEnvio(r), aceite: true }, hoje)
  const erros = resultado.ok ? [] : resultado.erros
  if (etapa.chave === 'enviar') return r.aceite ? [] : [{ campo: 'aceite', mensagem: 'Marque que concorda com o uso dos dados para enviar.' }]
  return erros.filter((e) => pertence(e.campo, etapa.campos))
}

/** Em que etapa está o erro que o servidor devolveu (para levar a pessoa até ele). */
export function etapaDoCampo(etapas: Etapa[], campo: string): ChaveEtapa | null {
  return etapas.find((e) => pertence(campo, e.campos))?.chave ?? null
}

/** O primeiro erro de cada campo, para mostrar embaixo do campo. */
export function errosPorCampo(erros: ErroCampo[]): Record<string, string> {
  const mapa: Record<string, string> = {}
  for (const e of erros) if (!Object.prototype.hasOwnProperty.call(mapa, e.campo)) mapa[e.campo] = e.mensagem
  return mapa
}
