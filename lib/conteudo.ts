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
 * Vai como texto, não como logotipo: os arquivos de marca no PPTX estão em
 * 24×24 px, tamanho de ícone de lista, inservível para exibição.
 */
export const CLIENTES: { grupo: string; marcas: string[] }[] = [
  {
    grupo: 'Varejo',
    marcas: ['Grupo Mateus', 'Shineray do Brasil', 'Selfit Academias', 'Skyfit Academia', 'Vetor Móveis'],
  },
  {
    grupo: 'Público e financeiro',
    marcas: [
      'Caixa Econômica Federal',
      'Banco BTG Pactual',
      'Governo do Maranhão',
      'Prefeitura de S. J. Ribamar',
      'Instituto Viver',
    ],
  },
  {
    grupo: 'Saúde e lazer',
    marcas: ['Nefroclínicas', 'Clínica Performe', 'Grupo Pague Menos', 'ODT Beach Tênis'],
  },
]

export const PASSOS: { titulo: string; texto: string }[] = [
  {
    titulo: 'Escolha o espaço',
    texto:
      'O portfólio mostra unidade por unidade, com a situação de cada uma. O que está livre está marcado como livre.',
  },
  {
    titulo: 'Fale direto conosco',
    texto:
      'Uma mensagem no WhatsApp já identifica o imóvel e a unidade. Sem formulário, sem espera por retorno de corretor.',
  },
  {
    titulo: 'Negocie com o proprietário',
    texto:
      'Os imóveis são nossos. Não há intermediação nem cadeia de comissões entre você e quem decide.',
  },
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
