// As datas que limitam os calendários da ficha. A regra que vale é a de lib/ficha-cadastral.ts;
// aqui só se evita que o calendário ofereça um dia que ela vai recusar.

/** Hoje em São Luís, AAAA-MM-DD. */
export const hojeEmSaoLuis = (): string => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Fortaleza' }).format(new Date())

/** A mesma data `anos` à frente (negativo: para trás). */
export function anosDepois(iso: string, anos: number): string {
  return `${String(Number(iso.slice(0, 4)) + anos).padStart(4, '0')}${iso.slice(4)}`
}
