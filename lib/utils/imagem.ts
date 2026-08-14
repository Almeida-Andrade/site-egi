export function calcularDimensoes(
  largura: number,
  altura: number,
  ladoMax: number,
): { largura: number; altura: number } {
  const maior = Math.max(largura, altura)
  if (maior <= ladoMax) return { largura, altura }

  const fator = ladoMax / maior
  return {
    largura: Math.round(largura * fator),
    altura: Math.round(altura * fator),
  }
}

/**
 * Redimensiona e converte para WebP no navegador. Uma foto de celular de 8 MB
 * costuma sair com cerca de 300 KB. Roda antes do upload para que a cota de
 * 1 GB do plano free não seja consumida por original de câmera.
 */
export async function comprimirImagem(arquivo: File, ladoMax = 1600): Promise<Blob> {
  const bitmap = await createImageBitmap(arquivo)
  const { largura, altura } = calcularDimensoes(bitmap.width, bitmap.height, ladoMax)

  const canvas = document.createElement('canvas')
  canvas.width = largura
  canvas.height = altura

  const contexto = canvas.getContext('2d')
  if (!contexto) throw new Error('Canvas indisponível neste navegador')
  contexto.drawImage(bitmap, 0, 0, largura, altura)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolver) =>
    canvas.toBlob(resolver, 'image/webp', 0.82),
  )
  if (!blob) throw new Error('Falha ao comprimir a imagem')
  return blob
}
