import { SCRIPT_CORTINA } from '@/lib/scripts-iniciais'
import estilos from './Cortina.module.css'

export function Cortina() {
  return (
    <>
      <div id="cortina" className={estilos.cortina} aria-hidden suppressHydrationWarning>
        <span className={estilos.marca} />
      </div>
      <script dangerouslySetInnerHTML={{ __html: SCRIPT_CORTINA }} />
    </>
  )
}
