// Os scripts embutidos do layout. Moram aqui porque a CSP das páginas da ficha os libera pelo hash
// do texto (lib/ficha/seguranca.ts): mudou o script aqui, o hash acompanha sozinho.

export const SCRIPT_MARCA_JS = `document.documentElement.classList.add('js')`

const CHAVE_CORTINA = 'egi:cortina'
const TETO_CORTINA_MS = 1200
const SAIDA_CORTINA_MS = 420

export const SCRIPT_CORTINA = `(function(){
  var c = document.getElementById('cortina');
  if (!c) return;
  var vista = false;
  try {
    vista = sessionStorage.getItem('${CHAVE_CORTINA}') === '1';
    sessionStorage.setItem('${CHAVE_CORTINA}', '1');
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
    setTimeout(ocultar, ${SAIDA_CORTINA_MS});
  }
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(function(){
    setTimeout(sair, 220);
  });
  setTimeout(sair, ${TETO_CORTINA_MS});
})();`

export const SCRIPTS_INICIAIS = [SCRIPT_MARCA_JS, SCRIPT_CORTINA]
