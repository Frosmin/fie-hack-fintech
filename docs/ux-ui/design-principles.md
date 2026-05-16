# Principios UX/UI para el MVP

## Objetivo

Definir lineamientos de experiencia y de interfaz para una herramienta digital de registro de ventas orientada a emprendedores de la comunidad Tinka de Banco FIE. Estos principios buscan mantener consistencia con el ecosistema digital de Banco FIE sin copiar de forma literal sus productos.

## Contexto analizado

- Sitio público de Tinka de Banco FIE:
  - https://www.bancofie.com.bo/plataformas/tinka
  - https://www.bancofie.com.bo/plataformas/tinka/espacio-creativo
  - https://www.bancofie.com.bo/plataformas/tinka/casilleros
  - https://www.bancofie.com.bo/plataformas/tinka/comunidad
  - https://www.bancofie.com.bo/plataformas/tinka/registro
- Manual de Banca Digital Banco FIE:
  - https://www.bancofie.com.bo/archivos/localfiles/MANUAL-BANCA-DIGITAL-1.pdf
- Nota institucional sobre Tinka:
  - https://www.bancofie.com.bo/novedades/noticias/127

## Principios de producto

### 1. Simplicidad operativa

La acción principal del producto es registrar una venta. Esa tarea debe poder completarse en pocos pasos, con pocos campos y sin exigir conocimiento técnico.

Reglas:
- Priorizar flujos cortos y lineales.
- Evitar pantallas con demasiadas decisiones simultáneas.
- Mostrar una sola acción principal por vista.

### 2. Lenguaje claro y cercano

Tinka comunica cercanía con personas emprendedoras. La interfaz debe usar un lenguaje directo, cotidiano y comprensible.

Reglas:
- Usar términos de negocio simples: `venta`, `monto`, `método de pago`, `resumen`, `historial`.
- Evitar tecnicismos innecesarios.
- Mantener tono útil, respetuoso y breve.

### 3. Confianza antes que sofisticación

El ecosistema Banco FIE transmite seguridad mediante confirmaciones, validaciones y mensajes explícitos. El MVP debe heredar esa sensación de control.

Reglas:
- Confirmar acciones sensibles.
- Mostrar comprobación visible después de guardar datos.
- Exponer fecha, hora y resultado de las acciones importantes.

### 4. Móvil primero

El público objetivo probablemente registrará ventas desde el celular, muchas veces mientras atiende clientes o participa en ferias.

Reglas:
- Diseñar primero para pantallas pequeñas.
- Favorecer botones grandes, campos claros y pocos elementos por pantalla.
- Minimizar escritura manual cuando haya opciones seleccionables.

### 5. Aprendizaje guiado

El manual de banca digital muestra flujos asistidos y progresivos. El producto debe enseñar su uso mientras se navega.

Reglas:
- Dividir formularios largos en pasos si es necesario.
- Incluir ayudas breves cerca de campos o acciones nuevas.
- Usar estados vacíos que orienten la primera acción.

### 6. Privacidad por usuario

La ficha técnica exige que cada emprendedor vea solo su propia información.

Reglas:
- Toda vista de datos debe partir del contexto del usuario autenticado.
- No mostrar datos de terceros.
- Mantener señales visibles de sesión iniciada y cuenta activa.

### 7. Reportes comprensibles

Los reportes no deben sentirse como un panel financiero complejo. Deben responder preguntas concretas.

Reglas:
- Empezar por métricas básicas: total vendido, cantidad de ventas, método de pago principal.
- Usar gráficos simples y tablas legibles.
- Mantener filtros por día, semana, mes y rango personalizado.

## Principios de interacción

### Flujo primario

El flujo más importante del MVP es:

1. Ingresar venta.
2. Confirmar registro.
3. Ver resumen actualizado.

Este flujo debe ser el más accesible de toda la app.

### Acciones principales y secundarias

Reglas:
- Usar una acción primaria por pantalla.
- Reservar acciones destructivas o de bajo uso para opciones secundarias.
- Mantener consistencia en etiquetas como `Continuar`, `Guardar`, `Confirmar`.

### Feedback inmediato

Reglas:
- Cada acción debe producir una respuesta visible.
- Usar mensajes de éxito breves y específicos.
- Mostrar errores junto al campo o acción que los causó.

### Prevención de errores

Reglas:
- Usar selectores para métodos de pago y ubicación.
- Autocompletar fecha y hora por defecto.
- Validar montos antes de permitir el guardado.

## Principios visuales

Con la información disponible se pueden documentar criterios visuales de alto nivel, pero no aún un sistema visual exacto de tokens.

Reglas:
- Mantener una interfaz limpia y cálida.
- Evitar apariencia excesivamente corporativa o fría.
- Usar jerarquía visual clara entre acciones, datos y ayudas.
- Favorecer contraste suficiente y legibilidad.

## Accesibilidad mínima requerida

- Contraste suficiente entre texto y fondo.
- Labels visibles en inputs.
- Estados de foco distinguibles.
- Botones con área táctil cómoda.
- Mensajes de error claros y asociados al campo.

## Criterios para aceptar una pantalla

Una pantalla del MVP cumple este estándar si:

- deja claro qué debe hacer la persona;
- muestra una sola prioridad principal;
- puede usarse cómodamente en móvil;
- confirma el resultado de la acción;
- usa lenguaje simple y consistente;
- no expone información innecesaria.
