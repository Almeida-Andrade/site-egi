const NUMERO = '5598984812793'

export function montarLinkWhatsApp(args: {
  empreendimento: string
  unidade?: string
}): string {
  const alvo = args.unidade
    ? `${args.unidade} do ${args.empreendimento}`
    : args.empreendimento

  const texto = `Olá! Tenho interesse em ${alvo}. Vi no site.`
  return `https://wa.me/${NUMERO}?text=${encodeURIComponent(texto)}`
}
