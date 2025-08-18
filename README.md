# 📘 Manual de Usuario: Wplace Overlay Pro 4.2.0

---

## ⚙️ Instalación

**Requisito:** Tener la extensión **Tampermonkey** instalada en tu navegador.

### Pasos de instalación
1. Abre el panel de Tampermonkey y crea un **nuevo script (+)**.
2. Borra todo el contenido de ejemplo.
3. Copia y pega el código completo de la última versión proporcionada.
4. Ve a **Archivo > Guardar**.
5. **Recarga la Página:** Refresca la pestaña de `wplace.live`. El panel del script aparecerá en la esquina superior derecha.

---

## 🖥️ Interfaz Principal

El panel es tu centro de control. Puedes arrastrarlo desde la cabecera para moverlo.

- ☀️/🌙: Cambia entre el tema claro y oscuro.  
- ⟲: Recarga la página (útil si algo no funciona bien).  
- ▾ / ▸: Pliega o despliega el panel completo.  

---

## 🔑 Funciones Detalladas

### 1. Controles Principales
- **Overlay ON / OFF:** Activa o desactiva la visualización de **todas las superposiciones**.  
  > Si lo apagas, es recomendable recargar la página para ver el lienzo original.  

- **Modo de visualización del overlay:**  
  - **Minificado:** Muestra el overlay con patrones de píxeles muy visibles. *(Modo recomendado)*  
  - **Detrás:** Muestra el overlay por debajo de los píxeles del lienzo.  
  - **Encima:** Muestra el overlay por encima de los píxeles del lienzo.  
  - **Original:** Desactiva el renderizado de overlays.  

- **Fijar overlay:** Establece la coordenada de anclaje. El siguiente clic en el lienzo fijará la esquina superior izquierda de tu imagen.  

- **Mostrar Errores:** Resalta en rojo los píxeles diferentes entre el overlay y el lienzo, útil para reparar.  

---

### 2. 📋 Copiar Lienzo (Backup de Arte)

Permite guardar cualquier obra como archivo de imagen.

**Paso 1: Fijar Puntos A y B**  
- Punto A → esquina superior izquierda.  
- Punto B → esquina inferior derecha.  
- El panel mostrará coordenadas y tamaño.  

**Paso 2: Visualizar Área**  
- Pulsa **Visualizar Área** → aparecerá un marco rojo sobre el lienzo.  

**Paso 3: Cargar Datos**  
- Mueve tu vista por todo el marco rojo para que el script “vea” los píxeles.  

**Paso 4: Descargar Copia**  
- Haz clic en **Detectar y Descargar**.  
- Se generará un archivo **PNG** con la obra seleccionada.  

---

### 3. 🖼️ Gestión de Overlays

Administra todas tus imágenes desde la lista.

- **⚪**: Selecciona overlay activo para editar.  
- **☑️**: Activa/desactiva visibilidad de un overlay específico.  
- **Nombre del Overlay:** clic para seleccionarlo.  
- **🗑️ Papelera:** elimina overlay.  

**Botones de acción:**  
- **+ Add:** Nuevo overlay vacío.  
- **Import / Export:** Guarda/carga configuración en JSON (nombre, URL, posición).  

---

### 4. 🎨 Editor de Overlay

Propiedades del overlay activo.

- **Nombre:** cambia el nombre.  
- **Imagen:**  
  - Desde URL (pegar enlace directo).  
  - Desde Archivo (arrastrar o seleccionar archivo).  

- **Opacidad:** ajusta transparencia.  

**Botones adicionales:**  
- **Descargar:** guarda copia de la imagen.  
- **Redimensionar:** cambia tamaño.  
- **Ajuste de Color:** adapta los colores a la paleta oficial de Wplace.  

---

### 5. ↔️ Desplazar Overlay

Usa las flechas (← ↑ → ↓) para mover el overlay **píxel por píxel**.  
El **Offset** indica cuánto lo moviste desde el ancla original.  

---

## ✅ Recomendaciones Finales

- **Si algo falla → recarga la página** con el botón ⟲ del panel.  
- **Clona el lienzo antes de un ataque**: haz copia de seguridad de tu obra.  
- **Exporta tus overlays:** Si usas imágenes por URL, exporta la configuración en JSON como respaldo de posición y datos.

---
