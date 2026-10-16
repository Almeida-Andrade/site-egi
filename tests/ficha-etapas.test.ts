import { describe, expect, it } from 'vitest'
import { validarFicha } from '@/lib/ficha-cadastral'
import {
  comPreenchido,
  errosDaEtapa,
  errosPorCampo,
  etapaDoCampo,
  etapasDoRascunho,
  lerDinheiro,
  paraEnvio,
  rascunhoVazio,
  socioVazio,
  type Rascunho,
} from '@/lib/ficha/etapas'

const HOJE = '2026-10-16'

function pfCompleta(): Rascunho {
  const r = rascunhoVazio()
  r.uso = { finalidade: 'Morar com a família', entradaDesejada: '2026-11-01', prazoMeses: '30' }
  r.tipo = 'fisica'
  r.pessoa = {
    ...r.pessoa,
    nome: 'Maria da Silva',
    cpf: '529.982.247-25',
    rg: '012345',
    rgOrgao: 'SSP/MA',
    nascimento: '1990-05-20',
    estadoCivil: 'solteiro',
    profissao: 'professora',
    endereco: { cep: '65075-000', logradouro: 'Rua A', numero: '10', complemento: '', bairro: 'Cohama', cidade: 'São Luís', uf: 'MA' },
    celular: '98 99999-1234',
    email: 'maria@exemplo.com',
  }
  r.trabalho = { empresa: 'Escola X', funcao: 'professora', endereco: '', telefone: '', renda: '4.500,00' }
  r.garantia = 'caucao'
  r.aceite = true
  return r
}

describe('lerDinheiro', () => {
  it('entende o jeito brasileiro de escrever', () => {
    expect(lerDinheiro('5.000,00')).toBe(5000)
    expect(lerDinheiro('R$ 1.234.567,89')).toBe(1234567.89)
    expect(lerDinheiro('5000')).toBe(5000)
    expect(lerDinheiro('5.000')).toBe(5000)
    expect(lerDinheiro('')).toBeNull()
    expect(lerDinheiro('cinco mil')).toBeNaN()
  })
})

describe('etapas', () => {
  it('pessoa física solteira: sem cônjuge, com trabalho', () => {
    expect(etapasDoRascunho(pfCompleta()).map((e) => e.chave)).toEqual(['imovel', 'quem', 'dados', 'trabalho', 'garantia', 'referencias', 'documentos', 'enviar'])
  })

  it('casada ganha a etapa do cônjuge; empresa não tem a de trabalho', () => {
    const r = pfCompleta()
    r.pessoa.estadoCivil = 'uniao_estavel'
    expect(etapasDoRascunho(r).map((e) => e.chave)).toContain('conjuge')
    r.tipo = 'juridica'
    const chaves = etapasDoRascunho(r).map((e) => e.chave)
    expect(chaves).not.toContain('trabalho')
    expect(chaves).not.toContain('conjuge')
  })

  it('cada etapa mostra só os seus erros', () => {
    const r = pfCompleta()
    r.pessoa.cpf = '111'
    r.uso.finalidade = ''
    const etapas = etapasDoRascunho(r)
    const imovel = etapas.find((e) => e.chave === 'imovel')!
    const dados = etapas.find((e) => e.chave === 'dados')!
    expect(errosDaEtapa(r, imovel, HOJE).map((e) => e.campo)).toEqual(['uso.finalidade'])
    expect(errosDaEtapa(r, dados, HOJE).map((e) => e.campo)).toEqual(['pessoa.cpf'])
  })

  it('o aceite só é cobrado na última etapa', () => {
    const r = pfCompleta()
    r.aceite = false
    const etapas = etapasDoRascunho(r)
    expect(errosDaEtapa(r, etapas[0], HOJE)).toEqual([])
    expect(errosDaEtapa(r, etapas.at(-1)!, HOJE)).toHaveLength(1)
  })

  it('o erro do servidor leva à etapa certa', () => {
    const etapas = etapasDoRascunho(pfCompleta())
    expect(etapaDoCampo(etapas, 'pessoa.endereco.cep')).toBe('dados')
    expect(etapaDoCampo(etapas, 'fiador.pessoa.cpf')).toBe('garantia')
    expect(etapaDoCampo(etapas, 'arquivos.locatario.renda')).toBe('documentos')
    expect(etapaDoCampo(etapas, 'pessoal')).toBeNull()
  })

  it('o primeiro erro de cada campo', () => {
    expect(errosPorCampo([{ campo: 'a', mensagem: '1' }, { campo: 'a', mensagem: '2' }, { campo: 'toString', mensagem: '3' }])).toEqual({ a: '1', toString: '3' })
  })
})

describe('paraEnvio', () => {
  it('o rascunho completo passa na mesma validação do servidor', () => {
    const r = validarFicha(paraEnvio(pfCompleta()), HOJE)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.valor.trabalho?.renda).toBe(4500)
  })

  it('só vai o que vale para as escolhas: empresa não leva a pessoa física', () => {
    const r = pfCompleta()
    r.tipo = 'juridica'
    r.socios = [socioVazio(true)]
    const envio = paraEnvio(r)
    expect(envio.pessoa).toBeUndefined()
    expect(envio.trabalho).toBeUndefined()
    expect(envio.socios).toHaveLength(1)
    expect(envio.fiador).toBeUndefined()
  })
})

describe('link personalizado', () => {
  it('preenche só o vazio', () => {
    const r = comPreenchido(rascunhoVazio(), { tipo: 'fisica', nome: 'MARIA', celular: '98999991234', email: 'm@x.com' })
    expect(r.tipo).toBe('fisica')
    expect(r.pessoa.nome).toBe('MARIA')
    const ja = pfCompleta()
    expect(comPreenchido(ja, { tipo: 'juridica', nome: 'OUTRO', celular: '', email: '' }).pessoa.nome).toBe('Maria da Silva')
    expect(comPreenchido(rascunhoVazio(), { tipo: 'juridica', nome: 'LOJA LTDA', celular: '', email: '' }).empresa.razaoSocial).toBe('LOJA LTDA')
  })
})
