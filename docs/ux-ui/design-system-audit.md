# Auditoría de patrones UX/UI observados

## Propósito

Registrar patrones observados en Tinka y en la banca digital de Banco FIE para reutilizar los que sí aportan al MVP del reto.

## Fuentes revisadas

- Tinka:
  - https://www.bancofie.com.bo/plataformas/tinka
  - https://www.bancofie.com.bo/plataformas/tinka/espacio-creativo
  - https://www.bancofie.com.bo/plataformas/tinka/casilleros
  - https://www.bancofie.com.bo/plataformas/tinka/comunidad
  - https://www.bancofie.com.bo/plataformas/tinka/registro
- Banca Digital:
  - https://www.bancofie.com.bo/archivos/localfiles/MANUAL-BANCA-DIGITAL-1.pdf
- Contexto institucional:
  - https://www.bancofie.com.bo/novedades/noticias/127

## Hallazgos clave

### 1. Tinka comunica comunidad, crecimiento y cercanía

Patrón observado:
- La propuesta de valor no gira solo en torno a transacciones.
- Se enfatiza pertenencia, aprendizaje, comercialización y red de apoyo.

Aplicación al MVP:
- La experiencia debe sentirse útil para el negocio del emprendedor, no solo como un formulario administrativo.
- El lenguaje de reportes debe ayudar a interpretar el desempeño, no solo listar datos.

### 2. La banca digital usa flujos guiados y secuenciales

Patrón observado:
- Las operaciones se resuelven por pasos.
- Se repiten acciones como `Continuar`, `Confirmar` y pantallas de verificación previa.

Aplicación al MVP:
- El registro de venta debe seguir una secuencia muy clara.
- Antes de guardar, se puede usar confirmación ligera si hay riesgo de error.
- En acciones de mayor impacto, como edición o eliminación, sí debe existir confirmación explícita.

### 3. Navegación inferior persistente para tareas frecuentes

Patrón observado:
- El manual de banca digital describe un menú inferior para accesos repetidos.

Aplicación al MVP:
- Conviene una navegación principal simple con acceso visible a:
  - Inicio
  - Nueva venta
  - Historial
  - Reportes
  - Perfil o más

### 4. Seguridad y confianza visibles

Patrón observado:
- Banco FIE utiliza autenticación, clave temporal, biometría, preguntas de seguridad, mensajes de confirmación y notificaciones.

Aplicación al MVP:
- Aunque el MVP no necesita replicar toda esa complejidad, sí debe transmitir control.
- Recomendado:
  - inicio de sesión claro;
  - confirmación al guardar;
  - historial visible;
  - mensajes consistentes de éxito y error.

### 5. Gestión clara de datos estructurados

Patrón observado:
- Transferencias, pagos y beneficiarios usan campos específicos, selección guiada y verificación.

Aplicación al MVP:
- Los campos del registro de venta deben ser estructurados y fáciles de completar:
  - producto o servicio;
  - monto;
  - método de pago;
  - ubicación;
  - fecha y hora.

### 6. Uso fuerte de estados de confirmación

Patrón observado:
- Después de una operación relevante, el sistema muestra confirmación y resultado.

Aplicación al MVP:
- Al guardar una venta se debe mostrar un estado claro de éxito.
- Idealmente incluir:
  - monto registrado;
  - fecha y hora;
  - método de pago;
  - acceso rápido a ver el resumen.

## Patrones que sí conviene adoptar

- Navegación sencilla y repetible.
- Flujos lineales.
- Verbos consistentes en botones.
- Confirmación posterior a acciones importantes.
- Estructura móvil primero.
- Lenguaje claro para usuarios no técnicos.

## Patrones que conviene adaptar, no copiar literal

- Controles de seguridad fuertes como clave temporal.
- Arquitectura de menús muy amplia.
- Flujos largos pensados para productos bancarios complejos.
- Terminología financiera corporativa.

## Patrones que conviene evitar en el MVP

- Sobrecargar la pantalla inicial con demasiadas funciones.
- Pedir datos irrelevantes para registrar una venta.
- Usar gráficos complejos desde la primera versión.
- Exigir pasos adicionales cuando una acción puede resolverse en una sola vista.

## Implicaciones directas para el diseño del MVP

### Pantalla de inicio

Debe responder estas preguntas:
- cuánto vendí hoy;
- cuántas ventas registré;
- cuál fue el método de pago más usado;
- cómo agrego una nueva venta ahora.

### Pantalla de nueva venta

Debe priorizar velocidad.

Recomendaciones:
- formulario corto;
- fecha y hora automáticas;
- selector de método de pago;
- selector de ubicación;
- botón principal claro.

### Pantalla de historial

Debe permitir revisar y validar registros.

Recomendaciones:
- lista ordenada por fecha;
- filtros simples;
- acceso a detalle o edición si aplica.

### Pantalla de reportes

Debe ser simple de leer.

Recomendaciones:
- tarjetas de resumen arriba;
- un gráfico principal;
- una tabla o desglose complementario;
- filtros por período.

## Vacíos de información actuales

Todavía no están documentados con precisión:

- paleta oficial en valores hex;
- tipografías exactas del sistema;
- espaciado base;
- radios y sombras;
- estados exactos de componentes visuales.

Para completar eso harían falta capturas de la app o un manual de marca.
