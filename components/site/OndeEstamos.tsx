import estilos from './OndeEstamos.module.css'

/**
 * Coordenadas da ficha da EGI no Google Maps. O embed por consulta não pede
 * chave de API — diferente do Maps Embed API, que pediria — então o mapa
 * funciona sem nada configurado no servidor.
 */
const COORDENADAS = '-2.491993,-44.2708699'
const MAPA = `https://maps.google.com/maps?q=${COORDENADAS}&z=16&hl=pt-BR&output=embed`
const FICHA = 'https://maps.app.goo.gl/7V8apakRoyCCdc1w5'

export function OndeEstamos() {
  return (
    <section className={estilos.secao} aria-labelledby="titulo-onde">
      <div className={estilos.texto}>
        <p className={estilos.kicker}>Onde estamos</p>
        <h2 id="titulo-onde" className={estilos.titulo}>
          Calhau, São Luís
        </h2>
        <address className={estilos.endereco}>
          Av. dos Sambaquis, 34 — Ed. Galeria A
          <br />
          Calhau, São Luís — MA
        </address>
        <p className={estilos.nota}>
          Nosso escritório fica na cobertura da Galeria A, um dos imóveis do próprio
          portfólio.
        </p>

        <div className={estilos.acoes}>
          <a
            className={estilos.principal}
            href={FICHA}
            target="_blank"
            rel="noopener noreferrer"
          >
            Abrir no Google Maps →
          </a>
          <a className={estilos.secundaria} href="tel:+559832355008">
            (98) 3235-5008
          </a>
        </div>
      </div>

      <div className={estilos.mapa}>
        <iframe
          src={MAPA}
          title="Mapa da sede da E.G.I Empreendimentos, na Av. dos Sambaquis, Calhau"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
    </section>
  )
}
