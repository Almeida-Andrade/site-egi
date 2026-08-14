import estilos from './MapaEmbed.module.css'

export function MapaEmbed({ url, titulo }: { url: string; titulo: string }) {
  return (
    <iframe
      className={estilos.mapa}
      src={url}
      title={`Localização de ${titulo}`}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
    />
  )
}
