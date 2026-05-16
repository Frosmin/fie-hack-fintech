# Inventario inicial de componentes y patrones

## Propósito

Listar los componentes UI y patrones de interacción necesarios para construir el MVP con consistencia.

## Componentes base

### Botones

Tipos mínimos:
- Primario
- Secundario
- Terciario o de texto
- Destructivo

Estados mínimos:
- normal
- hover
- pressed
- disabled
- loading

Uso:
- `Guardar venta` debe ser primario.
- `Cancelar` o `Volver` deben ser secundarios.
- `Eliminar` debe ser destructivo y pedir confirmación.

### Campos de formulario

Tipos mínimos:
- input de texto
- input numérico
- select
- date/time picker o fecha/hora automática
- textarea opcional

Estados mínimos:
- default
- focus
- error
- disabled

Campos esperados para `Nueva venta`:
- producto o servicio
- monto
- método de pago
- ubicación
- fecha y hora

### Tarjetas de resumen

Uso:
- mostrar métricas rápidas en inicio y reportes.

Ejemplos:
- total vendido hoy
- cantidad de ventas
- ticket promedio
- método de pago principal

### Navegación

Patrones necesarios:
- barra inferior o navegación principal compacta en móvil;
- encabezado simple con título de pantalla;
- acceso a perfil o configuración.

### Listas y tablas

Uso:
- historial de ventas;
- desglose por método de pago;
- reportes por rango de fechas.

Requisitos:
- buena legibilidad en móvil;
- orden cronológico;
- filtros básicos.

### Alertas y feedback

Tipos mínimos:
- éxito
- error
- advertencia
- información

Uso:
- venta registrada;
- validación fallida;
- problema de conexión;
- acción irreversible.

### Modales o diálogos

Uso recomendado:
- confirmar eliminación;
- confirmar salida de un formulario sin guardar;
- mostrar comprobación resumida si se necesita.

## Patrones de pantalla

### 1. Inicio

Objetivo:
- dar visibilidad del estado actual del negocio.

Contenido mínimo:
- saludo o contexto del usuario;
- resumen diario;
- CTA de nueva venta;
- acceso rápido a historial o reportes.

### 2. Nueva venta

Objetivo:
- registrar una venta rápido y con pocos errores.

Patrones:
- formulario corto;
- campos estructurados;
- fecha/hora precargadas;
- feedback inmediato al guardar.

### 3. Historial de ventas

Objetivo:
- consultar registros anteriores.

Patrones:
- lista por fecha;
- filtros por período;
- vista de detalle simple.

### 4. Reportes

Objetivo:
- convertir registros en información útil.

Patrones:
- filtros visibles;
- tarjetas con KPIs;
- gráfico principal;
- tabla o desglose adicional.

### 5. Autenticación

Objetivo:
- acceso privado por usuario.

Patrones:
- login simple;
- recuperación de contraseña;
- mensajes claros de error;
- indicador de sesión activa.

## Microcopy recomendado

Etiquetas sugeridas:
- `Nueva venta`
- `Guardar venta`
- `Método de pago`
- `Ubicación`
- `Ver reporte`
- `Hoy`
- `Esta semana`
- `Este mes`

Mensajes sugeridos:
- `La venta se registró correctamente.`
- `Revisa el monto ingresado.`
- `Completa los campos obligatorios.`
- `No se pudo guardar la venta. Intenta nuevamente.`

## Datos y validaciones

Validaciones mínimas:
- monto obligatorio y mayor que cero;
- método de pago obligatorio;
- ubicación obligatoria;
- producto o servicio obligatorio si el modelo de negocio lo requiere;
- fecha válida.

Reglas UX:
- validar cerca del campo;
- no borrar datos al fallar;
- priorizar mensajes específicos sobre mensajes genéricos.

## Prioridad para la implementación

### Esenciales para el MVP

- botones
- inputs
- selects
- navegación principal
- tarjetas de resumen
- lista de ventas
- alertas

### Útiles después del MVP inicial

- modales avanzados
- exportación
- filtros complejos
- preferencias de usuario
- tutorial de onboarding
