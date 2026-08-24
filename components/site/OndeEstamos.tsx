import estilos from './OndeEstamos.module.css'

const MAPA =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3986.04582848978!2d-44.27923842384083!3d-2.4917785974868836!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7f68d78e02c3513%3A0xc3cf49f3fcb35794!2sEGI%20Empreedimentos!5e0!3m2!1spt-BR!2sbr!4v1786971662830!5m2!1spt-BR!2sbr'
const FICHA = 'https://maps.app.goo.gl/eQFgEmat3vfh1Wz97'

export function OndeEstamos() {
  return (
    <section className={estilos.secao} aria-labelledby="titulo-onde">
      <div className={estilos.texto}>
        <p className={estilos.kicker}>Onde estamos</p>
        <h2 id="titulo-onde" className={estilos.titulo}>
          Calhau, São Luís
        </h2>
        <address className={estilos.endereco}>
          Av. dos Sambaquis, 33 — Ed. Galeria A
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
          <a
            className={estilos.secundaria}
            href="https://wa.me/5598984812793"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp (98) 98481-2793
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
