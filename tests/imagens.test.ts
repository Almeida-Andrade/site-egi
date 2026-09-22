import { describe, it, expect } from 'vitest'
import { capaDe, fotosDe, pecaDe, tipoDe } from '@/lib/imagens'
import type { Imagem } from '@/lib/tipos'

const img = (p: Partial<Imagem> & { id: string }): Imagem => ({
  storage_path: '', url: `https://x/${p.id}`, alt: null, capa: false, ordem: 0, tipo: 'foto', ...p,
})

describe('imagens por tipo', () => {
  const imagens = [
    img({ id: 'logo', tipo: 'logo', capa: true, ordem: 0 }),
    img({ id: 'f2', ordem: 2 }),
    img({ id: 'planta', tipo: 'planta', ordem: 1 }),
    img({ id: 'f1', ordem: 1 }),
    img({ id: 'f3', ordem: 3, capa: true }),
  ]

  it('a galeria tem só fotos, capa primeiro e depois pela ordem', () => {
    expect(fotosDe(imagens).map((i) => i.id)).toEqual(['f3', 'f1', 'f2'])
  })

  it('a capa é sempre uma foto, mesmo com a logo marcada como capa', () => {
    expect(capaDe(imagens)?.id).toBe('f3')
    expect(capaDe([img({ id: 'logo', tipo: 'logo', capa: true })])).toBeNull()
    expect(capaDe([])).toBeNull()
  })

  it('planta e logo saem por tipo', () => {
    expect(pecaDe(imagens, 'planta')?.id).toBe('planta')
    expect(pecaDe(imagens, 'logo')?.id).toBe('logo')
    expect(pecaDe([img({ id: 'f' })], 'logo')).toBeNull()
  })

  it('imagem antiga sem tipo válido conta como foto', () => {
    expect(tipoDe({ tipo: undefined as unknown as Imagem['tipo'] })).toBe('foto')
    expect(tipoDe({ tipo: 'x' as Imagem['tipo'] })).toBe('foto')
  })
})
