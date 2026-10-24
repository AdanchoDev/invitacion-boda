/* =============================================================
   Imagen del pase (canvas)
   -------------------------------------------------------------
   Dibuja el pase igual que en la página para:
     - el botón "Guardar mi pase" (frente y reverso en una imagen)
     - la vista previa de WhatsApp (vista-previa.html)
   ============================================================= */
(function () {
  "use strict";

  const O = window.Ornamentos;
  const C = window.INVITACION || {};
  const WREATH = O.wreath();
  const SPRIG = O.sprig();

  const PAPER = "#EFE5CF";
  const OLIVE = "#5B6033";
  const INK_SOFT = "#5E5741";
  const FOIL = [
    [0, "#74561A"], [0.2, "#A68134"], [0.36, "#D6B970"],
    [0.52, "#9C772B"], [0.7, "#C5A257"], [1, "#7A5B1C"],
  ];

  const FONT_SPECS = [
    '400 64px "Pinyon Script"',
    '500 64px "Cinzel"',
    '500 64px "Bodoni Moda"',
    '600 64px "Bodoni Moda"',
    'italic 400 40px "Cormorant Garamond"',
  ];

  /* Espera a que las letras de la invitación estén listas para dibujarlas. */
  async function fontsReady() {
    if (!document.fonts) return;
    try {
      await Promise.all(FONT_SPECS.map((f) => document.fonts.load(f, "ÁÉÍÓÚáéíóúÑñ&/0123456789AaBbDdEeNnPpRrSs")));
    } catch {}
  }

  const iniciales = () => {
    const n = C.novios || {};
    return n.iniciales || (n.nombres || []).map((x) => x.charAt(0));
  };

  /* 13/Marzo/2027, como en los pases impresos. */
  function fechaPase() {
    if (!C.fecha) return "";
    const parts = Object.fromEntries(
      new Intl.DateTimeFormat("es-MX", { timeZone: C.zonaHoraria, day: "numeric", month: "long", year: "numeric" })
        .formatToParts(new Date(C.fecha))
        .map((p) => [p.type, p.value])
    );
    return `${parts.day}/${parts.month.charAt(0).toUpperCase()}${parts.month.slice(1)}/${parts.year}`;
  }

  /* Texto dorado con un relieve sutil, como el dorado estampado del papel. */
  function foilText(ctx, text, x, y, size, family, { weight = 400, style = "normal", maxWidth } = {}) {
    ctx.save();
    let px = size;
    ctx.font = `${style} ${weight} ${px}px ${family}`;
    if (maxWidth) {
      while (ctx.measureText(text).width > maxWidth && px > size * 0.5) {
        px -= 1;
        ctx.font = `${style} ${weight} ${px}px ${family}`;
      }
    }
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    const w = ctx.measureText(text).width;
    const g = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
    FOIL.forEach(([o, c]) => g.addColorStop(o, c));
    const lift = Math.max(0.75, px * 0.012);
    ctx.fillStyle = "rgba(255, 251, 238, 0.55)";
    ctx.fillText(text, x, y - lift);
    ctx.shadowColor = "rgba(70, 48, 10, 0.28)";
    ctx.shadowOffsetY = lift;
    ctx.shadowBlur = lift;
    ctx.fillStyle = g;
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  function plainText(ctx, text, x, y, size, family, color, { weight = 400, style = "normal", maxWidth } = {}) {
    ctx.save();
    let px = size;
    ctx.font = `${style} ${weight} ${px}px ${family}`;
    if (maxWidth) {
      while (ctx.measureText(text).width > maxWidth && px > size * 0.5) {
        px -= 1;
        ctx.font = `${style} ${weight} ${px}px ${family}`;
      }
    }
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  /* Papel con una luz suave al centro. */
  function paper(ctx, x, y, w, h, base) {
    ctx.fillStyle = base;
    ctx.fillRect(x, y, w, h);
    const g = ctx.createRadialGradient(x + w / 2, y + h * 0.42, Math.min(w, h) * 0.15, x + w / 2, y + h / 2, Math.max(w, h) * 0.75);
    g.addColorStop(0, "rgba(255, 255, 255, 0.22)");
    g.addColorStop(1, "rgba(120, 90, 40, 0.10)");
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
  }

  // Rectángulo con esquinas redondeadas (con respaldo para navegadores viejos).
  const roundRect = (ctx, x, y, w, h, r) => (ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h));

  /* Sello verde "Confirmado", como de goma. */
  function stamp(ctx, cx, cy, w) {
    const h = w * 0.3;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((-11 * Math.PI) / 180);
    ctx.globalAlpha = 0.82;
    ctx.strokeStyle = OLIVE;
    ctx.fillStyle = OLIVE;
    ctx.lineWidth = Math.max(2, w * 0.018);
    ctx.beginPath();
    roundRect(ctx, -w / 2, -h / 2, w, h, h * 0.18);
    ctx.stroke();
    ctx.lineWidth = Math.max(1, w * 0.007);
    ctx.beginPath();
    roundRect(ctx, -w / 2 + w * 0.035, -h / 2 + w * 0.035, w - w * 0.07, h - w * 0.07, h * 0.12);
    ctx.stroke();
    ctx.font = `600 ${w * 0.1}px "Cinzel"`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("CONFIRMADO", 0, h * 0.04);
    ctx.restore();
  }

  /* Una cara del pase. Proporción 10:11, igual que en la página. */
  function drawFace(ctx, { x, y, w, h, side = "front", guest = "", count = 1, confirmed = false }) {
    const [i1, i2] = iniciales();

    ctx.save();
    ctx.shadowColor = "rgba(70, 52, 18, 0.32)";
    ctx.shadowBlur = w * 0.08;
    ctx.shadowOffsetY = w * 0.035;
    ctx.fillStyle = PAPER;
    ctx.fillRect(x, y, w, h);
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    paper(ctx, x, y, w, h, PAPER);

    const cx = x + w / 2;
    if (side === "front") {
      O.draw(ctx, SPRIG, { x: x - w * 0.18, y: y + h * 0.42, size: w * 0.7, color: OLIVE, alpha: 0.14 });
      foilText(ctx, "Nuestra boda", cx, y + h * 0.215, w * 0.118, '"Pinyon Script"');
      const ws = w * 0.56;
      const wy = y + h * 0.27;
      O.draw(ctx, WREATH, { x: cx - ws / 2, y: wy, size: ws, color: OLIVE });
      const ms = ws * 0.25;
      foilText(ctx, `${i1}&${i2}`, cx, wy + ws / 2 + ms * 0.34, ms, '"Bodoni Moda"', { weight: 500 });
      foilText(ctx, fechaPase(), cx, y + h * 0.885, w * 0.078, '"Bodoni Moda"', { weight: 600 });
    } else {
      O.draw(ctx, SPRIG, { x: x + w * 0.48, y: y - h * 0.14, size: w * 0.7, color: OLIVE, alpha: 0.14, rotate: 180 });
      const cs = w * 0.092;
      foilText(ctx, "VÁLIDO PARA", cx, y + h * 0.27, cs, '"Cinzel"', { weight: 500, maxWidth: w * 0.84 });
      foilText(ctx, `${count} ${count === 1 ? "PERSONA" : "PERSONAS"}`, cx, y + h * 0.37, cs, '"Cinzel"', {
        weight: 500,
        maxWidth: w * 0.84,
      });
      const ws = w * 0.3;
      O.draw(ctx, WREATH, { x: cx - ws / 2, y: y + h * 0.44, size: ws, color: OLIVE });
      if (guest) {
        plainText(ctx, guest, cx, y + h * 0.82, w * 0.066, '"Cormorant Garamond"', INK_SOFT, {
          style: "italic",
          maxWidth: w * 0.84,
        });
      }
      if (confirmed) stamp(ctx, x + w * 0.64, y + h * 0.915, w * 0.5);
    }
    ctx.restore();
  }

  /* Imagen para guardar: frente y reverso del pase lado a lado. */
  async function renderPassImage({ guest = "", count = 1, confirmed = false } = {}) {
    await fontsReady();
    const W = 1600, H = 900;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    paper(ctx, 0, 0, W, H, "#E7DFCF");
    const cw = 600, ch = 660, gap = 80;
    const top = (H - ch) / 2;
    const left = (W - (cw * 2 + gap)) / 2;
    drawFace(ctx, { x: left, y: top, w: cw, h: ch, side: "front", guest, count, confirmed });
    drawFace(ctx, { x: left + cw + gap, y: top, w: cw, h: ch, side: "back", guest, count, confirmed });
    return canvas;
  }

  /* Vista previa de WhatsApp (1200x630): el frente del pase, centrado para
     que también se vea bien cuando WhatsApp la recorta en cuadrado. */
  async function drawOG(ctx) {
    await fontsReady();
    const W = ctx.canvas.width, H = ctx.canvas.height;
    const [i1, i2] = iniciales();
    paper(ctx, 0, 0, W, H, "#ECE2CC");
    O.draw(ctx, SPRIG, { x: -50, y: H - 330, size: 300, color: OLIVE, alpha: 0.13 });
    O.draw(ctx, SPRIG, { x: W - 250, y: -110, size: 300, color: OLIVE, alpha: 0.13, rotate: 180 });
    const cx = W / 2;
    foilText(ctx, "Nuestra boda", cx, 150, 92, '"Pinyon Script"');
    const ws = 300, wy = 184;
    O.draw(ctx, WREATH, { x: cx - ws / 2, y: wy, size: ws, color: OLIVE });
    const ms = ws * 0.25;
    foilText(ctx, `${i1}&${i2}`, cx, wy + ws / 2 + ms * 0.34, ms, '"Bodoni Moda"', { weight: 500 });
    foilText(ctx, fechaPase(), cx, 548, 46, '"Bodoni Moda"', { weight: 600 });
  }

  window.Pase = { fontsReady, renderPassImage, drawOG, drawFace };
})();
