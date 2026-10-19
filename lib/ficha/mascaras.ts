// Máscaras enquanto a pessoa digita. Só formatam: quem confere é a validação (lib/ficha-cadastral.ts).

const digitos = (v: string, max: number) => v.replace(/\D/g, '').slice(0, max)

export function mascaraCpf(v: string): string {
  const d = digitos(v, 11)
  return d.replace(/^(\d{3})(\d)/, '$1.$2').replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2')
}

export function mascaraCnpj(v: string): string {
  const d = digitos(v, 14)
  return d
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
}

export function mascaraCep(v: string): string {
  const d = digitos(v, 8)
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d
}

export function mascaraTelefone(v: string): string {
  const d = digitos(v, 11)
  if (d.length <= 2) return d
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

/** Só número, vírgula e ponto: "R$ 5.000,00" fica como a pessoa digitou, sem letra. */
export function mascaraDinheiro(v: string): string {
  return v.replace(/[^\d.,]/g, '').slice(0, 16)
}
