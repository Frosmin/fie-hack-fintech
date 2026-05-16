# Estándares Visuales para IA

## Propósito

Este documento define estándares visuales concretos para que otra IA pueda generar interfaces consistentes con la identidad observada en Tinka y en el ecosistema público de Banco FIE.

## Alcance

Estos lineamientos no son un manual de marca oficial. Son una especificación operativa derivada de:

- HTML y CSS público de `https://www.bancofie.com.bo/plataformas/tinka`
- Manual de banca digital `https://www.bancofie.com.bo/archivos/localfiles/MANUAL-BANCA-DIGITAL-1.pdf`
- Patrones visuales de páginas públicas relacionadas con Banco FIE y Marca Magenta

Cuando este documento no defina algo, la IA debe priorizar simplicidad, legibilidad móvil y lenguaje claro.

## Instrucciones para otra IA

- No uses `Inter` como tipografía por defecto.
- No uses morado genérico ni paletas modernas aleatorias.
- No generes interfaces minimalistas frías tipo SaaS.
- Usa una estética cálida, institucional y cercana a emprendimientos.
- Prioriza azul y magenta como colores base.
- Usa bordes redondeados visibles.
- Mantén alto contraste entre fondo, texto y CTA.
- Diseña primero para móvil.

## Tipografía

### Familia tipográfica principal

Fuente observada en la página Tinka:

- `avenir, arial, sans-serif`

Fuentes disponibles en el CSS público de Banco FIE:

- `avenir`
- `Avenir Next LT Pro`
- `raleway`
- `roundkey`
- `Bustered`
- `Zuume`

### Estándar recomendado

- `font-body`: `Avenir Next LT Pro`, `avenir`, `Arial`, `sans-serif`
- `font-heading`: `Avenir Next LT Pro`, `avenir`, `Arial`, `sans-serif`
- `font-decorative`: no usar por defecto

### Regla de uso

- Texto de interfaz, formularios, navegación y reportes: `font-body`
- Títulos y subtítulos: `font-heading`
- No usar `Bustered`, `Zuume` o `roundkey` salvo que se quiera replicar una campaña visual específica

## Paleta de color

### Colores principales observados

- `brand-blue`: `#005BA7`
- `brand-blue-deep`: `#2B4382`
- `brand-blue-mid`: `#364DAB`
- `brand-magenta`: `#EE008A`
- `brand-magenta-soft`: `#E1278D`
- `brand-magenta-alt`: `#E02C88`
- `brand-cyan`: `#44C2F4`

### Colores de soporte

- `surface-light`: `#F2F2F2`
- `surface-white`: `#FFFFFF`
- `text-default`: `#2B4382`
- `text-inverse`: `#FFFFFF`
- `border-muted`: `#DADADA`
- `shadow-soft`: `rgba(0,0,0,0.08)`

### Gradiente institucional observado

- `hero-gradient`: `linear-gradient(90deg, #44C2F4, #364DAB, #F2008F)`

### Regla de uso

- Fondo principal de app: `#FFFFFF`
- Fondo secundario o panel suave: `#F2F2F2`
- Títulos principales: `#2B4382`
- Texto regular prioritario: `#2B4382`
- Resaltados y CTA: `#EE008A`
- Links y acentos secundarios: `#005BA7`
- Gradientes: solo en hero, banners o bloques de alto impacto

## Jerarquía tipográfica

Valores observados o normalizados desde Tinka:

- `nav-link`: `0.86em`, peso `600`
- `hero-title`: `2.46rem`, peso `800`
- `hero-body`: `16px`, peso `500`
- `objective-label`: `26px`, peso `700`
- `section-content-title`: `1.2rem`
- `slogan-title`: `1.72rem`, peso `600`
- `background-display-title`: `5rem`, peso `900`
- `location-title`: `1.42rem`
- `footer-meta`: `0.64rem`, peso `100`

## Radios y forma

### Radios observados

- `radius-button-sm`: `20px`
- `radius-button-md`: `30px`
- `radius-card`: `30px`
- `radius-input-group`: `20px`
- `radius-social-icon`: `4px`

### Regla de uso

- Botón principal: `30px`
- Botón secundario de cabecera o acción compacta: `20px`
- Cards y paneles importantes: `24px` a `30px`
- Inputs: `16px` a `20px`

## Espaciado

### Breakpoints observados en el CSS público

- `sm`: `576px`
- `md`: `768px`
- `lg`: `992px`
- `xl`: `1200px`

### Estándar de espaciado recomendado

- `space-1`: `4px`
- `space-2`: `8px`
- `space-3`: `12px`
- `space-4`: `16px`
- `space-5`: `20px`
- `space-6`: `24px`
- `space-7`: `30px`
- `space-8`: `40px`

### Regla de uso

- Formularios: separación vertical de `12px` a `16px`
- Bloques de contenido: padding interno de `20px` a `30px`
- Secciones principales: `24px` a `40px`

## Botones

### Botón primario

- Fondo: `#EE008A`
- Texto: `#FFFFFF`
- Borde: `none`
- Radio: `30px`
- Peso: `600`
- Padding horizontal amplio

### Botón de cabecera

- Radio: `20px`
- Peso: `600`

### Botón destacado opcional

- Fondo: `linear-gradient(270deg, #44C2F4, #364DAB, #F2008F)`
- Uso: banners, CTA promocional, bloques institucionales

### Regla de interacción

- Hover: oscurecer ligeramente el fondo o elevar el botón
- Disabled: bajar contraste, nunca mantener el mismo color sólido

## Inputs y formularios

### Estándar recomendado

- Fondo input: `#FFFFFF`
- Texto input: `#2B4382`
- Placeholder: `#2B4382`
- Peso input: `600`
- Borde: suave o invisible con contraste suficiente
- Radio: `16px` a `20px`

### Contenedor de formulario

- Fondo panel: `#2B4382`
- Texto dentro del bloque: `#FFFFFF`
- Radio del panel: `30px`
- Padding interno: `20px` mínimo

### Regla UX

- Etiquetas y placeholders deben ser claros y cortos
- El formulario no debe sentirse bancario-complejo
- El CTA debe estar visualmente aislado del resto de campos

## Layout

### Estructura visual recomendada

- Cabecera clara con fondo `#F2F2F2`
- Secciones con bloques respirados y buen contraste
- Alternancia entre fondos blancos y grises suaves
- Un CTA principal visible por pantalla

### Navegación

- Links compactos
- Peso `600`
- Evitar menús visualmente pesados

## Componentes y estilo visual

### Cards

- Fondo blanco o gris claro
- Radio grande
- Sombra leve
- Tipografía azul profunda para títulos

### Métricas y reportes

- Tarjetas simples con cifra grande
- Color dominante azul
- Color de acento magenta para comparativos o resaltados
- No usar dashboards oscuros

### Tablas

- Fondo blanco
- Bordes discretos
- Encabezados azules o gris claro
- Tipografía clara, sin densidad excesiva

### Estados vacíos

- Lenguaje humano
- CTA visible
- Ilustración opcional, preferiblemente simple y cálida

## Tono y microcopy

### Regla de lenguaje

- Cercano
- Claro
- Breve
- Inclusivo

### Reglas derivadas de Marca Magenta

- Evitar lenguaje excluyente o estereotipado
- Visibilizar una imagen positiva y realista de las personas usuarias
- No usar tono autoritario

### Ejemplos válidos

- `Registrar venta`
- `Guardar venta`
- `Revisa tu resumen`
- `Hoy vendiste`
- `Todo listo`

## Qué debe hacer otra IA

- Reutilizar esta paleta antes de inventar otra
- Usar Avenir como base
- Construir formularios redondeados y claros
- Mantener títulos azules y acentos magenta
- Diseñar reportes simples, no corporativos pesados
- Favorecer una interfaz amable para emprendedores

## Qué no debe hacer otra IA

- No usar `Inter` ni `Roboto` como primera opción
- No usar dark mode por defecto
- No usar vidrio, neón o estilo fintech genérico
- No usar morados aleatorios fuera de los tonos observados
- No convertir el producto en una banca formal fría
