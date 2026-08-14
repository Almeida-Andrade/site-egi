import type { TipoEmpreendimento } from '@/lib/tipos'

/**
 * Conteúdo editorial da home. Fica fora do banco porque não é portfólio: são
 * textos institucionais que mudam por decisão de marketing, não por contrato
 * assinado. O painel administra imóveis, não copy.
 */

export interface Categoria {
  tipo: TipoEmpreendimento
  rotulo: string
  descricao: string
}

export const CATEGORIAS: Categoria[] = [
  {
    tipo: 'centro_comercial',
    rotulo: 'Centros comerciais',
    descricao: 'Galerias de lojas em avenidas de grande circulação.',
  },
  {
    tipo: 'galpao',
    rotulo: 'Galpões',
    descricao: 'Estruturas de grande porte para atacado e logística.',
  },
  {
    tipo: 'residencial',
    rotulo: 'Residenciais',
    descricao: 'Condomínios de apartamentos e kitnets para locação.',
  },
  {
    tipo: 'sala_avulsa',
    rotulo: 'Salas comerciais',
    descricao: 'Conjuntos em edifícios empresariais consolidados.',
  },
]

/**
 * Marcas que ocupam imóveis da EGI, como a própria empresa divulga no slide
 * "Nossos clientes e parceiros" do portfólio comercial.
 *
 * Os arquivos vieram do site oficial de cada marca, exceto Caixa, Governo do
 * Maranhão e Shineray, que saíram do Wikimedia Commons. Os do PPTX não serviam:
 * estão em 24×24 px, tamanho de ícone de lista.
 *
 * A parede é monocromática. Além de unificar nove identidades de cores
 * diferentes, resolve o logo do Grupo Mateus, que só existe em versão branca —
 * o filtro o transforma em silhueta escura como todos os outros.
 *
 * Ficaram de fora, por não terem arquivo utilizável: Skyfit, Vetor Móveis,
 * Clínica Performe, ODT Beach Tênis e Instituto Viver.
 */
export interface Marca {
  nome: string
  arquivo: string
  /** Proporção largura/altura, para o navegador reservar o espaço certo. */
  proporcao: number
}

export const MARCAS: Marca[] = [
  { nome: 'Grupo Mateus', arquivo: '/marcas/grupo-mateus.png', proporcao: 710 / 119 },
  { nome: 'Caixa Econômica Federal', arquivo: '/marcas/caixa.svg', proporcao: 3.1 },
  { nome: 'Selfit Academias', arquivo: '/marcas/selfit.svg', proporcao: 2.6 },
  { nome: 'Banco BTG Pactual', arquivo: '/marcas/btg-pactual.svg', proporcao: 4.2 },
  { nome: 'Governo do Maranhão', arquivo: '/marcas/governo-ma.png', proporcao: 446 / 137 },
  { nome: 'Grupo Pague Menos', arquivo: '/marcas/pague-menos.svg', proporcao: 2.9 },
  { nome: 'Prefeitura de São José de Ribamar', arquivo: '/marcas/ribamar.png', proporcao: 513 / 200 },
  { nome: 'Shineray do Brasil', arquivo: '/marcas/shineray.png', proporcao: 241 / 200 },
  { nome: 'Nefroclínicas', arquivo: '/marcas/nefroclinicas.svg', proporcao: 4.4 },
]

/** Números do Center Valley conforme o portfólio de obras do grupo. */
export const CENTER_VALLEY = {
  cidade: 'Pedreiras — MA',
  entrega: 'Novembro de 2021',
  destaques: [
    { valor: '6.880 m²', rotulo: 'Área construída' },
    { valor: '68', rotulo: 'Lojas e megalojas' },
  ],
  equipamentos: [
    'Policlínica do Médio Mearim',
    'Cinema e parque infantil',
    'Academia',
    'Praça de alimentação',
  ],
}
