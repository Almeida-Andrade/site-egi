import type { Imagem, TipoImagem } from '@/lib/tipos'

// Regras puras sobre as imagens de um imóvel. A coluna `tipo` chegou com a
// vitrine à venda (CRM 0131/0133); imagem antiga sem tipo conta como foto.

export function tipoDe(imagem: Pick<Imagem, 'tipo'>): TipoImagem {
  return imagem.tipo === 'planta' || imagem.tipo === 'logo' ? imagem.tipo : 'foto'
}

/** Só as fotos, capa primeiro e depois pela ordem — o que a galeria mostra. */
export function fotosDe(imagens: Imagem[]): Imagem[] {
  return imagens
    .filter((i) => tipoDe(i) === 'foto')
    .sort((a, b) => Number(b.capa) - Number(a.capa) || a.ordem - b.ordem)
}

/** A capa é sempre uma foto: logo e planta nunca servem, mesmo marcadas. */
export function capaDe(imagens: Imagem[]): Imagem | null {
  return fotosDe(imagens)[0] ?? null
}

/** A planta ou a logo do imóvel (a primeira pela ordem), ou nulo. */
export function pecaDe(imagens: Imagem[], tipo: 'planta' | 'logo'): Imagem | null {
  return (
    imagens
      .filter((i) => tipoDe(i) === tipo)
      .sort((a, b) => a.ordem - b.ordem)[0] ?? null
  )
}
