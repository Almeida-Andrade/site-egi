import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// A regra da ficha é a mesma aqui e no OMNIS (a Edge Function valida com ela). O teste só roda onde o
// clone do OMNIS está ao lado; no CI do site ele é pulado.
const OMNIS = ['../omnis/lib/ficha-cadastral.ts', '../omnis-extra/lib/ficha-cadastral.ts', '../omnis-ajustes/lib/ficha-cadastral.ts'].find((c) => existsSync(c))

describe('regra da ficha', () => {
  it.skipIf(!OMNIS)('lib/ficha-cadastral.ts é igual à do OMNIS', () => {
    // A cópia de trabalho do git pode vir com CRLF de um lado e LF do outro: compara o texto.
    const texto = (c: string) => readFileSync(c, 'utf8').replace(/\r\n/g, '\n')
    expect(texto('lib/ficha-cadastral.ts')).toBe(texto(OMNIS!))
  })
})
