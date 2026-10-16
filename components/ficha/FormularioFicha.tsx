'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ESTADOS_CIVIS, GARANTIAS, documentosExigidos, validarArquivos, validarFicha, type DocumentoExigido, type GarantiaFicha } from '@/lib/ficha-cadastral'
import { AJUDAS } from '@/lib/ficha/ajudas'
import { abrirFicha, enviarFicha, type Abertura, type ArquivoDaFicha } from '@/lib/ficha/envio'
import {
  comPreenchido,
  errosDaEtapa,
  errosPorCampo,
  etapaDoCampo,
  etapasDoRascunho,
  paraEnvio,
  rascunhoVazio,
  socioVazio,
  type ChaveEtapa,
  type Rascunho,
} from '@/lib/ficha/etapas'
import { mascaraCnpj, mascaraTelefone } from '@/lib/ficha/mascaras'
import { BlocoConjuge, BlocoEndereco, BlocoPessoa, BlocoTrabalho, Campo, Opcoes, Secao, TituloComAjuda, type Erros } from './Campos'
import { EtapaDocumentos, type ArquivosPorDocumento } from './Documentos'
import { Turnstile } from './Turnstile'
import estilos from './Ficha.module.css'

type Alvo = { token: string } | { unidadeId: string }

const hojeEmSaoLuis = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Fortaleza' }).format(new Date())

function lerRascunho(chave: string): Rascunho | null {
  try {
    const texto = window.localStorage.getItem(chave)
    if (!texto) return null
    const lido = JSON.parse(texto) as Partial<Rascunho>
    const base = rascunhoVazio()
    return { ...base, ...lido, aceite: false } as Rascunho
  } catch {
    return null
  }
}

function guardarRascunho(chave: string, r: Rascunho | null): void {
  try {
    if (r) window.localStorage.setItem(chave, JSON.stringify(r))
    else window.localStorage.removeItem(chave)
  } catch {
    // aparelho sem armazenamento (aba anônima): o formulário segue sem guardar
  }
}

function metadados(arquivos: ArquivosPorDocumento, exigidos: DocumentoExigido[]): ArquivoDaFicha[] {
  return exigidos.flatMap((d) => (arquivos[d.chave] ?? []).map((arquivo) => ({ documento: d.chave, arquivo })))
}

const OPCOES_GARANTIA: { valor: GarantiaFicha; titulo: string; texto: string }[] = [
  { valor: 'fiador', titulo: 'Fiador', texto: 'Uma pessoa com renda que garante o aluguel se você não pagar.' },
  { valor: 'caucao', titulo: 'Caução', texto: 'Um depósito de até 3 aluguéis, devolvido no fim do contrato.' },
  { valor: 'seguro', titulo: 'Seguro-fiança', texto: 'Um seguro contratado numa seguradora, pago por você.' },
  { valor: 'conversar', titulo: 'Quero conversar com a EGI', texto: 'Ainda não sei. A equipe explica as opções.' },
]

export function FormularioFicha({ alvo }: { alvo: Alvo }) {
  const chaveRascunho = `ficha-egi:${'token' in alvo ? alvo.token.slice(0, 16) : alvo.unidadeId}`
  const [abertura, setAbertura] = useState<Abertura | null>(null)
  const [rascunho, setRascunho] = useState<Rascunho>(rascunhoVazio)
  const [pronto, setPronto] = useState(false)
  const [indice, setIndice] = useState(0)
  // Os campos apontados no último "Continuar"; o texto do erro é refeito a cada mudança, e some quando a pessoa corrige.
  const [marcados, setMarcados] = useState<string[]>([])
  const [arquivos, setArquivos] = useState<ArquivosPorDocumento>({})
  const [token, setToken] = useState<string | null>(null)
  const [tentativa, setTentativa] = useState(0)
  const [problemaTurnstile, setProblemaTurnstile] = useState<string | null>(null)
  // A Cloudflare desconfiou e mostrou a caixa "Confirme que é humano": a pessoa precisa marcar.
  const [pedeCaixa, setPedeCaixa] = useState(false)
  const [envio, setEnvio] = useState<{ situacao: 'parado' | 'enviando' | 'feito'; feitos: number; total: number; mensagem?: string }>({ situacao: 'parado', feitos: 0, total: 0 })
  const titulo = useRef<HTMLHeadingElement>(null)
  const cartao = useRef<HTMLDivElement>(null)
  const [hoje] = useState(hojeEmSaoLuis)

  const alvoEstavel = 'token' in alvo ? alvo.token : alvo.unidadeId
  useEffect(() => {
    let ativo = true
    const pedido: Alvo = 'token' in alvo ? { token: alvo.token } : { unidadeId: alvo.unidadeId }
    void abrirFicha(pedido).then((a) => {
      if (!ativo) return
      setAbertura(a)
      if (a.ok && !a.enviada) setRascunho(comPreenchido(lerRascunho(chaveRascunho) ?? rascunhoVazio(), a.preenchido))
      setPronto(true)
    })
    return () => {
      ativo = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- abre uma vez por link ou unidade
  }, [alvoEstavel])

  useEffect(() => {
    if (!pronto || envio.situacao === 'feito') return
    const t = window.setTimeout(() => guardarRascunho(chaveRascunho, rascunho), 400)
    return () => window.clearTimeout(t)
  }, [rascunho, pronto, chaveRascunho, envio.situacao])

  const etapas = etapasDoRascunho(rascunho)
  const atual = Math.min(indice, etapas.length - 1)
  const etapa = etapas[atual]

  const exigidos = useMemo(() => {
    const v = validarFicha({ ...paraEnvio(rascunho), aceite: true }, hoje)
    return v.ok ? documentosExigidos(v.valor) : []
  }, [rascunho, hoje])

  const aoReceberToken = useCallback((t: string | null) => setToken(t), [])
  const aoFalharTurnstile = useCallback((m: string) => setProblemaTurnstile(m), [])
  const aoPedirCaixa = useCallback(() => setPedeCaixa(true), [])

  function irPara(i: number) {
    setMarcados([])
    setIndice(i)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    window.requestAnimationFrame(() => titulo.current?.focus())
  }

  function mostrarErros(lista: { campo: string; mensagem: string }[]) {
    setMarcados(lista.map((e) => e.campo))
    window.requestAnimationFrame(() => {
      const primeiro = cartao.current?.querySelector<HTMLElement>('[aria-invalid="true"], [role="alert"]')
      primeiro?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      if (primeiro?.matches('input, select, textarea')) primeiro.focus({ preventScroll: true })
    })
  }

  function errosDosDocumentos() {
    const pedido = metadados(arquivos, exigidos).map((a) => ({ documento: a.documento, tipo: a.arquivo.type, bytes: a.arquivo.size, nome: a.arquivo.name }))
    const r = validarArquivos(pedido, exigidos)
    return r.ok ? [] : r.erros
  }

  const errosVivos = () => (etapa.chave === 'documentos' ? errosDosDocumentos() : errosDaEtapa(rascunho, etapa, hoje))
  const vivos = marcados.length ? errosPorCampo(errosVivos()) : {}
  const erros: Erros = Object.fromEntries(marcados.filter((k) => Object.prototype.hasOwnProperty.call(vivos, k)).map((k) => [k, vivos[k]]))

  function continuar() {
    const lista = errosVivos()
    if (lista.length) return mostrarErros(lista)
    irPara(atual + 1)
  }

  async function enviar() {
    if (!rascunho.aceite) return mostrarErros([{ campo: 'aceite', mensagem: 'Marque que concorda com o uso dos dados para enviar.' }])
    if (!token) {
      setEnvio({
        situacao: 'parado',
        feitos: 0,
        total: 0,
        mensagem: pedeCaixa
          ? 'Marque a caixa “Confirme que é humano”, logo acima, e toque em Enviar ficha de novo.'
          : 'Espere a verificação de segurança terminar (alguns segundos) e toque de novo.',
      })
      return
    }
    const lista = metadados(arquivos, exigidos)
    setEnvio({ situacao: 'enviando', feitos: 0, total: lista.length })
    const resultado = await enviarFicha(alvo, paraEnvio(rascunho), lista, token, (feitos, total) => setEnvio({ situacao: 'enviando', feitos, total }))
    if (resultado.ok) {
      guardarRascunho(chaveRascunho, null)
      setEnvio({ situacao: 'feito', feitos: lista.length, total: lista.length })
      window.scrollTo({ top: 0 })
      return
    }
    // O token do Turnstile vale uma vez: a próxima tentativa pede outro.
    setToken(null)
    setTentativa((t) => t + 1)
    setEnvio({ situacao: 'parado', feitos: 0, total: 0, mensagem: resultado.mensagem })
    const errosServidor = resultado.erros ?? []
    const destino = errosServidor.length ? etapaDoCampo(etapas, errosServidor[0].campo) : null
    if (destino && destino !== 'enviar') {
      irPara(etapas.findIndex((e) => e.chave === destino))
      window.setTimeout(() => mostrarErros(errosServidor), 50)
    }
  }

  function apagarTudo() {
    guardarRascunho(chaveRascunho, null)
    setRascunho(comPreenchido(rascunhoVazio(), abertura?.ok && !abertura.enviada ? abertura.preenchido : null))
    setArquivos({})
    irPara(0)
  }

  // ---------------------------------------------------------------- estados sem formulário

  if (!pronto || !abertura) {
    return (
      <main className={estilos.pagina}>
        <p className={estilos.kicker}>Ficha cadastral</p>
        <p className={estilos.subtitulo} role="status">
          Abrindo a ficha…
        </p>
      </main>
    )
  }

  if (!abertura.ok) {
    return (
      <main className={estilos.pagina}>
        <p className={estilos.kicker}>Ficha cadastral</p>
        <div className={estilos.estado}>
          <h1 className={estilos.titulo}>Não deu para abrir a ficha</h1>
          <p>{abertura.mensagem}</p>
          <Link href="/empreendimentos?disponiveis=1">Ver as unidades disponíveis</Link>
          <Link href="/contato">Falar com a EGI</Link>
        </div>
      </main>
    )
  }

  if (abertura.enviada || envio.situacao === 'feito') {
    return (
      <main className={estilos.pagina}>
        <p className={estilos.kicker}>Ficha cadastral</p>
        <div className={estilos.estado} role="status">
          <h1 className={estilos.titulo}>Recebemos sua ficha!</h1>
          <p>
            {abertura.enviada
              ? `Esta ficha foi enviada em ${new Date(abertura.quando).toLocaleDateString('pt-BR', { timeZone: 'America/Fortaleza' })}.`
              : 'Os dados e os documentos chegaram à equipe da EGI.'}{' '}
            Vamos conferir tudo e falar com você pelo WhatsApp ou e-mail informado.
          </p>
          <Link href="/contato">Falar com a EGI</Link>
        </div>
      </main>
    )
  }

  const unidade = abertura.unidade
  const enviando = envio.situacao === 'enviando'

  // ---------------------------------------------------------------- etapas

  const mudar = <K extends keyof Rascunho>(chave: K, valor: Rascunho[K]) => setRascunho((r) => ({ ...r, [chave]: valor }))

  const conteudo: Record<ChaveEtapa, () => ReactNode> = {
    imovel: () => (
      <div className={estilos.corpo}>
        {!unidade && (
          <Campo rotulo="Qual imóvel te interessa?" valor={rascunho.uso.imovelDesejado} aoMudar={(v) => mudar('uso', { ...rascunho.uso, imovelDesejado: v })} opcional ajuda="imovelDesejado" maximo={250} />
        )}
        <Campo rotulo="Para que vai usar o imóvel?" valor={rascunho.uso.finalidade} aoMudar={(v) => mudar('uso', { ...rascunho.uso, finalidade: v })} ajuda="finalidade" erro={erros['uso.finalidade']} maximo={250} />
        <div className={estilos.grade}>
          <Campo rotulo="Quando quer entrar?" valor={rascunho.uso.entradaDesejada} aoMudar={(v) => mudar('uso', { ...rascunho.uso, entradaDesejada: v })} tipo="date" opcional ajuda="entradaDesejada" erro={erros['uso.entradaDesejada']} />
          <Campo rotulo="Por quantos meses?" valor={rascunho.uso.prazoMeses} aoMudar={(v) => mudar('uso', { ...rascunho.uso, prazoMeses: v.replace(/\D/g, '').slice(0, 3) })} modo="numeric" opcional ajuda="prazoMeses" erro={erros['uso.prazoMeses']} maximo={3} />
        </div>
      </div>
    ),
    quem: () => (
      <div className={estilos.corpo}>
        <TituloComAjuda chave="tipo" titulo="O contrato fica no nome de quem?" />
        <Opcoes
          rotulo="Quem vai alugar"
          duas
          valor={rascunho.tipo}
          aoMudar={(v) => mudar('tipo', v)}
          opcoes={[
            { valor: 'fisica', titulo: 'Eu mesmo', texto: 'Pessoa física: o contrato fica no meu CPF.' },
            { valor: 'juridica', titulo: 'Minha empresa', texto: 'O contrato fica no CNPJ, assinado por um sócio.' },
          ]}
        />
        {erros.tipo && <span className={estilos.mensagemErro} role="alert">{erros.tipo}</span>}
      </div>
    ),
    dados: () =>
      rascunho.tipo === 'juridica' ? (
        <div className={estilos.corpo}>
          <div className={estilos.grade}>
            <Campo rotulo="Razão social" valor={rascunho.empresa.razaoSocial} aoMudar={(v) => mudar('empresa', { ...rascunho.empresa, razaoSocial: v })} ajuda="razaoSocial" erro={erros['empresa.razaoSocial']} inteiro maximo={160} />
            <Campo rotulo="CNPJ" valor={rascunho.empresa.cnpj} aoMudar={(v) => mudar('empresa', { ...rascunho.empresa, cnpj: v })} mascara={mascaraCnpj} modo="numeric" maximo={18} ajuda="cnpj" erro={erros['empresa.cnpj']} />
            <Campo rotulo="Telefone da empresa" valor={rascunho.empresa.telefone} aoMudar={(v) => mudar('empresa', { ...rascunho.empresa, telefone: v })} mascara={mascaraTelefone} tipo="tel" modo="tel" maximo={16} erro={erros['empresa.telefone']} />
            <Campo rotulo="E-mail da empresa" valor={rascunho.empresa.email} aoMudar={(v) => mudar('empresa', { ...rascunho.empresa, email: v })} tipo="email" modo="email" maximo={160} erro={erros['empresa.email']} inteiro />
          </div>
          <Secao titulo="Endereço da empresa">
            <BlocoEndereco valor={rascunho.empresa.endereco} aoMudar={(endereco) => mudar('empresa', { ...rascunho.empresa, endereco })} prefixo="empresa.endereco" erros={erros} />
          </Secao>
          <Secao titulo="Sócios">
            <TituloComAjuda chave="assina" titulo="Quem assina pela empresa?" />
            {erros.socios && <span className={estilos.mensagemErro} role="alert">{erros.socios}</span>}
            {rascunho.socios.map((s, i) => (
              <div key={i} className={estilos.socio}>
                <div className={estilos.socioTopo}>
                  <b>Sócio {i + 1}</b>
                  {rascunho.socios.length > 1 && (
                    <button type="button" className={estilos.botaoTexto} onClick={() => mudar('socios', rascunho.socios.filter((_, j) => j !== i).map((x, j, l) => ({ ...x, assina: l.some((y) => y.assina) ? x.assina : j === 0 })))}>
                      Tirar este sócio
                    </button>
                  )}
                </div>
                <label className={estilos.marcar}>
                  <input type="radio" name="quem-assina" checked={s.assina} onChange={() => mudar('socios', rascunho.socios.map((x, j) => ({ ...x, assina: j === i })))} />
                  Este sócio assina o contrato
                </label>
                <BlocoPessoa valor={s.pessoa} aoMudar={(pessoa) => mudar('socios', rascunho.socios.map((x, j) => (j === i ? { ...x, pessoa } : x)))} prefixo={`socios.${i}.pessoa`} erros={erros} contatoOpcional={!s.assina} />
                <Secao titulo="Trabalho e renda (opcional)">
                  <BlocoTrabalho valor={s.trabalho} aoMudar={(trabalho) => mudar('socios', rascunho.socios.map((x, j) => (j === i ? { ...x, trabalho } : x)))} prefixo={`socios.${i}.trabalho`} erros={erros} opcional />
                </Secao>
              </div>
            ))}
            {rascunho.socios.length < 5 && (
              <button type="button" className={estilos.botaoSecundario} onClick={() => mudar('socios', [...rascunho.socios, socioVazio(false)])}>
                + Acrescentar outro sócio
              </button>
            )}
          </Secao>
        </div>
      ) : (
        <BlocoPessoa valor={rascunho.pessoa} aoMudar={(pessoa) => mudar('pessoa', pessoa)} prefixo="pessoa" erros={erros} />
      ),
    conjuge: () => <BlocoConjuge valor={rascunho.conjuge} aoMudar={(conjuge) => mudar('conjuge', conjuge)} prefixo="conjuge" erros={erros} />,
    trabalho: () => <BlocoTrabalho valor={rascunho.trabalho} aoMudar={(trabalho) => mudar('trabalho', trabalho)} prefixo="trabalho" erros={erros} />,
    garantia: () => (
      <div className={estilos.corpo}>
        <TituloComAjuda chave="garantia" titulo="Escolha uma garantia" />
        <Opcoes rotulo="Garantia" duas valor={rascunho.garantia} aoMudar={(v) => mudar('garantia', v)} opcoes={OPCOES_GARANTIA} />
        {erros.garantia && <span className={estilos.mensagemErro} role="alert">{erros.garantia}</span>}
        {rascunho.garantia === 'fiador' && (
          <>
            <Secao titulo="Dados do fiador">
              <TituloComAjuda chave="fiador" titulo="Quem pode ser fiador" />
              <BlocoPessoa valor={rascunho.fiador.pessoa} aoMudar={(pessoa) => mudar('fiador', { ...rascunho.fiador, pessoa })} prefixo="fiador.pessoa" erros={erros} comNaturalidade />
            </Secao>
            {(rascunho.fiador.pessoa.estadoCivil === 'casado' || rascunho.fiador.pessoa.estadoCivil === 'uniao_estavel') && (
              <Secao titulo="Cônjuge do fiador">
                <BlocoConjuge valor={rascunho.fiador.conjuge} aoMudar={(conjuge) => mudar('fiador', { ...rascunho.fiador, conjuge })} prefixo="fiador.conjuge" erros={erros} />
              </Secao>
            )}
            <Secao titulo="Trabalho e renda do fiador">
              <BlocoTrabalho valor={rascunho.fiador.trabalho} aoMudar={(trabalho) => mudar('fiador', { ...rascunho.fiador, trabalho })} prefixo="fiador.trabalho" erros={erros} />
              <Campo rotulo="Imóvel ou veículo quitado" valor={rascunho.fiador.patrimonio} aoMudar={(patrimonio) => mudar('fiador', { ...rascunho.fiador, patrimonio })} multilinha opcional ajuda="patrimonio" maximo={250} />
            </Secao>
          </>
        )}
      </div>
    ),
    referencias: () => (
      <div className={estilos.corpo}>
        <Campo rotulo="Bancos e agências" valor={rascunho.referencias.bancos} aoMudar={(v) => mudar('referencias', { ...rascunho.referencias, bancos: v })} multilinha opcional ajuda="bancos" maximo={1000} />
        <Campo rotulo="Aluguéis anteriores" valor={rascunho.referencias.locacoes} aoMudar={(v) => mudar('referencias', { ...rascunho.referencias, locacoes: v })} multilinha opcional ajuda="locacoes" maximo={1000} />
      </div>
    ),
    documentos: () => (
      <div className={estilos.corpo}>
        <p className={estilos.avisoNeutro}>{AJUDAS.documentos}</p>
        <EtapaDocumentos exigidos={exigidos} arquivos={arquivos} aoMudar={setArquivos} erros={erros} />
      </div>
    ),
    enviar: () => (
      <div className={estilos.corpo}>
        <Resumo rascunho={rascunho} etapas={etapas.map((e) => e.chave)} arquivos={metadados(arquivos, exigidos).length} corrigir={(chave) => irPara(etapas.findIndex((e) => e.chave === chave))} />
        <label className={estilos.marcar}>
          <input type="checkbox" checked={rascunho.aceite} onChange={(e) => mudar('aceite', e.target.checked)} aria-invalid={erros.aceite ? true : undefined} />
          <span>
            Autorizo a E.G.I Empreendimentos a usar estes dados e documentos <b>só</b> para analisar esta locação e preparar o contrato. Se a locação não for fechada, eles são apagados em até 6 meses.
          </span>
        </label>
        {erros.aceite && <span className={estilos.mensagemErro} role="alert">{erros.aceite}</span>}
        <Turnstile key={tentativa} aoReceber={aoReceberToken} aoFalhar={aoFalharTurnstile} aoPedirCaixa={aoPedirCaixa} />
        {problemaTurnstile && <p className={estilos.aviso}>{problemaTurnstile}</p>}
        {enviando && (
          <p className={estilos.avisoNeutro} role="status">
            {envio.total ? `Enviando os documentos (${envio.feitos} de ${envio.total})… não feche esta página.` : 'Enviando a ficha…'}
          </p>
        )}
        {envio.mensagem && (
          <p className={estilos.aviso} role="alert">
            {envio.mensagem}
          </p>
        )}
      </div>
    ),
  }

  const ultima = atual === etapas.length - 1
  return (
    <main className={estilos.pagina}>
      <p className={estilos.kicker}>Ficha cadastral · E.G.I Empreendimentos</p>
      <h1 className={estilos.titulo}>{unidade ? `${unidade.identificacao} · ${unidade.imovel}` : 'Alugar com a EGI'}</h1>
      <p className={estilos.subtitulo}>Leva uns 10 minutos. Tenha à mão os documentos ou o celular para fotografá-los. O que você preencher fica guardado neste aparelho até enviar.</p>

      <div className={estilos.progresso}>
        <div className={estilos.progressoTexto}>
          <span>
            Etapa {atual + 1} de {etapas.length}
          </span>
          <b>{etapa.titulo}</b>
        </div>
        <div className={estilos.barra} role="progressbar" aria-valuemin={1} aria-valuemax={etapas.length} aria-valuenow={atual + 1} aria-label="Andamento da ficha">
          <div className={estilos.barraCheia} style={{ width: `${((atual + 1) / etapas.length) * 100}%` }} />
        </div>
      </div>

      <div className={estilos.cartao} ref={cartao}>
        <h2 className={estilos.pergunta} ref={titulo} tabIndex={-1}>
          {etapa.pergunta}
        </h2>
        <div className={estilos.corpo}>{conteudo[etapa.chave]()}</div>
      </div>

      <div className={estilos.navegacao}>
        {atual > 0 && (
          <button type="button" className={estilos.botaoVoltar} onClick={() => irPara(atual - 1)} disabled={enviando}>
            Voltar
          </button>
        )}
        {ultima ? (
          <button type="button" className={estilos.botaoPrincipal} onClick={() => void enviar()} disabled={enviando}>
            {enviando ? 'Enviando…' : 'Enviar ficha'}
          </button>
        ) : (
          <button type="button" className={estilos.botaoPrincipal} onClick={continuar}>
            Continuar
          </button>
        )}
      </div>

      <p className={estilos.esquecer}>
        Está num computador de outra pessoa?{' '}
        <button type="button" className={estilos.botaoTexto} onClick={apagarTudo}>
          Apagar o que preenchi neste aparelho
        </button>
      </p>
    </main>
  )
}

function Resumo({ rascunho: r, etapas, arquivos, corrigir }: { rascunho: Rascunho; etapas: ChaveEtapa[]; arquivos: number; corrigir: (e: ChaveEtapa) => void }) {
  const estado = (e: string) => ESTADOS_CIVIS[e as keyof typeof ESTADOS_CIVIS] ?? ''
  const blocos: { chave: ChaveEtapa; titulo: string; linhas: string[] }[] = [
    { chave: 'imovel', titulo: 'O imóvel', linhas: [r.uso.imovelDesejado, r.uso.finalidade, r.uso.prazoMeses ? `${r.uso.prazoMeses} meses` : ''] },
    {
      chave: 'dados',
      titulo: r.tipo === 'juridica' ? 'Empresa' : 'Seus dados',
      linhas:
        r.tipo === 'juridica'
          ? [`${r.empresa.razaoSocial} · CNPJ ${r.empresa.cnpj}`, ...r.socios.map((s) => `${s.pessoa.nome}${s.assina ? ' (assina)' : ''}`)]
          : [`${r.pessoa.nome} · CPF ${r.pessoa.cpf}`, estado(r.pessoa.estadoCivil), `${r.pessoa.celular} · ${r.pessoa.email}`],
    },
    { chave: 'conjuge', titulo: 'Cônjuge', linhas: [r.conjuge.nome] },
    { chave: 'trabalho', titulo: 'Trabalho e renda', linhas: [`${r.trabalho.empresa} · ${r.trabalho.funcao}`, r.trabalho.renda ? `R$ ${r.trabalho.renda} por mês` : ''] },
    { chave: 'garantia', titulo: 'Garantia', linhas: [r.garantia ? GARANTIAS[r.garantia] : '', r.garantia === 'fiador' ? `Fiador: ${r.fiador.pessoa.nome}` : ''] },
    { chave: 'documentos', titulo: 'Documentos', linhas: [`${arquivos} arquivo${arquivos === 1 ? '' : 's'}`] },
  ]
  return (
    <div className={estilos.resumo}>
      {blocos
        .filter((b) => etapas.includes(b.chave))
        .map((b) => (
          <div key={b.chave} className={estilos.resumoBloco}>
            <div className={estilos.resumoTopo}>
              <b>{b.titulo}</b>
              <button type="button" className={estilos.botaoTexto} onClick={() => corrigir(b.chave)}>
                Corrigir
              </button>
            </div>
            {b.linhas.filter(Boolean).map((l, i) => (
              <span key={i} className={estilos.resumoLinha}>
                {l}
              </span>
            ))}
          </div>
        ))}
    </div>
  )
}
