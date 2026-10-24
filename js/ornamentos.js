/* =============================================================
   Ornamentos: corona de laurel, ramas y separadores (como en los pases).
   -------------------------------------------------------------
   Cada figura se describe una sola vez como una lista de trazos.
   Después se puede pintar como SVG (en la página) o en un canvas
   (imagen del pase y vista previa de WhatsApp).
   ============================================================= */
(function () {
  "use strict";

  const f1 = (n) => Math.round(n * 10) / 10;
  const rad = (d) => (d * Math.PI) / 180;
  const deg = (dx, dy) => (Math.atan2(dy, dx) * 180) / Math.PI;

  // Hoja en forma de almendra que nace en (0,0) y apunta hacia +x.
  const leafPath = (len, w = 0.27) =>
    `M0 0Q${f1(len / 2)} ${f1(-len * w)} ${f1(len)} 0Q${f1(len / 2)} ${f1(len * w)} 0 0Z`;

  // Trazo: d (path SVG), posición (x, y), giro r en grados, relleno o línea.
  // "flip" refleja el trazo sobre la línea vertical x = flip.
  const leaf = (len, x, y, r, w) => ({ d: leafPath(len, w), x, y, r, mode: "fill" });
  const stroke = (d, width) => ({ d, x: 0, y: 0, r: 0, mode: "stroke", width });
  const mirrored = (list, axis) => list.map((p) => ({ ...p, flip: axis }));

  /* Corona de laurel con corazón abajo. Caja de 200x200 con margen. */
  function wreath() {
    const cx = 100, cy = 100, r = 76, a0 = 108, a1 = 252, pairs = 10;
    const at = (d) => [cx + r * Math.cos(rad(d)), cy + r * Math.sin(rad(d))];
    const [sx, sy] = at(a0);
    const [ex, ey] = at(a1);
    const half = [stroke(`M${f1(sx)} ${f1(sy)}A${r} ${r} 0 0 1 ${f1(ex)} ${f1(ey)}`, 1.4)];
    for (let i = 0; i < pairs; i++) {
      const t = 0.03 + (0.9 * i) / (pairs - 1);
      const d = a0 + (a1 - a0) * t;
      const [x, y] = at(d);
      const tangent = d + 90; // dirección hacia la punta de la rama
      const len = 21 - 7 * t;
      half.push(leaf(len, x, y, tangent - 38));
      half.push(leaf(len * 0.92, x, y, tangent + 40));
    }
    half.push(leaf(15, ex, ey, a1 + 90));
    const heart = stroke("M100 185C92 179.5 93 172 100 176C107 172 108 179.5 100 185Z", 1.4);
    return { viewBox: [-8, -8, 216, 216], prims: [...half, ...mirrored(half, 100), heart] };
  }

  /* Rama larga y tenue para las esquinas. */
  function sprig(leaves = 9) {
    const P0 = [40, 318], P1 = [8, 150], P2 = [150, 6];
    const pt = (t) => [0, 1].map((k) => (1 - t) ** 2 * P0[k] + 2 * (1 - t) * t * P1[k] + t * t * P2[k]);
    const tg = (t) => [0, 1].map((k) => 2 * (1 - t) * (P1[k] - P0[k]) + 2 * t * (P2[k] - P1[k]));
    const prims = [stroke(`M${P0}Q${P1} ${P2}`, 2)];
    for (let i = 0; i < leaves; i++) {
      const t = 0.08 + (0.86 * i) / (leaves - 1);
      const [x, y] = pt(t);
      const [dx, dy] = tg(t);
      prims.push(leaf(58 - i * 3, x, y, deg(dx, dy) + (i % 2 ? 44 : -44), 0.24));
    }
    const [dx, dy] = tg(1);
    prims.push(leaf(34, P2[0], P2[1], deg(dx, dy), 0.24));
    return { viewBox: [-40, -40, 260, 380], prims };
  }

  /* Separador horizontal: dos ramitas que se encuentran en un corazón. */
  function divider() {
    const half = [stroke("M8 15Q34 13 60 15", 1.1)];
    [15, 28, 41, 53].forEach((x, i) => {
      const len = 12.5 - i * 1.2;
      half.push(leaf(len, x, 15 - i * 0.25, -44, 0.36));
      half.push(leaf(len * 0.9, x + 3, 15 - i * 0.25, 40, 0.36));
    });
    half.push(leaf(10, 60, 15, -4, 0.36));
    const heart = stroke("M0 19.5C-5 16 -4.4 11.2 0 13.8C4.4 11.2 5 16 0 19.5Z", 1.1);
    return { viewBox: [-74, 2, 148, 26], prims: [...half, ...mirrored(half, 0), heart] };
  }

  function transformOf(p) {
    const parts = [];
    if (p.flip !== undefined) parts.push(`translate(${f1(2 * p.flip)} 0) scale(-1 1)`);
    if (p.x || p.y) parts.push(`translate(${f1(p.x)} ${f1(p.y)})`);
    if (p.r) parts.push(`rotate(${f1(p.r)})`);
    return parts.length ? ` transform="${parts.join(" ")}"` : "";
  }

  /* Figura como SVG en texto (usa currentColor para tomar el color del CSS). */
  function toSVG(shape, className = "") {
    const body = shape.prims
      .map((p) =>
        p.mode === "stroke"
          ? `<path d="${p.d}"${transformOf(p)} fill="none" stroke="currentColor" stroke-width="${p.width}" stroke-linecap="round" stroke-linejoin="round"/>`
          : `<path d="${p.d}"${transformOf(p)} fill="currentColor"/>`
      )
      .join("");
    return `<svg class="${className}" viewBox="${shape.viewBox.join(" ")}" aria-hidden="true" focusable="false">${body}</svg>`;
  }

  /* Figura en un canvas. (x, y) es la esquina superior izquierda y "size" el ancho.
     "rotate" (grados) y "flipX"/"flipY" giran o reflejan la figura sobre su centro. */
  function draw(ctx, shape, { x = 0, y = 0, size, color = "#5B6033", alpha = 1, rotate = 0, flipX = false, flipY = false } = {}) {
    const [vx, vy, vw, vh] = shape.viewBox;
    const s = size / vw;
    const w = size;
    const h = vh * s;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.translate(x + w / 2, y + h / 2);
    if (rotate) ctx.rotate(rad(rotate));
    ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
    ctx.translate(-w / 2, -h / 2);
    ctx.scale(s, s);
    ctx.translate(-vx, -vy);
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const p of shape.prims) {
      ctx.save();
      if (p.flip !== undefined) {
        ctx.translate(2 * p.flip, 0);
        ctx.scale(-1, 1);
      }
      ctx.translate(p.x || 0, p.y || 0);
      if (p.r) ctx.rotate(rad(p.r));
      const path = new Path2D(p.d);
      if (p.mode === "stroke") {
        ctx.lineWidth = p.width;
        ctx.stroke(path);
      } else {
        ctx.fill(path);
      }
      ctx.restore();
    }
    ctx.restore();
  }

  window.Ornamentos = { wreath, sprig, divider, toSVG, draw };
})();
