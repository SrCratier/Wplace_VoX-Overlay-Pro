== VoX - Overlay Pro: Guía de Usuario Completa -_-/ ==

¡Bienvenido a VoX - Overlay Pro! Esta guía te ayudará a dominar todas las herramientas que el script pone a tu disposición, desde colocar tu primer diseño hasta usar las funciones más avanzadas para coordinar y planificar.

--- 1. Instalación ---

Para usar el script, primero necesitas una extensión de navegador llamada Tampermonkey.

1. Instala Tampermonkey:
    * Para Chrome ( https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo )
    * Para Firefox ( https://addons.mozilla.org/es/firefox/addon/tampermonkey/ )
    * Para otros navegadores ( https://www.tampermonkey.net/ )

2. Instala el Script:
    Una vez tengas Tampermonkey, simplemente ve a la página de la Release en GitHub y haz clic en el archivo WplacePro-VoX.user.js. Tampermonkey se abrirá automáticamente y te pedirá que instales el script.

--- 2. Tu Primer Overlay: Pasos Esenciales ---

Esta es la función principal del script. Sigue estos tres pasos para colocar tu primer diseño sobre el lienzo.

Paso 1: Crear un Nuevo Overlay
En el panel del script, ve a la pestaña Overlays y haz clic en el botón "+ Add". Esto creará un nuevo "espacio" para tu imagen.

Paso 2: Añadir tu Imagen
Con el nuevo overlay seleccionado, ve a la pestaña Editor. Tienes dos formas de añadir tu imagen:
*   Desde una URL: Pega un enlace directo a una imagen (que termine en .png, .jpg, etc.) en el campo de texto y haz clic en "Cargar".
*   Desde un Archivo Local: Haz clic en el cuadro punteado o arrastra y suelta un archivo de imagen desde tu ordenador. (Nota: los overlays con imágenes locales no se pueden exportar o compartir con otros).

Paso 3: Fijar la Posición (¡El paso más importante!)
Una vez cargada la imagen, el script necesita saber dónde colocarla en el lienzo.
1.  Haz clic en el botón "Set Position: OFF" para activarlo. Cambiará a "Set Position: ON".
2.  Ahora, ve al lienzo del juego y haz clic con el botón izquierdo en el píxel exacto que corresponde a la esquina superior izquierda (0,0) de tu imagen.
3.  ¡Listo! El script fijará la imagen en esa coordenada. El modo "Set Position" se desactivará automáticamente.

--- 3. El Panel Principal: Un Vistazo General ---

La interfaz está diseñada para ser potente pero intuitiva. Aquí tienes un resumen de los controles principales:

*   "Overlay: ON/OFF": Activa o desactiva la visualización de todos tus overlays.
*   "Mode: Minify": Cambia cómo se muestra el overlay.
    *   Minify (Recomendado): Muestra tu diseño como una cuadrícula de puntos, permitiéndote ver el lienzo debajo.
    *   Behind/Above: Muestra la imagen completa por detrás o por delante del lienzo.
    *   Original: No modifica el lienzo, ideal para ver el estado real del mural.
*   "Show Errors: ON/OFF": Resalta en rojo los píxeles del lienzo que no coinciden con tu diseño.
*   "Set Position: ON/OFF": Activa el modo para fijar la posición de tu imagen en el lienzo.

--- 4. Funciones Detalladas por Pestaña ---

- Pestaña "Overlays" -

Aquí gestionas todas tus imágenes.

*   Activar un Overlay: Haz clic en el botón de radio (⚫) junto al nombre para seleccionarlo como el overlay activo. Solo uno puede estar activo a la vez.
*   Habilitar/Deshabilitar: Usa la casilla de verificación (☑) para mostrar u ocultar un overlay específico sin tener que borrarlo.
*   Previsualización: Al seleccionar un overlay con imagen, aparecerá una vista previa en la parte inferior para que sepas cuál estás editando.
*   Importar/Exportar: Comparte tus diseños con otros usando los botones "Import" y "Export".

- Pestaña "Editor" -

Aquí ajustas el overlay que tienes activo.

*   Nombre: Cambia el nombre de tu overlay para organizarte mejor.
*   Herramientas de Imagen:
    *   "Save 💾": Descarga la versión actual de la imagen del overlay a tu ordenador.
    *   "Resize": Abre un menú avanzado para cambiar el tamaño de tu imagen.
    *   "Color Tools": Abre una potente herramienta para ajustar los colores de tu imagen a la paleta oficial del juego.
*   Opacidad: Desliza la barra para hacer tu overlay más o menos transparente.
*   Ajuste Fino (Nudge): Usa los botones de flecha (← ↑ → ↓) para mover tu overlay píxel por píxel si necesitas un ajuste perfecto.

- Pestaña "Herramientas" -

Aquí se encuentran las utilidades más potentes del script.

*   Copiar Lienzo: Esta herramienta te permite "recortar" y descargar una sección del lienzo como una imagen.
    1.  Haz clic en "Fijar Punto A" y luego en un píxel del lienzo para marcar la primera esquina.
    2.  Haz clic en "Fijar Punto B" y luego en otro píxel para marcar la esquina opuesta.
    3.  Usa "Visualizar Área" para ver un recuadro de la zona seleccionada.
    4.  Cuando estés listo, haz clic en "Detectar y Descargar".

*   Mostrar Progreso del Overlay:
    *   Al hacer clic, aparece un nuevo panel flotante que analiza tu overlay activo y te muestra en tiempo real cuántos píxeles de cada color ya están colocados correctamente en el lienzo.
    *   "🎯" (Resaltar Faltantes): Cambia el modo del overlay para resaltar en cian los píxeles que aún faltan por colocar.
    *   "⚙️" (Ajustes): Abre un menú para controlar el panel:
        *   Ordenar por cantidad: Organiza la lista para mostrar primero los colores que más píxeles necesitan.
        *   Resaltar disponibles: Si tienes la paleta de colores del juego abierta, esta opción resalta en la lista los colores que tienes disponibles para pintar.
        *   Transparencia: Ajusta la opacidad del propio panel de progreso.
    *   Plegar Panel (▾/▸): Minimiza el panel para que no moleste mientras pintas.

--- 5. Ajustes y Soporte ---

*   Ajustes Generales ("⚙️" en la cabecera principal):
    *   Tema de la Interfaz: Cambia entre el modo claro y oscuro.
    *   Transparencia del Panel: Ajusta la opacidad del panel principal.

*   Apoya el Proyecto:
    *   Este proyecto es un proyecto hecho con dedicación y es completamente gratuito. Si te resulta útil, considera hacer una donación para apoyar su desarrollo continuo. Encontrarás la información en los menús de ajustes.

¡Disfruta creando y coordinando tus proyectos en wplace.live!

Créditos del código base en el script.
