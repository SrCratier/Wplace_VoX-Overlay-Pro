# VoX - Overlay Pro: Guía de Usuario Completa -_- /
**Basado en el código de shinkonet, adaptado y mejorado para Wplace.**
**Based on shinkonet’s code, adapted and enhanced for Wplace.**

¡Bienvenido a **VoX - Overlay Pro**!  
Esta guía te ayudará a dominar todas las herramientas que el script pone a tu disposición, desde colocar tu primer diseño hasta usar las funciones más avanzadas para coordinar y planificar.

---

## **1. Instalación**

Para usar el script, primero necesitas una extensión de navegador llamada **Tampermonkey**.

1. Instala Tampermonkey:
**IMPORTANTE, PARA TELÉFONOS SOLO FUNCIONA CON EL NAVEGADOR MICROSOFT EDGE - AGREGAR EXTENSIÓN DESDE EL MENÚ**
   - [Tampermonkey para Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
   - [Tampermonkey para Firefox](https://addons.mozilla.org/es/firefox/addon/tampermonkey/)
   - [Otros navegadores](https://www.tampermonkey.net/)

2. Instala el Script:  
   Una vez tengas Tampermonkey, simplemente ve a la página de la Release en GitHub y haz clic en https://github.com/SrCratier/Wplace_VoX-Overlay-Pro/releases/download/v4.9.1/WplacePro-VoX.user.js o archivo **WplacePro-VoX.user.js**.  
   Tampermonkey se abrirá automáticamente y te pedirá que instales el script.

---

## **2. Tu Primer Overlay: Pasos Esenciales**

Esta es la función principal del script. Sigue estos pasos para colocar tu primer diseño sobre el lienzo.

**Paso 1: Crear un Nuevo Overlay**  
En el panel del script, ve a la pestaña **Overlays** y haz clic en el botón **+ Add**. Esto creará un nuevo espacio para tu imagen.

**Paso 2: Añadir tu Imagen**  
Con el nuevo overlay seleccionado, ve a la pestaña **Editor**. Tienes dos formas de añadir tu imagen:
- **Desde una URL:** Pega un enlace directo a una imagen (.png, .jpg, etc.) en el campo de texto y haz clic en **Cargar**.
- **Desde un Archivo Local:** Haz clic en el cuadro punteado o arrastra y suelta un archivo de imagen desde tu ordenador.  
  *(Nota: los overlays con imágenes locales no se pueden exportar o compartir con otros).*

**Paso 3: Fijar la Posición (¡El paso más importante!)**  
Una vez cargada la imagen, el script necesita saber dónde colocarla en el lienzo.
1. Haz clic en el botón **Set Position: OFF** para activarlo. Cambiará a **Set Position: ON**.  
2. Ve al lienzo del juego y haz clic en el píxel exacto que corresponde a la esquina superior izquierda (0,0) de tu imagen.  
3. ¡Listo! El script fijará la imagen en esa coordenada. El modo **Set Position** se desactivará automáticamente.

---

## **3. El Panel Principal: Un Vistazo General**

La interfaz está diseñada para ser potente pero intuitiva. Aquí tienes un resumen de los controles principales:

- **Overlay: ON/OFF** → Activa o desactiva la visualización de todos tus overlays.  
- **Mode: Minify** → Cambia cómo se muestra el overlay:  
  - *Minify (Recomendado):* Muestra tu diseño como una cuadrícula de puntos, permitiéndote ver el lienzo debajo.  
  - *Behind/Above:* Muestra la imagen completa por detrás o por delante del lienzo.  
  - *Original:* No modifica el lienzo, ideal para ver el estado real del mural.  
- **Show Errors: ON/OFF** → Resalta en rojo los píxeles del lienzo que no coinciden con tu diseño.  
- **Set Position: ON/OFF** → Activa el modo para fijar la posición de tu imagen en el lienzo.  

---

## **4. Funciones Detalladas por Pestaña**

### **Pestaña Overlays**
Aquí gestionas todas tus imágenes.

- **Activar un Overlay:** Haz clic en el botón de radio junto al nombre para seleccionarlo como el overlay activo (solo uno puede estar activo a la vez).  
- **Habilitar/Deshabilitar:** Usa la casilla de verificación para mostrar u ocultar un overlay específico sin tener que borrarlo.  
- **Previsualización:** Al seleccionar un overlay con imagen, aparecerá una vista previa en la parte inferior.  
- **Importar/Exportar:** Comparte tus diseños con otros usando los botones **Import** y **Export**.  

### **Pestaña Editor**
Aquí ajustas el overlay que tienes activo.

- **Nombre:** Cambia el nombre de tu overlay para organizarte mejor.  
- **Herramientas de Imagen:**  
  - **Save:** Descarga la versión actual de la imagen del overlay a tu ordenador.  
  - **Resize:** Abre un menú avanzado para cambiar el tamaño de tu imagen.  
  - **Color Tools:** Ajusta los colores de tu imagen a la paleta oficial del juego.  
- **Opacidad:** Ajusta la transparencia de tu overlay.  
- **Ajuste Fino (Nudge):** Usa las flechas para mover tu overlay píxel por píxel.  

### **Pestaña Herramientas**
Aquí se encuentran las utilidades más potentes del script.

- **Copiar Lienzo:**  
  1. Haz clic en **Fijar Punto A** y luego en un píxel del lienzo.  
  2. Haz clic en **Fijar Punto B** para marcar la esquina opuesta.  
  3. Usa **Visualizar Área** para comprobar la selección.  
  4. Haz clic en **Detectar y Descargar** para guardar la zona seleccionada.  

- **Mostrar Progreso del Overlay:**  
  - Al activarlo, aparece un panel flotante con el progreso en tiempo real de tu overlay.  
  - **Resaltar Faltantes:** Marca en cian los píxeles que aún faltan.  
  - **Ajustes (⚙️):** Opciones para ordenar por cantidad, resaltar colores disponibles y ajustar transparencia.  
  - **Plegar Panel:** Minimiza el panel para que no moleste mientras pintas.  

---

## **5. Ajustes y Soporte**

- **Ajustes Generales:**  
  - Tema de la interfaz (claro/oscuro).  
  - Transparencia del panel principal.  

- **Apoya el Proyecto:**  
  Este proyecto es gratuito y hecho con dedicación. Si te resulta útil, considera apoyar su desarrollo con una donación (encontrarás la opción en los menús de ajustes).  

---

¡Disfruta creando y coordinando tus proyectos en **wplace.live**!
