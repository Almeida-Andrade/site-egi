// O texto do botão (?) de cada campo difícil. Curto, sem juridiquês, no tom de quem explica no balcão.

export const AJUDAS = {
  finalidade:
    'Conte em poucas palavras o que vai funcionar no imóvel. Ex.: "loja de roupas", "consultório odontológico", "moradia da família".',
  imovelDesejado:
    'Se já sabe, diga qual imóvel ou sala quer (ex.: "Sala 12 do Ana Diná"). Se ainda não decidiu, conte o que procura (ex.: "loja de uns 40 m² perto da Cohama").',
  entradaDesejada: 'A data em que você gostaria de receber as chaves. Pode ser aproximada: a data certa é combinada com a EGI.',
  prazoMeses: 'Por quanto tempo você pensa em alugar, em meses. Ex.: 30 meses são 2 anos e meio. Pode deixar em branco se ainda não sabe.',
  tipo: 'Pessoa física é quando o contrato fica no seu nome (CPF). Empresa é quando fica no nome do CNPJ, assinado por um sócio.',
  cpf: 'O número do CPF, com 11 dígitos. Pode digitar só os números.',
  rg: 'O número da carteira de identidade (RG). Se usar a CNH como identidade, coloque o número do RG que aparece nela.',
  rgOrgao: 'Quem emitiu o RG, escrito na própria carteira. Ex.: SSP/MA, SESP/PI, DETRAN/MA.',
  nascimento: 'A data de nascimento como está no documento.',
  nacionalidade: 'Ex.: brasileira. Estrangeiro: escreva o país (ex.: portuguesa).',
  estadoCivil:
    'Como está no documento. União estável é quando o casal vive junto como família sem ter casado no cartório. Casado ou em união estável, vamos pedir os dados do cônjuge.',
  profissao: 'O que você faz. Ex.: comerciante, enfermeira, autônomo, aposentado.',
  cep: 'O CEP do endereço. Ao digitar os 8 números, a rua e o bairro aparecem sozinhos (confira).',
  celular: 'Um celular com WhatsApp, com DDD. É por ele que a EGI vai falar com você.',
  email: 'Um e-mail que você usa. O contrato pode ser enviado por ele.',
  renda:
    'O que entra por mês, antes dos descontos, em reais. Você vai mandar o comprovante na etapa de documentos (contracheque, extrato ou declaração do Imposto de Renda).',
  empresaTrabalho: 'O nome da empresa ou do lugar onde trabalha. Autônomo: escreva "autônomo" e o que faz.',
  razaoSocial: 'O nome da empresa como está no cartão do CNPJ (não o nome da fachada).',
  cnpj: 'O número do CNPJ da empresa, com 14 dígitos.',
  assina:
    'O contrato da empresa é assinado por um sócio (ou administrador) que tem poder para isso no contrato social. Marque quem vai assinar.',
  garantia:
    'A garantia protege a EGI se o aluguel atrasar. A lei permite só uma por contrato: fiador, caução (depósito em dinheiro de até 3 aluguéis, devolvido no fim) ou seguro-fiança (contratado numa seguradora). Na dúvida, escolha "Quero conversar com a EGI".',
  fiador:
    'Fiador é a pessoa que se compromete a pagar se você não pagar. Precisa ter renda comprovada e, de preferência, um imóvel ou veículo quitado. Se o fiador for casado, o cônjuge dele também assina.',
  patrimonio:
    'Algum imóvel ou veículo do fiador que esteja quitado (sem financiamento). Escreva o endereço do imóvel ou a placa do veículo.',
  bancos: 'Os bancos em que você tem conta, com a agência. Ex.: "Caixa, agência 0029". Não precisa do número da conta.',
  locacoes: 'Se já alugou antes, diga onde e com quem (imobiliária ou dono). Ajuda na análise, mas é opcional.',
  documentos:
    'Tire a foto com o documento sobre uma mesa, com boa luz e sem cortar as bordas. Pode mandar mais de um arquivo por item (frente e verso). Vale foto (JPG, PNG) ou PDF, até 10 MB cada.',
} as const

export type ChaveAjuda = keyof typeof AJUDAS
