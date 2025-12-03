# VoX - Overlay Pro: Guía de Usuario Completa -_- /
**Basado en el código de shinkonet, adaptado y mejorado para Wplace.**
**Based on shinkonet’s code, adapted and enhanced for Wplace.**

¡Bienvenido a **VoX - Overlay Pro v5.0.1**!
Esta guía te ayudará a dominar todas las herramientas que el script pone a tu disposición. Hemos actualizado el motor para que sea más inteligente, rápido y fácil de usar.

---

## **1. Instalación**

Para usar el script, primero necesitas una extensión de navegador llamada **Tampermonkey**.

1. **Instala Tampermonkey:**

   **📱 IMPORTANTE PARA MÓVILES:** En Android/iOS, recomendamos usar el navegador **Microsoft Edge**, ya que permite instalar extensiones desde su menú.

   - [Tampermonkey para Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
   - [Tampermonkey para Firefox](https://addons.mozilla.org/es/firefox/addon/tampermonkey/)
   - [Otros navegadores](https://www.tampermonkey.net/)

2. **Instala el Script:**
   Una vez tengas Tampermonkey, ve a la sección de **Releases** en GitHub y descarga la última versión (`WplacePro-VoX.user.js`).
   Tampermonkey se abrirá automáticamente y te pedirá que instales el script.

---

## **2. Tu Primer Overlay: Pasos Esenciales**

Sigue estos pasos para colocar tu diseño sobre el lienzo con la mejor calidad de color posible.

**Paso 1: Crear un Nuevo Overlay**
En el panel del script, ve a la pestaña **Overlays** y haz clic en el botón **+ Add**.

**Paso 2: Elegir el Modo de Color (¡NUEVO!)**
Antes de cargar tu imagen, verás un menú desplegable llamado **Modo**. Esto define cómo el script "traduce" tu imagen a los colores de Wplace:

- **Natural (Recomendado):** Ideal para fotografías o imágenes con degradados suaves. (Opción por defecto).
- **Vibrante (Logos y Neón):** Perfecto para logotipos, textos y colores neón brillantes.
- **PESADO! 💀 (Intenso):** Un modo matemático que prioriza el tono exacto del color. Úsalo para Pixel Art o Anime complejo.

**Paso 3: Cargar la Imagen**
Con el modo seleccionado, carga tu imagen (desde URL o Archivo Local).
*El script procesará los colores automáticamente para que no haya errores ni colores "Desconocidos".*

**Paso 4: Fijar la Posición**
1. Haz clic en **Set Position: OFF** (cambiará a **ON**).
2. Haz clic en el lienzo del juego en el píxel donde quieres que empiece la esquina superior izquierda de tu imagen.
3. ¡Listo! La imagen se fijará.

---

## **3. El Panel Principal: Un Vistazo General**

La interfaz ha sido limpiada y optimizada.

- **Overlay: ON/OFF** → Muestra u oculta todos tus diseños.
- **Mode: Minify** → Cambia la visualización:
  - *Minify (Recomendado):* Convierte tu imagen en pequeños puntos para ver el lienzo debajo.
- **Show Errors: ON/OFF** → Escanea el lienzo y marca en rojo brillante los píxeles que están mal pintados.
- **Set Position: ON/OFF** → Activa el modo para anclar la imagen.

> **✨ Nota sobre el rendimiento:** Si haces cambios en la configuración (opacidad, posición, filtros), solo tienes que **mover un poco el mapa** o poner un píxel para ver los cambios aplicados en el lienzo.

---

## **4. Funciones Detalladas por Pestaña**

### **Pestaña Overlays**
Gestiona tu lista de proyectos.

- **Memoria Individual:** Cada Overlay recuerda su propia configuración de filtros.
- **Capacidad Aumentada:** Ahora se soportan imágenes de hasta **3000x3000px** sin lag al cargar (si tu dispositivo lo permite).

### **Pestaña Editor**
Ajustes finos para el overlay seleccionado.

- **Opacidad:** Desliza para hacer la imagen más transparente.
- **Ajuste Fino (Nudge):** Usa las flechas para mover la imagen píxel por píxel.

### **Pestaña Herramientas**
Utilidades para coordinar equipos.

- **Copiar Lienzo:**
  Define dos puntos (A y B) en el mapa y haz clic en **Detectar y Descargar** para obtener una copia exacta de esa zona del lienzo.

- **Mostrar Progreso del Overlay (Color Analysis):**
  Abre un panel flotante para el seguimiento en tiempo real.
  - **Lista de Colores:** Muestra cuántos píxeles de cada color faltan por pintar.
  - **Filtros (⚙️):** Puedes ocultar colores terminados o filtrar la lista para centrarte en una tarea.
  - **Optimización:** El panel ahora carga de forma fluida.

---

## **5. Ajustes y Soporte**

En la cabecera del panel encontrarás el botón de **Ajustes (⚙️)**:
- **Tema:** Cambia entre modo Claro y Oscuro.
- **Transparencia:** Ajusta la opacidad del panel.

**❤️ Apoya el Proyecto**
Este script es gratuito y se mantiene gracias a la comunidad. Si te resulta útil, considera apoyar su desarrollo (encontrarás la opción en los menús de ajustes).

---

¡Disfruta creando en **wplace.live** con VoX Overlay Pro!
