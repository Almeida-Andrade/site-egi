import type { MetadataRoute } from 'next'
import { listarRotasPublicadas } from '@/lib/dados/empreendimentos'
import { URL_SITE } from '@/lib/site'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const rotas = await listarRotasPublicadas()

  const fixas: MetadataRoute.Sitemap = [
    { url: URL_SITE, priority: 1, changeFrequency: 'daily' },
    { url: `${URL_SITE}/empreendimentos`, priority: 0.9, changeFrequency: 'daily' },
    { url: `${URL_SITE}/sobre`, priority: 0.5, changeFrequency: 'yearly' },
    { url: `${URL_SITE}/contato`, priority: 0.5, changeFrequency: 'yearly' },
  ]

  return [
    ...fixas,
    ...rotas.map(({ slug, atualizadoEm }) => ({
      url: `${URL_SITE}/empreendimentos/${slug}`,
      lastModified: new Date(atualizadoEm),
      priority: 0.8,
      changeFrequency: 'weekly' as const,
    })),
  ]
}
