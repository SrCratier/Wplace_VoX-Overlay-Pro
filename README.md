![Banner Principal](social-preview.png)

🌍 [Español](README.md) | [English](README-en.md) |[Français](README-fr.md)

# VoX - Overlay Pro para Wplace
**Basado en el código original de shinkonet, modificado y mantenido por @SrCratier.**

Un script de usuario avanzado para `wplace.live` que permite cargar, posicionar y gestionar plantillas (overlays) sobre el lienzo. Esta versión ha sido optimizada para ofrecer mayor rendimiento, precisión en la conversión de color y herramientas integradas para facilitar la creación de arte y mejorar la comodidad del usuario.

---

## 1. Instalación

Para utilizar este script, primero necesitas instalar un gestor de scripts en tu navegador.

### Navegadores Soportados

| Plataforma | Navegadores Recomendados |
| :--- | :--- |
| **PC / Mac** | Chrome, Firefox, Brave, Edge, Opera GX |
| **Móvil (Android/iOS)** | **Microsoft Edge (Recomendado)**, Kiwi Browser |

### Pasos de instalación
1. **Instala Tampermonkey** desde la tienda de extensiones de tu navegador:
   - [Tampermonkey para Chrome/Brave/Edge](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
   - [Tampermonkey para Firefox](https://addons.mozilla.org/es/firefox/addon/tampermonkey/)
   > *Nota para móviles: Si usas Edge en el móvil, puedes instalar la extensión directamente desde el menú "Extensiones" del navegador.*

2. [**Haz clic aquí para instalar el script (v5.2.5)**](https://raw.githubusercontent.com/SrCratier/Wplace_VoX-Overlay-Pro/main/WplacePro-VoX.user.js).
3. Tampermonkey abrirá una pestaña automáticamente pidiendo confirmación. Haz clic en **Instalar** o **Actualizar**.

---

## 2. Guía de Uso

Sigue estos pasos para colocar tu diseño sobre el lienzo con la mejor calidad visual posible.

### A. Crear y cargar un Overlay
1. Abre el panel de VoX en Wplace y ve a la pestaña **Overlays**.
2. Haz clic en **+ Añadir**, se abrirá la pestaña **Editor**.
3. Elige tu **Modo de renderizado** (ver apartado inferior) o usa el que está por defecto (recomendado).
4. Carga tu imagen: puedes pegar una **URL directa** y hacer clic en "Cargar", o hacer clic en el área punteada para subir un **archivo local**.

### B. Modos de Renderizado de Color
Al cargar una imagen, el script la convierte automáticamente a la paleta oficial de Wplace. Puedes elegir cómo se procesan estos colores:
*   **Estándar (Recomendado):** Utiliza un algoritmo de color cercano sin generar ruido visual. Ideal para la gran mayoría de diseños, logos y formas planas.
*   **Mejorado (Pixel Art):** Fuerza un mapeo matemático directo de color (distancia Euclidiana). Es el modo más preciso para Pixel Art estricto y bordes definidos.
*   **Fotorealista (Dithering):** Distribuye el error de conversión de color entre los píxeles adyacentes para simular transiciones y degradados suaves. Útil principalmente para fotografías o imágenes complejas.

### C. Fijar la posición (Anclar)
1. Con la imagen cargada, haz clic en el botón superior **Set Position: OFF** (cambiará a **ON**).
2. Haz clic en el lienzo del juego, exactamente en el píxel donde deseas que se coloque la esquina superior izquierda (0,0) de tu imagen.
3. El script fijará la imagen automáticamente. Puedes realizar micro-ajustes usando las flechas de desplazamiento en la sección de "Offset X / Y" dentro del Editor.
   > *Nota: Solo fijará la imagen si tienes la paleta de colores cerrada*

### D. Panel Principal y Modos de Visualización
Desde los botones de la parte superior del panel puedes controlar cómo se proyecta tu plantilla:
*   **Overlay (ON/OFF):** Muestra u oculta todos tus diseños cargados.
*   **Mode:** Cambia el estilo de visualización de la plantilla:
    *   *Minify (Recomendado):* Muestra la imagen como un patrón de puntos espaciados, permitiendo ver el lienzo original por debajo.
    *   *Behind / Above:* Proyecta la imagen completamente sólida por detrás o por encima de los píxeles del mapa.
    *   *Original:* Oculta temporalmente el overlay para observar el mapa real.
*   **Show Errors (ON/OFF):** Resalta en color de contraste los píxeles del mapa que no coinciden con tu diseño.

> **💡 Nota de rendimiento:** Si cambias la opacidad, la posición o aplicas filtros, simplemente mueve un poco el mapa o pinta un píxel para que la pantalla se actualice y refleje los cambios.

![Foto del renderizado](EJEMPLOS.png)

---

## 3. Herramientas Adicionales

El script incluye funciones de gestión y edición en sus respectivas pestañas.

### Pestaña Herramientas (Tools)
*   **Copiar Lienzo (Copy Canvas):** Descarga un recorte exacto y limpio del mapa actual en formato PNG.
    1. Fija el **Punto A** haciendo clic en una esquina.
    2. Fija el **Punto B** en la esquina opuesta.
    3. Activa "Visualizar Área" y haz clic en "Descargar".
*   **Análisis de Progreso (Color Analysis):** Abre un panel flotante para el seguimiento en tiempo real de tu proyecto.
    *   Calcula el porcentaje total de progreso de tu overlay.
    *   Muestra una lista de cuántos píxeles faltan, ordenados por color.
    *   Permite aplicar filtros visuales para mostrar u ocultar colores específicos, facilitando el trabajo en equipo por zonas o tonos.

### Pestaña Editor
*   **Herramientas de Color (Color Tools):** Ajusta y sustituye los colores de tu plantilla por otros de la paleta oficial de Wplace antes de empezar a dibujar.
*   **Redimensionar (Resize):** Herramienta integrada para escalar tu diseño internamente sin necesidad de usar programas externos.

---

## 4. Características Técnicas

Esta versión ha sido reescrita para ofrecer una experiencia más fluida y estable:

*   **Procesamiento Asíncrono (Web Workers):** La conversión de imágenes complejas se realiza en segundo plano, evitando que el navegador se congele (Anti-Lag) durante la carga.
*   **Soporte de Alta Resolución:** El límite de tamaño para los overlays se ha ampliado, soportando imágenes de hasta **3000x3000px**.
*   **Gestión Multi-Overlay Independiente:** Puedes mantener múltiples plantillas cargadas al mismo tiempo. Cada overlay guarda su propia posición, opacidad y configuración de filtros de color sin entrar en conflicto con los demás.
*   **Optimización de Memoria:** Implementación de un límite en la caché de datos del mapa, reduciendo significativamente el consumo de RAM en sesiones largas.
*   **Detección de Errores Mejorada:** Se ha corregido y ajustado la lógica para la detección de píxeles oscuros/negros, asegurando una visualización clara de los errores en cualquier tono.

---

## 5. Soporte y Agradecimientos

En la cabecera del panel principal encontrarás el botón de **Ajustes (⚙️)**, donde podrás:
*   Alternar la interfaz entre el tema **Claro** y **Oscuro**.
*   Ajustar la transparencia general del panel.

Este proyecto es de código abierto (GPLv3) y su mantenimiento requiere tiempo. Si el script te ha sido útil para organizar a tu comunidad o defender tu arte, considera apoyar al desarrollador.

Encontrarás los detalles para donaciones (Binance / PayPal) y la lista de agradecimientos a los colaboradores recientes dentro del menú de ajustes.
