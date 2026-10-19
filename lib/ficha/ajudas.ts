// O texto do botão (?) dos campos difíceis; os outros levam só um exemplo dentro do campo. Curto, sem juridiquês, no tom de quem explica no balcão.

export const AJUDAS = {
  imovelDesejado:
    'Se já sabe, diga qual imóvel ou sala quer (ex.: "Sala 12 do Ana Diná"). Se ainda não decidiu, conte o que procura (ex.: "loja de uns 40 m² perto da Cohama").',
  tipo: 'Pessoa física é quando o contrato fica no seu nome (CPF). Empresa é quando fica no nome do CNPJ, assinado por um sócio.',
  rgOrgao: 'Quem emitiu o RG, escrito na própria carteira. Ex.: SSP/MA, SESP/PI, DETRAN/MA.',
  estadoCivil:
    'Como está no documento. União estável é quando o casal vive junto como família sem ter casado no cartório. Casado ou em união estável, vamos pedir os dados do cônjuge.',
  renda:
    'O que entra por mês, antes dos descontos, em reais. Você vai mandar o comprovante na etapa de documentos (contracheque, extrato ou declaração do Imposto de Renda).',
  razaoSocial: 'O nome da empresa como está no cartão do CNPJ (não o nome da fachada).',
  assina:
    'O contrato da empresa é assinado por um sócio (ou administrador) que tem poder para isso no contrato social. Marque quem vai assinar.',
  garantia:
    'A garantia protege a EGI se o aluguel atrasar. A lei permite só uma por contrato: fiador, caução (depósito em dinheiro de até 3 aluguéis, devolvido no fim) ou seguro-fiança (contratado numa seguradora). Na dúvida, escolha "Quero conversar com a EGI".',
  fiador:
    'Fiador é a pessoa que se compromete a pagar se você não pagar. Precisa ter renda comprovada e, de preferência, um imóvel ou veículo quitado. Se o fiador for casado, o cônjuge dele também assina.',
  documentos:
    'Tire a foto com o documento sobre uma mesa, com boa luz e sem cortar as bordas. Pode mandar mais de um arquivo por item (frente e verso). Vale foto (JPG, PNG) ou PDF, até 10 MB cada.',
} as const

export type ChaveAjuda = keyof typeof AJUDAS
