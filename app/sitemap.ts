import type { MetadataRoute } from 'next'
import { listarSlugsPublicados } from '@/lib/dados/empreendimentos'
import { URL_SITE } from '@/lib/site'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await listarSlugsPublicados()

  const fixas: MetadataRoute.Sitemap = [
    { url: URL_SITE, priority: 1 },
    { url: `${URL_SITE}/empreendimentos`, priority: 0.9 },
    { url: `${URL_SITE}/sobre`, priority: 0.5 },
    { url: `${URL_SITE}/contato`, priority: 0.5 },
  ]

  return [
    ...fixas,
    ...slugs.map((slug) => ({
      url: `${URL_SITE}/empreendimentos/${slug}`,
      priority: 0.8,
    })),
  ]
}
