# Invitación de boda (plantilla)

Invitación digital de **Adan & Erika** (13 de marzo de 2027), pensada para
enviarse por WhatsApp y abrirse en el celular. Usa la misma paleta que los pases
impresos: papel kraft, dorado metálico y corona de laurel verde olivo. Trae un sobre
animado con sello de cera, un pase digital que se voltea y confirmación de
asistencia que llega directo a WhatsApp.

Los horarios, lugares, padrinos, historia y fotos todavía son de ejemplo
(marcados con `EJEMPLO` en `js/config.js`).

## Cómo verla

- **Rápido:** doble clic en `index.html`.
- **Con servidor local** (recomendado mientras editas):

  ```bash
  python -m http.server 5500
  ```

  y abre http://localhost:5500

Enlaces útiles para probar:

| Enlace | Qué hace |
|---|---|
| `index.html?invitado=Familia%20Ríos&pases=4` | Sobre "Para Familia Ríos" y pase digital "Válido para 4 personas" |
| `index.html?sinsobre` | Salta la animación del sobre (útil mientras editas) |
| `index.html?sobre` | Vuelve a mostrar el sobre (cada teléfono lo ve solo la primera vez) |
| `index.html?hoy=2027-02-20` | Simula otra fecha para ver la cuenta regresiva (meses si faltan más de 30 días; días, horas, minutos y segundos si faltan menos) |
| `generar.html` | Crea enlaces personalizados por invitado y los manda por WhatsApp |
| `vista-previa.html` | Genera la imagen que aparece al compartir el enlace por WhatsApp (`assets/og-imagen.jpg`) |

## Qué editar

| Quiero cambiar... | Dónde |
|---|---|
| Textos, fechas, lugares, programa, preguntas | `js/config.js` |
| Ocultar una sección | `js/config.js` → `secciones` |
| Fotos | Guárdalas en `assets/fotos/` y cambia la ruta en `js/config.js` |
| Fotos a color o en tono sepia | `js/config.js` → `fotosEnTono` |
| Colores de toda la invitación | `css/styles.css` → bloque `:root` |
| Vista previa al compartir por WhatsApp | Imagen: `vista-previa.html` → "Descargar imagen" y guardarla en `assets/og-imagen.jpg`. Textos: `<head>` de `index.html` |
| Música de fondo | `js/config.js` → `musica.src` |

Todo lo marcado con `EJEMPLO` en `js/config.js` es de prueba.

## Estructura

```
index.html        La invitación
generar.html      Herramienta para crear enlaces por invitado (no se enlaza desde la invitación)
vista-previa.html Herramienta para la imagen de vista previa de WhatsApp
css/styles.css    Estilos, paleta y animaciones
js/config.js      TODO el contenido editable
js/main.js        Lógica: sobre, cuenta regresiva, calendario, pase digital, confirmación, accesos rápidos
js/ornamentos.js  Corona de laurel, ramas y separadores (los mismos dibujos para la página y las imágenes)
js/pase.js        Dibuja el pase como imagen ("Guardar mi pase" y vista previa de WhatsApp)
assets/          Imagen de vista previa (og-imagen.jpg); aquí van también fotos y música
js/generar.js     Lógica de generar.html
```

## Secciones e ideas incluidas

1. **Sobre animado** de papel kraft con el nombre del invitado escrito a mano: toca el sello de cera verde olivo y sale una tarjeta igual al frente del pase (forro con hojas olivo). Cada teléfono lo ve solo la primera vez; al volver entra directo.
2. **Portada** con "¡Nos casamos!" en letra manuscrita dorada, foto en arco, nombres (en una línea en celular) y botón para confirmar.
La invitación se cuenta en tres partes, separadas con ramitas de laurel:

- **Nosotros**
  3. **Mensaje y familias**: corona de laurel, frase, padres y padrinos.
  4. **Nuestra historia** en línea de tiempo.
  5. **Galería** (en celular se desliza con el dedo) + hashtag.
- **El día**
  6. **Cuenta regresiva** en vivo (en meses si faltan más de 30 días) + botones para agregar el evento a Google Calendar o Apple / Outlook (.ics con recordatorio un día antes).
  7. **El gran día**: programa con horarios (incluye tornaboda).
  8. **Ubicaciones** con botones de Google Maps y Waze.
- **Tú**
  9. **Confirmación** con **pase digital**: copia de los pases impresos (frente con corona y A&E, reverso "Válido para N personas" con el nombre del invitado). Se voltea solo la primera vez y luego al tocarlo. Solo aparece en enlaces con `?pases=`. El formulario pide nombre, asistencia, número de personas, alergias, canción favorita y mensaje, y abre WhatsApp con todo listo. Al confirmar, el pase recibe un sello verde **"Confirmado"** y la respuesta queda guardada en ese teléfono. El botón **"Guardar mi pase"** descarga una imagen con frente y reverso (en celular abre el menú para guardarla en fotos).
  10. **Preguntas frecuentes**.

**Accesos rápidos:** al bajar de la portada aparece una barrita con "Ubicación" y "Confirmar" (cambia a "Mi pase" después de confirmar). Se esconde mientras estás en la confirmación.

11. Siempre se ve en papel kraft (aunque el teléfono esté en modo oscuro) y respeta la opción "reducir movimiento" del sistema.

Letras: Pinyon Script (manuscrita), Cinzel (mayúsculas tipo grabado), Bodoni Moda (monograma y fechas, como el pase impreso), Cormorant Garamond (títulos y nombres) y Jost (textos).

## Herramientas

| Necesidad | Herramienta | Costo |
|---|---|---|
| Código | HTML, CSS y JavaScript sin frameworks (ya en uso) | Gratis |
| Editor | VS Code (+ extensión Live Server) | Gratis |
| Tipografías | Google Fonts: Pinyon Script, Cinzel, Bodoni Moda, Cormorant Garamond y Jost (ya en uso) | Gratis |
| Íconos | Phosphor Icons (ya en uso) | Gratis |
| Optimizar fotos | Squoosh (squoosh.app): exportar a WebP, unos 200 KB por foto | Gratis |
| Guardar confirmaciones en una hoja | Google Sheets + Apps Script (poner la URL en `rsvp.endpoint`) | Gratis |
| Publicar | Netlify, Vercel, Cloudflare Pages o GitHub Pages | Gratis |
| Dominio propio (ej. adanyerika.com) | Cualquier registrador | Aprox. 10 a 15 USD al año |
| Historial de cambios | Git + GitHub | Gratis |
| Invitación impresa | Código QR que apunte al enlace | Gratis |
| Animaciones más cinematográficas (opcional) | GSAP | Gratis |

Si más adelante quieres reutilizarla para varias bodas (por ejemplo, venderla
como plantilla), conviene pasarla a Astro para generar una página por pareja.

## Antes de enviarla

- [ ] Reemplazar todo lo marcado `EJEMPLO` en `js/config.js`
- [ ] Poner fotos propias en `assets/fotos/`
- [ ] Poner el número real de WhatsApp en `rsvp.whatsapp`
- [ ] Al publicar, poner la dirección completa de `assets/og-imagen.jpg` en `og:image` (la imagen ya está hecha; si cambian nombres o fecha, regenerarla con `vista-previa.html`)
- [ ] Publicar y poner la dirección final en `generador.urlPublica`
- [ ] Probar el enlace en WhatsApp, en iPhone y en Android
- [ ] Generar los enlaces de cada invitado con `generar.html`
