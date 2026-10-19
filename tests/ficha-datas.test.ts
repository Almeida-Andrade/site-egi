import { describe, expect, it } from 'vitest'
import { anosDepois } from '@/lib/ficha/datas'

describe('datas dos calendários da ficha', () => {
  it('soma e tira anos da data ISO', () => {
    expect(anosDepois('2026-10-19', 1)).toBe('2027-10-19')
    expect(anosDepois('2026-10-19', -120)).toBe('1906-10-19')
  })
})
