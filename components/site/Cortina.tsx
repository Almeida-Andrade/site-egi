import estilos from './Cortina.module.css'

const CHAVE = 'egi:cortina'
const TETO_MS = 1200
const SAIDA_MS = 420

export function Cortina() {
  const script = `(function(){
  var c = document.getElementById('cortina');
  if (!c) return;
  var vista = false;
  try {
    vista = sessionStorage.getItem('${CHAVE}') === '1';
    sessionStorage.setItem('${CHAVE}', '1');
  } catch (e) {}
  function ocultar() { c.dataset.oculta = 'true'; }
  if (vista || matchMedia('(prefers-reduced-motion: reduce)').matches) { ocultar(); return; }
  var raiz = document.documentElement;
  raiz.style.overflow = 'hidden';
  var saiu = false;
  function sair() {
    if (saiu) return;
    saiu = true;
    raiz.style.overflow = '';
    c.dataset.saindo = 'true';
    setTimeout(ocultar, ${SAIDA_MS});
  }
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(function(){
    setTimeout(sair, 220);
  });
  setTimeout(sair, ${TETO_MS});
})();`

  return (
    <>
      <div id="cortina" className={estilos.cortina} aria-hidden suppressHydrationWarning>
        <span className={estilos.marca} />
      </div>
      <script dangerouslySetInnerHTML={{ __html: script }} />
    </>
  )
}
