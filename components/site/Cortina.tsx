import estilos from './Cortina.module.css'

const CHAVE = 'egi:cortina'
const TETO_MS = 1200
const SAIDA_MS = 420

/**
 * Cortina de abertura, só na primeira visita da aba.
 *
 * Vem no HTML e é controlada por um script inline, não por React: uma cortina
 * que só aparece depois do bundle carregar chega tarde justamente na conexão
 * ruim, que é quando ela existiria para servir.
 *
 * A página é estática e carrega rápido, então a cortina não pode virar espera
 * inventada. Ela sai quando as fontes ficam prontas — a causa do salto de
 * layout mais visível aqui — e tem teto de tempo, para nunca prender o
 * visitante num recurso que travou.
 *
 * Fica escondida sem JavaScript (a regra vive sob `html.js`): sem isso um
 * navegador com script desligado veria a página coberta para sempre.
 */
export function Cortina() {
  const script = `(function(){
  var c = document.getElementById('cortina');
  if (!c) return;
  var vista = false;
  try {
    vista = sessionStorage.getItem('${CHAVE}') === '1';
    sessionStorage.setItem('${CHAVE}', '1');
  } catch (e) {}
  if (vista || matchMedia('(prefers-reduced-motion: reduce)').matches) { c.remove(); return; }
  var raiz = document.documentElement;
  raiz.style.overflow = 'hidden';
  var saiu = false;
  function sair() {
    if (saiu) return;
    saiu = true;
    raiz.style.overflow = '';
    c.dataset.saindo = 'true';
    setTimeout(function(){ c.remove(); }, ${SAIDA_MS});
  }
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(function(){
    setTimeout(sair, 220);
  });
  setTimeout(sair, ${TETO_MS});
})();`

  return (
    <>
      <div id="cortina" className={estilos.cortina} aria-hidden>
        <span className={estilos.marca} />
      </div>
      <script dangerouslySetInnerHTML={{ __html: script }} />
    </>
  )
}
